import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Gem,
  HelpCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { formatTimestampToDate, stringToColor } from '@/lib/format'
import { ROLE } from '@/lib/roles'
import { cn } from '@/lib/utils'
import { SectionPageLayout } from '@/components/layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Markdown } from '@/components/ui/markdown'
import { useAuthStore } from '@/stores/auth-store'
import { getPublicPlans, getSelfSubscriptionFull } from '@/features/subscriptions/api'
import { formatDuration } from '@/features/subscriptions/lib'
import type {
  PlanRecord,
  UserSubscriptionRecord,
} from '@/features/subscriptions/types'
import { SubscriptionPlansCard } from '@/features/wallet/components/subscription-plans-card'
import { useTopupInfo } from '@/features/wallet/hooks'

type FAQItem = {
  question: string
  answer: string
}

type MemberPlanPreview = PlanRecord & {
  planMeta: {
    category: string
    durationText: string
    durationSeconds: number
    title: string
    badge: string
    actionLabel: string
    sortOrder: number
    bullets: string[]
  }
}

type StringRecord = Record<string, string>
type UnknownRecord = Record<string, unknown>

const DAY_SECONDS = 24 * 3600
const MONTH_SECONDS = 30 * DAY_SECONDS
const YEAR_SECONDS = 365 * DAY_SECONDS
const DEFAULT_GROUP_ICON_ALIASES = ['普通用户', '默认分组', '默认']

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

function parseUnknownRecord(value: unknown): UnknownRecord {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as UnknownRecord
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as UnknownRecord
      }
    } catch {
      return {}
    }
  }
  return {}
}

function parseStringRecord(value: unknown): StringRecord {
  const source = parseUnknownRecord(value)
  return Object.entries(source).reduce<StringRecord>((result, [key, item]) => {
    const text = pickString(item)
    if (text) {
      result[key] = text
    }
    return result
  }, {})
}

function normalizeUserGroupText(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function removeSvgRootSizingStyle(styleValue: string): string {
  const blockedProps = new Set([
    'width',
    'height',
    'min-width',
    'min-height',
    'max-width',
    'max-height',
  ])

  return String(styleValue || '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const propName = item.split(':')[0]?.trim().toLowerCase()
      return !!propName && !blockedProps.has(propName)
    })
    .join('; ')
}

function isInlineSvgMarkup(value: string): boolean {
  const trimmed = value.trim()
  return (
    trimmed.startsWith('<svg') ||
    (trimmed.startsWith('<?xml') && trimmed.includes('<svg'))
  )
}

function normalizeInlineSvgMarkup(value: string): string {
  const trimmed = value.trim()
  if (!isInlineSvgMarkup(trimmed)) {
    return trimmed
  }

  return trimmed.replace(/<svg\b([^>]*)>/i, (_match, attrs = '') => {
    let rootStyle = ''
    const nextAttrs = String(attrs)
      .replace(/\swidth\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\sheight\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\spreserveAspectRatio\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\sstyle\s*=\s*(['"])(.*?)\1/i, (_whole, _quote, styleValue) => {
        rootStyle = removeSvgRootSizingStyle(styleValue)
        return ''
      })

    const normalizedStyle = [
      'display:block',
      rootStyle,
      'max-width:100%',
      'max-height:100%',
    ]
      .filter(Boolean)
      .join('; ')

    return `<svg${nextAttrs} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="${normalizedStyle}">`
  })
}

function sanitizeInlineSvgMarkup(value: string): string {
  return normalizeInlineSvgMarkup(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z-]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(
      /\s(?:href|xlink:href)\s*=\s*(['"])\s*javascript:[\s\S]*?\1/gi,
      ''
    )
}

function resolveUserGroupIconSrc(value: unknown): string {
  const trimmed = pickString(value)
  if (!trimmed) {
    return ''
  }

  if (isInlineSvgMarkup(trimmed)) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      sanitizeInlineSvgMarkup(trimmed)
    )}`
  }

  return trimmed
}

function resolveUserGroupIconValue(params: {
  currentGroup: string
  currentGroupDisplayName: string
  groupIcons: StringRecord
  userUsableGroups: StringRecord
}): string {
  const normalizedGroupIcons = Object.entries(params.groupIcons).reduce<StringRecord>(
    (result, [key, value]) => {
      const normalizedKey = normalizeUserGroupText(key)
      if (normalizedKey && value.trim()) {
        result[normalizedKey] = value.trim()
      }
      return result
    },
    {}
  )

  const pickGroupIcon = (candidate: string): string => {
    const directMatch = pickString(params.groupIcons[candidate])
    if (directMatch) {
      return directMatch
    }
    return normalizedGroupIcons[normalizeUserGroupText(candidate)] || ''
  }

  const candidates = [params.currentGroup, params.currentGroupDisplayName]
  if (normalizeUserGroupText(params.currentGroup) === 'default') {
    candidates.push(...DEFAULT_GROUP_ICON_ALIASES)
  }

  Object.entries(params.userUsableGroups).forEach(([groupKey, groupLabel]) => {
    const normalizedKey = normalizeUserGroupText(groupKey)
    const normalizedLabel = normalizeUserGroupText(groupLabel)
    const normalizedCurrent = normalizeUserGroupText(params.currentGroup)
    const normalizedDisplay = normalizeUserGroupText(
      params.currentGroupDisplayName
    )

    if (
      normalizedKey === normalizedCurrent ||
      normalizedLabel === normalizedCurrent ||
      normalizedKey === normalizedDisplay ||
      normalizedLabel === normalizedDisplay
    ) {
      candidates.push(groupKey, groupLabel)
    }
  })

  for (const candidate of candidates) {
    const matched = pickGroupIcon(candidate)
    if (matched) {
      return matched
    }
  }

  return ''
}

function parseMemberUpgradeFaq(raw: unknown): FAQItem[] {
  if (typeof raw !== 'string' || raw.trim() === '') return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is FAQItem =>
          !!item &&
          typeof item === 'object' &&
          typeof (item as FAQItem).question === 'string' &&
          typeof (item as FAQItem).answer === 'string'
      )
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question && item.answer)
  } catch {
    return []
  }
}

function pickLatestSubscription(subscriptions: UserSubscriptionRecord[]) {
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) return null
  return subscriptions.reduce<UserSubscriptionRecord | null>((latest, current) => {
    if (!latest) return current
    return Number(current.subscription?.end_time || 0) >
      Number(latest.subscription?.end_time || 0)
      ? current
      : latest
  }, null)
}

function getPlanDurationSeconds(plan: PlanRecord['plan']): number {
  const unit = String(plan?.duration_unit || 'month').trim().toLowerCase()
  const value = Number(plan?.duration_value || 1)
  if (unit === 'year') return value * YEAR_SECONDS
  if (unit === 'month') return value * MONTH_SECONDS
  if (unit === 'day') return value * DAY_SECONDS
  if (unit === 'custom') return Number(plan?.custom_seconds || 0)
  return value
}

function detectPlanCategory(plan: PlanRecord['plan']): string {
  const unit = String(plan?.duration_unit || 'month').trim().toLowerCase()
  const value = Number(plan?.duration_value || 1)
  const seconds = getPlanDurationSeconds(plan)

  if (
    unit === 'year' ||
    (unit === 'month' && value === 12) ||
    seconds >= YEAR_SECONDS - 10 * DAY_SECONDS
  ) {
    return 'year'
  }
  if (
    (unit === 'month' && value === 6) ||
    seconds >= 6 * MONTH_SECONDS - 10 * DAY_SECONDS
  ) {
    return 'half_year'
  }
  if (
    (unit === 'month' && value === 3) ||
    seconds >= 3 * MONTH_SECONDS - 5 * DAY_SECONDS
  ) {
    return 'quarter'
  }
  if (
    (unit === 'month' && value === 1) ||
    seconds >= MONTH_SECONDS - 3 * DAY_SECONDS
  ) {
    return 'month'
  }
  if ((unit === 'day' && value === 7) || seconds === 7 * DAY_SECONDS) {
    return 'week'
  }
  if ((unit === 'day' && value === 1) || seconds === DAY_SECONDS) {
    return 'day'
  }
  if (seconds > 0 && seconds < 7 * DAY_SECONDS) {
    return 'short_term'
  }
  return 'custom'
}

function getPlanDisplayMeta(
  plan: PlanRecord['plan'],
  t: (key: string, options?: Record<string, unknown>) => string
) {
  const category = detectPlanCategory(plan)
  const durationTextMap: Record<string, string> = {
    month: `1 ${t('months')}`,
    quarter: `3 ${t('months')}`,
    half_year: `6 ${t('months')}`,
    year: `1 ${t('years')}`,
    week: `7 ${t('days')}`,
    day: `1 ${t('days')}`,
  }
  const durationText = durationTextMap[category] || formatDuration(plan, t as never)
  const map: Record<
    string,
    Omit<MemberPlanPreview['planMeta'], 'category' | 'durationText' | 'durationSeconds'>
  > = {
    month: {
      title: t('Month Card'),
      badge: t('Starter Plan'),
      actionLabel: t('Choose Month Card'),
      sortOrder: 10,
      bullets: [
        t('Lightweight activation, suitable for trying first'),
        t('Enjoy member identity and benefits immediately after activation'),
        t('The validity period is clear at a glance, making it easier to use'),
        t('Suitable for experiencing first before deciding on long-term retention'),
      ],
    },
    quarter: {
      title: t('Quarter Card'),
      badge: t('Recommended Plan'),
      actionLabel: t('Activate Quarter Card Now'),
      sortOrder: 20,
      bullets: [
        t('Balances experience and cycle, suitable as the main choice'),
        t('Valid for three months continuously, reducing repeated operations'),
        t('Membership status and expiration information are displayed synchronously'),
        t('Suitable for users who want stable use without considering annual payment for now'),
      ],
    },
    half_year: {
      title: t('Half-year Card'),
      badge: t('Stable Plan'),
      actionLabel: t('Choose Half-year Card'),
      sortOrder: 30,
      bullets: [
        t('Suitable for medium and long-term stable use'),
        t('Reduces interruptions caused by frequent renewals'),
        t('Identity display and expiration information are unified above'),
        t('More worry-free than short-term plans'),
      ],
    },
    year: {
      title: t('Year Card'),
      badge: t('Long-term Plan'),
      actionLabel: t('Choose Year Card'),
      sortOrder: 40,
      bullets: [
        t('Long-term membership plan for continuous use'),
        t('Valid for the whole year, saving the trouble of multiple renewals'),
        t('Identity display and benefit status stay visible for a long time'),
        t('Suitable for users who value stability and continuous experience'),
      ],
    },
    week: {
      title: t('Week Card'),
      badge: t('Flexible Plan'),
      actionLabel: t('Choose Week Card'),
      sortOrder: 50,
      bullets: [
        t('Suitable for flexible short-cycle experience'),
        t('Membership expiration will also be displayed after activation'),
        t('Automatically returns to regular user display after expiration'),
        t('More suitable for on-demand activation'),
      ],
    },
    day: {
      title: t('Day Card'),
      badge: t('Flexible Plan'),
      actionLabel: t('Choose Day Card'),
      sortOrder: 60,
      bullets: [
        t('Suitable for temporary use or quick experience'),
        t('Membership validity will still be displayed after activation'),
        t('Automatically returns to regular user display after expiration'),
        t('More flexible to activate on demand'),
      ],
    },
    short_term: {
      title: t('Short-term Plan'),
      badge: t('Short-term Plan'),
      actionLabel: t('Choose Plan'),
      sortOrder: 70,
      bullets: [
        t(
          'The current duration is {{duration}}, suitable for flexible use or special scenarios',
          {
            duration: durationText,
          }
        ),
        t('Membership validity will be displayed after activation'),
        t('Automatically returns to regular user display after expiration'),
        t('More flexible to activate on demand'),
      ],
    },
    custom: {
      title: t('Custom Plan'),
      badge: t('Custom Plan'),
      actionLabel: t('Choose Plan'),
      sortOrder: 80,
      bullets: [
        t(
          'The current duration is {{duration}}, suitable for flexible use or special scenarios',
          {
            duration: durationText,
          }
        ),
        t('Membership validity will be displayed after activation'),
        t('Automatically returns to regular user display after expiration'),
        t('More flexible to activate on demand'),
      ],
    },
  }
  return {
    category,
    durationText,
    durationSeconds: getPlanDurationSeconds(plan),
    ...(map[category] || map.custom),
  }
}

function getCurrencySymbol(currency?: string): string {
  const normalized = String(currency || '').trim().toUpperCase()
  if (normalized === 'USD') return '$'
  if (normalized === 'EUR') return '€'
  return '￥'
}

function formatPlanPrice(amount: number, currency?: string): string {
  return `${getCurrencySymbol(currency)}${amount.toFixed(
    Number.isInteger(amount) ? 0 : 2
  )}`
}

function getGroupDisplayName(
  group: string,
  userUsableGroups: StringRecord,
  t: (key: string) => string
): string {
  const normalized = normalizeUserGroupText(group)
  if (!normalized || normalized === 'default') {
    return t('Regular User')
  }
  if (normalized === 'svip') {
    return 'SVIP'
  }
  return pickString(userUsableGroups[group], userUsableGroups[normalized], group)
}

function getAvatarText(value: unknown): string {
  const normalized = String(value || '')
    .replace(/\s+/g, '')
    .trim()
  if (!normalized) {
    return 'U'
  }
  return normalized.slice(0, 2).toUpperCase()
}

function FaqItem(props: FAQItem) {
  return (
    <div>
      <h4 className='mb-2 flex items-start gap-2 text-[16px] font-semibold text-[#111418]'>
        <span className='font-extrabold text-[#e3b96a]'>Q:</span>
        <span>{props.question}</span>
      </h4>
      <div className='pl-[26px] text-[14px] leading-[1.75] text-[#626773]'>
        <Markdown>{props.answer}</Markdown>
      </div>
    </div>
  )
}

function BenefitCard(props: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <article className='rounded-[12px] bg-white px-6 py-8 shadow-[0_2px_10px_rgba(17,20,24,0.03)] transition-all duration-200 hover:-translate-y-[4px] hover:shadow-[0_8px_30px_rgba(17,20,24,0.05)]'>
      {props.icon}
      <div className='mt-4'>
        <h4 className='m-0 text-[20px] font-semibold text-[#111418]'>
          {props.title}
        </h4>
        <p className='mt-3 text-[14px] leading-[1.7] text-[#626773]'>
          {props.description}
        </p>
      </div>
    </article>
  )
}

function GroupLogoStage(props: {
  value?: string
  alt: string
  fallback: string
  compact?: boolean
  fallbackTone?: 'warm' | 'neutral'
}) {
  const src = resolveUserGroupIconSrc(props.value)
  const fallbackToneClass =
    props.fallbackTone === 'warm'
      ? 'bg-[linear-gradient(135deg,#f4d59c_0%,#d8a649_100%)] text-white'
      : 'bg-[#eef2f6] text-[#7a808a]'

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        props.compact ? 'h-[120px]' : 'mx-auto h-[160px] w-full max-w-[280px]'
      )}
    >
      {src ? (
        <img
          src={src}
          alt={props.alt}
          className='block h-full w-full object-contain'
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center rounded-[28px] text-[18px] font-bold tracking-[0.04em]',
            fallbackToneClass
          )}
        >
          {props.fallback}
        </div>
      )}
    </div>
  )
}

function ComparisonListItem(props: { active?: boolean; text: string }) {
  return (
    <li className='flex items-start gap-3 text-[14px] leading-[1.75] text-[#626773]'>
      <span
        className={cn(
          'mt-[9px] block h-[8px] w-[8px] flex-shrink-0 rounded-full',
          props.active ? 'bg-[#e3b96a]' : 'bg-[#d1d5db]'
        )}
      />
      <span>{props.text}</span>
    </li>
  )
}

function PlanPreviewCard(props: {
  badge: string
  title: string
  priceText: string
  bullets: string[]
  featured?: boolean
  actionLabel: string
  onClick: () => void
}) {
  return (
    <article
      className={cn(
        'relative flex min-h-full flex-col rounded-[20px] border p-6 shadow-[0_2px_10px_rgba(17,20,24,0.03)]',
        props.featured
          ? 'translate-y-[-8px] border-[rgba(227,185,106,0.5)] bg-[#fffbf0] shadow-[0_16px_40px_rgba(216,166,73,0.15)] max-[900px]:translate-y-0'
          : 'border-transparent bg-white'
      )}
    >
      <span
        className={cn(
          'inline-flex min-h-[28px] items-center self-start rounded-[6px] px-3 text-[12px] font-bold',
          props.featured
            ? 'bg-[linear-gradient(135deg,#F0D290_0%,#D8A649_100%)] text-white'
            : 'bg-[#f3f4f6] text-[#949ba6]'
        )}
      >
        {props.badge}
      </span>
      <div className='mb-6 mt-4 border-b border-[#f3f4f6] pb-6'>
        <h3
          className={cn(
            'm-0 mb-3 text-[18px] font-semibold',
            props.featured ? 'text-[#a67c27]' : 'text-[#626773]'
          )}
        >
          {props.title}
        </h3>
        <div
          className={cn(
            'text-[36px] font-extrabold',
            props.featured ? 'text-[#a67c27]' : 'text-[#111418]'
          )}
        >
          {props.priceText}
        </div>
      </div>
      <ul className='mb-8 flex-1 list-none space-y-3 text-left'>
        {props.bullets.map((item) => (
          <li
            key={item}
            className='flex gap-3 text-[14px] leading-[1.75] text-[#626773]'
          >
            <span
              className={cn(
                'mt-[10px] block h-[6px] w-[6px] flex-shrink-0 rounded-full',
                props.featured ? 'bg-[#e3b96a]' : 'bg-[#d1d5db]'
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <button
        type='button'
        onClick={props.onClick}
        className={cn(
          'inline-flex min-h-11 w-full items-center justify-center rounded-[8px] px-5 text-[15px] font-semibold transition-all duration-200 hover:-translate-y-[1px]',
          props.featured
            ? 'bg-[linear-gradient(135deg,#F0D290_0%,#D8A649_100%)] text-white shadow-[0_8px_20px_rgba(216,166,73,0.3)]'
            : 'border border-[#e3b96a] bg-transparent text-[#a67c27] hover:bg-[#fdf8ec]'
        )}
      >
        {props.actionLabel}
      </button>
    </article>
  )
}

export function MemberUpgrade() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { status, loading: statusLoading } = useStatus()
  const currentUser = useAuthStore((state) => state.auth.user)
  const { topupInfo } = useTopupInfo()

  const currentUserRecord = (currentUser || null) as UnknownRecord | null
  const parsedUserSetting = useMemo(
    () => parseUnknownRecord(currentUser?.setting),
    [currentUser?.setting]
  )

  const avatarSrc = pickString(
    currentUserRecord?.avatar,
    currentUserRecord?.avatar_url,
    currentUserRecord?.avatarUrl,
    currentUserRecord?.picture,
    currentUserRecord?.image,
    currentUserRecord?.photo_url,
    currentUserRecord?.photoUrl,
    parsedUserSetting.avatar,
    parsedUserSetting.avatar_url,
    parsedUserSetting.avatarUrl,
    parsedUserSetting.picture,
    parsedUserSetting.image,
    parsedUserSetting.photo_url,
    parsedUserSetting.photoUrl
  )

  const memberUpgradeEnabled =
    status?.MemberUpgradeEnabled !== false && status?.MemberUpgradeEnabled !== 'false'
  const memberUpgradeAdminOnly =
    status?.MemberUpgradeAdminOnly === true || status?.MemberUpgradeAdminOnly === 'true'
  const canAccess =
    memberUpgradeEnabled &&
    (!memberUpgradeAdminOnly || (currentUser?.role ?? ROLE.GUEST) >= ROLE.ADMIN)

  const faqList = useMemo(
    () => parseMemberUpgradeFaq(status?.MemberUpgradeFAQ),
    [status?.MemberUpgradeFAQ]
  )
  const balanceTitle =
    typeof status?.MemberBalanceConversionTitle === 'string'
      ? status.MemberBalanceConversionTitle.trim()
      : ''
  const balanceContent =
    typeof status?.MemberBalanceConversionContent === 'string'
      ? status.MemberBalanceConversionContent.trim()
      : ''

  const groupIcons = useMemo(
    () => parseStringRecord(status?.user_group_icons),
    [status?.user_group_icons]
  )
  const userUsableGroups = useMemo(
    () => parseStringRecord(status?.user_usable_groups),
    [status?.user_usable_groups]
  )

  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [activeSubscriptions, setActiveSubscriptions] = useState<
    UserSubscriptionRecord[]
  >([])
  const [allSubscriptions, setAllSubscriptions] = useState<
    UserSubscriptionRecord[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!canAccess) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const [plansRes, selfRes] = await Promise.all([
          getPublicPlans(),
          getSelfSubscriptionFull(),
        ])

        if (cancelled) {
          return
        }

        setPlans(plansRes.success ? plansRes.data || [] : [])

        if (selfRes.success && selfRes.data) {
          setActiveSubscriptions(selfRes.data.subscriptions || [])
          setAllSubscriptions(selfRes.data.all_subscriptions || [])
        } else {
          setActiveSubscriptions([])
          setAllSubscriptions([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [canAccess])

  const memberPlans = useMemo(
    () =>
      plans.filter(
        (item) =>
          item?.plan?.show_in_member_upgrade === true &&
          String(item?.plan?.upgrade_group || '').trim().toLowerCase() === 'svip'
      ),
    [plans]
  )

  const memberPlanIdSet = useMemo(
    () => new Set(memberPlans.map((item) => item.plan.id).filter(Boolean)),
    [memberPlans]
  )

  const activeMemberSubscriptions = useMemo(
    () =>
      activeSubscriptions.filter((item) => memberPlanIdSet.has(item.subscription.plan_id)),
    [activeSubscriptions, memberPlanIdSet]
  )

  const allMemberSubscriptions = useMemo(
    () => allSubscriptions.filter((item) => memberPlanIdSet.has(item.subscription.plan_id)),
    [allSubscriptions, memberPlanIdSet]
  )

  const currentGroup = pickString(currentUser?.group, 'default') || 'default'
  const currentGroupName = useMemo(
    () => getGroupDisplayName(currentGroup, userUsableGroups, t),
    [currentGroup, t, userUsableGroups]
  )

  const currentGroupIcon = useMemo(
    () =>
      resolveUserGroupIconValue({
        currentGroup,
        currentGroupDisplayName: currentGroupName,
        groupIcons,
        userUsableGroups,
      }),
    [currentGroup, currentGroupName, groupIcons, userUsableGroups]
  )

  const defaultGroupIcon = useMemo(
    () =>
      resolveUserGroupIconValue({
        currentGroup: 'default',
        currentGroupDisplayName: t('Regular User'),
        groupIcons,
        userUsableGroups,
      }),
    [groupIcons, t, userUsableGroups]
  )

  const svipGroupIcon = useMemo(
    () =>
      resolveUserGroupIconValue({
        currentGroup: 'svip',
        currentGroupDisplayName: 'SVIP',
        groupIcons,
        userUsableGroups,
      }),
    [groupIcons, userUsableGroups]
  )

  const displayUserName =
    pickString(currentUser?.display_name, currentUser?.username, t('User')) || t('User')
  const loginUserName =
    pickString(currentUser?.username, currentUser?.display_name, t('User')) || t('User')

  const isSvipGroup = normalizeUserGroupText(currentGroup) === 'svip'
  const hasActiveMemberSubscription = activeMemberSubscriptions.length > 0
  const isCurrentSvip = isSvipGroup && hasActiveMemberSubscription

  const latestActiveMemberSubscription = useMemo(
    () => pickLatestSubscription(activeMemberSubscriptions),
    [activeMemberSubscriptions]
  )
  const latestMemberSubscription = useMemo(
    () => pickLatestSubscription(allMemberSubscriptions),
    [allMemberSubscriptions]
  )

  const activeMemberEndTime = Number(
    latestActiveMemberSubscription?.subscription?.end_time || 0
  )
  const latestMemberEndTime = Number(latestMemberSubscription?.subscription?.end_time || 0)

  const displayPlans: MemberPlanPreview[] = useMemo(() => {
    if (isCurrentSvip) return []
    return memberPlans
      .map((item) => ({ ...item, planMeta: getPlanDisplayMeta(item.plan, t) }))
      .sort((left, right) => {
        if (left.planMeta.sortOrder !== right.planMeta.sortOrder) {
          return left.planMeta.sortOrder - right.planMeta.sortOrder
        }
        if (left.planMeta.durationSeconds !== right.planMeta.durationSeconds) {
          return left.planMeta.durationSeconds - right.planMeta.durationSeconds
        }
        return Number(left.plan.price_amount || 0) - Number(right.plan.price_amount || 0)
      })
  }, [isCurrentSvip, memberPlans, t])

  const featuredPlanIndex = useMemo(() => {
    const preferredCategories = ['quarter', 'half_year', 'month', 'year']
    for (const category of preferredCategories) {
      const index = displayPlans.findIndex((item) => item.planMeta.category === category)
      if (index >= 0) return index
    }
    return displayPlans.length > 0 ? 0 : -1
  }, [displayPlans])

  const latestMemberPlan =
    latestMemberSubscription?.subscription?.plan_id
      ? memberPlans.find(
          (item) => item.plan.id === latestMemberSubscription.subscription.plan_id
        )
      : null
  const latestMemberPlanMeta = latestMemberPlan
    ? getPlanDisplayMeta(latestMemberPlan.plan, t)
    : null
  const latestMemberPlanTitle =
    latestMemberPlanMeta?.title || latestMemberPlan?.plan?.title || 'SVIP'

  const expiryTimeDisplay =
    isCurrentSvip && activeMemberEndTime > 0
      ? formatTimestampToDate(activeMemberEndTime)
      : latestMemberEndTime > 0
        ? formatTimestampToDate(latestMemberEndTime)
        : t('Not Activated')
  const currentPlanDisplay =
    isCurrentSvip || latestMemberEndTime > 0 ? latestMemberPlanTitle : t('Not Activated')
  const currentRateDisplay = isCurrentSvip ? t('SVIP Preferential Rate') : t('Standard Rate')
  const primaryActionLabel = isCurrentSvip
    ? t('View Current Benefits')
    : t('Activate Membership')
  const currentStatusDescription = isCurrentSvip
    ? t(
        'Membership benefits are active. You are currently enjoying the SVIP identity display and preferential rates.'
      )
    : latestMemberEndTime > 0
      ? t(
          'Your membership benefits have expired. Renew in time if you want to continue enjoying SVIP display and preferential rates.'
        )
      : t(
          'After activation, your page identity will display as SVIP and you will enjoy better rates.'
        )
  const pricingEmptyText = isCurrentSvip
    ? t('Your SVIP membership is active. The purchase entrance is hidden automatically.')
    : t(
        'There are no purchasable plans at the moment. Please try again later or check the plan configuration.'
      )
  const currentStatusSummary = isCurrentSvip
    ? t('SVIP is active')
    : latestMemberEndTime > 0
      ? t('Membership benefits have expired')
      : t('Membership not activated yet')
  const mobileActionHint = isCurrentSvip
    ? t('Tap here to view your current member benefits')
    : latestMemberEndTime > 0
      ? t('Your membership has expired. Renew here to continue your SVIP display and preferential rates')
      : t('Tap here to go directly to the member activation plans')
  const topBannerClasses = isCurrentSvip
    ? 'bg-[linear-gradient(135deg,#EFFDF4_0%,#DCFCE7_100%)] text-[#166534]'
    : latestMemberEndTime > 0
      ? 'bg-[linear-gradient(135deg,#FEF2F2_0%,#FEE2E2_100%)] text-[#7f1d1d]'
      : 'bg-[linear-gradient(135deg,#F8FAFC_0%,#F1F5F9_100%)] text-[#475569]'
  const topBannerIconClasses = isCurrentSvip
    ? 'stroke-[#22c55e]'
    : latestMemberEndTime > 0
      ? 'stroke-[#ef4444]'
      : 'stroke-[#94a3b8]'

  function scrollToSection(sectionId: string) {
    if (typeof document === 'undefined') {
      return
    }
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handlePrimaryAction() {
    scrollToSection(isCurrentSvip ? 'comparison' : 'pricing')
  }

  if (!statusLoading && !canAccess) {
    return (
      <SectionPageLayout>
        <SectionPageLayout.Title>{t('Member Upgrade')}</SectionPageLayout.Title>
        <SectionPageLayout.Description>
          {t('View and purchase member-only upgrade plans')}
        </SectionPageLayout.Description>
        <SectionPageLayout.Content>
          <div className='mx-auto w-full max-w-[1100px] pt-2'>
            <Alert>
              <Wallet className='h-4 w-4' />
              <AlertTitle>{t('Member Upgrade')}</AlertTitle>
              <AlertDescription className='space-y-3'>
                <p>
                  {memberUpgradeEnabled
                    ? t('Member upgrade is only available to administrators')
                    : t('Member upgrade is currently disabled')}
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  type='button'
                  onClick={() => navigate({ to: '/wallet' })}
                >
                  <Wallet className='mr-2 h-4 w-4' />
                  {t('Open Wallet')}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </SectionPageLayout.Content>
      </SectionPageLayout>
    )
  }

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Member Upgrade')}</SectionPageLayout.Title>
      <SectionPageLayout.Description>
        {t('View and purchase member-only upgrade plans')}
      </SectionPageLayout.Description>
      <SectionPageLayout.Content>
        <div className='mx-auto max-w-[1100px] space-y-6 pb-[120px] pt-1'>
          <section className='overflow-hidden rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)]'>
            <div className='flex items-center justify-between gap-6 bg-[linear-gradient(135deg,#F0D290_0%,#E8C470_50%,#D8A649_100%)] px-7 py-6 max-[640px]:flex-col max-[640px]:items-start'>
              <div className='flex min-w-0 flex-1 items-center gap-4'>
                <div className='relative flex h-[68px] w-[68px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-white/75 bg-white/70 shadow-[0_12px_28px_rgba(17,20,24,0.12)]'>
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={displayUserName}
                      className='block h-full w-full object-cover'
                    />
                  ) : (
                    <div
                      className='flex h-full w-full items-center justify-center text-[22px] font-bold tracking-[0.04em] text-white'
                      style={{
                        background: `linear-gradient(135deg, ${stringToColor(loginUserName)} 0%, #0f172a 145%)`,
                      }}
                    >
                      {getAvatarText(displayUserName)}
                    </div>
                  )}
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='mb-2 flex flex-wrap items-center gap-2.5'>
                    <span className='truncate text-[20px] font-semibold leading-none tracking-tight text-[#422006]'>
                      {loginUserName}
                    </span>
                    <span className='inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#7a4d00]'>
                      {currentGroupIcon ? (
                        <img
                          src={resolveUserGroupIconSrc(currentGroupIcon)}
                          alt={currentGroupName}
                          className='h-4 w-4 object-contain'
                        />
                      ) : null}
                      {isCurrentSvip ? 'SVIP' : currentGroupName}
                    </span>
                  </div>

                  <div className='flex w-full flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-[#422006]'>
                    <div className='inline-flex items-center gap-1.5'>
                      <Gem className='h-4 w-4 flex-shrink-0 stroke-[#78350f] opacity-70' />
                      <span className='text-[#78350f] opacity-80'>
                        {t('Current Group')}
                      </span>
                      <span className='font-semibold text-[#422006]'>
                        {currentGroupName}
                      </span>
                    </div>
                    <div className='hidden h-4 w-px bg-gradient-to-b from-transparent via-[#d97706] to-transparent opacity-30 min-[641px]:block'></div>
                    <div className='inline-flex items-center gap-1.5'>
                      <CalendarDays className='h-4 w-4 flex-shrink-0 stroke-[#78350f] opacity-70' />
                      <span className='text-[#78350f] opacity-80'>
                        {t('Expiration Time')}
                      </span>
                      <span className='font-semibold text-[#422006]'>
                        {expiryTimeDisplay}
                      </span>
                    </div>
                    <div className='hidden h-4 w-px bg-gradient-to-b from-transparent via-[#d97706] to-transparent opacity-30 min-[641px]:block'></div>
                    <div className='inline-flex items-center gap-1.5'>
                      <Sparkles className='h-4 w-4 flex-shrink-0 stroke-[#78350f] opacity-70' />
                      <span className='text-[#78350f] opacity-80'>
                        {t('Current Plan')}
                      </span>
                      <span className='font-semibold text-[#422006]'>
                        {currentPlanDisplay}
                      </span>
                    </div>
                    <div className='hidden h-4 w-px bg-gradient-to-b from-transparent via-[#d97706] to-transparent opacity-30 min-[641px]:block'></div>
                    <div className='inline-flex items-center gap-1.5'>
                      <TrendingUp className='h-4 w-4 flex-shrink-0 stroke-[#78350f] opacity-70' />
                      <span className='text-[#78350f] opacity-80'>
                        {t('Current Rate')}
                      </span>
                      <span className='font-semibold text-[#422006]'>
                        {currentRateDisplay}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex flex-shrink-0 gap-2.5 max-[640px]:w-full'>
                <button
                  type='button'
                  onClick={handlePrimaryAction}
                  className='inline-flex h-[42px] items-center justify-center whitespace-nowrap rounded-xl bg-[linear-gradient(135deg,#7c3aed_0%,#6366f1_100%)] px-6 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(124,58,237,0.3)] transition-all duration-200 hover:opacity-90 max-[640px]:flex-1'
                >
                  {primaryActionLabel}
                </button>
                <button
                  type='button'
                  onClick={() => scrollToSection('faq')}
                  className='inline-flex h-[42px] items-center justify-center whitespace-nowrap rounded-xl border border-[rgba(120,53,15,0.2)] bg-white px-6 text-[14px] font-semibold text-[#422006] transition-all duration-200 hover:bg-[#fff8eb] max-[640px]:flex-1'
                >
                  {t('View Instructions')}
                </button>
              </div>
            </div>
            <div className={cn('flex items-start gap-3 px-7 py-4', topBannerClasses)}>
              <RefreshCw className={cn('mt-0.5 h-5 w-5 flex-shrink-0', topBannerIconClasses)} />
              <p className='text-[14px] leading-[1.7]'>{currentStatusDescription}</p>
            </div>
          </section>

          <header className='pt-8 text-center'>
            <h1 className='m-0 text-[clamp(30px,4.2vw,42px)] font-extrabold leading-[1.16] text-[#111418]'>
              {t('Light up your SVIP identity and upgrade display and consumption together')}
            </h1>
            <p className='mx-auto mt-4 max-w-[760px] text-[15px] leading-[1.9] text-[#626773]'>
              {t(
                'After activation, your page identity will switch to SVIP and the membership validity period will be displayed above. SVIP has a lower base unit price, making subsequent consumption more favorable for users who want to retain identity display and enjoy better rates over the long term.'
              )}
            </p>
          </header>

          <section
            id='comparison'
            className='mx-auto grid max-w-[1060px] items-center gap-6 pt-2 xl:grid-cols-[1fr_72px_1fr]'
          >
            <article className='rounded-[28px] border border-[rgba(17,20,24,0.05)] bg-white px-8 py-10 text-center shadow-[0_18px_44px_rgba(17,20,24,0.06)]'>
              <span className='inline-flex rounded-[6px] bg-[#f3f4f6] px-3 py-[6px] text-[12px] font-semibold text-[#949ba6]'>
                {t('Current Status')}
              </span>
              <div className='mx-auto mt-7 max-w-[280px]'>
                <GroupLogoStage
                  value={defaultGroupIcon}
                  alt={t('Regular User')}
                  fallback={t('Regular User')}
                  compact
                  fallbackTone='neutral'
                />
              </div>
              <h3 className='mb-6 mt-8 text-[20px] font-bold text-[#111418]'>
                {t('Regular User')}
              </h3>
              <ul className='mx-auto max-w-[280px] space-y-3 rounded-[16px] bg-[#f7f8fb] p-5 text-left'>
                {[
                  t('The page keeps the regular user display'),
                  t('Consumption is billed at the regular user standard rate'),
                  t('Validity period and status information are displayed more basically'),
                ].map((item) => (
                  <ComparisonListItem key={item} text={item} />
                ))}
              </ul>
            </article>

            <div className='flex items-center justify-center max-xl:py-2'>
              <div className='grid h-11 w-11 place-items-center rounded-full bg-white text-[20px] font-bold text-[#c89b41] shadow-[0_12px_26px_rgba(17,20,24,0.08)] max-xl:rotate-90'>
                <ArrowRight className='h-5 w-5' />
              </div>
            </div>

            <article className='relative rounded-[28px] border border-[rgba(227,185,106,0.28)] bg-[linear-gradient(180deg,#fffefb_0%,#ffffff_100%)] px-8 py-10 text-center shadow-[0_22px_50px_rgba(216,166,73,0.16)]'>
              <span className='inline-flex rounded-[6px] bg-[#fdf8ec] px-3 py-[6px] text-[12px] font-semibold text-[#a67c27]'>
                {t('Enjoy Immediately After Activation')}
              </span>
              <div className='mx-auto mt-7 max-w-[280px]'>
                <GroupLogoStage
                  value={svipGroupIcon}
                  alt='SVIP'
                  fallback='SVIP'
                  compact
                  fallbackTone='warm'
                />
              </div>
              <h3 className='mb-6 mt-8 text-[20px] font-bold text-[#b68427]'>
                SVIP {t('Premium Membership')}
              </h3>
              <ul className='mx-auto max-w-[280px] space-y-3 rounded-[16px] bg-[#fff9ec] p-5 text-left'>
                {[
                  t('The page identity display switches to SVIP'),
                  t('The base unit price is lower, making overall consumption more favorable'),
                  t('The membership validity period is clearly displayed above'),
                  t('It automatically returns to regular user display after expiration'),
                ].map((item) => (
                  <ComparisonListItem key={item} active text={item} />
                ))}
              </ul>
            </article>
          </section>

          <section>
            <div className='text-center'>
              <h2 className='m-0 text-[clamp(26px,3vw,34px)] font-extrabold leading-[1.18] text-[#111418]'>
                {t('Member Exclusive Benefits')}
              </h2>
              <p className='mx-auto mt-3 max-w-[720px] text-[15px] leading-[1.8] text-[#949ba6]'>
                {t('After activating membership, you will enjoy the following privileges')}
              </p>
            </div>
            <div className='mt-10 grid gap-6 lg:grid-cols-3'>
              <BenefitCard
                icon={<Sparkles className='h-8 w-8 text-[#a67c27]' />}
                title={t('Exclusive Identity Badge')}
                description={t(
                  'The SVIP membership badge is displayed in the profile center and related pages, highlighting your premium identity'
                )}
              />
              <BenefitCard
                icon={<TrendingUp className='h-8 w-8 text-[#a67c27]' />}
                title={t('Preferential Consumption Rate')}
                description={t(
                  'Enjoy an exclusive consumption multiplier during membership, reducing API call costs'
                )}
              />
              <BenefitCard
                icon={<CalendarDays className='h-8 w-8 text-[#a67c27]' />}
                title={t('Daily Check-in Rewards')}
                description={t(
                  'Daily check-ins can earn random quota rewards, making continuous use more cost-effective'
                )}
              />
            </div>
          </section>

          {faqList.length > 0 && (
            <section
              id='faq'
              className='rounded-[20px] bg-white p-10 shadow-[0_2px_10px_rgba(17,20,24,0.03)] max-[900px]:p-6'
            >
              <div>
                <h2 className='m-0 text-[clamp(26px,3vw,34px)] font-extrabold leading-[1.18] text-[#111418]'>
                  {t('Frequently Asked Questions About Upgrading')}
                </h2>
                <p className='mt-3 text-[15px] leading-[1.8] text-[#949ba6]'>
                  {t(
                    'These are the most common questions before activation, explained clearly in advance.'
                  )}
                </p>
              </div>
              <div className='mt-8 grid gap-8 lg:grid-cols-2'>
                {faqList.map((item, index) => (
                  <FaqItem
                    key={`${item.question}-${index}`}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </section>
          )}

          {balanceTitle && balanceContent && (
            <section className='flex items-start gap-6 rounded-[12px] border-l-4 border-[#e3b96a] bg-white p-6 shadow-[0_2px_10px_rgba(17,20,24,0.03)] max-[640px]:flex-col'>
              <div className='flex h-8 w-8 items-center justify-center text-[#a67c27]'>
                <Sparkles className='h-8 w-8' />
              </div>
              <div>
                <h4 className='m-0 text-[16px] font-semibold text-[#a67c27]'>
                  {balanceTitle}
                </h4>
                <div className='mt-2 text-[14px] leading-[1.8] text-[#626773]'>
                  <Markdown>{balanceContent}</Markdown>
                </div>
              </div>
            </section>
          )}

          <section id='pricing' className='scroll-mt-[88px]'>
            <div className='text-center'>
              <h2 className='m-0 text-[clamp(26px,3vw,34px)] font-extrabold leading-[1.18] text-[#111418]'>
                {t('Choose the activation plan that suits you')}
              </h2>
              <p className='mx-auto mt-3 max-w-[720px] text-[15px] leading-[1.8] text-[#949ba6]'>
                {t(
                  'The month card is suitable for lighting up the identity display first, the quarter card is suitable as the main recommendation, and the year card is suitable for maintaining SVIP status over the long term.'
                )}
              </p>
            </div>
            <div className='mt-10 grid gap-6 lg:grid-cols-3'>
              {!loading && displayPlans.length > 0 ? (
                displayPlans.map((item, index) => {
                  const price = Number(item.plan.price_amount || 0)
                  const priceText = `${formatPlanPrice(
                    price,
                    item.plan.currency
                  )} / ${item.planMeta.durationText}`
                  return (
                    <PlanPreviewCard
                      key={item.plan.id || `${item.plan.title}-${index}`}
                      badge={
                        index === featuredPlanIndex
                          ? t('Recommended Plan')
                          : item.planMeta.badge
                      }
                      title={item.planMeta.title}
                      priceText={priceText}
                      bullets={item.planMeta.bullets}
                      featured={index === featuredPlanIndex}
                      actionLabel={
                        index === featuredPlanIndex
                          ? t('Activate {{title}} Now', { title: item.planMeta.title })
                          : item.planMeta.actionLabel
                      }
                      onClick={() => scrollToSection('member-upgrade-real-pricing')}
                    />
                  )
                })
              ) : (
                <div className='rounded-[20px] border border-[rgba(227,185,106,0.3)] bg-[#fffbf0] px-6 py-8 text-center shadow-[0_2px_10px_rgba(17,20,24,0.03)] lg:col-span-3'>
                  <div className='text-[28px] font-extrabold text-[#111418]'>
                    {isCurrentSvip
                      ? t('SVIP is active')
                      : t('There are currently no purchasable plans')}
                  </div>
                  <p className='mx-auto mt-3 max-w-[720px] text-[14px] leading-[1.8] text-[#626773]'>
                    {pricingEmptyText}
                  </p>
                </div>
              )}
            </div>

            {displayPlans.length > 0 ? (
              <div id='member-upgrade-real-pricing' className='mt-6'>
                <SubscriptionPlansCard topupInfo={topupInfo} mode='member-upgrade' />
              </div>
            ) : null}
          </section>

          {faqList.length === 0 && (
            <Card id='faq'>
              <CardContent className='py-6'>
                <div className='flex items-center gap-2 text-[#a67c27]'>
                  <HelpCircle className='h-4 w-4' />
                  <span className='text-sm font-medium'>{t('Member Upgrade FAQ')}</span>
                </div>
                <p className='mt-3 text-sm text-muted-foreground'>
                  {t('FAQ not configured yet')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className='fixed bottom-3 left-3 right-3 z-30 hidden items-center justify-between gap-3 rounded-[18px] border border-[rgba(227,185,106,0.2)] bg-[rgba(255,255,255,0.96)] p-3 shadow-[0_18px_34px_rgba(17,20,24,0.14)] backdrop-blur-[12px] max-[760px]:flex'>
          <div>
            <strong className='block text-[14px] text-[#111418]'>
              {currentStatusSummary}
            </strong>
            <span className='mt-1 block text-[12px] leading-[1.5] text-[#949ba6]'>
              {mobileActionHint}
            </span>
          </div>
          <button
            type='button'
            onClick={handlePrimaryAction}
            className='inline-flex min-h-12 min-w-[128px] items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#F0D290_0%,#D8A649_100%)] px-5 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(216,166,73,0.3)]'
          >
            {primaryActionLabel}
          </button>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
