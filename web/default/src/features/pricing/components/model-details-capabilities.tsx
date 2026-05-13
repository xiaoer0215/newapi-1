import {
  Boxes,
  BrainCircuit,
  Braces,
  Code2,
  DatabaseZap,
  FileJson2,
  Globe2,
  MessageSquareText,
  Radio,
  Search,
  Sparkles,
  TerminalSquare,
  Wrench,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { Modality, ModelCapability } from '../types'
import { ModalitiesMatrix } from './model-details-modalities'

const CAPABILITY_META: Record<
  ModelCapability,
  {
    icon: React.ComponentType<{ className?: string }>
    labelKey: string
    descriptionKey: string
    accentClass: string
  }
> = {
  function_calling: {
    icon: Wrench,
    labelKey: 'Function calling',
    descriptionKey: 'Call external functions and tools from model responses.',
    accentClass: 'text-blue-600 dark:text-blue-400',
  },
  streaming: {
    icon: Radio,
    labelKey: 'Streaming',
    descriptionKey: 'Stream partial tokens for low-latency user experiences.',
    accentClass: 'text-emerald-600 dark:text-emerald-400',
  },
  vision: {
    icon: Sparkles,
    labelKey: 'Vision',
    descriptionKey: 'Understand images and multimodal prompts.',
    accentClass: 'text-violet-600 dark:text-violet-400',
  },
  json_mode: {
    icon: FileJson2,
    labelKey: 'JSON mode',
    descriptionKey: 'Constrain generation to JSON object outputs.',
    accentClass: 'text-amber-600 dark:text-amber-400',
  },
  structured_output: {
    icon: Braces,
    labelKey: 'Structured output',
    descriptionKey: 'Generate schema-aligned structured responses.',
    accentClass: 'text-cyan-600 dark:text-cyan-400',
  },
  reasoning: {
    icon: BrainCircuit,
    labelKey: 'Reasoning',
    descriptionKey: 'Optimized for multi-step reasoning and planning.',
    accentClass: 'text-purple-600 dark:text-purple-400',
  },
  tools: {
    icon: TerminalSquare,
    labelKey: 'Tools',
    descriptionKey: 'Designed to coordinate tool and agent workflows.',
    accentClass: 'text-sky-600 dark:text-sky-400',
  },
  system_prompt: {
    icon: MessageSquareText,
    labelKey: 'System prompt',
    descriptionKey: 'Supports system-level behavior instructions.',
    accentClass: 'text-indigo-600 dark:text-indigo-400',
  },
  web_search: {
    icon: Search,
    labelKey: 'Web search',
    descriptionKey: 'Can be paired with online search workflows.',
    accentClass: 'text-lime-600 dark:text-lime-400',
  },
  code_interpreter: {
    icon: Code2,
    labelKey: 'Code interpreter',
    descriptionKey: 'Useful for code generation and execution-style tasks.',
    accentClass: 'text-rose-600 dark:text-rose-400',
  },
  caching: {
    icon: DatabaseZap,
    labelKey: 'Prompt caching',
    descriptionKey: 'Supports cached prompt tokens for lower repeated costs.',
    accentClass: 'text-orange-600 dark:text-orange-400',
  },
  embeddings: {
    icon: Boxes,
    labelKey: 'Embeddings',
    descriptionKey: 'Produces vectors for search, ranking, or retrieval.',
    accentClass: 'text-teal-600 dark:text-teal-400',
  },
}

export function ModelDetailsCapabilities(props: {
  capabilities: ModelCapability[]
  input: Modality[]
  output: Modality[]
}) {
  const { t } = useTranslation()
  const capabilities = props.capabilities

  return (
    <div className='space-y-5'>
      <section>
        <div className='mb-2 flex items-center gap-2'>
          <Sparkles className='text-muted-foreground/70 size-3.5' />
          <div>
            <h2 className='text-sm font-semibold'>{t('Capabilities')}</h2>
            <p className='text-muted-foreground text-xs'>
              {t('Feature support inferred from model metadata and endpoints.')}
            </p>
          </div>
        </div>

        {capabilities.length === 0 ? (
          <div className='text-muted-foreground rounded-lg border p-6 text-center text-sm'>
            {t('No capabilities reported for this model.')}
          </div>
        ) : (
          <div className='grid gap-2 sm:grid-cols-2 xl:grid-cols-3'>
            {capabilities.map((capability) => {
              const meta = CAPABILITY_META[capability]
              const Icon = meta.icon
              return (
                <div
                  key={capability}
                  className='bg-card/60 rounded-lg border p-3 shadow-sm'
                >
                  <div className='flex items-center gap-2'>
                    <span
                      className={cn(
                        'bg-muted/60 inline-flex size-8 items-center justify-center rounded-lg',
                        meta.accentClass
                      )}
                    >
                      <Icon className='size-4' />
                    </span>
                    <span className='text-sm font-medium'>
                      {t(meta.labelKey)}
                    </span>
                  </div>
                  <p className='text-muted-foreground mt-2 text-xs leading-relaxed'>
                    {t(meta.descriptionKey)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <div className='mb-2 flex items-center gap-2'>
          <Globe2 className='text-muted-foreground/70 size-3.5' />
          <div>
            <h2 className='text-sm font-semibold'>{t('Supported modalities')}</h2>
            <p className='text-muted-foreground text-xs'>
              {t('Input and output types this model can process.')}
            </p>
          </div>
        </div>
        <ModalitiesMatrix input={props.input} output={props.output} />
      </section>
    </div>
  )
}
