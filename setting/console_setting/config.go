package console_setting

import "github.com/QuantumNous/new-api/setting/config"

type ConsoleSetting struct {
	ApiInfo              string `json:"api_info"`
	UptimeKumaGroups     string `json:"uptime_kuma_groups"`
	Announcements        string `json:"announcements"`
	TopNoticeItems       string `json:"top_notice_items"`
	TopNoticeRotationSec int    `json:"top_notice_rotation_seconds"`
	FAQ                  string `json:"faq"`
	HomePageConfig       string `json:"home_page_config"`
	ContactImage         string `json:"contact_image"`
	ContactTitle         string `json:"contact_title"`
	ContactCaption       string `json:"contact_caption"`
	ContactImage2        string `json:"contact_image2"`
	ContactTitle2        string `json:"contact_title2"`
	ContactCaption2      string `json:"contact_caption2"`
	ApiInfoEnabled       bool   `json:"api_info_enabled"`
	UptimeKumaEnabled    bool   `json:"uptime_kuma_enabled"`
	AnnouncementsEnabled bool   `json:"announcements_enabled"`
	TopNoticeEnabled     bool   `json:"top_notice_enabled"`
	FAQEnabled           bool   `json:"faq_enabled"`
	ContactEnabled       bool   `json:"contact_enabled"`
	Contact2Enabled      bool   `json:"contact2_enabled"`
}

var defaultConsoleSetting = ConsoleSetting{
	ApiInfo:              "",
	UptimeKumaGroups:     "",
	Announcements:        "",
	TopNoticeItems:       "",
	TopNoticeRotationSec: 4,
	FAQ:                  "",
	HomePageConfig:       "",
	ContactImage:         "",
	ContactTitle:         "",
	ContactCaption:       "",
	ContactImage2:        "",
	ContactTitle2:        "",
	ContactCaption2:      "",
	ApiInfoEnabled:       true,
	UptimeKumaEnabled:    true,
	AnnouncementsEnabled: true,
	TopNoticeEnabled:     false,
	FAQEnabled:           true,
	ContactEnabled:       false,
	Contact2Enabled:      false,
}

var consoleSetting = defaultConsoleSetting

func init() {
	config.GlobalConfig.Register("console_setting", &consoleSetting)
}

func GetConsoleSetting() *ConsoleSetting {
	return &consoleSetting
}
