import { useEffect, useMemo, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  className?: string
}

export function SearchBar(props: SearchBarProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const shortcutLabel = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return 'Ctrl K'
    }
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform) ? '⌘K' : 'Ctrl K'
  }, [])

  return (
    <div className={cn('relative', props.className)}>
      <Search className='text-muted-foreground/60 pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2' />
      <input
        ref={inputRef}
        type='text'
        placeholder={props.placeholder || t('Search models...')}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className={cn(
          'border-border/70 bg-background/85 supports-[backdrop-filter]:bg-background/72 placeholder:text-muted-foreground/50 shadow-sm backdrop-blur-sm',
          'hover:border-border',
          'focus:border-primary/50 focus:ring-primary/20 focus:ring-2',
          'h-11 w-full rounded-2xl border pr-16 pl-11 text-sm transition-all outline-none'
        )}
        aria-label={t('Search models')}
      />
      <div className='absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1'>
        {props.value ? (
          <Button
            variant='ghost'
            size='icon'
            onClick={props.onClear}
            className='text-muted-foreground/60 hover:text-foreground size-8 rounded-full'
            aria-label={t('Clear search')}
          >
            <X className='size-4' />
          </Button>
        ) : (
          <kbd className='bg-muted/70 text-muted-foreground pointer-events-none hidden rounded-full border px-2 py-1 font-mono text-[10px] sm:inline-flex'>
            {shortcutLabel}
          </kbd>
        )}
      </div>
    </div>
  )
}

