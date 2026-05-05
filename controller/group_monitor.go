package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	operation_setting "github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/gin-gonic/gin"
)

func validGroupMonitorWindow(raw string) string {
	switch raw {
	case "1h", "6h", "12h", "24h":
		return raw
	default:
		return "24h"
	}
}

func GetGroupMonitorStatus(c *gin.Context) {
	setting := operation_setting.GetGroupMonitorSetting()
	role := c.GetInt("role")

	if role < common.RoleAdminUser && !setting.PublicVisible {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "Group monitor is currently visible to admins only.",
		})
		return
	}

	window := validGroupMonitorWindow(c.DefaultQuery("window", setting.DefaultWindow))
	maxAge := int64(setting.RefreshInterval)
	if maxAge < 10 {
		maxAge = 10
	}

	if len(setting.EnabledGroups) > 0 && model.GetGroupMonitorCacheAge(window) >= maxAge {
		_ = model.RefreshGroupMonitorStats(setting.EnabledGroups, window)
	}

	stats := model.GetGroupMonitorStats(setting.EnabledGroups, window)

	wantModelDetail := c.DefaultQuery("model_detail", "false") == "true"
	canSeeModelDetail := role >= common.RoleAdminUser || setting.ModelDetailVisible
	var modelDetail map[string][]*model.ModelBucketStats
	if wantModelDetail && canSeeModelDetail && len(setting.EnabledGroups) > 0 {
		if model.GetModelDetailCacheAge(window) >= maxAge {
			_ = model.RefreshModelDetailStats(setting.EnabledGroups, window)
		}
		modelDetail = model.GetModelDetailStats(setting.EnabledGroups, window)
	}

	c.JSON(http.StatusOK, gin.H{
		"success":              true,
		"message":              "",
		"data":                 stats,
		"model_detail":         modelDetail,
		"model_detail_visible": canSeeModelDetail,
		"default_window":       setting.DefaultWindow,
		"refresh_interval":     setting.RefreshInterval,
	})
}

func AdminGetGroupMonitorConfig(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    operation_setting.GetGroupMonitorSetting(),
	})
}

type groupMonitorConfigRequest struct {
	EnabledGroups      []string `json:"enabled_groups"`
	RefreshInterval    int      `json:"refresh_interval"`
	PublicVisible      bool     `json:"public_visible"`
	ModelDetailVisible bool     `json:"model_detail_visible"`
	DefaultWindow      string   `json:"default_window"`
}

func AdminUpdateGroupMonitorConfig(c *gin.Context) {
	var req groupMonitorConfigRequest
	if err := common.DecodeJson(c.Request.Body, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	if req.RefreshInterval < 10 {
		req.RefreshInterval = 10
	}
	req.DefaultWindow = validGroupMonitorWindow(req.DefaultWindow)

	newSetting := operation_setting.GroupMonitorSetting{
		EnabledGroups:      req.EnabledGroups,
		RefreshInterval:    req.RefreshInterval,
		PublicVisible:      req.PublicVisible,
		ModelDetailVisible: req.ModelDetailVisible,
		DefaultWindow:      req.DefaultWindow,
	}
	operation_setting.UpdateGroupMonitorSetting(newSetting)

	enabledJSON, _ := common.Marshal(req.EnabledGroups)
	if err := model.UpdateOption("group_monitor_setting.enabled_groups", string(enabledJSON)); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	if err := model.UpdateOption("group_monitor_setting.refresh_interval", strconv.Itoa(req.RefreshInterval)); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	if err := model.UpdateOption("group_monitor_setting.public_visible", strconv.FormatBool(req.PublicVisible)); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	if err := model.UpdateOption("group_monitor_setting.model_detail_visible", strconv.FormatBool(req.ModelDetailVisible)); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	if err := model.UpdateOption("group_monitor_setting.default_window", req.DefaultWindow); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	for _, window := range []string{"1h", "6h", "12h", "24h"} {
		_ = model.RefreshGroupMonitorStats(req.EnabledGroups, window)
		_ = model.RefreshModelDetailStats(req.EnabledGroups, window)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Configuration saved",
	})
}
