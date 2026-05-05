import { useEffect, useMemo, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import {
  isTopNoticeActive,
  matchesTopNoticeRoute,
  normalizeTopNoticeItems,
  type TopNoticeType,
} from '@/lib/top-notice'
import { cn } from '@/lib/utils'

const NOTICE_TYPE_STYLES: Record<
  TopNoticeType,
  {
    wrapper: string
    dot: string
    badge: string
  }
> = {
  info: {
    wrapper:
      'border-emerald-200/70 bg-emerald-50/85 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-50',
    dot: 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]',
    badge:
      'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/16 dark:text-emerald-200',
  },
  notice: {
    wrapper:
      'border-orange-200/70 bg-orange-50/90 text-orange-950 dark:border-orange-900/60 dark:bg-orange-950/35 dark:text-orange-50',
    dot: 'bg-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.16)]',
    badge:
      'bg-orange-500/12 text-orange-700 dark:bg-orange-400/16 dark:text-orange-200',
  },
  warning: {
    wrapper:
      'border-red-200/70 bg-red-50/90 text-red-950 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-50',
    dot: 'bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.16)]',
    badge:
      'bg-red-500/12 text-red-700 dark:bg-red-400/16 dark:text-red-200',
  },
}

function getRotationSeconds(value: unknown) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 4
  return Math.min(30, Math.max(2, Math.round(parsed)))
}

type TopNoticeBannerProps = {
  className?: string
  containerClassName?: string
}

export function TopNoticeBanner({
  className,
  containerClassName,
}: TopNoticeBannerProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { t } = useTranslation()
  const { status } = useStatus()
  const [now, setNow] = useState(() => new Date())
  const [activeIndex, setActiveIndex] = useState(0)

  const topNoticeEnabled = Boolean(status?.top_notice_enabled)
  const rotationSeconds = getRotationSeconds(status?.top_notice_rotation_seconds)

  const activeItems = useMemo(() => {
    const items = normalizeTopNoticeItems(status?.top_notice_items)
    return items.filter(
      (item) =>
        isTopNoticeActive(item, now) &&
        matchesTopNoticeRoute(pathname, item.routes)
    )
  }, [now, pathname, status?.top_notice_items])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 30000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setActiveIndex((prev) => {
      if (activeItems.length === 0) return 0
      return prev % activeItems.length
    })
  }, [activeItems.length])

  useEffect(() => {
    if (activeItems.length <= 1) return

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activeItems.length)
    }, rotationSeconds * 1000)

    return () => window.clearInterval(timer)
  }, [activeItems.length, rotationSeconds])

  if (!topNoticeEnabled || activeItems.length === 0) {
    return null
  }

  const currentItem = activeItems[activeIndex] ?? activeItems[0]
  const styles = NOTICE_TYPE_STYLES[currentItem.type ?? 'info']
  const typeLabel = t(
    currentItem.type === 'warning'
      ? 'Warning'
      : currentItem.type === 'notice'
        ? 'Attention'
        : 'Tip'
  )

  return (
    <div className={cn('border-b', styles.wrapper, className)}>
      <div
        className={cn(
          'mx-auto flex min-h-10 items-center gap-3 px-4 py-2 sm:min-h-11 sm:px-6',
          containerClassName
        )}
        aria-live='polite'
      >
        <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', styles.dot)} />
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide',
            styles.badge
          )}
        >
          {typeLabel}
        </span>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium sm:text-[13px]'>
            {currentItem.content}
          </p>
        </div>
        {activeItems.length > 1 && (
          <span className='text-muted-foreground shrink-0 text-xs'>
            {activeIndex + 1}/{activeItems.length}
          </span>
        )}
      </div>
    </div>
  )
}
