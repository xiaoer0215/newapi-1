import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { AFFILIATE_I18N_OVERRIDES } from './affiliate-overrides'
import { DRAWING_I18N_OVERRIDES } from './drawing-overrides'
import { CONTACT_PANELS_I18N_OVERRIDES } from './contact-panels-overrides'
import { DASHBOARD_LATEST_I18N_OVERRIDES } from './dashboard-latest-overrides'
import { GROUP_MONITOR_I18N_OVERRIDES } from './group-monitor-overrides'
import { GROUP_RATIO_I18N_OVERRIDES } from './group-ratio-overrides'
import { HOME_PAGE_CONFIG_I18N_OVERRIDES } from './home-page-config-overrides'
import { MEMBER_UPGRADE_I18N_OVERRIDES } from './member-upgrade-overrides'
import { OVERVIEW_LAYOUT_I18N_OVERRIDES } from './overview-layout-overrides'
import { PLAYGROUND_I18N_OVERRIDES } from './playground-overrides'
import { PRICING_METADATA_I18N_OVERRIDES } from './pricing-metadata-overrides'
import { PRICING_OFFICIAL_I18N_OVERRIDES } from './pricing-official-overrides'
import { RANKINGS_I18N_OVERRIDES } from './rankings-overrides'
import { TOP_NOTICE_RATIO_I18N_OVERRIDES } from './top-notice-ratio-overrides'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ja from './locales/ja.json'
import ru from './locales/ru.json'
import vi from './locales/vi.json'
import zh from './locales/zh.json'

function withOverrides<
  T extends { translation: Record<string, string> },
  K extends keyof typeof DRAWING_I18N_OVERRIDES,
>(locale: K, base: T) {
  return {
    ...base,
    translation: {
      ...base.translation,
      ...AFFILIATE_I18N_OVERRIDES[locale],
      ...DRAWING_I18N_OVERRIDES[locale],
      ...CONTACT_PANELS_I18N_OVERRIDES[locale],
      ...DASHBOARD_LATEST_I18N_OVERRIDES[locale],
      ...GROUP_MONITOR_I18N_OVERRIDES[locale],
      ...GROUP_RATIO_I18N_OVERRIDES[locale],
      ...HOME_PAGE_CONFIG_I18N_OVERRIDES[locale],
      ...MEMBER_UPGRADE_I18N_OVERRIDES[locale],
      ...OVERVIEW_LAYOUT_I18N_OVERRIDES[locale],
      ...PLAYGROUND_I18N_OVERRIDES[locale],
      ...PRICING_METADATA_I18N_OVERRIDES[locale],
      ...PRICING_OFFICIAL_I18N_OVERRIDES[locale],
      ...RANKINGS_I18N_OVERRIDES[locale],
      ...TOP_NOTICE_RATIO_I18N_OVERRIDES[locale],
    },
  }
}

export const resources = {
  en: withOverrides('en', en),
  zh: withOverrides('zh', zh),
  fr: withOverrides('fr', fr),
  ru: withOverrides('ru', ru),
  ja: withOverrides('ja', ja),
  vi: withOverrides('vi', vi),
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh', 'fr', 'ru', 'ja', 'vi'],
    load: 'languageOnly', // Convert zh-CN -> zh
    nsSeparator: false, // Allow literal colons in keys (e.g., URLs, labels)
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n


