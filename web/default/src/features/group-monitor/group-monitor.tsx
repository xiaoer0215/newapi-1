import { VChart } from '@visactor/react-vchart'
import { useQueryClient } from '@tanstack/react-query'
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/context/theme-provider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useIsAdmin } from '@/hooks/use-admin'
import { useStatus } from '@/hooks/use-status'
import { VCHART_OPTION } from '@/lib/vchart'
import { cn } from '@/lib/utils'
import {
  type GroupMonitorBucket,
  type GroupMonitorConfig,
  type GroupMonitorModelStat,
  type GroupMonitorStat,
  type GroupMonitorWindow,
  getAdminGroups,
  getGroupMonitorConfig,
  getGroupMonitorStatus,
  updateGroupMonitorConfig,
} from './api'
import { groupMonitorStyles } from './styles'

let vchartThemeManagerPromise: Promise<
  (typeof import('@visactor/vchart'))['ThemeManager']
> | null = null

type ToneKey = 'green' | 'orange' | 'red' | 'empty'

type TrendPoint = {
  requests: number
  success: number
  error: number
  total: number
}

const WINDOW_OPTIONS: Array<{
  value: GroupMonitorWindow
  label: string
  short: string
}> = [
  { value: '1h', label: '1 Hour', short: '1H' },
  { value: '6h', label: '6 Hours', short: '6H' },
  { value: '12h', label: '12 Hours', short: '12H' },
  { value: '24h', label: '24 Hours', short: '24H' },
]

const WINDOW_TICKS: Record<GroupMonitorWindow, [string, string, string]> = {
  '1h': ['60m ago', '30m ago', 'Now'],
  '6h': ['6h ago', '3h ago', 'Now'],
  '12h': ['12h ago', '6h ago', 'Now'],
  '24h': ['24h ago', '12h ago', 'Now'],
}

const WINDOW_MINUTES: Record<GroupMonitorWindow, number> = {
  '1h': 60,
  '6h': 360,
  '12h': 720,
  '24h': 1440,
}

const WINDOW_BUCKETS: Record<GroupMonitorWindow, number> = {
  '1h': 60,
  '6h': 60,
  '12h': 24,
  '24h': 24,
}

const WINDOW_MAX_AXIS_LABELS: Record<GroupMonitorWindow, number> = {
  '1h': 12,
  '6h': 10,
  '12h': 8,
  '24h': 8,
}

const PAGE_SIZE = 8

const DEFAULT_CONFIG: GroupMonitorConfig = {
  enabled_groups: [],
  refresh_interval: 60,
  public_visible: false,
  model_detail_visible: false,
  default_window: '6h',
}

const STATUS_BADGE_CLASS: Record<ToneKey, string> = {
  green:
    'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300',
  orange:
    'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:text-amber-300',
  red:
    'border-rose-200 bg-rose-500/10 text-rose-700 dark:border-rose-500/30 dark:text-rose-300',
  empty:
    'border-slate-200 bg-slate-500/10 text-slate-600 dark:border-slate-500/30 dark:text-slate-300',
}

const STATUS_DOT_CLASS: Record<ToneKey, string> = {
  green: 'bg-emerald-500',
  orange: 'bg-amber-500',
  red: 'bg-rose-500',
  empty: 'bg-slate-400',
}

const STATUS_TEXT_CLASS: Record<ToneKey, string> = {
  green: 'text-emerald-500',
  orange: 'text-amber-500',
  red: 'text-rose-500',
  empty: 'text-slate-400',
}

const STATUS_BLOCK_COLOR: Record<ToneKey, string> = {
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444',
  empty: '#cbd5e1',
}

function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '--'
  return `${value.toFixed(1)}%`
}

function formatNumber(value: number | null | undefined) {
  return Number(value || 0).toLocaleString()
}

function getWindowShort(windowKey: GroupMonitorWindow) {
  return WINDOW_OPTIONS.find((option) => option.value === windowKey)?.short || '6H'
}

function getOverallStatusFromPct(value: number | null | undefined): ToneKey {
  if (value == null || Number.isNaN(value)) return 'empty'
  if (value >= 80) return 'green'
  if (value >= 60) return 'orange'
  return 'red'
}

function getStatusLabel(status: ToneKey, t: (key: string) => string) {
  switch (status) {
    case 'green':
      return t('Healthy')
    case 'orange':
      return t('Warning')
    case 'red':
      return t('Abnormal')
    default:
      return t('No requests')
  }
}

function getStatusHint(status: ToneKey, t: (key: string) => string) {
  switch (status) {
    case 'green':
      return t('System running normally')
    case 'orange':
      return t('Some groups need attention')
    case 'red':
      return t('There are abnormal groups')
    default:
      return t('Waiting for traffic data')
  }
}

function getGroupTone(
  stat:
    | Pick<GroupMonitorStat, 'total_count' | 'status' | 'success_rate'>
    | Pick<GroupMonitorModelStat, 'total_count' | 'status' | 'success_rate'>
): ToneKey {
  if (!stat.total_count) return 'empty'
  return (stat.status as ToneKey) || getOverallStatusFromPct(stat.success_rate)
}

function summarizeStats(stats: GroupMonitorStat[]) {
  return stats.reduce(
    (acc, item) => {
      acc.total += item.total_count || 0
      acc.success += item.success_count || 0
      acc.error += item.error_count || 0
      return acc
    },
    { total: 0, success: 0, error: 0 }
  )
}

function getStatusRows(stats: GroupMonitorStat[]) {
  const totalGroups = stats.length
  const keys: ToneKey[] = ['green', 'orange', 'red', 'empty']

  return keys.map((key) => {
    const count = stats.filter((item) => getGroupTone(item) === key).length
    return {
      key,
      count,
      percent: totalGroups > 0 ? (count / totalGroups) * 100 : 0,
    }
  })
}

function aggregateBuckets(stats: GroupMonitorStat[]): TrendPoint[] {
  const maxLen = Math.max(0, ...stats.map((item) => item.buckets?.length ?? 0))

  return Array.from({ length: maxLen }, (_, index) => {
    return stats.reduce<TrendPoint>(
      (acc, item) => {
        const bucket = item.buckets?.[index]
        if (!bucket) return acc

        acc.requests += bucket.total_count || 0
        acc.success += bucket.success_count || 0
        acc.error += bucket.error_count || 0
        acc.total += bucket.total_count || 0
        return acc
      },
      { requests: 0, success: 0, error: 0, total: 0 }
    )
  })
}

function compactTrendData(items: TrendPoint[], count: number) {
  const emptyPoint: TrendPoint = { requests: 0, success: 0, error: 0, total: 0 }

  if (!items.length) {
    return Array.from({ length: count }, () => ({ ...emptyPoint }))
  }

  if (items.length <= count) {
    const padded = [...items]
    while (padded.length < count) padded.unshift({ ...emptyPoint })
    return padded
  }

  const step = items.length / count
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor(index * step)
    const end =
      index === count - 1
        ? items.length
        : Math.max(start + 1, Math.floor((index + 1) * step))
    const slice = items.slice(start, end)

    return slice.reduce<TrendPoint>(
      (acc, point) => {
        acc.requests += point.requests
        acc.success += point.success
        acc.error += point.error
        acc.total += point.total
        return acc
      },
      { requests: 0, success: 0, error: 0, total: 0 }
    )
  })
}

function trimTrendData(items: TrendPoint[]) {
  if (!items.length) {
    return {
      items,
      startIndex: 0,
      totalCount: 0,
    }
  }

  const firstIndex = items.findIndex((item) => item.total > 0)
  if (firstIndex === -1) {
    return {
      items,
      startIndex: 0,
      totalCount: items.length,
    }
  }

  let lastIndex = items.length - 1
  while (lastIndex >= firstIndex && items[lastIndex].total <= 0) {
    lastIndex -= 1
  }

  return {
    items: items.slice(firstIndex, lastIndex + 1),
    startIndex: firstIndex,
    totalCount: items.length,
  }
}

function getTimeAxisLabels(
  windowKey: GroupMonitorWindow,
  totalCount: number,
  startIndex = 0,
  count = totalCount
) {
  const totalMinutes = WINDOW_MINUTES[windowKey] || 360
  return Array.from({ length: count }, (_, index) => {
    const globalIndex = startIndex + index
    const offset =
      totalMinutes -
      (totalCount <= 1
        ? 0
        : (globalIndex * totalMinutes) / Math.max(1, totalCount - 1))
    const date = new Date(Date.now() - offset * 60 * 1000)
    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`
  })
}

function getVisibleTimeLabels(labels: string[], windowKey: GroupMonitorWindow) {
  if (labels.length <= 2) {
    return new Set(labels)
  }

  const maxLabels = WINDOW_MAX_AXIS_LABELS[windowKey] || 8
  const step = Math.max(1, Math.ceil(labels.length / maxLabels))
  const visible = new Set<string>()

  labels.forEach((label, index) => {
    if (index === 0 || index === labels.length - 1 || index % step === 0) {
      visible.add(label)
    }
  })

  return visible
}

function formatBucketTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`
}

function getBucketTimeRangeLabel(
  index: number,
  total: number,
  windowKey: GroupMonitorWindow
) {
  const totalMinutes = WINDOW_MINUTES[windowKey] || 360
  const bucketMinutes = totalMinutes / Math.max(1, total)
  const now = Date.now()
  const start = new Date(
    now - (totalMinutes - index * bucketMinutes) * 60 * 1000
  )
  const end = new Date(
    now - (totalMinutes - (index + 1) * bucketMinutes) * 60 * 1000
  )
  return `${formatBucketTime(start)} - ${formatBucketTime(end)}`
}

function buildTrendChartSpec(
  data: TrendPoint[],
  windowKey: GroupMonitorWindow,
  t: (key: string) => string,
  startIndex = 0,
  totalCount = data.length
) {
  const xLabels = getTimeAxisLabels(windowKey, totalCount, startIndex, data.length)
  const visibleTimeLabels = getVisibleTimeLabels(xLabels, windowKey)
  const requestKey = t('Requests')
  const successKey = t('Success')
  const errorKey = t('Errors')
  const chartValues = data.flatMap((point, index) => [
    {
      Time: xLabels[index],
      Series: requestKey,
      Value: point.requests,
      rawValue: point.requests,
    },
    {
      Time: xLabels[index],
      Series: successKey,
      Value: point.success,
      rawValue: point.success,
    },
    {
      Time: xLabels[index],
      Series: errorKey,
      Value: point.error,
      rawValue: point.error,
    },
  ])

  return {
    type: 'area',
    data: [{ id: 'groupMonitorTrend', values: chartValues }],
    xField: 'Time',
    yField: 'Value',
    seriesField: 'Series',
    stack: false,
    padding: {
      top: 6,
      right: 8,
      bottom: 2,
      left: 0,
    },
    legends: {
      visible: false,
    },
    color: {
      type: 'ordinal',
      domain: [requestKey, successKey, errorKey],
      range: ['#3b82f6', '#10b981', '#ef4444'],
    },
    tooltip: {
      mark: {
        content: [
          {
            key: (datum: Record<string, unknown>) => datum?.Series,
            value: (datum: Record<string, unknown>) =>
              formatNumber(Number(datum?.rawValue) || 0),
          },
        ],
      },
      dimension: {
        content: [
          {
            key: (datum: Record<string, unknown>) => datum?.Series,
            value: (datum: Record<string, unknown>) =>
              Number(datum?.rawValue) || 0,
          },
        ],
        updateContent: (
          array: Array<{
            key: string
            value: string | number
          }>
        ) => {
          array.sort((left, right) => (Number(right.value) || 0) - (Number(left.value) || 0))
          let sum = 0
          for (let index = 0; index < array.length; index += 1) {
            const value = Number(array[index].value) || 0
            sum += value
            array[index].value = formatNumber(value)
          }
          array.unshift({
            key: t('Total:'),
            value: formatNumber(sum),
          })
          return array
        },
      },
    },
    area: {
      style: {
        fillOpacity: 0.08,
        curveType: 'monotone',
      },
    },
    line: {
      style: {
        lineWidth: 2.2,
        curveType: 'monotone',
      },
    },
    point: {
      style: {
        size: 3,
      },
      state: {
        dimension_hover: {
          visible: true,
          size: 5,
          lineWidth: 2,
          fill: '#fff',
        },
      },
    },
    crosshair: {
      xField: {
        visible: true,
        line: {
          type: 'line',
          style: {
            strokeOpacity: 0.18,
          },
        },
      },
    },
    axes: [
      {
        orient: 'left',
        label: { visible: true },
        grid: { visible: true },
      },
      {
        orient: 'bottom',
        type: 'band',
        trimPadding: true,
        paddingInner: 0,
        paddingOuter: 0,
        label: {
          visible: true,
          formatMethod: (value: string | string[]) => {
            const text =
              typeof value === 'string'
                ? value
                : Array.isArray(value)
                  ? String(value[0] || '')
                  : String(value || '')
            return visibleTimeLabels.has(text) ? text : ''
          },
        },
      },
    ],
    background: { fill: 'transparent' },
    animation: true,
  }
}

function MonitorHeroIllustration() {
  return (
    <div className='relative h-44 w-56 shrink-0 overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-100 via-blue-100 to-white dark:from-indigo-950/70 dark:via-slate-900 dark:to-slate-800'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgba(129,140,248,.26),transparent_28%),radial-gradient(circle_at_78%_62%,rgba(96,165,250,.22),transparent_26%)] dark:bg-[radial-gradient(circle_at_28%_24%,rgba(129,140,248,.30),transparent_28%),radial-gradient(circle_at_78%_62%,rgba(59,130,246,.18),transparent_30%)]' />
      <div className='absolute left-11 top-12 h-16 w-24 -skew-y-6 rounded-xl border border-indigo-200/80 bg-indigo-500/85 shadow-2xl shadow-indigo-300/40 dark:border-indigo-400/20 dark:shadow-indigo-950/40'>
        <div className='absolute inset-2 rounded-lg bg-indigo-400/60 dark:bg-indigo-300/25' />
        <svg
          className='absolute left-5 top-5 h-12 w-16 text-white/90'
          viewBox='0 0 80 48'
          fill='none'
        >
          <path
            d='M4 34c9-15 19-15 30-2 9 10 17 8 26-7 5-8 10-11 16-10'
            stroke='currentColor'
            strokeWidth='6'
            strokeLinecap='round'
          />
        </svg>
      </div>
      <div className='absolute bottom-8 left-16 h-5 w-20 rounded-full bg-indigo-300/35 blur-md dark:bg-indigo-600/35' />
      <div className='absolute bottom-8 left-14 h-3 w-24 rounded-full bg-indigo-400/45 dark:bg-indigo-500/45' />
      <div className='absolute right-8 top-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-300/50 dark:shadow-indigo-950/40'>
        <svg
          className='h-7 w-7'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='m5 12 4 4L19 6' />
        </svg>
      </div>
      <span className='absolute right-14 top-9 h-2 w-2 rounded-full bg-blue-200/90 dark:bg-blue-300/60' />
      <span className='absolute right-20 bottom-11 h-2.5 w-2.5 rounded-full bg-indigo-200/80 dark:bg-indigo-300/50' />
    </div>
  )
}

function OverviewMetricCard({
  icon,
  iconClass,
  value,
  label,
}: {
  icon: ReactNode
  iconClass: string
  value: string
  label: string
}) {
  return (
    <div className='group-monitor-overview-metric'>
      <div className='group-monitor-overview-metric-row'>
        <div
          className={cn(
            'group-monitor-overview-metric-icon flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg',
            iconClass
          )}
        >
          {icon}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='group-monitor-overview-metric-value text-3xl font-extrabold leading-none tracking-tight text-foreground'>
            {value}
          </div>
          <div className='group-monitor-overview-metric-label mt-2 text-sm font-bold text-muted-foreground'>
            {label}
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewPanel({
  stats,
  windowKey,
}: {
  stats: GroupMonitorStat[]
  windowKey: GroupMonitorWindow
}) {
  const { t } = useTranslation()
  const summary = summarizeStats(stats)
  const successRate =
    summary.total > 0 ? (summary.success / summary.total) * 100 : null
  const statusKey = getOverallStatusFromPct(successRate)

  return (
    <div className='group-monitor-overview-card group-monitor-glass-panel mb-6'>
      <MonitorHeroIllustration />

      <div className='group-monitor-overview-status'>
        <div className='text-sm font-bold text-muted-foreground'>
          {t('Overall Status')}
        </div>
        <div
          className={cn(
            'mt-5 text-3xl font-extrabold tracking-tight',
            STATUS_TEXT_CLASS[statusKey]
          )}
        >
          {getStatusLabel(statusKey, t)}
        </div>
        <div className='group-monitor-overview-status-chip mt-4'>
          <span
            className={cn('h-3.5 w-3.5 rounded-full', STATUS_DOT_CLASS[statusKey])}
          />
          <span>{getStatusHint(statusKey, t)}</span>
        </div>
      </div>

      <div className='group-monitor-overview-divider' />

      <div className='group-monitor-overview-metrics-grid'>
        <OverviewMetricCard
          icon={<Activity className='size-5' />}
          iconClass='bg-emerald-500 shadow-emerald-300/40 dark:shadow-emerald-950/40'
          value={formatPercent(successRate)}
          label={`${t('Success Rate')} / ${getWindowShort(windowKey)}`}
        />
        <OverviewMetricCard
          icon={<Sparkles className='size-5' />}
          iconClass='bg-blue-500 shadow-blue-300/40 dark:shadow-blue-950/40'
          value={formatNumber(summary.total)}
          label={`${t('Requests')} / ${getWindowShort(windowKey)}`}
        />
        <OverviewMetricCard
          icon={<BarChart3 className='size-5' />}
          iconClass='bg-rose-500 shadow-rose-300/40 dark:shadow-rose-950/40'
          value={formatNumber(summary.error)}
          label={`${t('Errors')} / ${getWindowShort(windowKey)}`}
        />
      </div>
    </div>
  )
}

function EqualStatusBars({
  buckets,
  windowKey,
  compact = false,
}: {
  buckets: GroupMonitorBucket[]
  windowKey: GroupMonitorWindow
  compact?: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className={compact ? 'mt-2' : 'mt-4'}>
      <div className={compact ? 'group-monitor-mini-bar-track' : 'group-monitor-bar-track'}>
        {buckets.map((bucket, index) => {
          const tone = bucket.total_count > 0 ? getGroupTone(bucket) : 'empty'
          const rangeLabel = getBucketTimeRangeLabel(index, buckets.length, windowKey)

          return (
            <Tooltip key={`${bucket.index}-${index}`}>
              <TooltipTrigger asChild>
                <div
                  className='group-monitor-bar'
                  style={{
                    background: STATUS_BLOCK_COLOR[tone],
                    opacity: tone === 'empty' ? 0.55 : 1,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side='top' className='group-monitor-bar-tooltip'>
                <div className='space-y-1.5'>
                  <div className='text-[11px] font-semibold opacity-80'>
                    {rangeLabel}
                  </div>
                  {bucket.total_count > 0 ? (
                    <>
                      <div>
                        {t('Requests')}: {formatNumber(bucket.total_count)}
                      </div>
                      <div>
                        {t('Success')}: {formatNumber(bucket.success_count)}
                      </div>
                      <div>
                        {t('Errors')}: {formatNumber(bucket.error_count)}
                      </div>
                      <div>
                        {t('Success Rate')}: {formatPercent(bucket.success_rate)}
                      </div>
                    </>
                  ) : (
                    <div>{t('No requests')}</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
      {!compact ? (
        <div className='group-monitor-tick-row'>
          <span>{t(WINDOW_TICKS[windowKey][0])}</span>
          <span>{t(WINDOW_TICKS[windowKey][1])}</span>
          <span>{t(WINDOW_TICKS[windowKey][2])}</span>
        </div>
      ) : null}
    </div>
  )
}

function ModelRow({
  model,
  windowKey,
}: {
  model: GroupMonitorModelStat
  windowKey: GroupMonitorWindow
}) {
  const { t } = useTranslation()
  const tone = getGroupTone(model)

  return (
    <div className='group-monitor-model-card'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='min-w-0'>
          <div className='truncate text-sm font-bold text-foreground'>
            {model.model_name}
          </div>
          <div className='mt-1 text-xs text-muted-foreground'>
            {t('Requests')}: {formatNumber(model.total_count)} / {t('Errors')}:{' '}
            {formatNumber(model.error_count)}
          </div>
        </div>
        <Badge variant='outline' className={STATUS_BADGE_CLASS[tone]}>
          {formatPercent(model.success_rate)}
        </Badge>
      </div>
      <EqualStatusBars
        buckets={model.buckets || []}
        windowKey={windowKey}
        compact
      />
    </div>
  )
}

function GroupDashboardRow({
  stat,
  modelStats,
  windowKey,
  showModelToggle,
}: {
  stat: GroupMonitorStat
  modelStats: GroupMonitorModelStat[]
  windowKey: GroupMonitorWindow
  showModelToggle: boolean
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const tone = getGroupTone(stat)
  const hasModels = modelStats.length > 0
  const canExpand = showModelToggle && hasModels

  useEffect(() => {
    if (!canExpand) {
      setExpanded(false)
    }
  }, [canExpand])

  return (
    <div className='group-monitor-row'>
      <div className='group-monitor-row-header'>
        <div className='group-monitor-row-title'>
          <span className='group-monitor-row-icon'>
            <svg
              className='h-5 w-5 text-slate-500 dark:text-slate-300'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M12 3 4 7l8 4 8-4-8-4Z' />
              <path d='m4 12 8 4 8-4' />
              <path d='m4 17 8 4 8-4' />
            </svg>
          </span>

          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <div className='truncate text-lg font-extrabold text-foreground'>
                {stat.group}
              </div>
              <Badge variant='outline' className={STATUS_BADGE_CLASS[tone]}>
                <span
                  className={cn(
                    'mr-1.5 inline-block h-1.5 w-1.5 rounded-full',
                    STATUS_DOT_CLASS[tone]
                  )}
                />
                {getStatusLabel(tone, t)}
              </Badge>
            </div>
            <div className='group-monitor-row-subtitle'>
              {t('Updated')}: {new Date(stat.updated_at * 1000).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className='group-monitor-row-metrics'>
          <div className='group-monitor-stat-chip'>
            <div className='text-[11px] font-semibold text-muted-foreground'>
              {t('Success Rate')}
            </div>
            <div className={cn('mt-0.5 text-[18px] font-extrabold leading-none', STATUS_TEXT_CLASS[tone])}>
              {formatPercent(stat.success_rate)}
            </div>
          </div>
          <div className='group-monitor-stat-chip'>
            <div className='text-[11px] font-semibold text-muted-foreground'>
              {t('Errors')}
            </div>
            <div
              className={cn(
                'mt-0.5 text-[18px] font-extrabold leading-none',
                stat.error_count > 0 ? 'text-rose-500' : 'text-foreground'
              )}
            >
              {formatNumber(stat.error_count)}
            </div>
          </div>
        </div>
      </div>

      <EqualStatusBars buckets={stat.buckets || []} windowKey={windowKey} />

      {canExpand ? (
        <button
          type='button'
          className='group-monitor-expand-btn'
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
          {expanded
            ? t('Hide Model Details')
            : `${t('Show Model Details')} (${modelStats.length})`}
        </button>
      ) : null}

      {expanded && canExpand ? (
        <div className='group-monitor-model-shell'>
          {[...modelStats]
            .sort((left, right) => right.total_count - left.total_count)
            .map((model) => (
              <ModelRow key={model.model_name} model={model} windowKey={windowKey} />
            ))}
        </div>
      ) : null}
    </div>
  )
}

function RequestTrendPanel({
  stats,
  windowKey,
}: {
  stats: GroupMonitorStat[]
  windowKey: GroupMonitorWindow
}) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const [themeReady, setThemeReady] = useState(false)
  const rawData = aggregateBuckets(stats)
  const hasTraffic = rawData.some((point) => point.total > 0)
  const fallbackData = compactTrendData(rawData, WINDOW_BUCKETS[windowKey] || 24)
  const trendViewport = hasTraffic
    ? trimTrendData(rawData)
    : {
        items: rawData.length > 0 ? rawData : fallbackData,
        startIndex: 0,
        totalCount: rawData.length > 0 ? rawData.length : fallbackData.length,
      }

  useEffect(() => {
    const updateTheme = async () => {
      setThemeReady(false)

      if (!vchartThemeManagerPromise) {
        vchartThemeManagerPromise = import('@visactor/vchart').then(
          (module) => module.ThemeManager
        )
      }

      const ThemeManager = await vchartThemeManagerPromise
      ThemeManager.setCurrentTheme(resolvedTheme === 'dark' ? 'dark' : 'light')
      setThemeReady(true)
    }

    void updateTheme()
  }, [resolvedTheme])

  const spec = useMemo(
    () =>
      buildTrendChartSpec(
        trendViewport.items,
        windowKey,
        t,
        trendViewport.startIndex,
        trendViewport.totalCount
      ),
    [t, trendViewport, windowKey]
  )

  return (
    <div className='group-monitor-glass-panel group-monitor-insight-card'>
      <div className='mb-2 flex items-center justify-between gap-3'>
        <div>
          <div className='group-monitor-insight-title'>{t('Request Trend')}</div>
          <div className='mt-1 text-xs text-muted-foreground'>
            {getWindowShort(windowKey)}
          </div>
        </div>
        <div className='group-monitor-trend-legend'>
          <span className='inline-flex items-center gap-2'>
            <i className='h-2.5 w-2.5 rounded-full bg-blue-500' />
            {t('Requests')}
          </span>
          <span className='inline-flex items-center gap-2'>
            <i className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
            {t('Success')}
          </span>
          <span className='inline-flex items-center gap-2'>
            <i className='h-2.5 w-2.5 rounded-full bg-rose-500' />
            {t('Errors')}
          </span>
        </div>
      </div>

      <div className='group-monitor-trend-chart'>
        {themeReady ? (
          <VChart
            key={`group-monitor-trend-${resolvedTheme}-${windowKey}-${t('Requests')}`}
            spec={{
              ...spec,
              theme: resolvedTheme === 'dark' ? 'dark' : 'light',
              background: 'transparent',
            }}
            option={VCHART_OPTION}
          />
        ) : null}
      </div>

      {!hasTraffic ? (
        <div className='-mt-2 text-center text-xs text-muted-foreground'>
          {t('No monitoring data yet')}
        </div>
      ) : null}
    </div>
  )
}

function StatusDistributionPanel({ stats }: { stats: GroupMonitorStat[] }) {
  const { t } = useTranslation()
  const rows = getStatusRows(stats)
  const totalGroups = stats.length
  const colors: Record<ToneKey, string> = {
    green: '#10b981',
    orange: '#f59e0b',
    red: '#ef4444',
    empty: '#94a3b8',
  }

  let accumulated = 0
  const gradient =
    totalGroups > 0
      ? rows
          .map((row) => {
            const start = accumulated
            const end = accumulated + (row.count / totalGroups) * 100
            accumulated = end
            return `${colors[row.key]} ${start}% ${end}%`
          })
          .join(', ')
      : colors.empty

  return (
    <div className='group-monitor-glass-panel group-monitor-insight-card'>
      <div className='mb-4'>
        <div className='group-monitor-insight-title'>{t('Status Distribution')}</div>
        <div className='mt-1 text-xs text-muted-foreground'>
          {t('Monitored Groups')}: {formatNumber(totalGroups)}
        </div>
      </div>

      <div className='group-monitor-donut-panel'>
        <div
          className='group-monitor-donut'
          style={{
            background: totalGroups > 0 ? `conic-gradient(${gradient})` : colors.empty,
          }}
        >
          <div className='group-monitor-donut-inner'>
            <div className='text-3xl font-extrabold text-foreground'>
              {formatNumber(totalGroups)}
            </div>
            <div className='mt-1 text-center text-[11px] font-semibold leading-4 text-muted-foreground'>
              {t('Monitored Groups')}
            </div>
          </div>
        </div>

        <div className='group-monitor-donut-legend'>
          {rows.map((row) => (
            <div key={row.key} className='group-monitor-donut-row'>
              <span className='inline-flex items-center gap-2 font-semibold text-foreground'>
                <i
                  className='h-2.5 w-2.5 rounded-full'
                  style={{ background: colors[row.key] }}
                />
                {getStatusLabel(row.key, t)}
              </span>
              <span className='font-bold text-muted-foreground'>
                {row.count} / {row.percent.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RiskFocusPanel({ groups }: { groups: GroupMonitorStat[] }) {
  const { t } = useTranslation()

  return (
    <div className='group-monitor-glass-panel group-monitor-insight-card'>
      <div className='mb-4'>
        <div className='group-monitor-insight-title'>{t('Risk Focus')}</div>
        <div className='mt-1 text-xs text-muted-foreground'>
          {t('Groups with more errors are surfaced here first.')}
        </div>
      </div>

      <div className='space-y-3'>
        {groups.length === 0 ? (
          <div className='group-monitor-risk-item text-sm text-muted-foreground'>
            {t('No abnormal groups in the current window')}
          </div>
        ) : (
          groups.map((group) => {
            const tone = getGroupTone(group)
            return (
              <div key={group.group} className='group-monitor-risk-item'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='min-w-0'>
                    <div className='truncate text-sm font-bold text-foreground'>
                      {group.group}
                    </div>
                    <div className='mt-1 text-xs text-muted-foreground'>
                      {t('Errors')}: {formatNumber(group.error_count)} / {t('Requests')}:{' '}
                      {formatNumber(group.total_count)}
                    </div>
                  </div>
                  <Badge variant='outline' className={STATUS_BADGE_CLASS[tone]}>
                    {formatPercent(group.success_rate)}
                  </Badge>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function ShieldIllustration() {
  return (
    <div className='relative hidden min-h-[220px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-100 via-blue-100 to-white lg:flex dark:from-indigo-950/70 dark:via-slate-900 dark:to-slate-800'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_62%,rgba(129,140,248,.18),transparent_24%),radial-gradient(circle_at_78%_36%,rgba(96,165,250,.16),transparent_28%)] dark:bg-[radial-gradient(circle_at_25%_62%,rgba(129,140,248,.24),transparent_24%),radial-gradient(circle_at_78%_36%,rgba(59,130,246,.18),transparent_30%)]' />
      <div className='absolute bottom-8 h-8 w-36 rounded-full bg-indigo-300/30 blur-md dark:bg-indigo-600/25' />
      <div className='relative flex h-32 w-32 items-center justify-center rounded-full bg-indigo-100/75 shadow-2xl shadow-indigo-200/50 dark:bg-indigo-500/10 dark:shadow-indigo-950/30'>
        <svg className='h-24 w-24 text-indigo-500 drop-shadow-sm' viewBox='0 0 120 120' fill='none'>
          <path d='M60 10 96 24v28c0 27-15 45-36 58-21-13-36-31-36-58V24L60 10Z' fill='currentColor' opacity='.18' />
          <path d='M60 18 88 29v23c0 22-11 36-28 47-17-11-28-25-28-47V29l28-11Z' fill='currentColor' opacity='.26' />
          <path d='m43 58 12 12 25-29' stroke='currentColor' strokeWidth='9' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      </div>
      <span className='absolute left-14 top-14 h-3 w-3 rounded-full bg-indigo-200 dark:bg-indigo-300/50' />
      <span className='absolute right-20 top-10 h-3 w-3 rounded-full bg-indigo-300/70 dark:bg-indigo-300/45' />
      <span className='absolute left-20 bottom-16 h-2.5 w-2.5 rounded-full bg-blue-200 dark:bg-blue-300/40' />
    </div>
  )
}

function ConfigPanel({
  open,
  loading,
  saving,
  config,
  groups,
  onToggleGroup,
  onConfigChange,
  onSave,
}: {
  open: boolean
  loading: boolean
  saving: boolean
  config: GroupMonitorConfig
  groups: string[]
  onToggleGroup: (group: string, checked: boolean) => void
  onConfigChange: (patch: Partial<GroupMonitorConfig>) => void
  onSave: () => void
}) {
  const { t } = useTranslation()

  if (!open) return null

  return (
    <div className='group-monitor-glass-panel mt-6 p-6'>
      <div className='mb-6 flex flex-wrap items-start gap-4'>
        <div className='group-monitor-title-badge'>
          <ShieldCheck className='size-5' />
        </div>
        <div>
          <div className='text-xl font-extrabold tracking-tight text-foreground'>
            {t('Monitor Settings')}
          </div>
          <div className='mt-2 max-w-3xl text-sm leading-6 text-muted-foreground'>
            {t('Select the groups to monitor and control visibility rules.')}
          </div>
        </div>
      </div>

      {loading ? (
        <div className='py-10 text-center text-sm text-muted-foreground'>
          {t('Loading...')}
        </div>
      ) : (
        <div className='group-monitor-admin-grid'>
          <div className='group-monitor-config-card'>
            <div className='group-monitor-config-field'>
              <div className='text-sm font-bold text-foreground'>
                {t('Monitored Groups')}
              </div>
              <div className='group-monitor-group-selector'>
                {groups.map((group) => {
                  const checked = config.enabled_groups.includes(group)

                  return (
                    <label key={group} className='group-monitor-group-chip'>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => onToggleGroup(group, value === true)}
                      />
                      <span className='truncate text-sm font-medium text-foreground'>
                        {group}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className='group-monitor-config-grid'>
              <div className='group-monitor-config-field'>
                <div className='text-sm font-bold text-foreground'>
                  {t('Refresh Interval (seconds)')}
                </div>
                <Input
                  type='number'
                  min={10}
                  value={String(config.refresh_interval || 60)}
                  onChange={(event) => {
                    const next = Math.max(10, Number(event.target.value || 60))
                    onConfigChange({ refresh_interval: next })
                  }}
                />
                <div className='text-xs text-muted-foreground'>
                  {t('Minimum 10 seconds')}
                </div>
              </div>

              <div className='group-monitor-config-field'>
                <div className='text-sm font-bold text-foreground'>
                  {t('Default Time Window')}
                </div>
                <Select
                  value={config.default_window}
                  onValueChange={(value) =>
                    onConfigChange({
                      default_window: value as GroupMonitorWindow,
                    })
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WINDOW_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='group-monitor-config-grid'>
              <label className='group-monitor-group-chip items-start'>
                <div className='flex-1'>
                  <div className='text-sm font-bold text-foreground'>
                    {t('Public Visibility')}
                  </div>
                  <div className='mt-1 text-xs leading-5 text-muted-foreground'>
                    {t('Allow non-admin users to view the group monitor page.')}
                  </div>
                </div>
                <Switch
                  checked={config.public_visible}
                  onCheckedChange={(checked) =>
                    onConfigChange({ public_visible: checked })
                  }
                />
              </label>

              <label className='group-monitor-group-chip items-start'>
                <div className='flex-1'>
                  <div className='text-sm font-bold text-foreground'>
                    {t('User Model Details')}
                  </div>
                  <div className='mt-1 text-xs leading-5 text-muted-foreground'>
                    {t('Allow non-admin users to expand per-model status details.')}
                  </div>
                </div>
                <Switch
                  checked={config.model_detail_visible}
                  onCheckedChange={(checked) =>
                    onConfigChange({ model_detail_visible: checked })
                  }
                />
              </label>
            </div>

            <div className='group-monitor-config-actions'>
              <Button onClick={onSave} disabled={saving} className='min-w-[140px]'>
                {saving ? t('Saving...') : t('Save Settings')}
              </Button>
            </div>
          </div>

          <ShieldIllustration />
        </div>
      )}
    </div>
  )
}

export function GroupMonitor() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isAdmin = useIsAdmin()
  const { status, loading: statusLoading } = useStatus()

  const [stats, setStats] = useState<GroupMonitorStat[]>([])
  const [modelDetail, setModelDetail] = useState<
    Record<string, GroupMonitorModelStat[]>
  >({})
  const [canSeeModelDetail, setCanSeeModelDetail] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [windowKey, setWindowKey] = useState<GroupMonitorWindow>('6h')
  const [windowInitialized, setWindowInitialized] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [lastUpdated, setLastUpdated] = useState('')
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [config, setConfig] = useState<GroupMonitorConfig>(DEFAULT_CONFIG)
  const [groups, setGroups] = useState<string[]>([])
  const [configLoading, setConfigLoading] = useState(false)
  const [configSaving, setConfigSaving] = useState(false)

  const publicVisible = Boolean(status?.group_monitor_public_visible)
  const canOpenPage = isAdmin || publicVisible

  useEffect(() => {
    if (status?.group_monitor_public_visible != null) {
      setConfig((prev) => ({
        ...prev,
        public_visible: Boolean(status.group_monitor_public_visible),
      }))
    }
  }, [status?.group_monitor_public_visible])

  const fetchStatus = useCallback(
    async (targetWindow: GroupMonitorWindow = windowKey) => {
      try {
        setStatsLoading(true)
        const res = await getGroupMonitorStatus(targetWindow, true)
        if (!res.success) {
          toast.error(res.message || t('Failed to load group monitor'))
          return
        }

        setStats(res.data || [])
        setModelDetail(res.model_detail || {})
        setCanSeeModelDetail(Boolean(res.model_detail_visible))

        if (!windowInitialized && res.default_window) {
          setWindowKey(res.default_window)
          setWindowInitialized(true)
        }

        if (res.refresh_interval && res.refresh_interval >= 10) {
          setConfig((prev) => ({
            ...prev,
            refresh_interval: res.refresh_interval || prev.refresh_interval,
          }))
        }

        setLastUpdated(new Date().toLocaleTimeString())
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t('Failed to load group monitor')
        )
      } finally {
        setStatsLoading(false)
      }
    },
    [t, windowInitialized, windowKey]
  )

  const fetchConfig = useCallback(async () => {
    if (!isAdmin) return

    try {
      setConfigLoading(true)
      const [configRes, groupsRes] = await Promise.all([
        getGroupMonitorConfig(),
        getAdminGroups(),
      ])

      if (configRes.success && configRes.data) {
        setConfig(configRes.data)
        if (!windowInitialized && configRes.data.default_window) {
          setWindowKey(configRes.data.default_window)
          setWindowInitialized(true)
        }
      }

      if (groupsRes.success && groupsRes.data) {
        setGroups(groupsRes.data)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('Failed to load configuration')
      )
    } finally {
      setConfigLoading(false)
    }
  }, [isAdmin, t, windowInitialized])

  useEffect(() => {
    if (!statusLoading && canOpenPage) {
      void fetchStatus(windowKey)
    }
  }, [canOpenPage, fetchStatus, statusLoading, windowKey])

  useEffect(() => {
    if (isAdmin) {
      void fetchConfig()
    }
  }, [fetchConfig, isAdmin])

  useEffect(() => {
    if (!canOpenPage) return

    const intervalSeconds = Math.max(10, config.refresh_interval || 60)
    setCountdown(intervalSeconds)

    const pollTimer = window.setInterval(() => {
      void fetchStatus(windowKey)
      setCountdown(intervalSeconds)
    }, intervalSeconds * 1000)

    const countdownTimer = window.setInterval(() => {
      setCountdown((value) => (value > 0 ? value - 1 : 0))
    }, 1000)

    return () => {
      window.clearInterval(pollTimer)
      window.clearInterval(countdownTimer)
    }
  }, [canOpenPage, config.refresh_interval, fetchStatus, windowKey])

  useEffect(() => {
    setCurrentPage(1)
  }, [keyword, windowKey])

  const filteredStats = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) return stats

    return stats.filter((item) =>
      String(item.group || '').toLowerCase().includes(normalized)
    )
  }, [keyword, stats])

  const totalPages = Math.max(1, Math.ceil(filteredStats.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pagedStats = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredStats.slice(start, start + PAGE_SIZE)
  }, [filteredStats, safePage])

  const topRiskGroups = useMemo(
    () =>
      [...filteredStats]
        .filter((item) => item.error_count > 0 || getGroupTone(item) !== 'green')
        .sort((left, right) => {
          if (right.error_count !== left.error_count) {
            return right.error_count - left.error_count
          }
          return left.success_rate - right.success_rate
        })
        .slice(0, 4),
    [filteredStats]
  )

  const onToggleGroup = (group: string, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      enabled_groups: checked
        ? Array.from(new Set([...prev.enabled_groups, group]))
        : prev.enabled_groups.filter((item) => item !== group),
    }))
  }

  const saveConfig = async () => {
    try {
      setConfigSaving(true)
      const res = await updateGroupMonitorConfig(config)
      if (!res.success) {
        toast.error(res.message || t('Failed to save configuration'))
        return
      }

      setWindowInitialized(true)
      setWindowKey(config.default_window)
      toast.success(t('Configuration saved'))
      await queryClient.invalidateQueries({ queryKey: ['status'] })
      await fetchStatus(config.default_window)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('Failed to save configuration')
      )
    } finally {
      setConfigSaving(false)
    }
  }

  if (!statusLoading && !canOpenPage) {
    return (
      <div className='group-monitor-page'>
        <style>{groupMonitorStyles}</style>
        <div className='group-monitor-dashboard-shell'>
          <div className='group-monitor-glass-panel group-monitor-empty mt-8'>
            <ShieldCheck className='mx-auto mb-3 size-10 text-muted-foreground/70' />
            <div className='text-lg font-bold text-foreground'>
              {t('Admin access required')}
            </div>
            <div className='mt-2 text-sm text-muted-foreground'>
              {t('This page is currently visible to administrators only.')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='group-monitor-page'>
      <style>{groupMonitorStyles}</style>

      <div className='group-monitor-dashboard-shell'>
        <div className='group-monitor-hero-header'>
          <div className='group-monitor-hero-heading'>
            <div className='group-monitor-hero-title-row'>
              <h1 className='group-monitor-hero-title text-foreground'>
                {t('Group Status Monitor')}
              </h1>
              <span className='group-monitor-title-badge'>
                <ShieldCheck className='size-5' />
              </span>
              <span className='group-monitor-summary-chip'>
                <strong>{formatNumber(stats.length)}</strong>
                <span>{t('Monitored Groups')}</span>
              </span>
            </div>
            <p className='group-monitor-caption'>
              <span className='group-monitor-pulse-dot' />
              {stats.length > 0
                ? t('Synchronized in real time')
                : t('Live status of monitored groups and models')}
              {lastUpdated ? ` / ${t('Updated')}: ${lastUpdated}` : ''}
            </p>
          </div>

          <button
            type='button'
            className='group-monitor-refresh-btn'
            onClick={() => {
              void fetchStatus(windowKey)
              setCountdown(Math.max(10, config.refresh_interval || 60))
            }}
            disabled={statsLoading}
          >
            <RefreshCw className={cn('size-4', statsLoading && 'animate-spin')} />
            {countdown > 0 ? `${countdown}s / ` : ''}
            {t('Refresh')}
          </button>
        </div>

        <OverviewPanel stats={filteredStats} windowKey={windowKey} />

        <div className='group-monitor-glass-panel group-monitor-toolbar-panel'>
          <div className='group-monitor-toolbar-primary'>
            <span className='mr-2 text-sm font-bold text-foreground/80'>
              {t('Time Granularity')}
            </span>
            <div className='group-monitor-toolbar-window-switch'>
              {[...WINDOW_OPTIONS].reverse().map((option) => (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => setWindowKey(option.value)}
                  className={cn(
                    'group-monitor-time-chip',
                    windowKey === option.value && 'active'
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      windowKey === option.value ? 'bg-white/90' : 'bg-slate-400'
                    )}
                  />
                  {t(option.label)}
                </button>
              ))}
            </div>
          </div>

          <div className='group-monitor-toolbar-actions'>
            <div className='group-monitor-search-shell'>
              <Search className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={t('Search group name...')}
                className='group-monitor-search-input h-10 rounded-2xl'
              />
            </div>

            <div className='group-monitor-mobile-window-select'>
              <Select
                value={windowKey}
                onValueChange={(value) => setWindowKey(value as GroupMonitorWindow)}
              >
                <SelectTrigger className='w-full rounded-2xl'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WINDOW_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {statsLoading && stats.length === 0 ? (
          <div className='group-monitor-glass-panel group-monitor-empty'>
            {t('Loading...')}
          </div>
        ) : filteredStats.length === 0 ? (
          <div className='group-monitor-glass-panel group-monitor-empty'>
            <Eye className='mx-auto mb-3 size-8 text-muted-foreground/70' />
            <div className='text-base font-bold text-foreground'>
              {t('No monitoring data yet')}
            </div>
            <div className='mt-2 text-sm text-muted-foreground'>
              {isAdmin
                ? t('Please select monitored groups below and save the configuration.')
                : t('No groups are currently being monitored.')}
            </div>
          </div>
        ) : (
          <div className='group-monitor-main-grid'>
            <div className='group-monitor-glass-panel group-monitor-list-panel'>
              <div className='group-monitor-list-header'>
                <div>
                  <div className='text-lg font-extrabold text-foreground'>
                    {t('Group Status Board')}
                  </div>
                  <div className='mt-1 text-sm text-muted-foreground'>
                    {t(
                      'Color blocks follow the active theme and reflect real-time request health.'
                    )}
                  </div>
                </div>

                <div className='group-monitor-list-header-badges'>
                  <Badge variant='outline' className={STATUS_BADGE_CLASS.green}>
                    {t('Healthy')}
                  </Badge>
                  <Badge variant='outline' className={STATUS_BADGE_CLASS.orange}>
                    {t('Warning')}
                  </Badge>
                  <Badge variant='outline' className={STATUS_BADGE_CLASS.red}>
                    {t('Abnormal')}
                  </Badge>
                </div>
              </div>

              <div className='group-monitor-list-body'>
                {pagedStats.map((stat) => (
                  <GroupDashboardRow
                    key={stat.group}
                    stat={stat}
                    modelStats={modelDetail[stat.group] || []}
                    windowKey={windowKey}
                    showModelToggle={isAdmin || canSeeModelDetail}
                  />
                ))}
              </div>

              <div className='group-monitor-page-footer'>
                <div className='text-xs font-semibold text-muted-foreground'>
                  {t('Monitored Groups')}: {formatNumber(filteredStats.length)}
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    className='group-monitor-page-switch'
                  >
                    <svg
                      className='h-4 w-4'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.4'
                    >
                      <path d='m15 18-6-6 6-6' />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .slice(0, 5)
                    .map((page) => (
                      <button
                        key={page}
                        type='button'
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'group-monitor-page-switch min-w-8 px-2',
                          page === safePage && 'active'
                        )}
                      >
                        {page}
                      </button>
                    ))}

                  <button
                    type='button'
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    className='group-monitor-page-switch'
                  >
                    <svg
                      className='h-4 w-4'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.4'
                    >
                      <path d='m9 18 6-6-6-6' />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className='group-monitor-insight-stack'>
              <RequestTrendPanel stats={filteredStats} windowKey={windowKey} />
              <StatusDistributionPanel stats={filteredStats} />
              <RiskFocusPanel groups={topRiskGroups} />
            </div>
          </div>
        )}

        <ConfigPanel
          open={isAdmin}
          loading={configLoading}
          saving={configSaving}
          config={config}
          groups={groups}
          onToggleGroup={onToggleGroup}
          onConfigChange={(patch) =>
            setConfig((prev) => ({
              ...prev,
              ...patch,
            }))
          }
          onSave={() => void saveConfig()}
        />
      </div>
    </div>
  )
}
