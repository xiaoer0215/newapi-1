import { useEffect, useRef } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useNotifications } from '@/hooks/use-notifications'
import { useTopNavLinks } from '@/hooks/use-top-nav-links'
import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationButton } from '@/components/notification-button'
import { NotificationDialog } from '@/components/notification-dialog'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { TopNoticeBanner } from '@/components/top-notice-banner'
import { defaultTopNavLinks } from '../config/top-nav.config'
import { type TopNavLink } from '../types'
import { Header } from './header'
import { TopNav } from './top-nav'

/**
 * General application Header component
 * Integrates navigation bar, search, configuration and profile functions
 *
 * @example
 * // Basic usage
 * <AppHeader />
 *
 * @example
 * // Custom navigation links
 * <AppHeader navLinks={customLinks} />
 *
 * @example
 * // Hide navigation bar and search box
 * <AppHeader showTopNav={false} showSearch={false} />
 *
 * @example
 * // Fully customize left and right content
 * <AppHeader
 *   leftContent={<CustomLeft />}
 *   rightContent={<CustomRight />}
 * />
 */
type AppHeaderProps = {
  /**
   * Custom navigation links, uses default global navigation or dynamically generated from backend if not provided
   */
  navLinks?: TopNavLink[]
  /**
   * Whether to show top navigation bar
   * @default true
   */
  showTopNav?: boolean
  /**
   * Left content, overrides TopNav if provided
   */
  leftContent?: React.ReactNode
  /**
   * Whether to show search box
   * @default true
   */
  showSearch?: boolean
  /**
   * Custom right content, overrides default right content if provided
   */
  rightContent?: React.ReactNode
  /**
   * Whether to show notification button
   * @default true
   */
  showNotifications?: boolean
  /**
   * Whether to show config drawer
   * @default true
   */
  showConfigDrawer?: boolean
  /**
   * Whether to show profile dropdown
   * @default true
   */
  showProfileDropdown?: boolean
}

export function AppHeader({
  navLinks = defaultTopNavLinks,
  showTopNav = true,
  leftContent,
  showSearch = true,
  rightContent,
  showNotifications = true,
  showConfigDrawer = true,
  showProfileDropdown = true,
}: AppHeaderProps) {
  const routerState = useRouterState()
  // Prioritize dynamically generated links from backend
  const dynamicLinks = useTopNavLinks()
  const links = dynamicLinks.length > 0 ? dynamicLinks : navLinks

  // Notifications hook
  const notifications = useNotifications()
  const autoOpenedLatestAnnouncementRef = useRef('')
  const pathname = routerState.location.pathname
  const {
    dialogOpen,
    activeTab,
    dialogMode,
    notice,
    announcements,
    loading,
    unreadCount,
    closeToday,
    closeDialog,
    openDialog,
    refetchStatus,
    setActiveTab,
    latestAnnouncementKey,
    openLatestAnnouncementDialog,
    closeLatestAnnouncementDialog,
  } = notifications

  useEffect(() => {
    const shouldRefreshAnnouncement =
      pathname === '/dashboard/overview' || pathname === '/dashboard/models'

    if (shouldRefreshAnnouncement) {
      void refetchStatus()
    }
  }, [pathname, refetchStatus])

  useEffect(() => {
    const shouldAutoOpen =
      pathname === '/dashboard/overview' || pathname === '/dashboard/models'
    const routeScopedAnnouncementKey = `${pathname}:${latestAnnouncementKey}`

    if (
      shouldAutoOpen &&
      latestAnnouncementKey &&
      !dialogOpen &&
      autoOpenedLatestAnnouncementRef.current !== routeScopedAnnouncementKey
    ) {
      autoOpenedLatestAnnouncementRef.current = routeScopedAnnouncementKey
      openLatestAnnouncementDialog()
    }
  }, [
    dialogOpen,
    latestAnnouncementKey,
    openLatestAnnouncementDialog,
    pathname,
  ])

  const handleNotificationDialogOpenChange = (open: boolean) => {
    if (open) return

    if (dialogMode === 'latest-announcement') {
      closeLatestAnnouncementDialog()
      return
    }

    closeDialog()
  }

  // Determine left content: custom content > navigation bar > null
  const leftSection =
    leftContent || (showTopNav ? <TopNav links={links} /> : null)

  return (
    <>
      <TopNoticeBanner />

      <Header>
        {leftSection}
        {rightContent ?? (
          <div className='ms-auto flex items-center space-x-4'>
            {showSearch && <Search />}
            {showNotifications && (
              <NotificationButton
                unreadCount={unreadCount}
                onClick={() => openDialog()}
              />
            )}
            <LanguageSwitcher />
            {showConfigDrawer && <ConfigDrawer />}
            {showProfileDropdown && <ProfileDropdown />}
          </div>
        )}
      </Header>

      {/* Notification Dialog */}
      {showNotifications && (
        <NotificationDialog
          open={dialogOpen}
          onOpenChange={handleNotificationDialogOpenChange}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          notice={notice}
          announcements={announcements}
          loading={loading}
          onCloseToday={closeToday}
          mode={dialogMode}
        />
      )}
    </>
  )
}
