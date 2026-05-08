import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { useStatus } from '@/hooks/use-status'

export type TopNavLink = {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
}

const DEFAULT_HEADER_NAV_MODULES = {
  home: true,
  console: true,
  pricing: { enabled: true, requireAuth: false },
  rankings: { enabled: true, requireAuth: false },
  docs: true,
  about: true,
}

function parseAccessModule(
  raw: unknown,
  fallback: { enabled: boolean; requireAuth: boolean }
) {
  if (
    typeof raw === 'boolean' ||
    typeof raw === 'string' ||
    typeof raw === 'number'
  ) {
    return {
      enabled: raw === true || raw === 'true' || raw === '1' || raw === 1,
      requireAuth: fallback.requireAuth,
    }
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    return {
      enabled:
        typeof record.enabled === 'boolean' ? record.enabled : fallback.enabled,
      requireAuth:
        typeof record.requireAuth === 'boolean'
          ? record.requireAuth
          : fallback.requireAuth,
    }
  }

  return { ...fallback }
}

function parseHeaderNavModules(
  raw: unknown
): typeof DEFAULT_HEADER_NAV_MODULES {
  if (!raw || String(raw).trim() === '') {
    return DEFAULT_HEADER_NAV_MODULES
  }

  try {
    const parsed = JSON.parse(String(raw)) as Record<string, unknown>
    return {
      ...DEFAULT_HEADER_NAV_MODULES,
      ...parsed,
      pricing: parseAccessModule(
        parsed.pricing,
        DEFAULT_HEADER_NAV_MODULES.pricing
      ),
      rankings: parseAccessModule(
        parsed.rankings,
        DEFAULT_HEADER_NAV_MODULES.rankings
      ),
    }
  } catch {
    return DEFAULT_HEADER_NAV_MODULES
  }
}

export function useTopNavLinks(): TopNavLink[] {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { auth } = useAuthStore()

  const modules = useMemo(() => {
    return parseHeaderNavModules(status?.HeaderNavModules)
  }, [status?.HeaderNavModules])

  const docsLink: string | undefined = status?.docs_link as string | undefined
  const isAuthed = !!auth?.user

  const links: TopNavLink[] = []

  if (modules?.home !== false) {
    links.push({ title: t('Home'), href: '/' })
  }

  if (modules?.console !== false) {
    links.push({ title: t('Console'), href: '/dashboard' })
  }

  const pricing = modules?.pricing
  if (pricing && typeof pricing === 'object' && pricing.enabled) {
    const disabled = pricing.requireAuth && !isAuthed
    links.push({ title: t('Pricing'), href: '/pricing', disabled })
  }

  const rankings = modules?.rankings
  if (rankings && typeof rankings === 'object' && rankings.enabled) {
    const disabled = rankings.requireAuth && !isAuthed
    links.push({ title: t('Rankings'), href: '/rankings', disabled })
  }

  if (modules?.docs !== false) {
    if (docsLink) {
      links.push({ title: t('Docs'), href: docsLink, external: true })
    } else {
      links.push({ title: t('Docs'), href: '/docs' })
    }
  }

  if (modules?.about !== false) {
    links.push({ title: t('About'), href: '/about' })
  }

  return links
}
