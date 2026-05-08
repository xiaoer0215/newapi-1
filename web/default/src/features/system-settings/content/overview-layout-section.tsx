import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DEFAULT_OVERVIEW_LAYOUT,
  normalizeOverviewLayout,
  serializeOverviewLayout,
  type OverviewLayoutSectionId,
} from '@/features/dashboard/lib/overview-layout'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'

type OverviewLayoutSectionProps = {
  defaultValue: string
}

const SECTION_LABEL_KEY: Record<OverviewLayoutSectionId, string> = {
  'api-info': 'API Addresses',
  announcements: 'Announcements',
  'contact-panels': 'Contact QR Panels',
  faq: 'FAQ',
}

export function OverviewLayoutSection({
  defaultValue,
}: OverviewLayoutSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const normalizedDefault = useMemo(
    () => normalizeOverviewLayout(defaultValue),
    [defaultValue]
  )

  const [order, setOrder] = useState<OverviewLayoutSectionId[]>(
    normalizedDefault
  )

  useEffect(() => {
    setOrder(normalizedDefault)
  }, [normalizedDefault])

  const moveSection = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= order.length) return
    const next = [...order]
    ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
    setOrder(next)
  }

  const handleSave = async () => {
    const current = serializeOverviewLayout(order)
    const saved = serializeOverviewLayout(normalizedDefault)
    if (current === saved) return

    await updateOption.mutateAsync({
      key: 'console_setting.overview_layout',
      value: current,
    })
  }

  return (
    <SettingsSection
      title={t('Overview Layout')}
      description={t(
        'Configure the display order of cards on the dashboard overview page.'
      )}
    >
      <div className='space-y-4'>
        <div className='space-y-1'>
          <h4 className='text-sm font-medium'>{t('Overview card order')}</h4>
          <p className='text-muted-foreground text-sm'>
            {t(
              'Cards are rendered from top to bottom and left to right according to this order.'
            )}
          </p>
          <p className='text-muted-foreground text-sm'>
            {t('Visibility is still controlled by each module\'s own enable switch.')}
          </p>
        </div>

        <div className='space-y-3'>
          {order.map((section, index) => (
            <div
              key={section}
              className='flex items-center gap-3 rounded-lg border p-3'
            >
              <GripVertical className='text-muted-foreground h-4 w-4' />
              <div className='min-w-0 flex-1'>
                <div className='text-sm font-medium'>
                  {t(SECTION_LABEL_KEY[section])}
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
                  disabled={index === order.length - 1}
                  onClick={() => moveSection(index, 1)}
                >
                  <ArrowDown className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className='flex flex-wrap gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOrder([...DEFAULT_OVERVIEW_LAYOUT])}
          >
            {t('Reset to default')}
          </Button>
          <Button type='button' onClick={handleSave} disabled={updateOption.isPending}>
            {updateOption.isPending ? t('Saving...') : t('Save Changes')}
          </Button>
        </div>
      </div>
    </SettingsSection>
  )
}
