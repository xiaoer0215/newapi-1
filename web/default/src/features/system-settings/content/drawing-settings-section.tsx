import { useEffect, useMemo, useRef, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
import { MultiSelect, type Option } from '@/components/multi-select'
import { SelectDropdown } from '@/components/select-dropdown'
import { Switch } from '@/components/ui/switch'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'
import { api } from '@/lib/api'
import { getGroups } from '@/features/users/api'
import type { ApiResponse } from '@/features/users/types'

const DRAWING_CDN_PROVIDERS: Option[] = [
  { label: 'SKY Image', value: 'skyimg' },
  { label: 'Litterbox 72h', value: 'litterbox_72h' },
  { label: 'SCDN CN', value: 'scdn_cn' },
  { label: 'SCDN EdgeOne', value: 'scdn_edgeone' },
  { label: 'SCDN Anycast', value: 'scdn_anycast' },
  { label: 'Image Host XZ', value: 'tuchuang_xqd' },
  { label: '360 Image Host', value: 'wzapi_360' },
]

const DEFAULT_CDN_PROVIDERS = DRAWING_CDN_PROVIDERS.map(
  (item) => item.value
).join(',')

const drawingSchema = z.object({
  DrawingEnabled: z.boolean(),
  DrawingTokenGroup: z.string(),
  DrawingTokenModels: z.array(z.string()),
  DrawingDefaultModel: z.string(),
  DrawingCDNMode: z.string(),
  DrawingCDNProviders: z.array(z.string()).min(1),
  MjNotifyEnabled: z.boolean(),
  MjAccountFilterEnabled: z.boolean(),
  MjForwardUrlEnabled: z.boolean(),
  MjModeClearEnabled: z.boolean(),
  MjActionCheckSuccessEnabled: z.boolean(),
})

type DrawingFormValues = z.infer<typeof drawingSchema>

type DrawingSettingsSectionProps = {
  defaultValues: {
    DrawingEnabled: boolean
    DrawingTokenGroup: string
    DrawingTokenModels: string
    DrawingDefaultModel: string
    DrawingCDNMode: string
    DrawingCDNProviders: string
    MjNotifyEnabled: boolean
    MjAccountFilterEnabled: boolean
    MjForwardUrlEnabled: boolean
    MjModeClearEnabled: boolean
    MjActionCheckSuccessEnabled: boolean
  }
}

type GroupModelsResponse = ApiResponse<string[]>

const splitCsv = (raw: string) =>
  String(raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const buildFormDefaults = (
  defaults: DrawingSettingsSectionProps['defaultValues']
): DrawingFormValues => ({
  DrawingEnabled: defaults.DrawingEnabled,
  DrawingTokenGroup: defaults.DrawingTokenGroup || '',
  DrawingTokenModels: splitCsv(defaults.DrawingTokenModels),
  DrawingDefaultModel: defaults.DrawingDefaultModel || '',
  DrawingCDNMode: defaults.DrawingCDNMode || 'fastest',
  DrawingCDNProviders:
    splitCsv(defaults.DrawingCDNProviders).length > 0
      ? splitCsv(defaults.DrawingCDNProviders)
      : splitCsv(DEFAULT_CDN_PROVIDERS),
  MjNotifyEnabled: defaults.MjNotifyEnabled,
  MjAccountFilterEnabled: defaults.MjAccountFilterEnabled,
  MjForwardUrlEnabled: defaults.MjForwardUrlEnabled,
  MjModeClearEnabled: defaults.MjModeClearEnabled,
  MjActionCheckSuccessEnabled: defaults.MjActionCheckSuccessEnabled,
})

const serializeComparable = (values: DrawingFormValues) => ({
  ...values,
  DrawingTokenModels: values.DrawingTokenModels.join(','),
  DrawingCDNProviders: values.DrawingCDNProviders.join(','),
})

async function getGroupModels(group: string): Promise<GroupModelsResponse> {
  const res = await api.get<GroupModelsResponse>('/api/group/models', {
    params: { group },
  })
  return res.data
}

export function DrawingSettingsSection({
  defaultValues,
}: DrawingSettingsSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const baselineRef = useRef(serializeComparable(buildFormDefaults(defaultValues)))
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [groupOptions, setGroupOptions] = useState<Option[]>([])
  const [modelOptions, setModelOptions] = useState<Option[]>([])

  const form = useForm<DrawingFormValues>({
    resolver: zodResolver(drawingSchema),
    defaultValues: buildFormDefaults(defaultValues),
  })

  const selectedGroup = form.watch('DrawingTokenGroup')
  const selectedModels = form.watch('DrawingTokenModels')

  const normalizedModelOptions = useMemo(
    () => modelOptions.map((option) => option.value),
    [modelOptions]
  )

  const translatedCdnProviders = useMemo(
    () =>
      DRAWING_CDN_PROVIDERS.map((option) => ({
        ...option,
        label: t(option.label),
      })),
    [t]
  )

  const defaultModelOptions = useMemo(() => {
    if (selectedModels.length > 0) {
      const selectedSet = new Set(selectedModels)
      return modelOptions.filter((option) => selectedSet.has(option.value))
    }
    return modelOptions
  }, [modelOptions, selectedModels])

  useEffect(() => {
    let cancelled = false

    const loadGroups = async () => {
      try {
        setGroupsLoading(true)
        const res = await getGroups()
        if (!res.success) {
          toast.error(res.message || t('Failed to load drawing groups'))
          return
        }
        if (cancelled) return
        const options = (res.data || [])
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
          .map((group) => ({ label: group, value: group }))
        setGroupOptions(options)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t('Failed to load drawing groups')
        )
      } finally {
        if (!cancelled) setGroupsLoading(false)
      }
    }

    void loadGroups()
    return () => {
      cancelled = true
    }
  }, [t])

  useEffect(() => {
    const nextDefaults = buildFormDefaults(defaultValues)
    baselineRef.current = serializeComparable(nextDefaults)
    form.reset(nextDefaults)
  }, [defaultValues, form])

  useEffect(() => {
    let cancelled = false

    const loadModels = async () => {
      if (!selectedGroup) {
        setModelOptions([])
        form.setValue('DrawingTokenModels', [])
        form.setValue('DrawingDefaultModel', '')
        return
      }

      try {
        setModelsLoading(true)
        const res = await getGroupModels(selectedGroup)
        if (!res.success) {
          toast.error(res.message || t('Failed to load drawing models'))
          return
        }
        if (cancelled) return

        const availableModels = (res.data || []).filter(Boolean)
        const options = availableModels.map((model) => ({
          label: model,
          value: model,
        }))
        setModelOptions(options)

        const currentValues = form.getValues()
        const allowedSelected = currentValues.DrawingTokenModels.filter((model) =>
          availableModels.includes(model)
        )
        const fallbackModels =
          allowedSelected.length > 0 ? allowedSelected : availableModels
        const nextDefault = fallbackModels.includes(currentValues.DrawingDefaultModel)
          ? currentValues.DrawingDefaultModel
          : ''

        form.setValue('DrawingTokenModels', allowedSelected, {
          shouldDirty: true,
          shouldValidate: true,
        })
        form.setValue('DrawingDefaultModel', nextDefault, {
          shouldDirty: true,
          shouldValidate: true,
        })
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t('Failed to load drawing models')
        )
      } finally {
        if (!cancelled) setModelsLoading(false)
      }
    }

    void loadModels()
    return () => {
      cancelled = true
    }
  }, [form, selectedGroup, t])

  const onSubmit = async (values: DrawingFormValues) => {
    const comparable = serializeComparable(values)
    const baseline = baselineRef.current
    const updates: Array<{ key: string; value: string | boolean }> = []

    ;(
      Object.keys(comparable) as Array<keyof typeof comparable>
    ).forEach((key) => {
      if (comparable[key] !== baseline[key]) {
        updates.push({
          key,
          value: comparable[key] as string | boolean,
        })
      }
    })

    if (updates.length === 0) {
      toast.info(t('No changes to save'))
      return
    }

    for (const update of updates) {
      await updateOption.mutateAsync(update)
    }

    baselineRef.current = comparable
  }

  const switches: Array<{
    name:
      | 'DrawingEnabled'
      | 'MjNotifyEnabled'
      | 'MjAccountFilterEnabled'
      | 'MjForwardUrlEnabled'
      | 'MjModeClearEnabled'
      | 'MjActionCheckSuccessEnabled'
    label: string
    description: string
  }> = [
    {
      name: 'DrawingEnabled',
      label: t('Enable drawing features'),
      description: t(
        'After enabling, the system will automatically create a dedicated drawing token for the user and bind it to the configured group and models.'
      ),
    },
    {
      name: 'MjNotifyEnabled',
      label: t('Allow upstream callbacks'),
      description: t(
        'When enabled, Midjourney callbacks are accepted, which may reveal the server IP address.'
      ),
    },
    {
      name: 'MjAccountFilterEnabled',
      label: t('Allow accountFilter parameter'),
      description: t(
        'Keep this enabled if you need to proxy drawing requests for different upstream accounts.'
      ),
    },
    {
      name: 'MjForwardUrlEnabled',
      label: t('Rewrite callback URLs to the local server'),
      description: t(
        'Automatically replaces upstream callback URLs with the current server address.'
      ),
    },
    {
      name: 'MjModeClearEnabled',
      label: t('Clear --fast / --relax / --turbo flags in prompts'),
      description: t(
        'Removes Midjourney mode flags from user prompts before forwarding them upstream.'
      ),
    },
    {
      name: 'MjActionCheckSuccessEnabled',
      label: t('Require success before follow-up actions'),
      description: t(
        'Users must wait for a successful drawing before upscales or variations.'
      ),
    },
  ]

  return (
    <SettingsSection
      title={t('Drawing')}
      description={t(
        'Migrate and manage dedicated AI drawing token, model scope, and free CDN storage strategy here.'
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='rounded-lg border bg-muted/35 p-4 text-sm leading-7 text-muted-foreground'>
            {t(
              'When enabled, the system automatically creates one dedicated drawing token for each user on the first call to /api/user/self/drawing/init. The token only restricts group and model scope, while quota billing still follows the user account itself.'
            )}
          </div>

          <div className='grid gap-4'>
            {switches.map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name}
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5 pe-4'>
                      <FormLabel className='text-base'>{item.label}</FormLabel>
                      <FormDescription>{item.description}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className='grid gap-6 rounded-xl border p-5'>
            <div className='space-y-1'>
              <h4 className='text-sm font-semibold'>
                {t('Dedicated drawing token settings')}
              </h4>
              <p className='text-muted-foreground text-sm'>
                {t(
                  'The drawing group determines the available channels. Model restrictions and default model will be enforced onto the dedicated token.'
                )}
              </p>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='DrawingTokenGroup'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Drawing group')}</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        isControlled
                        defaultValue={field.value || undefined}
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue('DrawingTokenModels', [])
                          form.setValue('DrawingDefaultModel', '')
                        }}
                        isPending={groupsLoading}
                        items={groupOptions}
                        placeholder={t('Please select drawing group')}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'The system will load all available drawing-capable models from the selected group.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='DrawingDefaultModel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Default drawing model')}</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        isControlled
                        defaultValue={field.value || undefined}
                        onValueChange={field.onChange}
                        isPending={modelsLoading}
                        items={defaultModelOptions}
                        disabled={!selectedGroup || defaultModelOptions.length === 0}
                        placeholder={
                          defaultModelOptions.length > 0
                            ? t('Leave empty to use the first available model')
                            : t('No available models')
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'If left empty, the system automatically uses the first available model in the allowed list.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='DrawingTokenModels'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Allowed drawing models')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={modelOptions}
                      selected={field.value}
                      onChange={(values) => {
                        field.onChange(values)
                        const fallbackModels =
                          values.length > 0 ? values : normalizedModelOptions
                        const currentDefault = form.getValues('DrawingDefaultModel')
                        if (!fallbackModels.includes(currentDefault)) {
                          form.setValue('DrawingDefaultModel', '', {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      }}
                      placeholder={
                        selectedGroup
                          ? t(
                              'Supports multi-select. Leave empty to allow all available models in this group.'
                            )
                          : t('Please select drawing group first')
                      }
                      className={!selectedGroup ? 'opacity-60' : ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'The system prefers models that support /v1/images/generations or equivalent drawing endpoints. If endpoint metadata is missing, all available group models will be listed as fallback.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid gap-6 rounded-xl border p-5'>
            <div className='space-y-1'>
              <h4 className='text-sm font-semibold'>{t('Drawing CDN settings')}</h4>
              <p className='text-muted-foreground text-sm'>
                {t(
                  'After images are generated, the system can upload them to free CDN providers. In fastest mode it uploads concurrently and uses whichever succeeds first.'
                )}
              </p>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='DrawingCDNMode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Upload strategy')}</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        isControlled
                        defaultValue={field.value || undefined}
                        onValueChange={field.onChange}
                        items={[
                          { label: t('Fastest available'), value: 'fastest' },
                          ...translatedCdnProviders,
                        ]}
                        placeholder={t('Please select upload strategy')}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Choose fastest to race multiple providers, or lock to one fixed provider.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='DrawingCDNProviders'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Enabled CDN providers')}</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={translatedCdnProviders}
                        selected={field.value}
                        onChange={(values) =>
                          field.onChange(
                            values.length > 0
                              ? values
                              : splitCsv(DEFAULT_CDN_PROVIDERS)
                          )
                        }
                        placeholder={t('Please select CDN providers')}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Saved values will be written into DrawingCDNMode and DrawingCDNProviders. Generated images will then be uploaded to the providers configured here.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type='submit' disabled={updateOption.isPending}>
            {updateOption.isPending
              ? t('Saving...')
              : t('Save drawing settings')}
          </Button>
        </form>
      </Form>
    </SettingsSection>
  )
}
