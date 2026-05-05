import { type SyntheticEvent, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { Markdown } from '@/components/ui/markdown'
import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import { useTheme } from '@/context/theme-provider'
import { CTA, Features, Hero, HowItWorks, Stats } from './components'
import { useHomePageContent } from './hooks'

type CustomHomeContentMode =
  | 'default'
  | 'iframe-url'
  | 'iframe-srcdoc'
  | 'html'
  | 'markdown'

const HOME_PAGE_IFRAME_SELECTOR = 'iframe[data-home-page-frame="true"]'

function isRemoteContentUrl(content = '') {
  return /^https?:\/\//i.test(content.trim())
}

function isFullHtmlDocument(content = '') {
  return /<!doctype\s+html|<html[\s>]|<head[\s>]|<body[\s>]/i.test(content)
}

function looksLikeHtmlFragment(content = '') {
  return /^\s*<([a-zA-Z!][^>]*)>/m.test(content) || /<\/[a-zA-Z][^>]*>/m.test(content)
}

function shouldPromoteToTopNavigation(href = '') {
  const trimmedHref = href.trim()
  if (
    !trimmedHref ||
    trimmedHref.startsWith('#') ||
    /^javascript:/i.test(trimmedHref) ||
    /^mailto:/i.test(trimmedHref) ||
    /^tel:/i.test(trimmedHref)
  ) {
    return false
  }

  try {
    const targetUrl = new URL(trimmedHref, window.location.origin)
    return targetUrl.origin === window.location.origin
  } catch {
    return false
  }
}

export function Home() {
  const { t, i18n } = useTranslation()
  const { auth } = useAuthStore()
  const { resolvedTheme } = useTheme()
  const isAuthenticated = !!auth.user
  const { content, isLoaded } = useHomePageContent()

  const resolvedContent = useMemo<{
    mode: CustomHomeContentMode
    content: string
  }>(() => {
    const rawContent = content || ''
    const trimmedContent = rawContent.trim()

    if (!trimmedContent) {
      return { mode: 'default', content: '' }
    }

    if (isRemoteContentUrl(trimmedContent)) {
      return { mode: 'iframe-url', content: trimmedContent }
    }

    if (isFullHtmlDocument(trimmedContent)) {
      return { mode: 'iframe-srcdoc', content: rawContent }
    }

    if (looksLikeHtmlFragment(trimmedContent)) {
      return { mode: 'html', content: rawContent }
    }

    return { mode: 'markdown', content: rawContent }
  }, [content])

  useEffect(() => {
    if (
      resolvedContent.mode !== 'iframe-url' &&
      resolvedContent.mode !== 'iframe-srcdoc'
    ) {
      return
    }

    const iframeElement = document.querySelector<HTMLIFrameElement>(
      HOME_PAGE_IFRAME_SELECTOR
    )

    if (!iframeElement?.contentWindow) {
      return
    }

    iframeElement.contentWindow.postMessage({ themeMode: resolvedTheme }, '*')
    iframeElement.contentWindow.postMessage({ lang: i18n.language }, '*')

    try {
      const doc = iframeElement.contentDocument || iframeElement.contentWindow.document
      if (!doc) return

      doc.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
        const href = anchor.getAttribute('href') || ''
        if (
          shouldPromoteToTopNavigation(href) &&
          (!anchor.target || anchor.target === '_self')
        ) {
          anchor.setAttribute('target', '_top')
        }
      })
    } catch {
      // Cross-origin iframe content cannot be bridged from the parent page.
    }
  }, [i18n.language, resolvedContent.content, resolvedContent.mode, resolvedTheme])

  const handleHomePageFrameLoad = (
    event: SyntheticEvent<HTMLIFrameElement>
  ) => {
    const iframeElement = event.currentTarget

    if (!iframeElement.contentWindow) {
      return
    }

    iframeElement.contentWindow.postMessage({ themeMode: resolvedTheme }, '*')
    iframeElement.contentWindow.postMessage({ lang: i18n.language }, '*')
  }

  if (!isLoaded && resolvedContent.mode === 'default') {
    return (
      <PublicLayout showMainContainer={false}>
        <main className='flex min-h-screen items-center justify-center'>
          <div className='text-muted-foreground'>{t('Loading...')}</div>
        </main>
      </PublicLayout>
    )
  }

  if (resolvedContent.mode !== 'default') {
    return (
      <PublicLayout showMainContainer={false} showHeader={false}>
        <main className='w-full overflow-x-hidden'>
          {resolvedContent.mode === 'iframe-url' ? (
            <iframe
              data-home-page-frame='true'
              src={resolvedContent.content}
              className='min-h-[100dvh] w-full border-none'
              title={t('Custom Home Page')}
              onLoad={handleHomePageFrameLoad}
            />
          ) : resolvedContent.mode === 'iframe-srcdoc' ? (
            <iframe
              data-home-page-frame='true'
              srcDoc={resolvedContent.content}
              className='min-h-[100dvh] w-full border-none'
              title={t('Custom Home Page')}
              onLoad={handleHomePageFrameLoad}
            />
          ) : resolvedContent.mode === 'html' ? (
            <div
              className='min-h-[100dvh] w-full'
              dangerouslySetInnerHTML={{ __html: resolvedContent.content }}
            />
          ) : (
            <div className='container mx-auto px-4 py-8'>
              <Markdown className='custom-home-content'>
                {resolvedContent.content}
              </Markdown>
            </div>
          )}
        </main>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout showMainContainer={false}>
      <Hero isAuthenticated={isAuthenticated} />
      <Stats />
      <Features />
      <HowItWorks />
      <CTA isAuthenticated={isAuthenticated} />
      <Footer />
    </PublicLayout>
  )
}
