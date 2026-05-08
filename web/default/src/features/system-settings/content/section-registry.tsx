import type { ContentSettings } from '../types'
import { createSectionRegistry } from '../utils/section-registry'
import { AnnouncementsSection } from './announcements-section'
import { ApiInfoSection } from './api-info-section'
import { ChatSettingsSection } from './chat-settings-section'
import { ContactPanelsSection } from './contact-panels-section'
import { DashboardSection } from './dashboard-section'
import { DrawingSettingsSection } from './drawing-settings-section'
import { FAQSection } from './faq-section'
import { HomePageConfigSection } from './home-page-config-section'
import { MemberUpgradeSection } from './member-upgrade-section'
import { OverviewLayoutSection } from './overview-layout-section'
import { PricingMetadataSection } from './pricing-metadata-section'
import { TopNoticeSection } from './top-notice-section'
import { UptimeKumaSection } from './uptime-kuma-section'

/**
 * Validate and coerce DataExportDefaultTime to a safe value
 */
function validateDataExportDefaultTime(value: string): 'week' | 'hour' | 'day' {
  if (value === 'week' || value === 'hour' || value === 'day') {
    return value
  }
  // Default to 'hour' if value is unexpected
  return 'hour'
}

const CONTENT_SECTIONS = [
  {
    id: 'dashboard',
    titleKey: 'Data Dashboard',
    descriptionKey: 'Configure data export settings for dashboard',
    build: (settings: ContentSettings) => (
      <DashboardSection
        defaultValues={{
          DataExportEnabled: settings.DataExportEnabled,
          DataExportInterval: settings.DataExportInterval,
          DataExportDefaultTime: validateDataExportDefaultTime(
            settings.DataExportDefaultTime
          ),
        }}
      />
    ),
  },
  {
    id: 'home-page',
    titleKey: 'Home Page Layout',
    descriptionKey: 'Configure landing page section order and QR content',
    build: (settings: ContentSettings) => (
      <HomePageConfigSection
        defaultValue={settings['console_setting.home_page_config']}
      />
    ),
  },
  {
    id: 'overview-layout',
    titleKey: 'Overview Layout',
    descriptionKey:
      'Configure the display order of cards on the dashboard overview page.',
    build: (settings: ContentSettings) => (
      <OverviewLayoutSection
        defaultValue={settings['console_setting.overview_layout']}
      />
    ),
  },
  {
    id: 'pricing-metadata',
    titleKey: 'Pricing Metadata',
    descriptionKey:
      'Configure which metadata fields appear on the model pricing detail page.',
    build: (settings: ContentSettings) => (
      <PricingMetadataSection
        defaultValues={{
          pricingContextEnabled:
            settings['console_setting.pricing_context_enabled'],
          pricingMaxOutputEnabled:
            settings['console_setting.pricing_max_output_enabled'],
          pricingModalitiesEnabled:
            settings['console_setting.pricing_modalities_enabled'],
          pricingKnowledgeCutoffEnabled:
            settings['console_setting.pricing_knowledge_cutoff_enabled'],
          pricingReleaseDateEnabled:
            settings['console_setting.pricing_release_date_enabled'],
          pricingCapabilitiesEnabled:
            settings['console_setting.pricing_capabilities_enabled'],
        }}
      />
    ),
  },
  {
    id: 'contact-panels',
    titleKey: 'Contact QR Panels',
    descriptionKey: 'Configure dashboard contact QR panels',
    build: (settings: ContentSettings) => (
      <ContactPanelsSection
        defaultValues={{
          contactEnabled: settings['console_setting.contact_enabled'],
          contactImage: settings['console_setting.contact_image'],
          contactTitle: settings['console_setting.contact_title'],
          contactCaption: settings['console_setting.contact_caption'],
          contact2Enabled: settings['console_setting.contact2_enabled'],
          contact2Image: settings['console_setting.contact_image2'],
          contact2Title: settings['console_setting.contact_title2'],
          contact2Caption: settings['console_setting.contact_caption2'],
        }}
      />
    ),
  },
  {
    id: 'announcements',
    titleKey: 'Announcements',
    descriptionKey: 'Configure system announcements',
    build: (settings: ContentSettings) => (
      <AnnouncementsSection
        enabled={settings['console_setting.announcements_enabled']}
        data={settings['console_setting.announcements']}
      />
    ),
  },
  {
    id: 'top-notice',
    titleKey: 'Top Notice',
    descriptionKey: 'Configure the scrolling notice banner shown at the top of the dashboard',
    build: (settings: ContentSettings) => (
      <TopNoticeSection
        enabled={settings['console_setting.top_notice_enabled']}
        data={settings['console_setting.top_notice_items']}
        rotationSeconds={settings['console_setting.top_notice_rotation_seconds']}
      />
    ),
  },
  {
    id: 'api-info',
    titleKey: 'API Addresses',
    descriptionKey: 'Configure API information display',
    build: (settings: ContentSettings) => (
      <ApiInfoSection
        enabled={settings['console_setting.api_info_enabled']}
        data={settings['console_setting.api_info']}
      />
    ),
  },
  {
    id: 'faq',
    titleKey: 'FAQ',
    descriptionKey: 'Configure frequently asked questions',
    build: (settings: ContentSettings) => (
      <FAQSection
        enabled={settings['console_setting.faq_enabled']}
        data={settings['console_setting.faq']}
      />
    ),
  },
  {
    id: 'uptime-kuma',
    titleKey: 'Uptime Kuma',
    descriptionKey: 'Configure Uptime Kuma monitoring integration',
    build: (settings: ContentSettings) => (
      <UptimeKumaSection
        enabled={settings['console_setting.uptime_kuma_enabled']}
        data={settings['console_setting.uptime_kuma_groups']}
      />
    ),
  },
  {
    id: 'chat',
    titleKey: 'Chat Presets',
    descriptionKey: 'Configure chat-related settings',
    build: (settings: ContentSettings) => (
      <ChatSettingsSection defaultValue={settings.Chats} />
    ),
  },
  {
    id: 'drawing',
    titleKey: 'Drawing',
    descriptionKey: 'Configure drawing and Midjourney settings',
    build: (settings: ContentSettings) => (
      <DrawingSettingsSection
        defaultValues={{
          DrawingEnabled: settings.DrawingEnabled,
          DrawingTokenGroup: settings.DrawingTokenGroup,
          DrawingTokenModels: settings.DrawingTokenModels,
          DrawingDefaultModel: settings.DrawingDefaultModel,
          DrawingCDNMode: settings.DrawingCDNMode,
          DrawingCDNProviders: settings.DrawingCDNProviders,
          MjNotifyEnabled: settings.MjNotifyEnabled,
          MjAccountFilterEnabled: settings.MjAccountFilterEnabled,
          MjForwardUrlEnabled: settings.MjForwardUrlEnabled,
          MjModeClearEnabled: settings.MjModeClearEnabled,
          MjActionCheckSuccessEnabled: settings.MjActionCheckSuccessEnabled,
        }}
      />
    ),
  },
  {
    id: 'member-upgrade',
    titleKey: 'Member Upgrade',
    descriptionKey:
      'Configure member upgrade entrance, FAQ, and balance conversion copy',
    build: (settings: ContentSettings) => (
      <MemberUpgradeSection
        defaultValues={{
          MemberUpgradeEnabled: settings.MemberUpgradeEnabled,
          MemberUpgradeAdminOnly: settings.MemberUpgradeAdminOnly,
          MemberUpgradeFAQ: settings.MemberUpgradeFAQ,
          MemberBalanceConversionTitle: settings.MemberBalanceConversionTitle,
          MemberBalanceConversionContent:
            settings.MemberBalanceConversionContent,
        }}
      />
    ),
  },
] as const

export type ContentSectionId = (typeof CONTENT_SECTIONS)[number]['id']

const contentRegistry = createSectionRegistry<
  ContentSectionId,
  ContentSettings
>({
  sections: CONTENT_SECTIONS,
  defaultSection: 'dashboard',
  basePath: '/system-settings/content',
  urlStyle: 'path',
})

export const CONTENT_SECTION_IDS = contentRegistry.sectionIds
export const CONTENT_DEFAULT_SECTION = contentRegistry.defaultSection
export const getContentSectionNavItems = contentRegistry.getSectionNavItems
export const getContentSectionContent = contentRegistry.getSectionContent
