import {
  LayoutDashboard,
  Activity,
  Key,
  FileText,
  Wallet,
  Box,
  Users,
  Ticket,
  User,
  Command,
  Radio,
  FlaskConical,
  MessageSquare,
  Sparkles,
  CreditCard,
  ListTodo,
  Settings,
  Crown,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { WORKSPACE_IDS } from '@/components/layout/lib/workspace-registry'
import { type SidebarData } from '@/components/layout/types'
import { useStatus } from '@/hooks/use-status'
import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

export function useSidebarData(): SidebarData {
  const { t } = useTranslation()
  const { status } = useStatus()
  const userRole = useAuthStore((state) => state.auth.user?.role ?? 0)
  const canSeeGroupMonitor =
    userRole >= ROLE.ADMIN || Boolean(status?.group_monitor_public_visible)
  const memberUpgradeEnabled =
    status?.MemberUpgradeEnabled !== false &&
    status?.MemberUpgradeEnabled !== 'false'
  const memberUpgradeAdminOnly =
    status?.MemberUpgradeAdminOnly === true ||
    status?.MemberUpgradeAdminOnly === 'true'
  const canSeeMemberUpgrade =
    memberUpgradeEnabled &&
    (!memberUpgradeAdminOnly || userRole >= ROLE.ADMIN)

  return useMemo(
    () => ({
      workspaces: [
        {
          id: WORKSPACE_IDS.DEFAULT,
          name: '',
          logo: Command,
          plan: '',
        },
      ],
      navGroups: [
        {
          id: 'chat',
          title: t('Chat'),
          items: [
            {
              title: t('Playground'),
              url: '/playground',
              icon: FlaskConical,
            },
            {
              title: t('Chat'),
              icon: MessageSquare,
              type: 'chat-presets',
            },
            {
              title: t('AI Drawing'),
              url: '/drawing',
              icon: Sparkles,
            },
          ],
        },
        {
          id: 'general',
          title: t('General'),
          items: [
            {
              title: t('Overview'),
              url: '/dashboard/overview',
              icon: Activity,
            },
            {
              title: t('Dashboard'),
              url: '/dashboard/models',
              icon: LayoutDashboard,
            },
            {
              title: t('API Keys'),
              url: '/keys',
              icon: Key,
            },
            {
              title: t('Usage Logs'),
              url: '/usage-logs/common',
              icon: FileText,
            },
            {
              title: t('Task Logs'),
              url: '/usage-logs/task',
              activeUrls: ['/usage-logs/drawing'],
              configUrls: ['/usage-logs/drawing', '/usage-logs/task'],
              icon: ListTodo,
            },
            ...(canSeeGroupMonitor
              ? [
                  {
                    title: t('Group Monitor'),
                    url: '/group-monitor',
                    icon: Activity,
                    configUrls: ['/group-monitor'],
                  },
                ]
              : []),
          ],
        },
        {
          id: 'personal',
          title: t('Personal'),
          items: [
            {
              title: t('Wallet'),
              url: '/wallet',
              icon: Wallet,
            },
            ...(canSeeMemberUpgrade
              ? [
                  {
                    title: t('Member Upgrade'),
                    url: '/member-upgrade',
                    icon: Crown,
                  },
                ]
              : []),
            {
              title: t('Profile'),
              url: '/profile',
              icon: User,
            },
          ],
        },
        {
          id: 'admin',
          title: t('Admin'),
          items: [
            {
              title: t('Channels'),
              url: '/channels',
              icon: Radio,
            },
            {
              title: t('Models'),
              url: '/models/metadata',
              icon: Box,
            },
            {
              title: t('Users'),
              url: '/users',
              icon: Users,
            },
            {
              title: t('Redemption Codes'),
              url: '/redemption-codes',
              icon: Ticket,
            },
            {
              title: t('Subscription Management'),
              url: '/subscriptions',
              icon: CreditCard,
            },
            {
              title: t('System Settings'),
              url: '/system-settings/general',
              activeUrls: ['/system-settings'],
              icon: Settings,
            },
          ],
        },
      ],
    }),
    [canSeeGroupMonitor, canSeeMemberUpgrade, t]
  )
}



