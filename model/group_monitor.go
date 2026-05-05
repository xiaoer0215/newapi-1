package model

import (
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
)

func windowParams(window string) (int, int64, time.Duration) {
	switch window {
	case "1h":
		return 60, 60, 1 * time.Hour
	case "6h":
		return 60, 360, 6 * time.Hour
	case "12h":
		return 24, 1800, 12 * time.Hour
	default:
		return 24, 3600, 24 * time.Hour
	}
}

type BucketStat struct {
	Index        int     `json:"index"`
	SuccessCount int64   `json:"success_count"`
	ErrorCount   int64   `json:"error_count"`
	TotalCount   int64   `json:"total_count"`
	SuccessRate  float64 `json:"success_rate"`
	Status       string  `json:"status"`
}

type GroupMonitorStats struct {
	Group        string       `json:"group"`
	SuccessCount int64        `json:"success_count"`
	ErrorCount   int64        `json:"error_count"`
	TotalCount   int64        `json:"total_count"`
	SuccessRate  float64      `json:"success_rate"`
	Status       string       `json:"status"`
	Buckets      []BucketStat `json:"buckets"`
	UpdatedAt    int64        `json:"updated_at"`
}

type ModelBucketStats struct {
	ModelName    string       `json:"model_name"`
	SuccessCount int64        `json:"success_count"`
	ErrorCount   int64        `json:"error_count"`
	TotalCount   int64        `json:"total_count"`
	SuccessRate  float64      `json:"success_rate"`
	Status       string       `json:"status"`
	Buckets      []BucketStat `json:"buckets"`
}

var (
	groupMonitorCacheMu   sync.RWMutex
	groupMonitorCache     = map[string]*GroupMonitorStats{}
	groupMonitorRefreshTs = map[string]int64{}
	modelDetailCacheMu    sync.RWMutex
	modelDetailCache      = map[string][]*ModelBucketStats{}
	modelDetailRefreshTs  = map[string]int64{}
)

func gmStatus(rate float64, total int64) string {
	if total == 0 {
		return "green"
	}
	if rate < 60 {
		return "red"
	}
	if rate < 80 {
		return "orange"
	}
	return "green"
}

func cacheKey(window, group string) string {
	return window + ":" + group
}

func clearWindowCache[T any](cache map[string]T, window string) {
	prefix := window + ":"
	for key := range cache {
		if strings.HasPrefix(key, prefix) {
			delete(cache, key)
		}
	}
}

func RefreshGroupMonitorStats(groups []string, window string) error {
	if len(groups) == 0 {
		groupMonitorCacheMu.Lock()
		clearWindowCache(groupMonitorCache, window)
		groupMonitorRefreshTs[window] = time.Now().Unix()
		groupMonitorCacheMu.Unlock()
		return nil
	}

	numBuckets, bucketSecs, lookback := windowParams(window)
	since := time.Now().Add(-lookback).Unix()
	now := time.Now().Unix()

	var bucketExpr string
	if common.UsingMySQL {
		bucketExpr = fmt.Sprintf("CAST((created_at - %d) / %d AS SIGNED)", since, bucketSecs)
	} else {
		bucketExpr = fmt.Sprintf("(created_at - %d) / %d", since, bucketSecs)
	}

	query := fmt.Sprintf(
		`SELECT %s AS group_name, %s AS bucket_idx,`+
			` COUNT(CASE WHEN type = %d THEN 1 END) AS success_count,`+
			` COUNT(CASE WHEN type = %d THEN 1 END) AS error_count`+
			` FROM logs`+
			` WHERE created_at >= %d AND %s IN ?`+
			` GROUP BY %s, %s`,
		logGroupCol, bucketExpr,
		LogTypeConsume, LogTypeError,
		since, logGroupCol,
		logGroupCol, bucketExpr,
	)

	type bucketRow struct {
		GroupName    string `gorm:"column:group_name"`
		BucketIdx    int    `gorm:"column:bucket_idx"`
		SuccessCount int64  `gorm:"column:success_count"`
		ErrorCount   int64  `gorm:"column:error_count"`
	}

	var rows []bucketRow
	if err := LOG_DB.Raw(query, groups).Scan(&rows).Error; err != nil {
		return err
	}

	type groupAgg struct {
		buckets      []BucketStat
		totalSuccess int64
		totalError   int64
	}

	aggs := make(map[string]*groupAgg, len(groups))
	for _, groupName := range groups {
		agg := &groupAgg{buckets: make([]BucketStat, numBuckets)}
		for i := range agg.buckets {
			agg.buckets[i] = BucketStat{Index: i, SuccessRate: 100, Status: "green"}
		}
		aggs[groupName] = agg
	}

	for _, row := range rows {
		agg, ok := aggs[row.GroupName]
		if !ok || row.BucketIdx < 0 || row.BucketIdx >= numBuckets {
			continue
		}
		total := row.SuccessCount + row.ErrorCount
		rate := float64(100)
		if total > 0 {
			rate = float64(row.SuccessCount) / float64(total) * 100
		}
		agg.buckets[row.BucketIdx] = BucketStat{
			Index:        row.BucketIdx,
			SuccessCount: row.SuccessCount,
			ErrorCount:   row.ErrorCount,
			TotalCount:   total,
			SuccessRate:  rate,
			Status:       gmStatus(rate, total),
		}
		agg.totalSuccess += row.SuccessCount
		agg.totalError += row.ErrorCount
	}

	groupMonitorCacheMu.Lock()
	for _, groupName := range groups {
		agg := aggs[groupName]
		total := agg.totalSuccess + agg.totalError
		rate := float64(100)
		if total > 0 {
			rate = float64(agg.totalSuccess) / float64(total) * 100
		}
		buckets := make([]BucketStat, numBuckets)
		copy(buckets, agg.buckets)
		groupMonitorCache[cacheKey(window, groupName)] = &GroupMonitorStats{
			Group:        groupName,
			SuccessCount: agg.totalSuccess,
			ErrorCount:   agg.totalError,
			TotalCount:   total,
			SuccessRate:  rate,
			Status:       gmStatus(rate, total),
			Buckets:      buckets,
			UpdatedAt:    now,
		}
	}
	groupMonitorRefreshTs[window] = time.Now().Unix()
	groupMonitorCacheMu.Unlock()
	return nil
}

func RefreshModelDetailStats(groups []string, window string) error {
	if len(groups) == 0 {
		modelDetailCacheMu.Lock()
		clearWindowCache(modelDetailCache, window)
		modelDetailRefreshTs[window] = time.Now().Unix()
		modelDetailCacheMu.Unlock()
		return nil
	}

	numBuckets, bucketSecs, lookback := windowParams(window)
	since := time.Now().Add(-lookback).Unix()

	var bucketExpr string
	if common.UsingMySQL {
		bucketExpr = fmt.Sprintf("CAST((created_at - %d) / %d AS SIGNED)", since, bucketSecs)
	} else {
		bucketExpr = fmt.Sprintf("(created_at - %d) / %d", since, bucketSecs)
	}

	query := fmt.Sprintf(
		`SELECT %s AS group_name, model_name, %s AS bucket_idx,`+
			` COUNT(CASE WHEN type = %d THEN 1 END) AS success_count,`+
			` COUNT(CASE WHEN type = %d THEN 1 END) AS error_count`+
			` FROM logs`+
			` WHERE created_at >= %d AND %s IN ?`+
			` GROUP BY %s, model_name, %s`,
		logGroupCol, bucketExpr,
		LogTypeConsume, LogTypeError,
		since, logGroupCol,
		logGroupCol, bucketExpr,
	)

	type modelRow struct {
		GroupName    string `gorm:"column:group_name"`
		ModelName    string `gorm:"column:model_name"`
		BucketIdx    int    `gorm:"column:bucket_idx"`
		SuccessCount int64  `gorm:"column:success_count"`
		ErrorCount   int64  `gorm:"column:error_count"`
	}

	var rows []modelRow
	if err := LOG_DB.Raw(query, groups).Scan(&rows).Error; err != nil {
		return err
	}

	type modelAgg struct {
		buckets      []BucketStat
		totalSuccess int64
		totalError   int64
	}

	groupModels := make(map[string]map[string]*modelAgg)
	for _, row := range rows {
		if row.BucketIdx < 0 || row.BucketIdx >= numBuckets {
			continue
		}
		models, ok := groupModels[row.GroupName]
		if !ok {
			models = make(map[string]*modelAgg)
			groupModels[row.GroupName] = models
		}
		agg, ok := models[row.ModelName]
		if !ok {
			agg = &modelAgg{buckets: make([]BucketStat, numBuckets)}
			for i := range agg.buckets {
				agg.buckets[i] = BucketStat{Index: i, SuccessRate: 100, Status: "green"}
			}
			models[row.ModelName] = agg
		}
		total := row.SuccessCount + row.ErrorCount
		rate := float64(100)
		if total > 0 {
			rate = float64(row.SuccessCount) / float64(total) * 100
		}
		agg.buckets[row.BucketIdx] = BucketStat{
			Index:        row.BucketIdx,
			SuccessCount: row.SuccessCount,
			ErrorCount:   row.ErrorCount,
			TotalCount:   total,
			SuccessRate:  rate,
			Status:       gmStatus(rate, total),
		}
		agg.totalSuccess += row.SuccessCount
		agg.totalError += row.ErrorCount
	}

	modelDetailCacheMu.Lock()
	for _, groupName := range groups {
		key := cacheKey(window, groupName)
		models, ok := groupModels[groupName]
		if !ok {
			modelDetailCache[key] = nil
			continue
		}
		stats := make([]*ModelBucketStats, 0, len(models))
		for modelName, agg := range models {
			total := agg.totalSuccess + agg.totalError
			rate := float64(100)
			if total > 0 {
				rate = float64(agg.totalSuccess) / float64(total) * 100
			}
			buckets := make([]BucketStat, numBuckets)
			copy(buckets, agg.buckets)
			stats = append(stats, &ModelBucketStats{
				ModelName:    modelName,
				SuccessCount: agg.totalSuccess,
				ErrorCount:   agg.totalError,
				TotalCount:   total,
				SuccessRate:  rate,
				Status:       gmStatus(rate, total),
				Buckets:      buckets,
			})
		}
		sort.Slice(stats, func(i, j int) bool {
			if stats[i].TotalCount == stats[j].TotalCount {
				return stats[i].ModelName < stats[j].ModelName
			}
			return stats[i].TotalCount > stats[j].TotalCount
		})
		modelDetailCache[key] = stats
	}
	modelDetailRefreshTs[window] = time.Now().Unix()
	modelDetailCacheMu.Unlock()
	return nil
}

func GetGroupMonitorCacheAge(window string) int64 {
	groupMonitorCacheMu.RLock()
	defer groupMonitorCacheMu.RUnlock()
	ts, ok := groupMonitorRefreshTs[window]
	if !ok || ts == 0 {
		return 999999
	}
	return time.Now().Unix() - ts
}

func GetModelDetailCacheAge(window string) int64 {
	modelDetailCacheMu.RLock()
	defer modelDetailCacheMu.RUnlock()
	ts, ok := modelDetailRefreshTs[window]
	if !ok || ts == 0 {
		return 999999
	}
	return time.Now().Unix() - ts
}

func GetGroupMonitorStats(groups []string, window string) []*GroupMonitorStats {
	groupMonitorCacheMu.RLock()
	defer groupMonitorCacheMu.RUnlock()
	stats := make([]*GroupMonitorStats, 0, len(groups))
	for _, groupName := range groups {
		if stat, ok := groupMonitorCache[cacheKey(window, groupName)]; ok {
			stats = append(stats, stat)
		}
	}
	sort.Slice(stats, func(i, j int) bool {
		if stats[i].TotalCount == stats[j].TotalCount {
			return stats[i].Group < stats[j].Group
		}
		return stats[i].TotalCount > stats[j].TotalCount
	})
	return stats
}

func GetModelDetailStats(groups []string, window string) map[string][]*ModelBucketStats {
	modelDetailCacheMu.RLock()
	defer modelDetailCacheMu.RUnlock()
	result := make(map[string][]*ModelBucketStats, len(groups))
	for _, groupName := range groups {
		if stat, ok := modelDetailCache[cacheKey(window, groupName)]; ok {
			result[groupName] = stat
		}
	}
	return result
}
