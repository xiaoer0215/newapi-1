import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNotificationStore } from '@/stores/notification-store'
import { getNotice } from '@/lib/api'
import { useStatus } from '@/hooks/use-status'

function hashString(input: string): string {
  let hash = 0
  if (!input) return '0'

  for (let i = 0; i < input.length; i += 1) {
    const chr = input.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }

  return hash.toString(36)
}

/**
 * Generate a unique key for an announcement
 * Prefer backend id, fall back to a content hash so edits register
 */
function getAnnouncementKey(item: Record<string, unknown>): string {
  if (!item) return ''

  if (item.id !== undefined && item.id !== null) {
    return `id:${item.id}`
  }

  const fingerprint = JSON.stringify({
    publishDate: (item?.publishDate as string) || '',
    content: ((item?.content as string) || '').trim(),
    extra: ((item?.extra as string) || '').trim(),
    type: (item?.type as string) || '',
    title: ((item?.title as string) || '').trim(),
    link: ((item?.link as string) || '').trim(),
  })
  return `hash:${hashString(fingerprint)}`
}

function getAnnouncementTimestamp(item: Record<string, unknown>): number {
  const publishDate = item?.publishDate as string | Date | undefined
  if (!publishDate) return 0

  const timestamp = new Date(publishDate).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

/**
 * Hook to manage notifications (Notice + Announcements)
 * Provides unread counts and read status management
 */
export function useNotifications() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'notice' | 'announcements'>(
    'notice'
  )
  const [dialogMode, setDialogMode] = useState<'all' | 'latest-announcement'>(
    'all'
  )

  // Fetch Notice from API
  const {
    data: noticeResponse,
    isLoading: noticeLoading,
    refetch: refetchNotice,
  } = useQuery({
    queryKey: ['notice'],
    queryFn: getNotice,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch Announcements from status
  const { status, loading: statusLoading, refetch: refetchStatus } = useStatus()
  const announcementsEnabled = status?.announcements_enabled ?? false
  const announcements = useMemo<Record<string, unknown>[]>(() => {
    if (!announcementsEnabled) return []

    return [...((status?.announcements || []) as Record<string, unknown>[])]
      .sort(
        (a, b) => getAnnouncementTimestamp(b) - getAnnouncementTimestamp(a)
      )
      .slice(0, 20)
  }, [announcementsEnabled, status?.announcements])

  // Notification store
  const {
    lastReadNotice,
    markNoticeRead,
    markAnnouncementsRead,
    isAnnouncementRead,
    isNoticeClosed,
    setClosedUntilDate,
  } = useNotificationStore()

  // Extract notice content
  const noticeContent = noticeResponse?.success
    ? (noticeResponse.data || '').trim()
    : ''

  const latestAnnouncement = announcements[0] || null
  const latestAnnouncementKey = latestAnnouncement
    ? getAnnouncementKey(latestAnnouncement)
    : ''
  const isLatestAnnouncementUnread =
    !!latestAnnouncementKey && !isAnnouncementRead(latestAnnouncementKey)

  // Calculate unread counts
  const unreadCounts = useMemo(() => {
    const noticeUnread =
      noticeContent && noticeContent !== lastReadNotice ? 1 : 0

    const announcementsUnread = announcements.filter(
      (item: Record<string, unknown>) => {
        const key = getAnnouncementKey(item)
        return !isAnnouncementRead(key)
      }
    ).length

    return {
      notice: noticeUnread,
      announcements: announcementsUnread,
      total: noticeUnread + announcementsUnread,
    }
  }, [noticeContent, lastReadNotice, announcements, isAnnouncementRead])

  // Handle dialog open
  const handleOpenDialog = useCallback(
    (tab?: 'notice' | 'announcements') => {
      // Mark Notice as read when opening dialog
      if (noticeContent) {
        markNoticeRead(noticeContent)
      }

      setDialogMode('all')
      setActiveTab(tab || 'notice')
      setDialogOpen(true)
    },
    [markNoticeRead, noticeContent]
  )

  const handleOpenLatestAnnouncementDialog = useCallback(() => {
    setDialogMode('latest-announcement')
    setActiveTab('announcements')
    setDialogOpen(true)
  }, [])

  // Handle tab change - mark announcements as read when switching to that tab
  const handleTabChange = useCallback(
    (tab: 'notice' | 'announcements') => {
      setActiveTab(tab)

      if (dialogMode === 'latest-announcement') {
        return
      }

      if (tab === 'announcements' && announcements.length > 0) {
        const allKeys = announcements.map((item: Record<string, unknown>) =>
          getAnnouncementKey(item)
        )
        markAnnouncementsRead(allKeys)
      }
    },
    [announcements, dialogMode, markAnnouncementsRead]
  )

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false)
    setDialogMode('all')
  }, [])

  const handleCloseLatestAnnouncementDialog = useCallback(() => {
    setDialogOpen(false)
    setDialogMode('all')
  }, [])

  // Handle "Close Today" action
  const handleCloseToday = useCallback(() => {
    const today = new Date().toDateString()
    setClosedUntilDate(today)
    setDialogOpen(false)
    setDialogMode('all')
  }, [setClosedUntilDate])

  return {
    // Data
    notice: noticeContent,
    announcements,
    latestAnnouncement,
    latestAnnouncementKey,
    loading: noticeLoading || statusLoading,

    // Unread counts
    unreadCount: unreadCounts.total,
    unreadNoticeCount: unreadCounts.notice,
    unreadAnnouncementsCount: unreadCounts.announcements,
    isLatestAnnouncementUnread,

    // Dialog state
    dialogOpen,
    setDialogOpen,
    activeTab,
    setActiveTab: handleTabChange,
    dialogMode,

    // Actions
    openDialog: handleOpenDialog,
    openLatestAnnouncementDialog: handleOpenLatestAnnouncementDialog,
    closeDialog: handleCloseDialog,
    closeLatestAnnouncementDialog: handleCloseLatestAnnouncementDialog,
    closeToday: handleCloseToday,
    refetchNotice,
    refetchStatus,

    // Status
    isNoticeClosed: isNoticeClosed(),
  }
}
