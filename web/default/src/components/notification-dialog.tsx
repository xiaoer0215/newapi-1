import type { TFunction } from 'i18next'
import { Bell, CalendarClock, Megaphone, Sparkles, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAnnouncementColorClass } from '@/lib/colors'
import { formatDateTimeObject } from '@/lib/time'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Markdown } from '@/components/ui/markdown'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AnnouncementItem {
  type?: string
  content?: string
  extra?: string
  publishDate?: string | Date
}

interface NotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTab: 'notice' | 'announcements'
  onTabChange: (tab: 'notice' | 'announcements') => void
  notice: string
  announcements: AnnouncementItem[]
  loading: boolean
  onCloseToday: () => void
  mode?: 'all' | 'latest-announcement'
}

function getRelativeTime(publishDate: string | Date, t: TFunction): string {
  if (!publishDate) return ''

  const now = new Date()
  const pubDate = new Date(publishDate)

  if (Number.isNaN(pubDate.getTime())) {
    return typeof publishDate === 'string' ? publishDate : ''
  }

  const diffMs = now.getTime() - pubDate.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffMs < 0) return formatDateTimeObject(pubDate)
  if (diffSeconds < 60) return t('Just now')
  if (diffMinutes < 60) {
    return diffMinutes === 1
      ? t('1 minute ago')
      : t('{{count}} minutes ago', { count: diffMinutes })
  }
  if (diffHours < 24) {
    return diffHours === 1
      ? t('1 hour ago')
      : t('{{count}} hours ago', { count: diffHours })
  }
  if (diffDays < 7) {
    return diffDays === 1
      ? t('1 day ago')
      : t('{{count}} days ago', { count: diffDays })
  }
  if (diffWeeks < 4) {
    return diffWeeks === 1
      ? t('1 week ago')
      : t('{{count}} weeks ago', { count: diffWeeks })
  }
  if (diffMonths < 12) {
    return diffMonths === 1
      ? t('1 month ago')
      : t('{{count}} months ago', { count: diffMonths })
  }
  if (diffYears < 2) return t('1 year ago')

  return formatDateTimeObject(pubDate)
}

function AnnouncementDot({ type }: { type?: string }) {
  return (
    <span
      className={cn(
        'mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full',
        getAnnouncementColorClass(type)
      )}
    />
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <p className='text-muted-foreground text-sm'>{message}</p>
    </div>
  )
}

function NoticeContent({
  notice,
  loading,
  t,
}: {
  notice: string
  loading: boolean
  t: TFunction
}) {
  if (loading) {
    return <EmptyState message={t('Loading...')} />
  }

  if (!notice) {
    return <EmptyState message={t('No announcements at this time')} />
  }

  return (
    <ScrollArea className='h-[50vh] pr-4'>
      <Markdown>{notice}</Markdown>
    </ScrollArea>
  )
}

function AnnouncementsContent({
  announcements,
  loading,
  t,
  latestOnly = false,
}: {
  announcements: AnnouncementItem[]
  loading: boolean
  t: TFunction
  latestOnly?: boolean
}) {
  const displayAnnouncements = latestOnly
    ? announcements.slice(0, 1)
    : announcements

  if (loading) {
    return <EmptyState message={t('Loading...')} />
  }

  if (displayAnnouncements.length === 0) {
    return <EmptyState message={t('No system announcements')} />
  }

  return (
    <ScrollArea className='h-[50vh] pr-4'>
      <div className='space-y-0'>
        {displayAnnouncements.map((item, idx) => {
          const publishDate = item.publishDate
            ? new Date(item.publishDate)
            : null
          const relativeTime = publishDate ? getRelativeTime(publishDate, t) : ''
          const absoluteTime = publishDate
            ? formatDateTimeObject(publishDate)
            : ''

          return (
            <div key={idx}>
              <div className='py-3'>
                <div className='flex items-start gap-3'>
                  <AnnouncementDot type={item.type} />
                  <div className='min-w-0 flex-1 space-y-2'>
                    <div className='text-sm'>
                      <Markdown>{item.content || ''}</Markdown>
                    </div>

                    {item.extra && (
                      <div className='text-muted-foreground text-xs'>
                        <Markdown>{item.extra}</Markdown>
                      </div>
                    )}

                    {absoluteTime && (
                      <div className='text-muted-foreground text-xs'>
                        {relativeTime ? `${relativeTime} · ` : ''}
                        {absoluteTime}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {idx < displayAnnouncements.length - 1 && <Separator />}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

function LatestAnnouncementContent({
  announcement,
  loading,
  t,
}: {
  announcement?: AnnouncementItem
  loading: boolean
  t: TFunction
}) {
  if (loading) {
    return <EmptyState message={t('Loading...')} />
  }

  if (!announcement) {
    return <EmptyState message={t('No system announcements')} />
  }

  const publishDate = announcement.publishDate
    ? new Date(announcement.publishDate)
    : null
  const absoluteTime = publishDate ? formatDateTimeObject(publishDate) : ''
  const relativeTime = publishDate ? getRelativeTime(publishDate, t) : ''

  return (
    <div className='space-y-3.5 sm:space-y-5'>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 sm:px-3 sm:text-xs'>
          <Sparkles className='h-3.5 w-3.5' />
          {t('Latest announcement')}
        </span>
        {absoluteTime && (
          <span className='text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs'>
            <CalendarClock className='h-3.5 w-3.5 shrink-0' />
            {relativeTime ? `${relativeTime} · ` : ''}
            {absoluteTime}
          </span>
        )}
      </div>

      <div className='rounded-2xl border bg-muted/20 p-4 shadow-sm sm:rounded-3xl sm:p-5'>
        <div className='flex items-start gap-3'>
          <AnnouncementDot type={announcement.type} />
          <div className='min-w-0 flex-1 space-y-3 sm:space-y-4'>
            <Markdown className='prose-p:text-sm prose-p:leading-7'>
              {announcement.content || ''}
            </Markdown>
            {announcement.extra && (
              <div className='rounded-xl border border-dashed px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3'>
                <div className='text-muted-foreground mb-2 text-xs font-medium'>
                  {t('Extra Notes (Optional)')}
                </div>
                <Markdown className='prose-p:text-xs prose-p:leading-6'>
                  {announcement.extra}
                </Markdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationDialog({
  open,
  onOpenChange,
  activeTab,
  onTabChange,
  notice,
  announcements,
  loading,
  onCloseToday,
  mode = 'all',
}: NotificationDialogProps) {
  const { t } = useTranslation()

  if (mode === 'latest-announcement') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className='max-h-[92vh] w-[calc(100vw-1rem)] overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-xl md:max-w-2xl'
        >
          <div className='overflow-hidden rounded-[24px] border bg-background shadow-2xl sm:rounded-[28px]'>
            <div className='relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 px-4 py-4 text-white sm:px-6 sm:py-5'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_45%)]' />
              <div className='relative flex items-start justify-between gap-3 sm:gap-4'>
                <div className='min-w-0 space-y-2.5 sm:space-y-3'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white sm:px-3 sm:text-xs'>
                    <Megaphone className='h-3.5 w-3.5' />
                    {t('Latest announcement')}
                  </span>
                  <div className='space-y-1.5 sm:space-y-2'>
                    <DialogTitle className='text-xl font-semibold tracking-tight text-white sm:text-2xl'>
                      {t('System Announcements')}
                    </DialogTitle>
                    <DialogDescription className='max-w-xl text-xs leading-5 text-white/85 sm:text-sm sm:leading-6'>
                      {t('Please review the latest system announcement below.')}
                    </DialogDescription>
                  </div>
                </div>

                <DialogClose asChild>
                  <button
                    type='button'
                    aria-label={t('Close')}
                    className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/20 sm:h-10 sm:w-10'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </DialogClose>
              </div>
            </div>

            <div className='max-h-[58vh] overflow-y-auto p-4 sm:max-h-[60vh] sm:p-6'>
              <LatestAnnouncementContent
                announcement={announcements[0]}
                loading={loading}
                t={t}
              />
            </div>

            <div className='border-t bg-muted/20 px-4 py-3 sm:px-6 sm:py-4'>
              <div className='flex justify-end'>
                <Button
                  onClick={() => onOpenChange(false)}
                  className='w-full sm:min-w-24 sm:w-auto'
                >
                  {t('Close')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('System Announcements')}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={onTabChange as (value: string) => void}
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='notice' className='gap-1.5'>
              <Bell className='h-3.5 w-3.5' />
              {t('Notice')}
            </TabsTrigger>
            <TabsTrigger value='announcements' className='gap-1.5'>
              <Megaphone className='h-3.5 w-3.5' />
              {t('Timeline')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='notice' className='mt-4'>
            <NoticeContent notice={notice} loading={loading} t={t} />
          </TabsContent>

          <TabsContent value='announcements' className='mt-4'>
            <AnnouncementsContent
              announcements={announcements}
              loading={loading}
              t={t}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={onCloseToday}>
            {t('Close Today')}
          </Button>
          <Button onClick={() => onOpenChange(false)}>{t('Close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
