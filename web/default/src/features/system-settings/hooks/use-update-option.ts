import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18next from 'i18next'
import { toast } from 'sonner'
import { updateSystemOption } from '../api'
import type { UpdateOptionRequest } from '../types'

// Configuration keys that require status refresh
const STATUS_RELATED_KEYS = [
  'theme.frontend',
  'HeaderNavModules',
  'SidebarModulesAdmin',
  'Notice',
  'SystemName',
  'SystemSubtitle',
  'Logo',
  'SEODescription',
  'SEOKeywords',
  'MemberUpgradeEnabled',
  'MemberUpgradeAdminOnly',
  'MemberUpgradeFAQ',
  'MemberBalanceConversionTitle',
  'MemberBalanceConversionContent',
  'LogConsumeEnabled',
  'QuotaPerUnit',
  'USDExchangeRate',
  'DisplayInCurrencyEnabled',
  'DisplayTokenStatEnabled',
  'general_setting.quota_display_type',
  'general_setting.custom_currency_symbol',
  'general_setting.custom_currency_exchange_rate',
  'console_setting.api_info',
  'console_setting.announcements',
  'console_setting.top_notice_items',
  'console_setting.faq',
  'console_setting.uptime_kuma_groups',
  'console_setting.home_page_config',
  'console_setting.pricing_context_enabled',
  'console_setting.pricing_max_output_enabled',
  'console_setting.pricing_modalities_enabled',
  'console_setting.pricing_knowledge_cutoff_enabled',
  'console_setting.pricing_release_date_enabled',
  'console_setting.pricing_capabilities_enabled',
  'console_setting.api_info_enabled',
  'console_setting.announcements_enabled',
  'console_setting.top_notice_enabled',
  'console_setting.top_notice_rotation_seconds',
  'console_setting.faq_enabled',
  'console_setting.uptime_kuma_enabled',
  'console_setting.contact_enabled',
  'console_setting.contact_image',
  'console_setting.contact_title',
  'console_setting.contact_caption',
  'console_setting.contact2_enabled',
  'console_setting.contact_image2',
  'console_setting.contact_title2',
  'console_setting.contact_caption2',
  'UserGroupIcons',
]

export function useUpdateOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UpdateOptionRequest) => updateSystemOption(request),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Always refresh system-options
        queryClient.invalidateQueries({ queryKey: ['system-options'] })

        // If updating frontend-display-related config, also refresh status
        if (STATUS_RELATED_KEYS.includes(variables.key)) {
          queryClient.invalidateQueries({ queryKey: ['status'] })
        }

        toast.success(i18next.t('Setting updated successfully'))
      } else {
        toast.error(data.message || i18next.t('Failed to update setting'))
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || i18next.t('Failed to update setting'))
    },
  })
}
