import { useEffect, useMemo } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'

const SECTION_IDS = ['endpoint', 'buttons', 'stats', 'qr'] as const

const DEFAULT_SECTIONS = [
  { id: 'endpoint', enabled: true },
  { id: 'buttons', enabled: true },
  { id: 'stats', enabled: true },
  { id: 'qr', enabled: true },
] as const

const homePageConfigSchema = z.object({
  raw: z.string(),
  heroTitle: z.string(),
  heroHighlight: z.string(),
  heroDescription: z.string(),
  qrImage: z.string(),
  qrTitle: z.string(),
  qrCaption: z.string(),
})

type HomePageConfigFormValues = z.infer<typeof homePageConfigSchema>

type HomePageConfigSectionProps = {
  defaultValue: string
}

type HomePageSectionId = (typeof SECTION_IDS)[number]

type HomePageSectionConfig = {
  id: HomePageSectionId
  enabled: boolean
}

type HomePageConfig = {
  sections?: HomePageSectionConfig[]
  hero_title?: string
  hero_highlight?: string
  hero_description?: string
  qr_image?: string
  qr_title?: string
  qr_caption?: string
}

function normalizeConfig(raw: string): Required<HomePageConfig> {
  let parsed: HomePageConfig = {}

  try {
    parsed = raw.trim() ? (JSON.parse(raw) as HomePageConfig) : {}
  } catch {
    parsed = {}
  }

  const savedSections = Array.isArray(parsed.sections) ? parsed.sections : []
  const normalizedSections = savedSections
    .filter(
      (item): item is HomePageSectionConfig =>
        !!item &&
        typeof item === 'object' &&
        SECTION_IDS.includes(item.id as HomePageSectionId)
    )
    .map((item) => ({
      id: item.id as HomePageSectionId,
      enabled: item.enabled !== false,
    }))

  for (const section of DEFAULT_SECTIONS) {
    if (!normalizedSections.some((item) => item.id === section.id)) {
      normalizedSections.push({ ...section })
    }
  }

  return {
    sections: normalizedSections,
    hero_title: parsed.hero_title ?? '',
    hero_highlight: parsed.hero_highlight ?? '',
    hero_description: parsed.hero_description ?? '',
    qr_image: parsed.qr_image ?? '',
    qr_title: parsed.qr_title ?? '',
    qr_caption: parsed.qr_caption ?? '',
  }
}

function serializeConfig(config: Required<HomePageConfig>) {
  return JSON.stringify(
    {
      sections: config.sections.map((section) => ({
        id: section.id,
        enabled: section.enabled,
      })),
      hero_title: config.hero_title,
      hero_highlight: config.hero_highlight,
      hero_description: config.hero_description,
      qr_image: config.qr_image,
      qr_title: config.qr_title,
      qr_caption: config.qr_caption,
    },
    null,
    2
  )
}

export function HomePageConfigSection({
  defaultValue,
}: HomePageConfigSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const normalized = useMemo(() => normalizeConfig(defaultValue), [defaultValue])

  const form = useForm<HomePageConfigFormValues>({
    resolver: zodResolver(homePageConfigSchema),
    defaultValues: {
      raw: serializeConfig(normalized),
      heroTitle: normalized.hero_title,
      heroHighlight: normalized.hero_highlight,
      heroDescription: normalized.hero_description,
      qrImage: normalized.qr_image,
      qrTitle: normalized.qr_title,
      qrCaption: normalized.qr_caption,
    },
  })

  useEffect(() => {
    form.reset({
      raw: serializeConfig(normalized),
      heroTitle: normalized.hero_title,
      heroHighlight: normalized.hero_highlight,
      heroDescription: normalized.hero_description,
      qrImage: normalized.qr_image,
      qrTitle: normalized.qr_title,
      qrCaption: normalized.qr_caption,
    })
  }, [form, normalized])

  const watchedRaw = form.watch('raw')
  const config = useMemo(() => normalizeConfig(watchedRaw), [watchedRaw])

  const setConfig = (next: Required<HomePageConfig>) => {
    form.setValue('raw', serializeConfig(next), {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue('heroTitle', next.hero_title, { shouldDirty: true })
    form.setValue('heroHighlight', next.hero_highlight, { shouldDirty: true })
    form.setValue('heroDescription', next.hero_description, {
      shouldDirty: true,
    })
    form.setValue('qrImage', next.qr_image, { shouldDirty: true })
    form.setValue('qrTitle', next.qr_title, { shouldDirty: true })
    form.setValue('qrCaption', next.qr_caption, { shouldDirty: true })
  }

  const moveSection = (index: number, direction: -1 | 1) => {
    const nextSections = [...config.sections]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= nextSections.length) return
    ;[nextSections[index], nextSections[targetIndex]] = [
      nextSections[targetIndex],
      nextSections[index],
    ]
    setConfig({
      ...config,
      sections: nextSections,
    })
  }

  const toggleSection = (index: number, enabled: boolean) => {
    const nextSections = [...config.sections]
    nextSections[index] = {
      ...nextSections[index],
      enabled,
    }
    setConfig({
      ...config,
      sections: nextSections,
    })
  }

  const handleQrFieldChange = (
    key: 'qr_image' | 'qr_title' | 'qr_caption',
    value: string
  ) => {
    setConfig({
      ...config,
      [key]: value,
    })
  }

  const handleHeroFieldChange = (
    key: 'hero_title' | 'hero_highlight' | 'hero_description',
    value: string
  ) => {
    setConfig({
      ...config,
      [key]: value,
    })
  }

  const onSubmit = async (values: HomePageConfigFormValues) => {
    const normalizedCurrent = serializeConfig(normalizeConfig(values.raw))
    const normalizedDefault = serializeConfig(normalized)
    if (normalizedCurrent === normalizedDefault) {
      return
    }

    await updateOption.mutateAsync({
      key: 'console_setting.home_page_config',
      value: normalizedCurrent,
    })
  }

  return (
    <SettingsSection
      title={t('Home Page Layout')}
      description={t(
        'Configure the home page section order and the QR image card shown on the landing page.'
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-3'>
            <div className='grid gap-4 lg:grid-cols-2'>
              <FormField
                control={form.control}
                name='heroTitle'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Hero title')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(event) => {
                          field.onChange(event)
                          handleHeroFieldChange(
                            'hero_title',
                            event.target.value
                          )
                        }}
                        placeholder={t('Unified API Gateway for')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='heroHighlight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Hero highlight')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(event) => {
                          field.onChange(event)
                          handleHeroFieldChange(
                            'hero_highlight',
                            event.target.value
                          )
                        }}
                        placeholder={t('All Your AI Models')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='heroDescription'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Hero description')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        field.onChange(event)
                        handleHeroFieldChange(
                          'hero_description',
                          event.target.value
                        )
                      }}
                      placeholder={t(
                        'is an open-source AI API gateway for self-hosted deployments. Connect multiple upstream services, manage models, keys, quotas, logs, and routing policies in one place.'
                      )}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Only takes effect when the custom home page code is empty.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-1'>
              <h4 className='text-sm font-medium'>{t('Section order')}</h4>
              <p className='text-muted-foreground text-sm'>
                {t(
                  'The QR section stays on the right side in the classic layout, while the remaining sections follow the order configured here.'
                )}
              </p>
            </div>

            {config.sections.map((section, index) => (
              <div
                key={section.id}
                className='flex items-center gap-3 rounded-lg border p-3'
              >
                <GripVertical className='text-muted-foreground h-4 w-4' />
                <Switch
                  checked={section.enabled}
                  onCheckedChange={(checked) => toggleSection(index, checked)}
                />
                <div className='min-w-0 flex-1'>
                  <div className='text-sm font-medium'>
                    {section.id === 'endpoint'
                      ? t('Endpoint address')
                      : section.id === 'buttons'
                        ? t('Action buttons')
                        : section.id === 'stats'
                          ? t('Statistics')
                          : t('QR image panel')}
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    disabled={index === 0}
                    onClick={() => moveSection(index, -1)}
                  >
                    <ArrowUp className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    disabled={index === config.sections.length - 1}
                    onClick={() => moveSection(index, 1)}
                  >
                    <ArrowDown className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className='grid gap-4 lg:grid-cols-[minmax(260px,0.44fr)_minmax(0,0.56fr)]'>
            <FormField
              control={form.control}
              name='qrTitle'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('QR title')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        field.onChange(event)
                        handleQrFieldChange('qr_title', event.target.value)
                      }}
                      placeholder='SCAN TO PURCHASE'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='qrCaption'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('QR caption')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        field.onChange(event)
                        handleQrFieldChange('qr_caption', event.target.value)
                      }}
                      placeholder='WeChat ? Reply "API" ? Instant access'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='qrImage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('QR image URL')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(event) => {
                      field.onChange(event)
                      handleQrFieldChange('qr_image', event.target.value)
                    }}
                    placeholder='https://example.com/qrcode.png'
                  />
                </FormControl>
                <FormDescription>
                  {t(
                    'This image will be shown on the home page QR panel when the QR section is enabled.'
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {config.qr_image ? (
            <div className='rounded-lg border p-4'>
              <div className='text-sm font-medium'>{t('Preview')}</div>
              <div className='mt-3 flex items-center gap-4'>
                <img
                  src={config.qr_image}
                  alt={config.qr_title || 'qr'}
                  className='h-28 w-28 rounded-md border object-contain'
                />
                <div className='space-y-1'>
                  <div className='text-sm font-semibold'>
                    {config.qr_title || t('QR title')}
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    {config.qr_caption || t('QR caption')}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <FormField
            control={form.control}
            name='raw'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('JSON config')}</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={12}
                    className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[160px] w-full rounded-md border px-3 py-2 font-mono text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                  />
                </FormControl>
                <FormDescription>
                  {t(
                    'Direct JSON editor for the home page section order and QR card configuration.'
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' disabled={updateOption.isPending}>
            {updateOption.isPending ? t('Saving...') : t('Save Changes')}
          </Button>
        </form>
      </Form>
    </SettingsSection>
  )
}
