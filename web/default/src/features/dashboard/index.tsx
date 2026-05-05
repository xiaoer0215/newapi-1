import {
  type ReactElement,
  useState,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { useAuthStore } from '@/stores/auth-store'
import { ROLE } from '@/lib/roles'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionPageLayout } from '@/components/layout'
import {
  CardStaggerContainer,
  CardStaggerItem,
  FadeIn,
} from '@/components/page-transition'
import {
  buildDefaultDashboardFilters,
  getSavedChartPreferences,
  saveChartPreferences,
} from './lib'
import { ModelsChartPreferences } from './components/models/models-chart-preferences'
import { ModelsFilter } from './components/models/models-filter-dialog'
import { AnnouncementsPanel } from './components/overview/announcements-panel'
import { ApiInfoPanel } from './components/overview/api-info-panel'
import { ContactPanelsPanel } from './components/overview/contact-panels-panel'
import { FAQPanel } from './components/overview/faq-panel'
import { SummaryCards } from './components/overview/summary-cards'
import { UptimePanel } from './components/overview/uptime-panel'
import { DEFAULT_TIME_GRANULARITY } from './constants'
import {
  type DashboardSectionId,
  DASHBOARD_DEFAULT_SECTION,
  DASHBOARD_SECTION_IDS,
} from './section-registry'
import {
  type ContactPanelConfig,
  type DashboardChartPreferences,
  type DashboardFilters,
  type QuotaDataItem,
} from './types'

const route = getRouteApi('/_authenticated/dashboard/$section')

const LazyLogStatCards = lazy(() =>
  import('./components/models/log-stat-cards').then((m) => ({
    default: m.LogStatCards,
  }))
)

const LazyModelCharts = lazy(() =>
  import('./components/models/model-charts').then((m) => ({
    default: m.ModelCharts,
  }))
)

const LazyConsumptionDistributionChart = lazy(() =>
  import('./components/models/consumption-distribution-chart').then((m) => ({
    default: m.ConsumptionDistributionChart,
  }))
)

const LazyUserCharts = lazy(() =>
  import('./components/users/user-charts').then((m) => ({
    default: m.UserCharts,
  }))
)

function LogStatCardsFallback() {
  return (
    <div className='overflow-hidden rounded-lg border'>
      <div className='divide-border/60 grid grid-cols-2 divide-x sm:grid-cols-3 lg:grid-cols-5'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='px-4 py-3.5 sm:px-5 sm:py-4'>
            <Skeleton className='h-3.5 w-16' />
            <Skeleton className='mt-2 h-7 w-20' />
            <Skeleton className='mt-1.5 h-3.5 w-28' />
          </div>
        ))}
      </div>
    </div>
  )
}

function ModelChartsFallback() {
  return (
    <div className='overflow-hidden rounded-lg border'>
      <div className='flex items-center justify-between border-b px-4 py-3 sm:px-5'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-8 w-72' />
      </div>
      <div className='h-96 p-2'>
        <Skeleton className='h-full w-full' />
      </div>
    </div>
  )
}

const SECTION_META: Record<
  DashboardSectionId,
  { titleKey: string; descriptionKey: string }
> = {
  overview: {
    titleKey: 'Overview',
    descriptionKey: 'View dashboard overview and statistics',
  },
  models: {
    titleKey: 'Model Call Analytics',
    descriptionKey: 'View model call count analytics and charts',
  },
  users: {
    titleKey: 'User Analytics',
    descriptionKey: 'View user consumption statistics and charts',
  },
}

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const params = route.useParams()
  const userRole = useAuthStore((state) => state.auth.user?.role)
  const activeSection = (params.section ??
    DASHBOARD_DEFAULT_SECTION) as DashboardSectionId

  const [modelData, setModelData] = useState<QuotaDataItem[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [chartPreferences, setChartPreferences] =
    useState<DashboardChartPreferences>(() => getSavedChartPreferences())
  const [modelFilters, setModelFilters] = useState<DashboardFilters>(() =>
    buildDefaultDashboardFilters(getSavedChartPreferences())
  )

  const handleFilterChange = useCallback((filters: DashboardFilters) => {
    setModelFilters(filters)
  }, [])

  const handleResetFilters = useCallback(() => {
    setModelFilters(buildDefaultDashboardFilters(chartPreferences))
  }, [chartPreferences])

  const handleDataUpdate = useCallback(
    (data: QuotaDataItem[], loading: boolean) => {
      setModelData(data)
      setDataLoading(loading)
    },
    []
  )

  const handleChartPreferencesChange = useCallback(
    (preferences: DashboardChartPreferences) => {
      setChartPreferences(preferences)
      setModelFilters(buildDefaultDashboardFilters(preferences))
      saveChartPreferences(preferences)
    },
    []
  )

  const { status } = useStatus()
  const resolveEnabled = useCallback(
    (key: string, fallback: boolean) => {
      const value = status?.[key]
      return typeof value === 'boolean' ? value : fallback
    },
    [status]
  )
  const apiInfoEnabled = resolveEnabled('api_info_enabled', true)
  const announcementsEnabled = resolveEnabled('announcements_enabled', true)
  const faqEnabled = resolveEnabled('faq_enabled', true)
  const uptimeEnabled = resolveEnabled('uptime_kuma_enabled', true)
  const contactEnabled = resolveEnabled('contact_enabled', false)
  const contact2Enabled = resolveEnabled('contact2_enabled', false)
  const contactImage =
    typeof status?.contact_image === 'string' ? status.contact_image : ''
  const contactTitle =
    typeof status?.contact_title === 'string' ? status.contact_title : ''
  const contactCaption =
    typeof status?.contact_caption === 'string' ? status.contact_caption : ''
  const contactImage2 =
    typeof status?.contact_image2 === 'string' ? status.contact_image2 : ''
  const contactTitle2 =
    typeof status?.contact2_title === 'string' ? status.contact2_title : ''
  const contactCaption2 =
    typeof status?.contact2_caption === 'string'
      ? status.contact2_caption
      : ''
  const contactPanels = useMemo(() => {
    const panels: ContactPanelConfig[] = []

    if (contactEnabled && contactImage.trim()) {
      panels.push({
        title: contactTitle,
        image: contactImage,
        caption: contactCaption,
      })
    }

    if (contact2Enabled && contactImage2.trim()) {
      panels.push({
        title: contactTitle2,
        image: contactImage2,
        caption: contactCaption2,
      })
    }

    return panels
  }, [
    contact2Enabled,
    contactCaption,
    contactCaption2,
    contactEnabled,
    contactImage,
    contactImage2,
    contactTitle,
    contactTitle2,
  ])

  const overviewPanels = useMemo(() => {
    const panels: Array<{ key: string; node: ReactElement }> = []

    if (apiInfoEnabled) {
      panels.push({ key: 'api-info', node: <ApiInfoPanel /> })
    }
    if (announcementsEnabled) {
      panels.push({ key: 'announcements', node: <AnnouncementsPanel /> })
    }
    if (contactPanels.length > 0) {
      panels.push({
        key: 'contact-panels',
        node: <ContactPanelsPanel panels={contactPanels} />,
      })
    }
    if (faqEnabled) {
      panels.push({ key: 'faq', node: <FAQPanel /> })
    }
    if (uptimeEnabled) {
      panels.push({ key: 'uptime', node: <UptimePanel /> })
    }

    return panels
  }, [
    announcementsEnabled,
    apiInfoEnabled,
    contactPanels,
    faqEnabled,
    uptimeEnabled,
  ])

  const meta = SECTION_META[activeSection] ?? SECTION_META.overview
  const isAdmin = Boolean(userRole && userRole >= ROLE.ADMIN)
  const visibleSections = useMemo(
    () =>
      DASHBOARD_SECTION_IDS.filter(
        (section) => section !== 'overview' && (section !== 'users' || isAdmin)
      ),
    [isAdmin]
  )
  const handleSectionChange = useCallback(
    (section: string) => {
      void navigate({
        to: '/dashboard/$section',
        params: { section: section as DashboardSectionId },
      })
    },
    [navigate]
  )
  const showSectionTabs = activeSection !== 'overview' && visibleSections.length > 1
  const modelActions =
    activeSection === 'models' ? (
      <>
        <ModelsChartPreferences
          preferences={chartPreferences}
          onPreferencesChange={handleChartPreferencesChange}
        />
        <ModelsFilter
          preferences={chartPreferences}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </>
    ) : null

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t(meta.titleKey)}</SectionPageLayout.Title>
      <SectionPageLayout.Description>
        {t(meta.descriptionKey)}
      </SectionPageLayout.Description>
      <SectionPageLayout.Content>
        <div className='space-y-3 sm:space-y-4'>
          {activeSection !== 'overview' && (
            <div className='flex flex-wrap items-center justify-between gap-1.5 sm:gap-2'>
              {showSectionTabs ? (
                <Tabs value={activeSection} onValueChange={handleSectionChange}>
                  <TabsList className='h-auto max-w-full flex-wrap justify-start'>
                    {visibleSections.map((section) => (
                      <TabsTrigger key={section} value={section}>
                        {t(SECTION_META[section].titleKey)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              ) : (
                <div />
              )}
              {modelActions != null && (
                <div className='flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2'>
                  {modelActions}
                </div>
              )}
            </div>
          )}
          {activeSection === 'overview' && (
            <>
              <SummaryCards />
              {overviewPanels.length > 0 && (
                <CardStaggerContainer className='grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2'>
                  {overviewPanels.map((panel) => (
                    <CardStaggerItem key={panel.key}>
                      {panel.node}
                    </CardStaggerItem>
                  ))}
                </CardStaggerContainer>
              )}
            </>
          )}
          {activeSection === 'models' && (
            <>
              <FadeIn>
                <Suspense fallback={<LogStatCardsFallback />}>
                  <LazyLogStatCards
                    filters={modelFilters}
                    onDataUpdate={handleDataUpdate}
                  />
                </Suspense>
              </FadeIn>
              <FadeIn delay={0.1}>
                <Suspense fallback={<ModelChartsFallback />}>
                  <LazyConsumptionDistributionChart
                    data={modelData}
                    loading={dataLoading}
                    defaultChartType={
                      chartPreferences.consumptionDistributionChart
                    }
                    timeGranularity={
                      modelFilters.time_granularity || DEFAULT_TIME_GRANULARITY
                    }
                  />
                </Suspense>
              </FadeIn>
              <FadeIn delay={0.15}>
                <Suspense fallback={<ModelChartsFallback />}>
                  <LazyModelCharts
                    data={modelData}
                    loading={dataLoading}
                    defaultChartTab={chartPreferences.modelAnalyticsChart}
                    timeGranularity={
                      modelFilters.time_granularity || DEFAULT_TIME_GRANULARITY
                    }
                  />
                </Suspense>
              </FadeIn>
            </>
          )}
          {activeSection === 'users' && (
            <FadeIn>
              <Suspense fallback={<ModelChartsFallback />}>
                <LazyUserCharts />
              </Suspense>
            </FadeIn>
          )}
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
