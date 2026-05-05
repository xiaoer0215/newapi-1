export type TopNoticeType = 'info' | 'notice' | 'warning'

export type TopNoticeItem = {
  id?: number
  content: string
  startAt: string
  endAt?: string
  type?: TopNoticeType
  routes?: string[]
}

export const TOP_NOTICE_ROUTE_OPTIONS = [
  { value: '/', labelKey: 'Home' },
  { value: '/dashboard/overview', labelKey: 'Overview' },
  { value: '/dashboard/models', labelKey: 'Data Board' },
  { value: '/keys', labelKey: 'API Keys' },
  { value: '/usage-logs/common', labelKey: 'Usage Logs' },
  { value: '/group-monitor', labelKey: 'Group Monitor' },
  { value: '/wallet', labelKey: 'Wallet' },
  { value: '/member-upgrade', labelKey: 'Member Upgrade' },
  { value: '/profile', labelKey: 'Profile' },
  { value: '/pricing', labelKey: 'Pricing' },
] as const

export const DEFAULT_TOP_NOTICE_ROUTES = TOP_NOTICE_ROUTE_OPTIONS.map(
  (item) => item.value
)

export const TOP_NOTICE_TYPES = [
  { value: 'info', labelKey: 'Tip' },
  { value: 'notice', labelKey: 'Attention' },
  { value: 'warning', labelKey: 'Warning' },
] as const satisfies Array<{ value: TopNoticeType; labelKey: string }>

const VALID_TOP_NOTICE_TYPES = new Set<TopNoticeType>([
  'info',
  'notice',
  'warning',
])

export function toValidDate(value?: string): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function normalizeTopNoticeType(value: unknown): TopNoticeType {
  if (
    typeof value === 'string' &&
    VALID_TOP_NOTICE_TYPES.has(value as TopNoticeType)
  ) {
    return value as TopNoticeType
  }
  return 'info'
}

export function normalizeTopNoticeRoutes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_TOP_NOTICE_ROUTES]
  }

  const routes = Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.startsWith('/'))
    )
  )

  return routes.length > 0 ? routes : [...DEFAULT_TOP_NOTICE_ROUTES]
}

export function normalizeTopNoticeItems(raw: unknown): TopNoticeItem[] {
  if (!Array.isArray(raw)) return []

  const items: TopNoticeItem[] = []

  raw.forEach((item) => {
    if (!item || typeof item !== 'object') return

    const candidate = item as Record<string, unknown>
    const content =
      typeof candidate.content === 'string' ? candidate.content.trim() : ''
    const startAt = typeof candidate.startAt === 'string' ? candidate.startAt : ''

    if (!content || !toValidDate(startAt)) return

    items.push({
      id: typeof candidate.id === 'number' ? candidate.id : undefined,
      content,
      startAt,
      endAt: typeof candidate.endAt === 'string' ? candidate.endAt : undefined,
      type: normalizeTopNoticeType(candidate.type),
      routes: normalizeTopNoticeRoutes(candidate.routes),
    })
  })

  return items
}

export function isTopNoticeActive(item: TopNoticeItem, now: Date) {
  const startAt = toValidDate(item.startAt)
  if (!startAt || startAt.getTime() > now.getTime()) return false

  const endAt = toValidDate(item.endAt)
  if (endAt && endAt.getTime() < now.getTime()) return false

  return true
}

export function matchesTopNoticeRoute(pathname: string, routes?: string[]) {
  const routeList = normalizeTopNoticeRoutes(routes)

  return routeList.some((route) => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}
