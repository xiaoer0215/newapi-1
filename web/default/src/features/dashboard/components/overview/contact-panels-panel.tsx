import { useEffect, useMemo, useState } from 'react'
import { QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { ContactPanelConfig } from '@/features/dashboard/types'
import { PanelWrapper } from '../ui/panel-wrapper'

type ContactPanelsPanelProps = {
  panels: ContactPanelConfig[]
}

function ContactTile(
  props: ContactPanelConfig & {
    index: number
  }
) {
  const { t } = useTranslation()
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [props.image])

  const captionLines = useMemo(
    () =>
      (props.caption || '')
        .split(/\\n|\n/g)
        .map((line) => line.trim())
        .filter(Boolean),
    [props.caption]
  )

  return (
    <div
      className={cn(
        'grid h-full min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] justify-items-center gap-2 overflow-hidden px-2 pb-3 pt-4 sm:px-3 sm:pb-3 sm:pt-4',
        props.index > 0 && 'border-border/60 border-l'
      )}
    >
      <div className='text-slate-900 line-clamp-2 text-center text-base font-semibold leading-6 dark:text-slate-100'>
        {props.title?.trim() || t('Contact QR')}
      </div>
      <div className='flex min-h-0 flex-1 items-center justify-center'>
        <div className='flex aspect-square w-[clamp(9.5rem,70%,13.5rem)] items-center justify-center rounded-xl border bg-muted/15 p-2.5 sm:w-[clamp(10rem,64%,14rem)] sm:p-3'>
          {!imageError ? (
            <img
              src={props.image}
              alt={props.title?.trim() || t('Contact QR')}
              className='h-full w-full rounded-md object-contain'
              onError={() => setImageError(true)}
            />
          ) : (
            <div className='text-muted-foreground flex h-full w-full items-center justify-center text-center text-[11px] leading-4 sm:text-xs'>
              {t('Image unavailable')}
            </div>
          )}
        </div>
      </div>
      {captionLines.length > 0 && (
        <div className='max-w-[94%] space-y-0.5 text-center'>
          {captionLines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className='text-slate-900 text-sm font-medium leading-5 dark:text-slate-100'
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export function ContactPanelsPanel({ panels }: ContactPanelsPanelProps) {
  const { t } = useTranslation()

  if (!panels.length) return null

  return (
    <PanelWrapper
      title={
        <span className='flex items-center gap-2'>
          <QrCode className='text-muted-foreground/60 size-4' />
          {t('Contact Us')}
        </span>
      }
      height='h-72'
      contentClassName='p-0 sm:p-0'
    >
      <div
        className={cn(
          'grid h-72 overflow-hidden',
          panels.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
        )}
      >
        {panels.map((panel, index) => (
          <ContactTile
            key={`${panel.title || 'contact'}-${index}`}
            index={index}
            title={panel.title}
            image={panel.image}
            caption={panel.caption}
          />
        ))}
      </div>
    </PanelWrapper>
  )
}
