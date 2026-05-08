import { useEffect, useState } from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
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
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { updateSystemOption } from '../api'
import { SettingsSection } from '../components/settings-section'

const pricingMetadataSchema = z.object({
  pricingContextEnabled: z.boolean(),
  pricingMaxOutputEnabled: z.boolean(),
  pricingModalitiesEnabled: z.boolean(),
  pricingKnowledgeCutoffEnabled: z.boolean(),
  pricingReleaseDateEnabled: z.boolean(),
  pricingCapabilitiesEnabled: z.boolean(),
})

type PricingMetadataFormValues = z.infer<typeof pricingMetadataSchema>

type PricingMetadataSectionProps = {
  defaultValues: PricingMetadataFormValues
}

const OPTION_KEY_MAP = {
  pricingContextEnabled: 'console_setting.pricing_context_enabled',
  pricingMaxOutputEnabled: 'console_setting.pricing_max_output_enabled',
  pricingModalitiesEnabled: 'console_setting.pricing_modalities_enabled',
  pricingKnowledgeCutoffEnabled:
    'console_setting.pricing_knowledge_cutoff_enabled',
  pricingReleaseDateEnabled: 'console_setting.pricing_release_date_enabled',
  pricingCapabilitiesEnabled: 'console_setting.pricing_capabilities_enabled',
} as const

const FIELD_META: Array<{
  name: keyof PricingMetadataFormValues
  title: string
  description: string
}> = [
  {
    name: 'pricingContextEnabled',
    title: 'Context card',
    description:
      'Show or hide the context window card on the pricing detail page.',
  },
  {
    name: 'pricingMaxOutputEnabled',
    title: 'Max output card',
    description:
      'Show or hide the maximum output tokens card on the pricing detail page.',
  },
  {
    name: 'pricingModalitiesEnabled',
    title: 'Modalities card',
    description:
      'Control whether modality summary and input/output badges are shown on the pricing detail page.',
  },
  {
    name: 'pricingKnowledgeCutoffEnabled',
    title: 'Knowledge cutoff card',
    description:
      'Show or hide the knowledge cutoff card on the pricing detail page.',
  },
  {
    name: 'pricingReleaseDateEnabled',
    title: 'Release date card',
    description:
      'Show or hide the release date card on the pricing detail page.',
  },
  {
    name: 'pricingCapabilitiesEnabled',
    title: 'Capabilities panel',
    description:
      'Show or hide the capability tags panel on the pricing detail page.',
  },
]

export function PricingMetadataSection({
  defaultValues,
}: PricingMetadataSectionProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)

  const form = useForm<PricingMetadataFormValues>({
    resolver: zodResolver(pricingMetadataSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const onSubmit = async (values: PricingMetadataFormValues) => {
    const updates = FIELD_META.filter(
      ({ name }) => values[name] !== defaultValues[name]
    )

    if (updates.length === 0) {
      toast.info(t('No changes to save'))
      return
    }

    setSaving(true)
    try {
      for (const field of updates) {
        const result = await updateSystemOption({
          key: OPTION_KEY_MAP[field.name],
          value: values[field.name],
        })
        if (!result.success) {
          throw new Error(result.message || t('Failed to update setting'))
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['system-options'] }),
        queryClient.invalidateQueries({ queryKey: ['status'] }),
      ])

      form.reset(values)
      toast.success(t('Pricing metadata settings saved successfully'))
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('Failed to update setting')
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsSection
      title={t('Pricing Metadata')}
      description={t(
        'Configure which metadata fields appear on the model pricing detail page.'
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-3'>
            {FIELD_META.map((fieldMeta) => (
              <FormField
                key={fieldMeta.name}
                control={form.control}
                name={fieldMeta.name}
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5 pe-4'>
                      <FormLabel className='text-base'>
                        {t(fieldMeta.title)}
                      </FormLabel>
                      <FormDescription>
                        {t(fieldMeta.description)}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className='flex flex-wrap gap-3'>
            <Button type='submit' disabled={saving}>
              {saving ? t('Saving...') : t('Save Changes')}
            </Button>
            <Button
              type='button'
              variant='outline'
              disabled={saving}
              onClick={() => form.reset(defaultValues)}
            >
              {t('Reset to default')}
            </Button>
          </div>
        </form>
      </Form>
    </SettingsSection>
  )
}
