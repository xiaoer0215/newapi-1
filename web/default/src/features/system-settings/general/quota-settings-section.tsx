import * as z from 'zod'
import type { ChangeEvent } from 'react'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'
import { getAffiliateTierName } from '@/features/wallet/lib'
import type { AffiliateCommissionTier } from '@/features/wallet/types'
import { Textarea } from '@/components/ui/textarea'

const affiliateTierSchema = z.object({
  level: z.coerce.number().int().min(1).max(4),
  min_invites: z.coerce.number().int().min(0),
  percentage: z.coerce.number().min(0).max(100),
})

const quotaSchema = z.object({
  QuotaForNewUser: z.coerce.number().min(0),
  PreConsumedQuota: z.coerce.number().min(0),
  QuotaForInviter: z.coerce.number().min(0),
  QuotaForInvitee: z.coerce.number().min(0),
  AffiliateCommissionPercentage: z.coerce.number().min(0).max(100),
  AffiliateCommissionTiers: z
    .array(affiliateTierSchema)
    .length(4)
    .superRefine((tiers, ctx) => {
      tiers.forEach((tier, index) => {
        if (index === 0 && tier.min_invites !== 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'min_invites'],
            message: 'Level 1 invite threshold must start from 0',
          })
        }
        if (index > 0 && tier.min_invites < tiers[index - 1].min_invites) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'min_invites'],
            message:
              'Invite threshold must be greater than or equal to the previous level',
          })
        }
      })
    }),
  AffiliateTransferEnabled: z.boolean(),
  AffiliateWithdrawEnabled: z.boolean(),
  AffiliateMinWithdrawQuota: z.coerce.number().min(0),
  AffiliateWithdrawNotice: z.string(),
  TopUpLink: z.string().url().optional().or(z.literal('')),
  general_setting: z.object({
    docs_link: z.string().url().optional().or(z.literal('')),
  }),
  quota_setting: z.object({
    enable_free_model_pre_consume: z.boolean(),
  }),
})

type QuotaFormValues = z.infer<typeof quotaSchema>

type QuotaSettingsSectionProps = {
  defaultValues: {
    QuotaForNewUser: number
    PreConsumedQuota: number
    QuotaForInviter: number
    QuotaForInvitee: number
    AffiliateCommissionPercentage: number
    AffiliateCommissionTiers: string
    AffiliateTransferEnabled: boolean
    AffiliateWithdrawEnabled: boolean
    AffiliateMinWithdrawQuota: number
    AffiliateWithdrawNotice: string
    TopUpLink: string
    'general_setting.docs_link': string
    'quota_setting.enable_free_model_pre_consume': boolean
  }
}

const FALLBACK_TIERS: AffiliateCommissionTier[] = [
  { level: 1, min_invites: 0, percentage: 0 },
  { level: 2, min_invites: 10, percentage: 0 },
  { level: 3, min_invites: 30, percentage: 0 },
  { level: 4, min_invites: 100, percentage: 0 },
]

function normalizeTierList(
  raw: string,
  basePercentage: number
): AffiliateCommissionTier[] {
  const fallback = FALLBACK_TIERS.map((tier, index) => ({
    ...tier,
    level: index + 1,
    percentage: basePercentage,
  }))

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback

    const normalized: AffiliateCommissionTier[] = []

    fallback.forEach((tier, index) => {
      const current = parsed[index] as Partial<AffiliateCommissionTier> | undefined
      const prevMin = index === 0 ? 0 : normalized[index - 1].min_invites
      normalized.push({
        level: index + 1,
        min_invites:
          index === 0
            ? 0
            : Math.max(
                prevMin,
                Number.isFinite(Number(current?.min_invites))
                  ? Number(current?.min_invites)
                  : tier.min_invites
              ),
        percentage: Number.isFinite(Number(current?.percentage))
          ? Number(current?.percentage)
          : tier.percentage,
      })
    })

    return normalized
  } catch {
    return fallback
  }
}

function buildTierJson(tiers: AffiliateCommissionTier[]) {
  return JSON.stringify(
    tiers.map((tier, index) => ({
      level: index + 1,
      min_invites: Math.max(0, Math.trunc(tier.min_invites ?? 0)),
      percentage: Number(tier.percentage ?? 0),
    }))
  )
}

export function QuotaSettingsSection({
  defaultValues,
}: QuotaSettingsSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const initialTiers = useMemo(
    () =>
      normalizeTierList(
        defaultValues.AffiliateCommissionTiers,
        defaultValues.AffiliateCommissionPercentage
      ),
    [
      defaultValues.AffiliateCommissionPercentage,
      defaultValues.AffiliateCommissionTiers,
    ]
  )

  const normalizedDefaults: QuotaFormValues = {
    QuotaForNewUser: defaultValues.QuotaForNewUser,
    PreConsumedQuota: defaultValues.PreConsumedQuota,
    QuotaForInviter: defaultValues.QuotaForInviter,
    QuotaForInvitee: defaultValues.QuotaForInvitee,
    AffiliateCommissionPercentage: defaultValues.AffiliateCommissionPercentage,
    AffiliateCommissionTiers: initialTiers,
    AffiliateTransferEnabled: defaultValues.AffiliateTransferEnabled,
    AffiliateWithdrawEnabled: defaultValues.AffiliateWithdrawEnabled,
    AffiliateMinWithdrawQuota: defaultValues.AffiliateMinWithdrawQuota,
    AffiliateWithdrawNotice: defaultValues.AffiliateWithdrawNotice ?? '',
    TopUpLink: defaultValues.TopUpLink ?? '',
    general_setting: {
      docs_link: defaultValues['general_setting.docs_link'] ?? '',
    },
    quota_setting: {
      enable_free_model_pre_consume:
        defaultValues['quota_setting.enable_free_model_pre_consume'],
    },
  }

  const handleNumberChange =
    (onChange: (value: number | string) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(
        event.currentTarget.value === ''
          ? ''
          : event.currentTarget.valueAsNumber
      )
    }

  const { form, handleSubmit, isDirty, isSubmitting } =
    useSettingsForm<QuotaFormValues>({
      resolver: zodResolver(quotaSchema) as Resolver<
        QuotaFormValues,
        unknown,
        QuotaFormValues
      >,
      defaultValues: normalizedDefaults,
      onSubmit: async (_data, changedFields) => {
        const entries = Object.entries(changedFields)
        const hasTierChanges = entries.some(
          ([key]) => key === 'AffiliateCommissionTiers' || key.startsWith('AffiliateCommissionTiers.')
        )

        const filteredEntries = entries.filter(([key, value]) => {
          if (value === undefined || value === null) return false
          if (key === 'AffiliateCommissionPercentage') return false
          if (key.startsWith('AffiliateCommissionTiers.')) return false
          if (typeof value === 'object') return false
          return true
        })

        for (const [key, value] of filteredEntries) {
          await updateOption.mutateAsync({
            key,
            value: value as string | number | boolean,
          })
        }

        if (hasTierChanges) {
          await updateOption.mutateAsync({
            key: 'AffiliateCommissionTiers',
            value: buildTierJson(form.getValues('AffiliateCommissionTiers')),
          })
        }
      },
    })

  const watchedTiers = form.watch('AffiliateCommissionTiers')

  return (
    <SettingsSection
      title={t('Quota Settings')}
      description={t('Configure user quota allocation and rewards')}
    >
      <FormNavigationGuard when={isDirty} />

      <Form {...form}>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <FormDirtyIndicator isDirty={isDirty} />
          <div className='grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]'>
            <div className='space-y-6'>
              <Card>
                <CardHeader className='pb-0'>
                  <CardTitle>{t('Quota Basics')}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-5 pt-6'>
                  <FormField
                    control={form.control}
                    name='QuotaForNewUser'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('New User Quota')}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            value={field.value ?? ''}
                            onChange={handleNumberChange(field.onChange)}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('Initial quota given to new users')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='PreConsumedQuota'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Pre-Consumed Quota')}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            value={field.value ?? ''}
                            onChange={handleNumberChange(field.onChange)}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('Quota consumed before charging users')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='QuotaForInviter'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Inviter Reward')}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            value={field.value ?? ''}
                            onChange={handleNumberChange(field.onChange)}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('Quota given to users who invite others')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='QuotaForInvitee'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Invitee Reward')}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            value={field.value ?? ''}
                            onChange={handleNumberChange(field.onChange)}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('Quota given to invited users')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-0'>
                  <CardTitle>{t('Affiliate Withdrawal')}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-5 pt-6'>
                  <FormField
                    control={form.control}
                    name='AffiliateMinWithdrawQuota'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Affiliate Minimum Withdraw Quota')}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            value={field.value ?? ''}
                            onChange={handleNumberChange(field.onChange)}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('Minimum affiliate quota required before withdrawal')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                      )}
                  />

                  <FormField
                    control={form.control}
                    name='AffiliateWithdrawNotice'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Withdrawal Notice')}</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            value={field.value}
                            onChange={field.onChange}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            placeholder={t('Example: Current withdrawal ratio is 1:1, please fill in your Alipay account carefully')}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('Shown in the affiliate withdrawal area and can be customized freely')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='AffiliateTransferEnabled'
                      render={({ field }) => (
                        <FormItem className='flex min-h-28 flex-row items-center justify-between rounded-xl border p-4'>
                          <div className='space-y-1.5 pr-4'>
                            <FormLabel className='text-sm font-medium'>
                              {t('Enable Affiliate Transfer')}
                            </FormLabel>
                            <FormDescription>
                              {t('Allow users to transfer affiliate rewards into wallet balance')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={updateOption.isPending}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='AffiliateWithdrawEnabled'
                      render={({ field }) => (
                        <FormItem className='flex min-h-28 flex-row items-center justify-between rounded-xl border p-4'>
                          <div className='space-y-1.5 pr-4'>
                            <FormLabel className='text-sm font-medium'>
                              {t('Enable Affiliate Withdrawal')}
                            </FormLabel>
                            <FormDescription>
                              {t('Allow users to submit affiliate withdrawal requests')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={updateOption.isPending}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className='space-y-6'>
              <Card className='border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background'>
                <CardHeader className='pb-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant='secondary'>{t('Four Tiers')}</Badge>
                    <Badge variant='outline'>{t('Invite-Based')}</Badge>
                  </div>
                  <CardTitle>{t('Affiliate Commission Tiers')}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 pt-4'>
                  <div className='grid gap-3'>
                    {watchedTiers?.map((tier, index) => (
                      <div
                        key={index}
                        className='rounded-2xl border bg-background/90 p-4 shadow-sm'
                      >
                        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                          <div className='flex items-center gap-2'>
                            <div className='flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
                              {index + 1}
                            </div>
                            <div>
                              <div className='text-sm font-semibold'>
                                {getAffiliateTierName(index + 1, t)}
                              </div>
                              <div className='text-muted-foreground text-xs'>
                                {index === 0
                                  ? t('Default commission level after registration')
                                  : t('Unlock this level after the invite threshold is met')}
                              </div>
                            </div>
                          </div>
                          <Badge variant='outline'>
                            {t('{{count}} invites', { count: tier.min_invites })}
                          </Badge>
                        </div>

                        <div className='grid gap-4 sm:grid-cols-2'>
                          <FormField
                            control={form.control}
                            name={`AffiliateCommissionTiers.${index}.min_invites`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('Minimum Invites')}</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    min={index === 0 ? 0 : watchedTiers[index - 1]?.min_invites ?? 0}
                                    value={field.value ?? ''}
                            onChange={handleNumberChange(field.onChange)}
                                    name={field.name}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    disabled={index === 0}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`AffiliateCommissionTiers.${index}.percentage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('Commission Percentage')}</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    min={0}
                                    max={100}
                                    value={field.value ?? ''}
                            onChange={handleNumberChange(field.onChange)}
                                    name={field.name}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name='AffiliateCommissionPercentage'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Level 1 Commission Reference')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={watchedTiers?.[0]?.percentage ?? field.value} readOnly disabled />
                        </FormControl>
                        <FormDescription>
                          {t('This value follows the first commission tier automatically.')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-0'>
                  <CardTitle>{t('Additional Links')}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-5 pt-6'>
                  <FormField
                    control={form.control}
                    name='quota_setting.enable_free_model_pre_consume'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-xl border p-4'>
                        <div className='space-y-1.5 pr-4'>
                          <FormLabel className='text-sm font-medium'>
                            {t('Pre-Consume for Free Models')}
                          </FormLabel>
                          <FormDescription>
                            {t(
                              'When enabled, zero-cost models also pre-consume quota before final settlement.'
                            )}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={updateOption.isPending}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='TopUpLink'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Top-Up Link')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('https://example.com/topup')}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('External link for users to purchase quota')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='general_setting.docs_link'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Documentation Link')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('https://docs.example.com')}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('Link to your documentation site')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Button
            type='submit'
            disabled={updateOption.isPending || isSubmitting}
          >
            {updateOption.isPending ? t('Saving...') : t('Save Changes')}
          </Button>
        </form>
      </Form>
    </SettingsSection>
  )
}
