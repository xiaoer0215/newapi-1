import { Copy, Check, RefreshCw, Edit, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MESSAGE_ACTION_LABELS } from '../constants'
import { useMessageActionGuard } from '../hooks/use-message-action-guard'
import type { Message } from '../types'
import { MessageActionButton } from './message-action-button'

interface MessageActionsProps {
  message: Message
  onCopy?: (message: Message) => void
  onRegenerate?: (message: Message) => void
  onEdit?: (message: Message) => void
  onDelete?: (message: Message) => void
  isGenerating?: boolean
  alwaysVisible?: boolean
  className?: string
}

export function MessageActions({
  message,
  onCopy,
  onRegenerate,
  onEdit,
  onDelete,
  isGenerating = false,
  alwaysVisible = false,
  className = '',
}: MessageActionsProps) {
  const { t } = useTranslation()
  const { copiedText, copyToClipboard } = useCopyToClipboard()
  const { guardAction } = useMessageActionGuard(isGenerating)

  const isAssistant = message.from === 'assistant'
  const versions = Array.isArray(message.versions) ? message.versions : []
  const hasContent = versions.some((v) => v?.content)
  const isLoading =
    message.status === 'loading' || message.status === 'streaming'
  const content = versions[0]?.content || ''
  const isCopied = copiedText === content

  const handleCopy = () => {
    if (!content) {
      toast.warning(t(MESSAGE_ACTION_LABELS.NO_CONTENT))
      return
    }
    copyToClipboard(content)
    onCopy?.(message)
  }

  const handleRegenerate = guardAction(() => onRegenerate?.(message))
  const handleEdit = guardAction(() => onEdit?.(message))
  const handleDelete = guardAction(() => onDelete?.(message))

  const visibilityClass = alwaysVisible
    ? 'opacity-100'
    : 'opacity-0 group-hover:opacity-100 max-md:opacity-100'

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={`flex items-center gap-0.5 transition-opacity ${visibilityClass} ${className}`}
      >
        {/* Copy */}
        {hasContent && (
          <MessageActionButton
            icon={isCopied ? Check : Copy}
            label={
              isCopied
                ? t(MESSAGE_ACTION_LABELS.COPIED)
                : t(MESSAGE_ACTION_LABELS.COPY)
            }
            onClick={handleCopy}
            className={isCopied ? 'text-green-600' : ''}
          />
        )}

        {/* Regenerate - only for assistant messages */}
        {isAssistant && !isLoading && onRegenerate && (
          <MessageActionButton
            icon={RefreshCw}
            label={t(MESSAGE_ACTION_LABELS.REGENERATE)}
            onClick={handleRegenerate}
            disabled={isGenerating}
          />
        )}

        {/* Edit */}
        {hasContent && onEdit && (
          <MessageActionButton
            icon={Edit}
            label={t(MESSAGE_ACTION_LABELS.EDIT)}
            onClick={handleEdit}
            disabled={isGenerating}
          />
        )}

        {/* Delete */}
        {onDelete && (
          <MessageActionButton
            icon={Trash2}
            label={t(MESSAGE_ACTION_LABELS.DELETE)}
            onClick={handleDelete}
            disabled={isGenerating}
            variant='destructive'
          />
        )}
      </div>
    </TooltipProvider>
  )
}
