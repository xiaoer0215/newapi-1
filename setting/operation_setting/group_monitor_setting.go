package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

type GroupMonitorSetting struct {
	EnabledGroups      []string `json:"enabled_groups"`
	RefreshInterval    int      `json:"refresh_interval"`
	PublicVisible      bool     `json:"public_visible"`
	ModelDetailVisible bool     `json:"model_detail_visible"`
	DefaultWindow      string   `json:"default_window"`
}

var groupMonitorSetting = GroupMonitorSetting{
	EnabledGroups:      []string{},
	RefreshInterval:    60,
	PublicVisible:      false,
	ModelDetailVisible: false,
	DefaultWindow:      "6h",
}

func init() {
	config.GlobalConfig.Register("group_monitor_setting", &groupMonitorSetting)
}

func GetGroupMonitorSetting() *GroupMonitorSetting {
	return &groupMonitorSetting
}

func UpdateGroupMonitorSetting(newSetting GroupMonitorSetting) {
	if newSetting.RefreshInterval < 10 {
		newSetting.RefreshInterval = 10
	}
	switch newSetting.DefaultWindow {
	case "1h", "6h", "12h", "24h":
	default:
		newSetting.DefaultWindow = "6h"
	}
	groupMonitorSetting = newSetting
}
