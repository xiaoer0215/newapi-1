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
        'flex flex-col items-center gap-3 px-2 py-3 sm:px-4 sm:py-4',
        props.index > 0 && 'border-border/60 border-t xl:border-t-0 xl:border-l'
      )}
    >
      <div className='text-center text-sm font-medium'>
        {props.title?.trim() || t('Contact QR')}
      </div>
      <div className='flex min-h-36 min-w-36 items-center justify-center rounded-xl border bg-muted/20 p-3'>
        {!imageError ? (
          <img
            src={props.image}
            alt={props.title?.trim() || t('Contact QR')}
            className='h-32 w-32 rounded-lg object-contain sm:h-36 sm:w-36'
            onError={() => setImageError(true)}
          />
        ) : (
          <div className='text-muted-foreground flex h-32 w-32 items-center justify-center text-sm sm:h-36 sm:w-36'>
            {t('Image unavailable')}
          </div>
        )}
      </div>
      {captionLines.length > 0 && (
        <div className='space-y-1 text-center'>
          {captionLines.map((line, index) => (
            <p key={`${line}-${index}`} className='text-muted-foreground text-xs'>
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
    >
      <div
        className={cn(
          'flex flex-col',
          panels.length > 1 && 'xl:grid xl:grid-cols-2'
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
