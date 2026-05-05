import { useStatus } from '@/hooks/use-status'
import type { AnnouncementItem, ApiInfoItem, FAQItem } from '../types'

/**
 * Get specific list from status data
 */
export function useStatusData<T = unknown>(
  enabledKey: string,
  dataKey: string,
  defaultEnabled = false
): { items: T[]; loading: boolean } {
  const { status, loading } = useStatus()
  const enabledValue = status?.[enabledKey]
  const enabled =
    typeof enabledValue === 'boolean' ? enabledValue : defaultEnabled
  const items = (enabled ? status?.[dataKey] || [] : []) as T[]

  return { items, loading }
}

/**
 * Get API info list
 */
export function useApiInfo() {
  return useStatusData<ApiInfoItem>('api_info_enabled', 'api_info', true)
}

/**
 * Get announcements list
 */
export function useAnnouncements() {
  return useStatusData<AnnouncementItem>(
    'announcements_enabled',
    'announcements',
    true
  )
}

/**
 * Get FAQ list
 */
export function useFAQ() {
  return useStatusData<FAQItem>('faq_enabled', 'faq', true)
}
