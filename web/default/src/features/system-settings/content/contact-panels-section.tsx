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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { updateSystemOption } from '../api'
import { SettingsSection } from '../components/settings-section'

const contactPanelsSchema = z.object({
  contactEnabled: z.boolean(),
  contactImage: z.string(),
  contactTitle: z.string(),
  contactCaption: z.string(),
  contact2Enabled: z.boolean(),
  contact2Image: z.string(),
  contact2Title: z.string(),
  contact2Caption: z.string(),
})

type ContactPanelsFormValues = z.infer<typeof contactPanelsSchema>

type ContactPanelsSectionProps = {
  defaultValues: ContactPanelsFormValues
}

const OPTION_KEY_MAP = {
  contactEnabled: 'console_setting.contact_enabled',
  contactImage: 'console_setting.contact_image',
  contactTitle: 'console_setting.contact_title',
  contactCaption: 'console_setting.contact_caption',
  contact2Enabled: 'console_setting.contact2_enabled',
  contact2Image: 'console_setting.contact_image2',
  contact2Title: 'console_setting.contact_title2',
  contact2Caption: 'console_setting.contact_caption2',
} as const

function PreviewImage(props: { src: string; alt: string }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setHidden(false)
  }, [props.src])

  if (!props.src.trim()) return null

  return (
    <div className='space-y-2'>
      <div className='text-muted-foreground text-xs font-medium'>
        {props.alt}
      </div>
      <div className='inline-flex rounded-xl border bg-muted/20 p-2'>
        {!hidden ? (
          <img
            src={props.src}
            alt={props.alt}
            className='h-28 w-28 rounded-lg object-contain'
            onError={() => setHidden(true)}
          />
        ) : (
          <div className='text-muted-foreground flex h-28 w-28 items-center justify-center rounded-lg text-xs'>
            {props.alt}
          </div>
        )}
      </div>
    </div>
  )
}

function PanelEditor(props: {
  index: 1 | 2
  enabledName: keyof ContactPanelsFormValues
  titleName: keyof ContactPanelsFormValues
  imageName: keyof ContactPanelsFormValues
  captionName: keyof ContactPanelsFormValues
  image: string
  t: (key: string) => string
  control: ReturnType<typeof useForm<ContactPanelsFormValues>>['control']
}) {
  return (
    <div className='space-y-4'>
      <div className='text-sm font-semibold'>{props.t(`Panel ${props.index}`)}</div>
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]'>
        <div className='space-y-4'>
          <FormField
            control={props.control}
            name={props.enabledName}
            render={({ field }) => (
              <FormItem className='flex flex-row items-start justify-between rounded-lg border p-4'>
                <div className='space-y-0.5 pe-4'>
                  <FormLabel className='text-base'>{props.t('Enabled')}</FormLabel>
                  <FormDescription>
                    {props.t('Configure dashboard contact QR panels')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={props.control}
            name={props.titleName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{props.t('Contact title')}</FormLabel>
                <FormControl>
                  <Input
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value as string}
                    placeholder={props.t(
                      'Enter a title such as WeChat, QQ group, or customer service'
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={props.control}
            name={props.imageName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{props.t('QR image URL')}</FormLabel>
                <FormControl>
                  <Input
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value as string}
                    placeholder={props.t('Enter the QR image URL')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={props.control}
            name={props.captionName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{props.t('Caption')}</FormLabel>
                <FormControl>
                  <Textarea
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value as string}
                    rows={4}
                    placeholder={props.t('Enter the description shown below the QR image')}
                  />
                </FormControl>
                <FormDescription>
                  {props.t('Shown below the QR image. Supports line breaks.')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <PreviewImage src={props.image} alt={props.t('Preview')} />
      </div>
    </div>
  )
}

export function ContactPanelsSection({
  defaultValues,
}: ContactPanelsSectionProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)

  const form = useForm<ContactPanelsFormValues>({
    resolver: zodResolver(contactPanelsSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const contactImage = form.watch('contactImage')
  const contact2Image = form.watch('contact2Image')

  const onSubmit = async (values: ContactPanelsFormValues) => {
    const updates = (
      Object.entries(OPTION_KEY_MAP) as Array<
        [keyof ContactPanelsFormValues, string]
      >
    ).filter(([key]) => values[key] !== defaultValues[key])

    if (updates.length === 0) {
      toast.info(t('No changes to save'))
      return
    }

    setSaving(true)
    try {
      for (const [key, optionKey] of updates) {
        const result = await updateSystemOption({
          key: optionKey,
          value: values[key],
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
      toast.success(t('Contact QR panels saved successfully'))
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
      title={t('Contact QR Panels')}
      description={t(
        'Configure the two QR contact panels shown on the dashboard overview page.'
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <PanelEditor
            index={1}
            enabledName='contactEnabled'
            titleName='contactTitle'
            imageName='contactImage'
            captionName='contactCaption'
            image={contactImage}
            t={t}
            control={form.control}
          />

          <PanelEditor
            index={2}
            enabledName='contact2Enabled'
            titleName='contact2Title'
            imageName='contact2Image'
            captionName='contact2Caption'
            image={contact2Image}
            t={t}
            control={form.control}
          />

          <Button type='submit' disabled={saving}>
            {saving ? t('Saving...') : t('Save Changes')}
          </Button>
        </form>
      </Form>
    </SettingsSection>
  )
}
