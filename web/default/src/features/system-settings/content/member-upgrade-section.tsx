import { useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'

const memberUpgradeSchema = z.object({
  MemberUpgradeEnabled: z.boolean(),
  MemberUpgradeAdminOnly: z.boolean(),
  MemberUpgradeFAQ: z.string(),
  MemberBalanceConversionTitle: z.string(),
  MemberBalanceConversionContent: z.string(),
})

type MemberUpgradeFormValues = z.infer<typeof memberUpgradeSchema>

type MemberUpgradeSectionProps = {
  defaultValues: MemberUpgradeFormValues
}

function validateFaqJson(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  try {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) {
      return 'array'
    }
    const invalidItem = parsed.some(
      (item) =>
        !item ||
        typeof item !== 'object' ||
        typeof (item as { question?: unknown }).question !== 'string' ||
        typeof (item as { answer?: unknown }).answer !== 'string'
    )
    if (invalidItem) {
      return 'shape'
    }
  } catch {
    return 'array'
  }

  return null
}

export function MemberUpgradeSection({
  defaultValues,
}: MemberUpgradeSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const form = useForm<MemberUpgradeFormValues>({
    resolver: zodResolver(memberUpgradeSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const onSubmit = async (values: MemberUpgradeFormValues) => {
    const faqError = validateFaqJson(values.MemberUpgradeFAQ)
    if (faqError === 'array') {
      toast.error(t('Please enter a valid FAQ JSON array'))
      return
    }
    if (faqError === 'shape') {
      toast.error(t('Each FAQ item must contain question and answer fields'))
      return
    }

    const updates = Object.entries(values).filter(
      ([key, value]) =>
        value !== defaultValues[key as keyof MemberUpgradeFormValues]
    )

    for (const [key, value] of updates) {
      await updateOption.mutateAsync({ key, value })
    }
  }

  return (
    <SettingsSection
      title={t('Member upgrade settings')}
      description={t(
        'Configure member upgrade entrance, FAQ, and balance conversion content'
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid gap-4 lg:grid-cols-2'>
            <FormField
              control={form.control}
              name='MemberUpgradeEnabled'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5 pe-4'>
                    <FormLabel className='text-base'>
                      {t('Enable member upgrade entrance')}
                    </FormLabel>
                    <FormDescription>
                      {t(
                        'Control whether the member upgrade entry appears in the sidebar'
                      )}
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

            <FormField
              control={form.control}
              name='MemberUpgradeAdminOnly'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5 pe-4'>
                    <FormLabel className='text-base'>
                      {t('Visible to admins only')}
                    </FormLabel>
                    <FormDescription>
                      {t(
                        'During testing, only admins can access the member upgrade page'
                      )}
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
          </div>

          <FormField
            control={form.control}
            name='MemberUpgradeFAQ'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Member Upgrade FAQ')}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={10}
                    className='font-mono text-xs'
                    placeholder='[{"question":"...","answer":"..."}]'
                  />
                </FormControl>
                <FormDescription>
                  {t(
                    'Configure the FAQ displayed on the member upgrade page in JSON array format'
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid gap-4 lg:grid-cols-[minmax(240px,0.36fr)_minmax(0,0.64fr)]'>
            <FormField
              control={form.control}
              name='MemberBalanceConversionTitle'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Balance Conversion Title')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='MemberBalanceConversionContent'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Balance Conversion Content')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type='submit' disabled={updateOption.isPending}>
            {updateOption.isPending ? t('Saving...') : t('Save Changes')}
          </Button>
        </form>
      </Form>
    </SettingsSection>
  )
}
