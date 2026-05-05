import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  History,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  ZoomIn,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getDrawingInit, resolveDrawingImage, uploadDrawingImage } from './api'
import {
  DEFAULT_FORM,
  DRAWING_ASPECT_RATIO_OPTIONS,
  DRAWING_HISTORY_LIMIT,
  DRAWING_HISTORY_PAGE_SIZE,
  DRAWING_IMAGE_SIZE_OPTIONS,
  DRAWING_REQUEST_MODE_GEMINI_NATIVE,
  DRAWING_REQUEST_MODE_OPENAI_IMAGE_EDIT,
  DRAWING_REQUEST_MODE_RESPONSES_IMAGE_GENERATION,
  INITIAL_CONFIG,
  MAX_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGE_BYTES,
  getDrawingTokenName,
  isFreeCdnDrawingImage,
  normalizeDrawingUploadSource,
  readDrawingHistoryWithFallback,
  writeDrawingHistory,
  buildDrawingPrompt,
} from './constants'
import { drawingPageStyles } from './styles'
import type { DrawingConfig, DrawingImage, DrawingRecord, ReferenceImage } from './types'
import {
  aspectRatioToImageGenerationSize,
  buildGeminiGenerateContentPayload,
  buildOpenAIImageEditFormData,
  buildResponsesImageGenerationPayload,
  downloadImage,
  formatBytes,
  formatDrawingSizeLabel,
  formatElapsedTime,
  formatTime,
  makeRecordId,
  normalizeDrawingErrorMessage,
  normalizeDrawingImages,
  normalizeGeminiGenerateContentResponse,
  normalizeImageItem,
  normalizeResponsesImageGenerationResponse,
  readFileAsDataUrl,
  resolveApiUrl,
  resolveDrawingRequestMode,
  resolveGeminiGenerateContentUrl,
  supportsReferenceImages,
  uploadDrawingImageToFreeCdn,
} from './utils'

export function Drawing() {
  const { t, i18n } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [booting, setBooting] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [config, setConfig] = useState<DrawingConfig>(INITIAL_CONFIG)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([])
  const [resultHistory, setResultHistory] = useState<DrawingRecord[]>([])
  const [activeRecordId, setActiveRecordId] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<{
    src: string
    downloadSrc: string
    filename: string
  } | null>(null)
  const [latestError, setLatestError] = useState('')
  const [generationStartedAt, setGenerationStartedAt] = useState(0)
  const [generationElapsedSeconds, setGenerationElapsedSeconds] = useState(0)

  const loadInit = useCallback(async () => {
    try {
      setBooting(true)
      const payload = await getDrawingInit()
      if (!payload.success) {
        const message =
          payload.message || t('Failed to load drawing configuration')
        toast.error(message)
        setLatestError(message)
        return
      }

      const nextConfig = payload.data || {}
      const nextModels = Array.isArray(nextConfig.models)
        ? nextConfig.models.filter(Boolean)
        : []

      setConfig({
        enabled: Boolean(nextConfig.enabled),
        group: nextConfig.group || '',
        models: nextModels,
        default_model: nextConfig.default_model || '',
        default_request_mode: nextConfig.default_request_mode || '',
        model_request_modes: nextConfig.model_request_modes || {},
        token_name: nextConfig.token_name || '',
        authorization: nextConfig.authorization || '',
        endpoint: nextConfig.endpoint || '/v1/images/generations',
        responses_endpoint: nextConfig.responses_endpoint || '/v1/responses',
        edit_endpoint: nextConfig.edit_endpoint || '/v1/images/edits',
      })

      setForm((prev) => ({
        ...prev,
        model: nextModels.includes(prev.model)
          ? prev.model
          : nextConfig.default_model || nextModels[0] || '',
      }))
      setLatestError('')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('Failed to load drawing configuration')
      toast.error(message)
      setLatestError(message)
    } finally {
      setBooting(false)
    }
  }, [t])

  useEffect(() => {
    void loadInit()
  }, [loadInit])

  useEffect(() => {
    const records = readDrawingHistoryWithFallback<DrawingRecord>(
      config.token_name
    )
    setResultHistory(records)
    setActiveRecordId(records[0]?.id || '')
  }, [config.token_name])

  useEffect(() => {
    writeDrawingHistory(config.token_name, resultHistory)
  }, [config.token_name, resultHistory])

  useEffect(() => {
    setHistoryPage(1)
  }, [resultHistory.length])

  useEffect(() => {
    if (!submitting || !generationStartedAt) return
    const updateElapsed = () => {
      setGenerationElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - generationStartedAt) / 1000))
      )
    }
    updateElapsed()
    const timer = window.setInterval(updateElapsed, 1000)
    return () => window.clearInterval(timer)
  }, [generationStartedAt, submitting])

  const handleFormChange = <K extends keyof typeof DEFAULT_FORM>(
    key: K,
    value: (typeof DEFAULT_FORM)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const appendReferenceFiles = async (files: FileList | null) => {
    if (referenceImages.length >= MAX_REFERENCE_IMAGES) {
      toast.error(t('You can upload up to 3 reference images'))
      return
    }

    const incomingFiles = Array.from(files || [])
    if (incomingFiles.length === 0) return

    const availableSlots = MAX_REFERENCE_IMAGES - referenceImages.length
    const selectedFiles = incomingFiles.slice(0, availableSlots)
    const nextItems: ReferenceImage[] = []

    for (const file of selectedFiles) {
      if (!String(file.type || '').startsWith('image/')) {
        toast.error(t('Only image files are supported'))
        continue
      }
      if (file.size > MAX_REFERENCE_IMAGE_BYTES) {
        toast.error(`${file.name} ${t('exceeds the 5MB limit')}`)
        continue
      }

      try {
        const dataUrl = await readFileAsDataUrl(file)
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : ''
        if (!base64) {
          toast.error(`${file.name} ${t('Failed to read image')}`)
          continue
        }
        nextItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          mimeType: file.type || 'image/png',
          size: file.size,
          base64,
          previewUrl: dataUrl,
        })
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t('Failed to read image')
        )
      }
    }

    if (nextItems.length > 0) {
      setReferenceImages((prev) => [...prev, ...nextItems].slice(0, 3))
    }
    if (incomingFiles.length > availableSlots) {
      toast.error(t('You can upload up to 3 reference images'))
    }
  }

  const handleReferenceInput = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    await appendReferenceFiles(event.target.files)
    event.target.value = ''
  }

  const handleReferenceDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    await appendReferenceFiles(event.dataTransfer.files)
  }

  const addHistoryImageAsReference = async (
    record: DrawingRecord,
    image: DrawingImage,
    index: number
  ) => {
    if (!image.src) {
      toast.error(t('Image URL is invalid'))
      return
    }
    if (referenceImages.length >= MAX_REFERENCE_IMAGES) {
      toast.error(t('You can upload up to 3 reference images'))
      return
    }

    try {
      const resolveSource = normalizeDrawingUploadSource(image.src)
      const res = await resolveDrawingImage({
        image: resolveSource,
        filename: `history-${record.id}-${index + 1}.png`,
      })
      if (!res.success || !res.data?.base64) {
        throw new Error(t('Reference image data is invalid'))
      }

      const mimeType = res.data.mimeType || res.data.mime_type || 'image/png'
      const base64 = res.data.base64
      const dataUrl = res.data.data_url || `data:${mimeType};base64,${base64}`

      setReferenceImages((prev) =>
        [
          ...prev,
          {
            id: `history-${record.id}-${index}-${Date.now()}`,
            name: `history-${record.id}-${index + 1}.png`,
            mimeType,
            size: Number(res.data?.size || 0),
            base64,
            previewUrl: dataUrl,
          },
        ].slice(0, MAX_REFERENCE_IMAGES)
      )
      toast.success(t('Added to reference images'))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('Failed to read history image')
      )
    }
  }

  const openLargePreview = useCallback(
    (image: DrawingImage, filename: string) => {
      const resolvedSrc = image.link || image.src
      if (!resolvedSrc) {
        toast.error(t('Image URL is invalid'))
        return
      }

      setPreviewImage({
        src: resolvedSrc,
        downloadSrc: resolvedSrc,
        filename,
      })
    },
    [t]
  )

  const handleGenerate = async () => {
    setLatestError('')
    const prompt = String(form.prompt || '').trim()
    const finalPrompt = buildDrawingPrompt({
      prompt,
      aspectRatio: form.aspectRatio,
      imageSize: form.imageSize,
      referenceImages,
    })

    if (!config.enabled) {
      toast.error(t('Drawing is not enabled on this site yet'))
      return
    }
    if (!prompt) {
      toast.error(t('Please enter a prompt'))
      return
    }
    if (!form.model) {
      toast.error(t('No drawing model is currently available'))
      return
    }
    if (!config.authorization) {
      toast.error(
        t('Drawing token is not initialized yet. Please refresh the configuration.')
      )
      return
    }

    const requestMode = resolveDrawingRequestMode(
      config.model_request_modes,
      config.default_request_mode,
      form.model
    )

    if (referenceImages.length > 0 && !supportsReferenceImages(requestMode)) {
      toast.error(
        t(
          'The current model does not support reference images. Please switch to a compatible model.'
        )
      )
      return
    }

    setGenerationStartedAt(Date.now())
    setGenerationElapsedSeconds(0)
    setSubmitting(true)

    try {
      let requestUrl = resolveApiUrl(config.endpoint)
      let requestBody: BodyInit | null = null
      let payload: Record<string, unknown> = {}
      let sizeLabel = form.aspectRatio

      if (requestMode === DRAWING_REQUEST_MODE_GEMINI_NATIVE) {
        requestUrl = resolveGeminiGenerateContentUrl(form.model)
        payload = buildGeminiGenerateContentPayload({
          prompt: finalPrompt,
          aspectRatio: form.aspectRatio,
          imageSize: form.imageSize,
          referenceImages,
        }) as Record<string, unknown>
      } else if (
        requestMode === DRAWING_REQUEST_MODE_RESPONSES_IMAGE_GENERATION
      ) {
        requestUrl = resolveApiUrl(config.responses_endpoint)
        payload = buildResponsesImageGenerationPayload({
          model: form.model,
          prompt: finalPrompt,
          aspectRatio: form.aspectRatio,
          imageSize: form.imageSize,
          referenceImages,
        }) as Record<string, unknown>
        sizeLabel = formatDrawingSizeLabel({
          aspectRatio: form.aspectRatio,
          imageSize: form.imageSize,
          actualSize: String(
            (payload.tools as Array<Record<string, unknown>>)?.[0]?.size || ''
          ),
        })
      } else if (
        requestMode === DRAWING_REQUEST_MODE_OPENAI_IMAGE_EDIT &&
        referenceImages.length > 0
      ) {
        requestUrl = resolveApiUrl(config.edit_endpoint)
        const editRequest = buildOpenAIImageEditFormData({
          model: form.model,
          prompt: finalPrompt,
          aspectRatio: form.aspectRatio,
          imageSize: form.imageSize,
          referenceImages,
        })
        requestBody = editRequest.formData
        sizeLabel = formatDrawingSizeLabel({
          aspectRatio: form.aspectRatio,
          imageSize: form.imageSize,
          actualSize: editRequest.sizeLabel,
        })
      } else {
        const imageGenerationSize = aspectRatioToImageGenerationSize(
          form.aspectRatio,
          form.model
        )
        payload = {
          model: form.model,
          prompt: finalPrompt,
          n: 1,
          size: imageGenerationSize,
        }
        sizeLabel = formatDrawingSizeLabel({
          aspectRatio: form.aspectRatio,
          imageSize: form.imageSize,
          actualSize: imageGenerationSize,
        })
      }

      const headers: Record<string, string> = {
        Authorization: config.authorization,
      }
      if (requestBody === null) {
        headers['Content-Type'] = 'application/json'
        requestBody = JSON.stringify(payload)
      }

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: requestBody,
      })

      const rawText = await response.text()
      let parsedBody: Record<string, unknown> | null = null
      try {
        parsedBody = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {}
      } catch {
        parsedBody = null
      }

      if (!response.ok) {
        const upstreamError = (
          parsedBody?.error as Record<string, unknown> | undefined
        )?.message
        const errorMessage = String(
          upstreamError || parsedBody?.message || rawText || `HTTP ${response.status}`
        ).trim()
        throw new Error(errorMessage || `HTTP ${response.status}`)
      }

      let images: DrawingImage[] = []
      let responseText = ''

      if (requestMode === DRAWING_REQUEST_MODE_GEMINI_NATIVE) {
        const normalized = normalizeGeminiGenerateContentResponse(parsedBody || {})
        images = normalized.images
        responseText = normalized.responseText
        if (images.length === 0 && normalized.blockReason) {
          throw new Error(`Gemini blocked the request: ${normalized.blockReason}`)
        }
      } else if (
        requestMode === DRAWING_REQUEST_MODE_RESPONSES_IMAGE_GENERATION
      ) {
        const normalized = normalizeResponsesImageGenerationResponse(parsedBody || {})
        images = normalized.images
        responseText = normalized.responseText
      } else {
        images = Array.isArray(parsedBody?.data)
          ? (parsedBody.data
              .map((item, index) =>
                typeof item === 'object' && item !== null
                  ? normalizeImageItem(item as Record<string, unknown>, index)
                  : null
              )
              .filter((item): item is NonNullable<typeof item> => Boolean(item)) as DrawingImage[])
          : []
      }

      if (images.length === 0) {
        throw new Error(
          responseText ||
            t(
              'The upstream returned success, but no displayable image result was found.'
            )
        )
      }

      images = normalizeDrawingImages(images, 4)
      const recordId = makeRecordId()
      if (images.some((image) => image.src && !isFreeCdnDrawingImage(image.src))) {
        try {
          images = await Promise.all(
            images.map((image, index) =>
              uploadDrawingImageToFreeCdn(image, recordId, index, uploadDrawingImage)
            )
          )
        } catch (uploadError) {
          toast.error(
            `${t(
              'Images were generated, but uploading to the free CDN failed. Temporary upstream URLs will be used instead.'
            )} ${uploadError instanceof Error ? uploadError.message : ''}`
          )
        }
      }

      const nextRecord: DrawingRecord = {
        id: recordId,
        createdAt: new Date().toISOString(),
        prompt: finalPrompt,
        rawPrompt: prompt,
        model: form.model,
        aspectRatio: form.aspectRatio,
        imageSize: form.imageSize,
        sizeLabel,
        count: images.length,
        requestMode,
        responseText,
        images,
      }

      setResultHistory((prev) =>
        [nextRecord, ...prev].slice(0, DRAWING_HISTORY_LIMIT)
      )
      setActiveRecordId(nextRecord.id)
      toast.success(t('Drawing completed'))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('Drawing request failed')
      const normalized = normalizeDrawingErrorMessage(message, t)
      setLatestError(normalized)
      toast.error(normalized)
    } finally {
      setSubmitting(false)
    }
  }

  const activeRecord =
    resultHistory.find((item) => item.id === activeRecordId) || resultHistory[0] || null
  const tokenValue = getDrawingTokenName(config.token_name)
  const currentRequestMode = resolveDrawingRequestMode(
    config.model_request_modes,
    config.default_request_mode,
    form.model
  )
  const historyImageEntries = resultHistory.flatMap((record) =>
    record.images.map((image, index) => ({
      record,
      image,
      index,
      key: `${record.id}-${image.id || index}`,
    }))
  )
  const historyTotalPages = Math.max(
    1,
    Math.ceil(historyImageEntries.length / DRAWING_HISTORY_PAGE_SIZE)
  )
  const safeHistoryPage = Math.min(historyPage, historyTotalPages)
  const pagedHistoryImages = historyImageEntries.slice(
    (safeHistoryPage - 1) * DRAWING_HISTORY_PAGE_SIZE,
    safeHistoryPage * DRAWING_HISTORY_PAGE_SIZE
  )
  const historyLabel =
    (
      {
        zh: '历史',
        en: 'History',
        fr: 'Historique',
        ru: 'История',
        ja: '履歴',
        vi: 'Lịch sử',
      } as const
    )[i18n.resolvedLanguage as 'zh' | 'en' | 'fr' | 'ru' | 'ja' | 'vi'] ||
    (
      {
        zh: '历史',
        en: 'History',
        fr: 'Historique',
        ru: 'История',
        ja: '履歴',
        vi: 'Lịch sử',
      } as const
    )[i18n.language?.split('-')[0] as 'zh' | 'en' | 'fr' | 'ru' | 'ja' | 'vi'] ||
    'History'
  const viewLargeLabel =
    (
      {
        zh: '查看大图',
        en: 'View Large',
        fr: 'Voir en grand',
        ru: 'Открыть крупно',
        ja: '大きく表示',
        vi: 'Xem ảnh lớn',
      } as const
    )[i18n.resolvedLanguage as 'zh' | 'en' | 'fr' | 'ru' | 'ja' | 'vi'] ||
    (
      {
        zh: '查看大图',
        en: 'View Large',
        fr: 'Voir en grand',
        ru: 'Открыть крупно',
        ja: '大きく表示',
        vi: 'Xem ảnh lớn',
      } as const
    )[i18n.language?.split('-')[0] as 'zh' | 'en' | 'fr' | 'ru' | 'ja' | 'vi'] ||
    'View Large'

  const configBadges = useMemo(
    () =>
      [
        {
          key: 'enabled',
          className: config.enabled
            ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
            : 'bg-muted text-muted-foreground',
          label: config.enabled ? t('Enabled') : t('Disabled'),
        },
        config.group
          ? {
              key: 'group',
              className: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
              label: `${t('Group')}: ${config.group}`,
            }
          : null,
        config.token_name
          ? {
              key: 'token',
              className: 'bg-violet-500/12 text-violet-600 dark:text-violet-400',
              label: `${t('Token')}: ${config.token_name}`,
            }
          : null,
        {
          key: 'models',
          className: 'bg-amber-500/12 text-amber-700 dark:text-amber-400',
          label: `${t('Model Count')}: ${config.models.length}`,
        },
      ].filter(
        (
          item
        ): item is { key: string; className: string; label: string } => Boolean(item)
      ),
    [config.enabled, config.group, config.models.length, config.token_name, t]
  )

  return (
    <div className='drawing-page-shell'>
      <div className='drawing-page-header'>
        <div>
          <div className='drawing-page-badge'>
            <Sparkles size={14} />
            {t('AI Drawing')}
          </div>
          <div className='drawing-page-hero-copy'>
            <div className='drawing-page-hero-copy-title'>
              {t(
                'Your ideas start turning into finished images the moment inspiration appears.'
              )}
            </div>
            <div className='drawing-page-hero-copy-summary'>
              {t(
                'Combine prompts, reference images, aspect ratios, and image sizes freely. Available models are synced automatically from the backend drawing configuration so every idea can become a visible result faster.'
              )}
            </div>
          </div>
        </div>

        <Button
          variant='outline'
          className='rounded-2xl'
          onClick={() => void loadInit()}
          disabled={booting}
        >
          <RefreshCw className={cn('size-4', booting && 'animate-spin')} />
          {t('Refresh Configuration')}
        </Button>
      </div>

      <div className='drawing-stage-grid'>
        <Card className='drawing-panel-card gap-0 py-0'>
          <CardContent className='drawing-panel-body'>
            <div className='drawing-form-stack'>
              <div className='drawing-config-pills'>
                {configBadges.map((item) => (
                  <Badge key={item.key} variant='outline' className={item.className}>
                    {item.label}
                  </Badge>
                ))}
              </div>

              {!config.enabled ? (
                <Empty className='border-0 px-0 py-10'>
                  <EmptyHeader>
                    <EmptyMedia variant='icon'>
                      <ImageIcon />
                    </EmptyMedia>
                    <EmptyTitle>{t('Drawing is not configured yet')}</EmptyTitle>
                    <EmptyDescription>
                      {t(
                        'Drawing is disabled, or the drawing group and models have not been configured yet in the backend.'
                      )}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  <div className='drawing-field-block'>
                    <div className='drawing-field-head'>
                      <div className='text-sm font-semibold text-foreground'>
                        {t('Prompt')}
                      </div>
                      <div className='text-muted-foreground text-xs'>{`${
                        String(form.prompt || '').length
                      } / 5000`}</div>
                    </div>
                    <Textarea
                      value={form.prompt}
                      onChange={(event) =>
                        handleFormChange('prompt', event.target.value)
                      }
                      placeholder={t(
                        'For example: an orange cat wearing metallic headphones sitting on a neon rainy street at night, cinematic, ultra detailed.'
                      )}
                      className='min-h-[180px] rounded-2xl border-0 bg-muted/45 px-4 py-4 text-sm shadow-none'
                    />
                  </div>

                  <div className='drawing-field-block'>
                    <div className='drawing-field-head'>
                      <div className='text-sm font-semibold text-foreground'>
                        {t('Reference Images (Optional, 1-3)')}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        {supportsReferenceImages(currentRequestMode)
                          ? t(
                              'The current model will generate together with the reference images.'
                            )
                          : t('The current model does not use reference images.')}
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/png,image/jpeg,image/webp'
                      multiple
                      className='hidden'
                      onChange={(event) => {
                        void handleReferenceInput(event)
                      }}
                    />

                    <div
                      className={cn(
                        'drawing-upload-panel cursor-pointer',
                        !supportsReferenceImages(currentRequestMode) && 'is-muted'
                      )}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={(event) => {
                        void handleReferenceDrop(event)
                      }}
                      onDragOver={(event) => event.preventDefault()}
                    >
                      {referenceImages.length === 0 ? (
                        <div className='drawing-upload-placeholder'>
                          <div className='drawing-upload-icon'>
                            <Upload size={18} />
                          </div>
                          <div className='text-sm font-semibold text-foreground'>
                            {t('Click or drag images here')}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {t(
                              'Supports JPEG, PNG, and WebP. Maximum 5MB per image.'
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className='drawing-reference-grid'>
                          {referenceImages.map((item) => (
                            <div key={item.id} className='drawing-reference-item'>
                              <img
                                src={item.previewUrl}
                                alt={item.name}
                                className='drawing-reference-image'
                              />
                              <button
                                type='button'
                                className='drawing-reference-remove'
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setReferenceImages((prev) =>
                                    prev.filter((image) => image.id !== item.id)
                                  )
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                              <div className='drawing-reference-meta'>
                                <span>{item.name}</span>
                                <span>{formatBytes(item.size)}</span>
                              </div>
                            </div>
                          ))}
                          {referenceImages.length < MAX_REFERENCE_IMAGES ? (
                            <button
                              type='button'
                              className='drawing-reference-add'
                              onClick={(event) => {
                                event.stopPropagation()
                                fileInputRef.current?.click()
                              }}
                            >
                              <Upload size={18} />
                              <span>{t('Add More')}</span>
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='drawing-setup-shell'>
                    <div className='drawing-token-panel'>
                      <div className='drawing-panel-kicker'>{t('Dedicated Token')}</div>
                      <div className='drawing-token-title'>{t('Token')}</div>
                      <div className='drawing-token-note'>
                        {t(
                          'The system automatically binds a dedicated drawing token for the current user. You do not need to create or switch it manually.'
                        )}
                      </div>
                      <div className='mt-3 rounded-2xl border border-border/80 bg-background/70 px-4 py-3 text-sm font-medium text-foreground'>
                        {tokenValue}
                      </div>
                    </div>

                    <div className='drawing-inline-grid'>
                      <div className='drawing-control-card'>
                        <div className='drawing-panel-kicker'>{t('Model')}</div>
                        <div className='drawing-control-title'>{t('Model')}</div>
                        <div className='drawing-control-note'>
                          {t(
                            'Different models automatically switch to their matching request endpoints.'
                          )}
                        </div>
                        <Select
                          value={form.model}
                          onValueChange={(value) => handleFormChange('model', value)}
                        >
                          <SelectTrigger className='drawing-select-trigger'>
                            <SelectValue placeholder={t('Please select a model')} />
                          </SelectTrigger>
                          <SelectContent>
                            {config.models.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='drawing-control-card'>
                        <div className='drawing-panel-kicker'>
                          {t('Aspect Ratio')}
                        </div>
                        <div className='drawing-control-title'>
                          {t('Aspect Ratio')}
                        </div>
                        <div className='drawing-control-note'>
                          {t(
                            'Controls the orientation and composition space of the image.'
                          )}
                        </div>
                        <Select
                          value={form.aspectRatio}
                          onValueChange={(value) =>
                            handleFormChange('aspectRatio', value)
                          }
                        >
                          <SelectTrigger className='drawing-select-trigger'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DRAWING_ASPECT_RATIO_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {t(option.labelKey)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='drawing-control-card'>
                        <div className='drawing-panel-kicker'>{t('Image Size')}</div>
                        <div className='drawing-control-title'>{t('Image Size')}</div>
                        <div className='drawing-control-note'>
                          {t(
                            'Higher sizes usually produce better quality but may take longer.'
                          )}
                        </div>
                        <Select
                          value={form.imageSize}
                          onValueChange={(value) =>
                            handleFormChange('imageSize', value)
                          }
                        >
                          <SelectTrigger className='drawing-select-trigger'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DRAWING_IMAGE_SIZE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className='drawing-action-bar drawing-action-bar--full'>
                    <Button
                      className='drawing-generate-button'
                      onClick={() => void handleGenerate()}
                      disabled={submitting || booting}
                    >
                      {submitting ? (
                        <LoaderCircle className='size-4 animate-spin' />
                      ) : (
                        <Sparkles className='size-4' />
                      )}
                      {t('Generate Image')}
                    </Button>
                  </div>

                  {latestError ? <div className='drawing-error-box'>{latestError}</div> : null}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='drawing-panel-card gap-0 py-0'>
          <CardContent className='drawing-panel-body'>
            <div className='drawing-preview-head'>
              <div>
                <div className='text-sm font-semibold text-foreground'>
                  {t('Latest Result')}
                </div>
                <div className='drawing-preview-subtitle'>
                  {t(
                    'Recently generated images keep their CDN URLs. Use the history button in the lower-right corner to browse them.'
                  )}
                </div>
              </div>
              {resultHistory.length > 0 ? (
                <Badge
                  variant='outline'
                  className='bg-sky-500/10 text-sky-600 dark:text-sky-400'
                >
                  {`${resultHistory.length} ${t('Records')}`}
                </Badge>
              ) : null}
            </div>

            <div className='drawing-preview-stage'>
              <div className='drawing-preview-glow' />

              {submitting ? (
                <div className='drawing-preview-empty'>
                  <LoaderCircle className='size-8 animate-spin text-amber-500' />
                  <div className='text-sm font-semibold text-foreground'>
                    {t('Generating image, please wait')}
                  </div>
                  <div className='drawing-preview-timer'>
                    <span>{t('Elapsed')}</span>
                    <strong>{formatElapsedTime(generationElapsedSeconds)}</strong>
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {t('The generated result will appear here automatically.')}
                  </div>
                </div>
              ) : activeRecord ? (
                activeRecord.images.length === 1 ? (
                  <div className='drawing-single-preview'>
                    <img
                      src={activeRecord.images[0].src}
                      alt='drawing-preview'
                      className='drawing-single-preview-image'
                    />
                    <div className='drawing-single-preview-actions'>
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() =>
                          downloadImage(
                            activeRecord.images[0].src,
                            `drawing-${activeRecord.id}.png`
                          )
                        }
                      >
                        <Download className='size-3.5' />
                        {t('Download')}
                      </Button>
                      {activeRecord.images[0].src ? (
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() =>
                            openLargePreview(
                              activeRecord.images[0],
                              `drawing-${activeRecord.id}.png`
                            )
                          }
                        >
                          <ZoomIn className='size-3.5' />
                          {viewLargeLabel}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className='drawing-preview-grid'>
                    {activeRecord.images.map((image, index) => (
                      <div key={image.id} className='drawing-preview-grid-item'>
                        <img src={image.src} alt={`drawing-${index + 1}`} />
                        <div className='drawing-preview-grid-actions'>
                          <Button
                            size='icon-sm'
                            variant='secondary'
                            onClick={() =>
                              downloadImage(
                                image.src,
                                `drawing-${activeRecord.id}-${index + 1}.png`
                              )
                            }
                          >
                            <Download className='size-3.5' />
                          </Button>
                          {image.src ? (
                            <Button
                              size='icon-sm'
                              variant='secondary'
                              onClick={() =>
                                openLargePreview(
                                  image,
                                  `drawing-${activeRecord.id}-${index + 1}.png`
                                )
                              }
                            >
                              <ZoomIn className='size-3.5' />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className='drawing-preview-empty'>
                  <div className='drawing-preview-orb' />
                  <ImageIcon className='size-8' />
                  <div className='text-sm font-semibold text-foreground'>
                    {t('Your generated images will appear here')}
                  </div>
                </div>
              )}
            </div>

            {!submitting && activeRecord ? (
              <div className='drawing-result-details'>
                <div className='drawing-preview-stat-row'>
                  <div className='drawing-preview-stat'>
                    <span>{t('Model')}</span>
                    <strong>{activeRecord.model}</strong>
                  </div>
                  <div className='drawing-preview-stat'>
                    <span>{t('Specification')}</span>
                    <strong>{activeRecord.sizeLabel}</strong>
                  </div>
                  <div className='drawing-preview-stat'>
                    <span>{t('Quantity')}</span>
                    <strong>{`${activeRecord.count} ${t('Images')}`}</strong>
                  </div>
                  <div className='drawing-preview-stat'>
                    <span>{t('Time')}</span>
                    <strong>{formatTime(activeRecord.createdAt)}</strong>
                  </div>
                </div>

                <div className='drawing-detail-card'>
                  <div className='drawing-detail-title'>{t('Prompt Used')}</div>
                  <div className='text-sm leading-7 whitespace-pre-wrap text-foreground/90'>
                    {activeRecord.prompt}
                  </div>

                  {activeRecord.responseText ? (
                    <>
                      <div className='drawing-detail-title mt-4'>
                        {t('Model Notes')}
                      </div>
                      <div className='drawing-response-text'>
                        {activeRecord.responseText}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <button
        type='button'
        className='drawing-history-fab'
        onClick={() => setHistoryDrawerOpen(true)}
      >
        <History size={18} />
        <span>{historyLabel}</span>
        <em>{historyImageEntries.length}</em>
      </button>

      <Sheet open={historyDrawerOpen} onOpenChange={setHistoryDrawerOpen}>
        <SheetContent side='right' className='drawing-history-sheet'>
          <SheetHeader className='border-b border-border/90 pe-14'>
            <SheetTitle>{historyLabel}</SheetTitle>
            <SheetDescription>
              {t(
                'Click an image to switch the preview. Use the pencil button to add it as a reference image.'
              )}
            </SheetDescription>
          </SheetHeader>
          <div className='drawing-history-sheet-body'>
            {historyImageEntries.length === 0 ? (
              <Empty className='mt-8 border-0'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <ImageIcon />
                  </EmptyMedia>
                  <EmptyTitle>{t('No history images yet')}</EmptyTitle>
                  <EmptyDescription>
                    {t('Generated images with uploaded CDN URLs will be stored here.')}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <div className='drawing-history-drawer-grid'>
                  {pagedHistoryImages.map(({ record, image, index, key }) => (
                    <div
                      key={key}
                      role='button'
                      tabIndex={0}
                      className={cn(
                        'drawing-history-drawer-card',
                        record.id === activeRecord?.id && 'is-active'
                      )}
                      onClick={() => setActiveRecordId(record.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setActiveRecordId(record.id)
                        }
                      }}
                    >
                      <button
                        type='button'
                        className='drawing-history-edit-tip'
                        aria-label={t('Reference')}
                        title={t('Reference')}
                        onClick={(event) => {
                          event.stopPropagation()
                          void addHistoryImageAsReference(record, image, index)
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <div className='drawing-history-media'>
                        <img
                          src={image.src}
                          alt={`history-${index + 1}`}
                          className='drawing-history-drawer-image'
                        />
                        <div className='drawing-history-card-overlay'>
                          <button
                            type='button'
                            onClick={(event) => {
                              event.stopPropagation()
                              openLargePreview(
                                image,
                                `drawing-${record.id}-${index + 1}.png`
                              )
                            }}
                          >
                            <ZoomIn size={13} />
                            {viewLargeLabel}
                          </button>
                          <button
                            type='button'
                            onClick={(event) => {
                              event.stopPropagation()
                              downloadImage(
                                image.src,
                                `drawing-${record.id}-${index + 1}.png`
                              )
                            }}
                          >
                            <Download size={13} />
                            {t('Download')}
                          </button>
                        </div>
                      </div>
                      <div className='drawing-history-card-info'>
                        <span>{record.model}</span>
                        <small>{`${formatTime(record.createdAt)} · ${record.sizeLabel}`}</small>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='drawing-history-pagination'>
                  <button
                    type='button'
                    disabled={safeHistoryPage <= 1}
                    onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type='button'
                        className={page === safeHistoryPage ? 'is-active' : ''}
                        onClick={() => setHistoryPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    type='button'
                    disabled={safeHistoryPage >= historyTotalPages}
                    onClick={() =>
                      setHistoryPage((page) => Math.min(historyTotalPages, page + 1))
                    }
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewImage(null)
          }
        }}
      >
        <DialogContent className='drawing-preview-dialog' showCloseButton>
          <div className='drawing-preview-dialog-toolbar'>
            <DialogTitle className='drawing-preview-dialog-title'>
              {viewLargeLabel}
            </DialogTitle>
            {previewImage ? (
              <Button
                size='sm'
                variant='secondary'
                onClick={() =>
                  downloadImage(previewImage.downloadSrc, previewImage.filename)
                }
              >
                <Download className='size-3.5' />
                {t('Download')}
              </Button>
            ) : null}
          </div>
          {previewImage ? (
            <div className='drawing-preview-dialog-stage'>
              <img
                src={previewImage.src}
                alt={previewImage.filename}
                className='drawing-preview-dialog-image'
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <style>{drawingPageStyles}</style>
    </div>
  )
}



