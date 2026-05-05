import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { HeroTerminalDemo } from '../hero-terminal-demo'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

const SECTION_IDS = ['endpoint', 'buttons', 'stats', 'qr'] as const

const DEFAULT_SECTIONS = [
  { id: 'endpoint', enabled: true },
  { id: 'buttons', enabled: true },
  { id: 'stats', enabled: true },
  { id: 'qr', enabled: true },
] as const

const PROVIDER_ICONS = [
  'OpenAI',
  'Claude.Color',
  'Gemini.Color',
  'DeepSeek.Color',
  'Qwen.Color',
  'Moonshot',
  'Zhipu.Color',
  'Volcengine.Color',
] as const

const COMMON_ENDPOINTS = [
  '/v1/chat/completions',
  '/v1/responses',
  '/v1/images/generations',
  '/v1/models',
] as const

type HomePageSectionId = (typeof SECTION_IDS)[number]

type HomePageSectionConfig = {
  id: HomePageSectionId
  enabled: boolean
}

type HomePageConfig = {
  sections: HomePageSectionConfig[]
  qr_image: string
  qr_title: string
  qr_caption: string
  hero_title: string
  hero_highlight: string
  hero_description: string
}

function normalizeHomePageConfig(raw?: string | null): HomePageConfig {
  let parsed: {
    sections?: Array<Partial<HomePageSectionConfig>>
    qr_image?: string
    qr_title?: string
    qr_caption?: string
    hero_title?: string
    hero_highlight?: string
    hero_description?: string
  } = {}

  if (typeof raw === 'string' && raw.trim()) {
    try {
      parsed = JSON.parse(raw) as typeof parsed
    } catch {
      parsed = {}
    }
  }

  const sections: HomePageSectionConfig[] = []
  const seen = new Set<HomePageSectionId>()

  if (Array.isArray(parsed.sections)) {
    for (const item of parsed.sections) {
      const id = item?.id
      if (
        typeof id === 'string' &&
        SECTION_IDS.includes(id as HomePageSectionId) &&
        !seen.has(id as HomePageSectionId)
      ) {
        const normalizedId = id as HomePageSectionId
        sections.push({
          id: normalizedId,
          enabled: item?.enabled !== false,
        })
        seen.add(normalizedId)
      }
    }
  }

  for (const section of DEFAULT_SECTIONS) {
    if (!seen.has(section.id)) {
      sections.push({ ...section })
    }
  }

  return {
    sections,
    qr_image: typeof parsed.qr_image === 'string' ? parsed.qr_image : '',
    qr_title: typeof parsed.qr_title === 'string' ? parsed.qr_title : '',
    qr_caption: typeof parsed.qr_caption === 'string' ? parsed.qr_caption : '',
    hero_title: typeof parsed.hero_title === 'string' ? parsed.hero_title : '',
    hero_highlight:
      typeof parsed.hero_highlight === 'string' ? parsed.hero_highlight : '',
    hero_description:
      typeof parsed.hero_description === 'string'
        ? parsed.hero_description
        : '',
  }
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { systemName, homePageConfig } = useSystemConfig()
  const { status } = useStatus()

  const rawConfig =
    typeof status?.home_page_config === 'string'
      ? status.home_page_config
      : homePageConfig

  const config = useMemo(() => normalizeHomePageConfig(rawConfig), [rawConfig])
  const heroTitle = config.hero_title || t('Unified API Gateway for')
  const heroHighlight = config.hero_highlight || t('All Your AI Models')
  const heroDescription =
    config.hero_description ||
    `${systemName} ${t(
      'is an open-source AI API gateway for self-hosted deployments. Connect multiple upstream services, manage models, keys, quotas, logs, and routing policies in one place.'
    )}`

  const serverAddress =
    typeof status?.server_address === 'string' && status.server_address.trim()
      ? status.server_address
      : typeof window !== 'undefined'
        ? window.location.origin
        : ''

  const docsLink =
    typeof status?.docs_link === 'string' ? status.docs_link.trim() : ''

  const qrFallbackCandidates = [
    status?.wechat_qrcode,
    status?.wechat_qr_code,
    status?.wechat_qrcode_image_url,
    status?.wechat_qr_code_image_url,
    status?.wechat_account_qrcode_image_url,
    status?.WeChatAccountQRCodeImageURL,
  ]

  const wechatQrFallback = qrFallbackCandidates.find(
    (value): value is string => typeof value === 'string' && Boolean(value.trim())
  )

  const qrImage = config.qr_image || wechatQrFallback || ''
  const qrTitle = config.qr_title || t('Scan to purchase')
  const qrCaption =
    config.qr_caption || t('WeChat · Reply "API" · Instant access')
  const qrEnabled =
    config.sections.find((section) => section.id === 'qr')?.enabled !== false
  const showQrCard = qrEnabled && Boolean(qrImage || qrTitle || qrCaption)
  const leftSections = config.sections.filter(
    (section) => section.enabled && section.id !== 'qr'
  )
  const isAuthenticated = Boolean(props.isAuthenticated)

  const renderSection = (sectionId: HomePageSectionId) => {
    switch (sectionId) {
      case 'endpoint':
        return (
          <div
            key={sectionId}
            className='rounded-2xl border border-border/60 bg-background/75 p-4 text-left shadow-sm backdrop-blur-sm'
          >
            <div className='text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase'>
              {t('Base URL')}
            </div>
            <div className='mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2'>
              <code className='min-w-0 flex-1 truncate text-sm font-medium'>
                {serverAddress}
              </code>
              <CopyButton
                value={serverAddress}
                variant='outline'
                size='icon'
                className='rounded-lg'
              />
            </div>
            <p className='text-muted-foreground mt-3 text-sm leading-relaxed'>
              {t('Just replace your model base URL with the address below.')}
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              {COMMON_ENDPOINTS.map((endpoint) => (
                <span
                  key={endpoint}
                  className='bg-muted/60 text-muted-foreground rounded-full border border-border/50 px-2.5 py-1 font-mono text-xs'
                >
                  {endpoint}
                </span>
              ))}
            </div>
          </div>
        )
      case 'buttons':
        return (
          <div
            key={sectionId}
            className={cn(
              'flex flex-wrap items-center gap-3',
              showQrCard ? 'justify-start' : 'justify-center'
            )}
          >
            {isAuthenticated ? (
              <Button className='group rounded-lg' asChild>
                <Link to='/dashboard'>
                  {t('Go to Dashboard')}
                  <ArrowRight className='ml-1 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
                </Link>
              </Button>
            ) : (
              <>
                <Button className='group rounded-lg' asChild>
                  <Link to='/sign-up'>
                    {t('Get Started')}
                    <ArrowRight className='ml-1 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
                  </Link>
                </Button>
                <Button
                  variant='outline'
                  className='border-border/50 hover:border-border hover:bg-muted/50 rounded-lg'
                  asChild
                >
                  <Link to='/pricing'>{t('View Pricing')}</Link>
                </Button>
              </>
            )}

            {docsLink ? (
              <Button
                variant='outline'
                className='border-border/50 hover:border-border hover:bg-muted/50 rounded-lg'
                asChild
              >
                <a href={docsLink} target='_blank' rel='noopener noreferrer'>
                  {t('footer.columns.docs.title')}
                  <ExternalLink className='ml-1 size-3.5' />
                </a>
              </Button>
            ) : null}
          </div>
        )
      case 'stats':
        return (
          <div
            key={sectionId}
            className='rounded-2xl border border-border/60 bg-muted/15 p-4 text-left shadow-sm backdrop-blur-sm'
          >
            <div className='text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase'>
              {t('Supported providers')}
            </div>
            <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
              {t('Supports multiple AI providers and mainstream model routes.')}
            </p>
            <div className='mt-4 flex flex-wrap items-center gap-3'>
              {PROVIDER_ICONS.map((iconName) => (
                <div
                  key={iconName}
                  className='flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-background/80'
                >
                  {getLobeIcon(iconName, 20)}
                </div>
              ))}
              <div className='rounded-full border border-border/50 bg-background/80 px-3 py-1.5 text-sm font-semibold'>
                30+
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <section
      className={cn(
        'relative z-10 flex flex-col overflow-hidden px-6 pt-28 pb-16 md:pt-36 md:pb-24',
        props.className
      )}
    >
      {/* Radial gradient background */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 opacity-25 dark:opacity-[0.12]'
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 20% 20%, oklch(0.72 0.18 250 / 80%) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 40% at 80% 15%, oklch(0.65 0.15 200 / 60%) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 35% at 40% 80%, oklch(0.70 0.12 280 / 40%) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      {/* Grid pattern */}
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black_20%,transparent_100%)] bg-[size:4rem_4rem] opacity-[0.08]'
      />

      <div
        className={cn(
          'mx-auto grid w-full max-w-6xl gap-10',
          showQrCard
            ? 'lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start'
            : 'justify-items-center'
        )}
      >
        <div
          className={cn(
            'flex min-w-0 flex-col',
            showQrCard ? 'items-start text-left' : 'items-center text-center'
          )}
        >
          <h1
            className='landing-animate-fade-up text-[clamp(2rem,5.5vw,3.5rem)] leading-[1.15] font-bold tracking-tight'
            style={{ animationDelay: '0ms' }}
          >
            {heroTitle}
            <br />
            <span className='bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500 bg-clip-text text-transparent'>
              {heroHighlight}
            </span>
          </h1>
          <p
            className={cn(
              'landing-animate-fade-up text-muted-foreground/80 mt-5 text-base leading-relaxed opacity-0 md:text-lg',
              showQrCard ? 'max-w-2xl' : 'max-w-lg'
            )}
            style={{ animationDelay: '80ms' }}
          >
            {heroDescription}
          </p>

          {leftSections.length > 0 ? (
            <div
              className={cn(
                'landing-animate-fade-up mt-8 w-full space-y-4 opacity-0',
                showQrCard ? 'max-w-2xl' : 'max-w-3xl'
              )}
              style={{ animationDelay: '160ms' }}
            >
              {leftSections.map((section) => renderSection(section.id))}
            </div>
          ) : null}
        </div>

        {showQrCard ? (
          <div
            className='landing-animate-fade-up flex w-full justify-center opacity-0 lg:justify-end'
            style={{ animationDelay: '220ms' }}
          >
            <div className='w-full max-w-sm rounded-[28px] border border-border/60 bg-background/80 p-5 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.22)] backdrop-blur-sm dark:shadow-[0_20px_60px_-25px_rgba(0,0,0,0.7)]'>
              {qrImage ? (
                <img
                  src={qrImage}
                  alt={qrTitle}
                  className='aspect-square w-full rounded-2xl border border-border/60 bg-white object-contain p-3'
                />
              ) : (
                <div className='text-muted-foreground flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 text-sm'>
                  {t('QR image panel')}
                </div>
              )}
              <div className='mt-5 text-center'>
                <div className='text-lg font-semibold'>{qrTitle}</div>
                <div className='text-muted-foreground mt-2 text-sm leading-relaxed'>
                  {qrCaption}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className='landing-animate-fade-up w-full opacity-0'
        style={{ animationDelay: '300ms' }}
      >
        <HeroTerminalDemo />
      </div>
    </section>
  )
}
