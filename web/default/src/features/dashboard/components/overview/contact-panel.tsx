import { useEffect, useMemo, useState } from 'react'
import { QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ContactPanelConfig } from '@/features/dashboard/types'
import { PanelWrapper } from '../ui/panel-wrapper'

export function ContactPanel({
  title,
  image,
  caption,
}: ContactPanelConfig) {
  const { t } = useTranslation()
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [image])

  const captionLines = useMemo(
    () =>
      (caption || '')
        .split(/\\n|\n/g)
        .map((line) => line.trim())
        .filter(Boolean),
    [caption]
  )

  return (
    <PanelWrapper
      title={
        <span className='flex items-center gap-2'>
          <QrCode className='text-muted-foreground/60 size-4' />
          {title?.trim() || t('Contact Us')}
        </span>
      }
      height='h-56 sm:h-64'
    >
      <div className='flex h-56 flex-col items-center justify-center gap-4 sm:h-64'>
        <div className='flex min-h-40 min-w-40 items-center justify-center rounded-xl border bg-muted/20 p-3'>
          {!imageError ? (
            <img
              src={image}
              alt={title?.trim() || t('Contact QR')}
              className='h-36 w-36 rounded-lg object-contain sm:h-40 sm:w-40'
              onError={() => setImageError(true)}
            />
          ) : (
            <div className='text-muted-foreground flex h-36 w-36 items-center justify-center text-sm sm:h-40 sm:w-40'>
              {t('Image unavailable')}
            </div>
          )}
        </div>

        {captionLines.length > 0 && (
          <div className='space-y-1 text-center'>
            {captionLines.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className='text-muted-foreground text-sm'
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </PanelWrapper>
  )
}
