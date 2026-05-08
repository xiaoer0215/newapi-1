package model

import (
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"

	"gorm.io/gorm"
)

const (
	NameRuleExact = iota
	NameRulePrefix
	NameRuleContains
	NameRuleSuffix
)

type BoundChannel struct {
	Name string `json:"name"`
	Type int    `json:"type"`
}

type Model struct {
	Id               int            `json:"id"`
	ModelName        string         `json:"model_name" gorm:"size:128;not null;uniqueIndex:uk_model_name_delete_at,priority:1"`
	Description      string         `json:"description,omitempty" gorm:"type:text"`
	Icon             string         `json:"icon,omitempty" gorm:"type:varchar(128)"`
	Tags             string         `json:"tags,omitempty" gorm:"type:varchar(255)"`
	VendorID         int            `json:"vendor_id,omitempty" gorm:"index"`
	Endpoints        string         `json:"endpoints,omitempty" gorm:"type:text"`
	ContextLength    int            `json:"context_length,omitempty"`
	MaxOutputTokens  int            `json:"max_output_tokens,omitempty"`
	KnowledgeCutoff  string         `json:"knowledge_cutoff,omitempty" gorm:"type:varchar(32)"`
	ReleaseDate      string         `json:"release_date,omitempty" gorm:"type:varchar(32)"`
	ParameterCount   string         `json:"parameter_count,omitempty" gorm:"type:varchar(64)"`
	InputModalities  []string       `json:"input_modalities,omitempty" gorm:"-"`
	OutputModalities []string       `json:"output_modalities,omitempty" gorm:"-"`
	Capabilities     []string       `json:"capabilities,omitempty" gorm:"-"`
	Status           int            `json:"status" gorm:"default:1"`
	SyncOfficial     int            `json:"sync_official" gorm:"default:1"`
	CreatedTime      int64          `json:"created_time" gorm:"bigint"`
	UpdatedTime      int64          `json:"updated_time" gorm:"bigint"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index;uniqueIndex:uk_model_name_delete_at,priority:2"`

	InputModalitiesRaw  string `json:"-" gorm:"column:input_modalities;type:text"`
	OutputModalitiesRaw string `json:"-" gorm:"column:output_modalities;type:text"`
	CapabilitiesRaw     string `json:"-" gorm:"column:capabilities;type:text"`

	BoundChannels []BoundChannel `json:"bound_channels,omitempty" gorm:"-"`
	EnableGroups  []string       `json:"enable_groups,omitempty" gorm:"-"`
	QuotaTypes    []int          `json:"quota_types,omitempty" gorm:"-"`
	NameRule      int            `json:"name_rule" gorm:"default:0"`

	MatchedModels []string `json:"matched_models,omitempty" gorm:"-"`
	MatchedCount  int      `json:"matched_count,omitempty" gorm:"-"`
}

func (mi *Model) AfterFind(tx *gorm.DB) error {
	mi.InputModalities = parseStringListField(mi.InputModalitiesRaw)
	mi.OutputModalities = parseStringListField(mi.OutputModalitiesRaw)
	mi.Capabilities = parseStringListField(mi.CapabilitiesRaw)
	return nil
}

func (mi *Model) BeforeSave(tx *gorm.DB) error {
	return mi.syncMetadataColumns()
}

func (mi *Model) syncMetadataColumns() error {
	inputRaw, err := stringifyStringListField(mi.InputModalities)
	if err != nil {
		return err
	}
	outputRaw, err := stringifyStringListField(mi.OutputModalities)
	if err != nil {
		return err
	}
	capabilitiesRaw, err := stringifyStringListField(mi.Capabilities)
	if err != nil {
		return err
	}

	mi.InputModalitiesRaw = inputRaw
	mi.OutputModalitiesRaw = outputRaw
	mi.CapabilitiesRaw = capabilitiesRaw
	return nil
}

func parseStringListField(raw string) []string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}
	var items []string
	if err := common.UnmarshalJsonStr(raw, &items); err != nil {
		return nil
	}
	result := make([]string, 0, len(items))
	for _, item := range items {
		item = strings.TrimSpace(item)
		if item == "" {
			continue
		}
		result = append(result, item)
	}
	if len(result) == 0 {
		return nil
	}
	return result
}

func stringifyStringListField(items []string) (string, error) {
	if len(items) == 0 {
		return "", nil
	}
	normalized := make([]string, 0, len(items))
	seen := make(map[string]struct{}, len(items))
	for _, item := range items {
		item = strings.TrimSpace(item)
		if item == "" {
			continue
		}
		if _, ok := seen[item]; ok {
			continue
		}
		seen[item] = struct{}{}
		normalized = append(normalized, item)
	}
	if len(normalized) == 0 {
		return "", nil
	}
	data, err := common.Marshal(normalized)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func (mi *Model) Insert() error {
	if err := mi.syncMetadataColumns(); err != nil {
		return err
	}
	now := common.GetTimestamp()
	mi.CreatedTime = now
	mi.UpdatedTime = now

	// 保存原始值（因为 Create 后可能被 GORM 的 default 标签覆盖为 1）
	originalStatus := mi.Status
	originalSyncOfficial := mi.SyncOfficial

	// 先创建记录（GORM 会对零值字段应用默认值）
	if err := DB.Create(mi).Error; err != nil {
		return err
	}

	// 使用保存的原始值进行更新，确保零值能正确保存
	return DB.Model(&Model{}).Where("id = ?", mi.Id).Updates(map[string]interface{}{
		"status":        originalStatus,
		"sync_official": originalSyncOfficial,
	}).Error
}

func IsModelNameDuplicated(id int, name string) (bool, error) {
	if name == "" {
		return false, nil
	}
	var cnt int64
	err := DB.Model(&Model{}).Where("model_name = ? AND id <> ?", name, id).Count(&cnt).Error
	return cnt > 0, err
}

func (mi *Model) Update() error {
	if err := mi.syncMetadataColumns(); err != nil {
		return err
	}
	mi.UpdatedTime = common.GetTimestamp()
	return DB.Model(&Model{}).Where("id = ?", mi.Id).
		Select(
			"model_name",
			"description",
			"icon",
			"tags",
			"vendor_id",
			"endpoints",
			"context_length",
			"max_output_tokens",
			"knowledge_cutoff",
			"release_date",
			"parameter_count",
			"input_modalities",
			"output_modalities",
			"capabilities",
			"status",
			"sync_official",
			"name_rule",
			"updated_time",
		).
		Updates(mi).Error
}

func (mi *Model) Delete() error {
	return DB.Delete(mi).Error
}

func GetVendorModelCounts() (map[int64]int64, error) {
	var stats []struct {
		VendorID int64
		Count    int64
	}
	if err := DB.Model(&Model{}).
		Select("vendor_id as vendor_id, count(*) as count").
		Group("vendor_id").
		Scan(&stats).Error; err != nil {
		return nil, err
	}
	m := make(map[int64]int64, len(stats))
	for _, s := range stats {
		m[s.VendorID] = s.Count
	}
	return m, nil
}

func GetAllModels(offset int, limit int) ([]*Model, error) {
	var models []*Model
	err := DB.Order("id DESC").Offset(offset).Limit(limit).Find(&models).Error
	return models, err
}

func GetBoundChannelsByModelsMap(modelNames []string) (map[string][]BoundChannel, error) {
	result := make(map[string][]BoundChannel)
	if len(modelNames) == 0 {
		return result, nil
	}
	type row struct {
		Model string
		Name  string
		Type  int
	}
	var rows []row
	err := DB.Table("channels").
		Select("abilities.model as model, channels.name as name, channels.type as type").
		Joins("JOIN abilities ON abilities.channel_id = channels.id").
		Where("abilities.model IN ? AND abilities.enabled = ?", modelNames, true).
		Distinct().
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	for _, r := range rows {
		result[r.Model] = append(result[r.Model], BoundChannel{Name: r.Name, Type: r.Type})
	}
	return result, nil
}

func SearchModels(keyword string, vendor string, offset int, limit int) ([]*Model, int64, error) {
	var models []*Model
	db := DB.Model(&Model{})
	if keyword != "" {
		like := "%" + keyword + "%"
		db = db.Where("model_name LIKE ? OR description LIKE ? OR tags LIKE ?", like, like, like)
	}
	if vendor != "" {
		if vid, err := strconv.Atoi(vendor); err == nil {
			db = db.Where("models.vendor_id = ?", vid)
		} else {
			db = db.Joins("JOIN vendors ON vendors.id = models.vendor_id").Where("vendors.name LIKE ?", "%"+vendor+"%")
		}
	}
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := db.Order("models.id DESC").Offset(offset).Limit(limit).Find(&models).Error; err != nil {
		return nil, 0, err
	}
	return models, total, nil
}
