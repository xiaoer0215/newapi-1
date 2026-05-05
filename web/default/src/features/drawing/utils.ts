import type {
  DrawingImage,
  DrawingRecord,
  ReferenceImage,
} from './types'
import {
  DRAWING_HISTORY_LIMIT,
  DRAWING_REQUEST_MODE_GEMINI_NATIVE,
  DRAWING_REQUEST_MODE_OPENAI_IMAGE_EDIT,
  DRAWING_REQUEST_MODE_RESPONSES_IMAGE_GENERATION,
  getImageSourceDedupKey,
  isFreeCdnDrawingImage,
  normalizeDrawingUploadSource,
} from './constants'

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function deepMerge<T>(baseValue: T, overrideValue: unknown): T {
  if (!isPlainObject(baseValue) || !isPlainObject(overrideValue)) {
    return overrideValue as T
  }

  const merged: Record<string, unknown> = { ...baseValue }
  Object.keys(overrideValue).forEach((key) => {
    const nextValue = overrideValue[key]
    if (isPlainObject(nextValue) && isPlainObject(merged[key])) {
      merged[key] = deepMerge(merged[key], nextValue)
      return
    }
    merged[key] = nextValue
  })
  return merged as T
}

export function isResponsesImageGenerationModel(model: string) {
  const name = model.trim().toLowerCase()
  if (!name) return false
  return ['gpt-4o', 'chatgpt-4o', 'gpt-4.1', 'gpt-4.5', 'gpt-5'].some(
    (prefix) => name.startsWith(prefix)
  )
}

export function isOpenAIImageEditModel(model: string) {
  const name = model.trim().toLowerCase()
  return name.startsWith('gpt-image-') || name === 'chatgpt-image-latest'
}

export function isDalle2Model(model: string) {
  const name = model.trim().toLowerCase()
  return name === 'dall-e' || name === 'dall-e-2'
}

export function isDalle3Model(model: string) {
  return model.trim().toLowerCase() === 'dall-e-3'
}

export function isGPTImageApiSizeModel(model: string) {
  const name = model.trim().toLowerCase()
  return name.startsWith('gpt-image-') || name === 'chatgpt-image-latest'
}

export function supportsReferenceImages(requestMode: string) {
  return (
    requestMode === DRAWING_REQUEST_MODE_GEMINI_NATIVE ||
    requestMode === DRAWING_REQUEST_MODE_RESPONSES_IMAGE_GENERATION ||
    requestMode === DRAWING_REQUEST_MODE_OPENAI_IMAGE_EDIT
  )
}

export function resolveApiUrl(endpoint: string) {
  if (!endpoint) {
    return `${window.location.origin}/v1/images/generations`
  }
  if (/^https?:\/\//i.test(endpoint)) return endpoint
  return new URL(endpoint, window.location.origin).toString()
}

export function resolveGeminiGenerateContentUrl(model: string) {
  return resolveApiUrl(`/v1beta/models/${encodeURIComponent(model)}:generateContent`)
}

export function resolveDrawingRequestMode(
  requestModes: Record<string, string>,
  defaultRequestMode: string,
  model: string
) {
  if (requestModes[model]) return requestModes[model]
  if (!model && defaultRequestMode) return defaultRequestMode
  if (model.startsWith('gemini-')) return DRAWING_REQUEST_MODE_GEMINI_NATIVE
  if (isOpenAIImageEditModel(model)) return DRAWING_REQUEST_MODE_OPENAI_IMAGE_EDIT
  if (isResponsesImageGenerationModel(model)) {
    return DRAWING_REQUEST_MODE_RESPONSES_IMAGE_GENERATION
  }
  return 'image_generation'
}

export function isPortraitAspectRatio(aspectRatio: string) {
  return ['2:3', '3:4', '9:16'].includes(aspectRatio.trim())
}

export function isLandscapeAspectRatio(aspectRatio: string) {
  return ['3:2', '4:3', '16:9'].includes(aspectRatio.trim())
}

export function aspectRatioToImageGenerationSize(
  aspectRatio: string,
  model: string,
  options?: { forceGPTImageSize?: boolean }
) {
  const ratio = aspectRatio.trim() || '1:1'
  const forceGPTImageSize = Boolean(options?.forceGPTImageSize)

  if (isDalle2Model(model)) return '1024x1024'

  if (forceGPTImageSize || isGPTImageApiSizeModel(model)) {
    if (isPortraitAspectRatio(ratio)) return '1024x1536'
    if (isLandscapeAspectRatio(ratio)) return '1536x1024'
    return '1024x1024'
  }

  if (isDalle3Model(model)) {
    if (isPortraitAspectRatio(ratio)) return '1024x1792'
    if (isLandscapeAspectRatio(ratio)) return '1792x1024'
    return '1024x1024'
  }

  switch (ratio) {
    case '3:2':
      return '1536x1024'
    case '2:3':
      return '1024x1536'
    case '4:3':
      return '1536x1152'
    case '3:4':
      return '1152x1536'
    case '16:9':
      return '1792x1024'
    case '9:16':
      return '1024x1792'
    default:
      return '1024x1024'
  }
}

export function imageSizeToGenerationQuality(
  imageSize: string,
  model: string,
  options?: { forceGPTImageQuality?: boolean; requestMode?: string }
) {
  const size = imageSize.trim().toUpperCase() || '1K'
  if (size === '1K') return ''

  if (isDalle3Model(model)) return 'hd'

  if (
    options?.forceGPTImageQuality ||
    isGPTImageApiSizeModel(model) ||
    options?.requestMode === DRAWING_REQUEST_MODE_RESPONSES_IMAGE_GENERATION ||
    options?.requestMode === DRAWING_REQUEST_MODE_OPENAI_IMAGE_EDIT
  ) {
    return size === '4K' ? 'high' : 'medium'
  }

  return size === '4K' ? '4k' : 'high'
}

export function formatDrawingSizeLabel(input: {
  aspectRatio: string
  imageSize: string
  actualSize?: string
}) {
  return [input.aspectRatio || '1:1', input.imageSize || '1K', input.actualSize]
    .filter(Boolean)
    .join(' · ')
}

export function buildGeminiGenerateContentPayload(input: {
  prompt: string
  aspectRatio: string
  imageSize: string
  referenceImages: ReferenceImage[]
}) {
  const parts: Array<Record<string, unknown>> = input.referenceImages.map((item) => ({
    inlineData: {
      mimeType: item.mimeType,
      data: item.base64,
    },
  }))
  parts.push({ text: input.prompt })

  return {
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      candidateCount: 1,
      aspectRatio: input.aspectRatio || '1:1',
      imageSize: input.imageSize || '1K',
      outputMimeType: 'image/jpeg',
      imageConfig: {
        aspectRatio: input.aspectRatio || '1:1',
        imageSize: input.imageSize || '1K',
      },
    },
  }
}

export function buildResponsesImageGenerationPayload(input: {
  model: string
  prompt: string
  aspectRatio: string
  imageSize: string
  referenceImages: ReferenceImage[]
}) {
  const imageTool: Record<string, unknown> = {
    type: 'image_generation',
    size: aspectRatioToImageGenerationSize(input.aspectRatio, input.model, {
      forceGPTImageSize: true,
    }),
  }

  const quality = imageSizeToGenerationQuality(input.imageSize, input.model, {
    forceGPTImageQuality: true,
    requestMode: DRAWING_REQUEST_MODE_RESPONSES_IMAGE_GENERATION,
  })
  if (quality) imageTool.quality = quality
  if (input.referenceImages.length > 0) imageTool.action = 'edit'

  const content: Array<Record<string, unknown>> = [
    {
      type: 'input_text',
      text: input.prompt,
    },
  ]

  input.referenceImages.forEach((item) => {
    const dataUrl = item.previewUrl || `data:${item.mimeType};base64,${item.base64}`
    content.push({
      type: 'input_image',
      image_url: dataUrl,
      detail: 'high',
    })
  })

  return {
    model: input.model,
    input: [
      {
        role: 'user',
        content,
      },
    ],
    tools: [imageTool],
    tool_choice: {
      type: 'image_generation',
    },
  }
}

export function dataUrlToFile(dataUrl: string, filename: string, mimeType?: string) {
  const [header, base64] = dataUrl.split(',')
  if (!header || !base64) {
    throw new Error('Reference image data is invalid')
  }

  const detectedMimeType =
    mimeType || header.match(/^data:([^;]+);base64$/i)?.[1] || 'image/png'
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new File([bytes], filename, { type: detectedMimeType })
}

export function appendFormDataValue(
  formData: FormData,
  key: string,
  value: unknown
) {
  if (value === undefined || value === null || value === '') return

  if (Array.isArray(value)) {
    value.forEach((item) => appendFormDataValue(formData, `${key}[]`, item))
    return
  }

  if (isPlainObject(value)) {
    formData.append(key, JSON.stringify(value))
    return
  }

  formData.append(key, String(value))
}

export function buildOpenAIImageEditFormData(input: {
  model: string
  prompt: string
  aspectRatio: string
  imageSize: string
  referenceImages: ReferenceImage[]
}) {
  const size = aspectRatioToImageGenerationSize(input.aspectRatio, input.model, {
    forceGPTImageSize: true,
  })
  const fields: Record<string, unknown> = {
    model: input.model,
    prompt: input.prompt,
    n: 1,
    size,
  }

  const quality = imageSizeToGenerationQuality(input.imageSize, input.model, {
    forceGPTImageQuality: true,
    requestMode: DRAWING_REQUEST_MODE_OPENAI_IMAGE_EDIT,
  })
  if (quality && fields.quality === undefined) fields.quality = quality

  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) =>
    appendFormDataValue(formData, key, value)
  )

  input.referenceImages.forEach((item, index) => {
    const dataUrl = item.previewUrl || `data:${item.mimeType};base64,${item.base64}`
    const file = dataUrlToFile(
      dataUrl,
      item.name || `reference-${index + 1}.png`,
      item.mimeType
    )
    formData.append(
      input.referenceImages.length > 1 ? 'image[]' : 'image',
      file,
      file.name
    )
  })

  return { formData, sizeLabel: size }
}

export function extractImageSourcesFromText(text: string, prefix: string) {
  const rawText = text.trim()
  if (!rawText) {
    return { images: [] as DrawingImage[], text: '' }
  }

  const images: DrawingImage[] = []
  const markdownImagePattern =
    /!\[[^\]]*]\((data:image\/[a-zA-Z0-9.+-]+;base64,[^)]+|https?:\/\/[^)\s]+)\)/g

  let cleanedText = rawText.replace(markdownImagePattern, (_matched, src: string) => {
    images.push({
      id: `text-image-${prefix}-${images.length}`,
      src,
      link: src.startsWith('http') ? src : '',
      revisedPrompt: '',
    })
    return ''
  })

  const trimmedText = cleanedText.trim()
  if (images.length === 0 && /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(trimmedText)) {
    images.push({
      id: `text-image-${prefix}-0`,
      src: trimmedText,
      link: '',
      revisedPrompt: '',
    })
    cleanedText = ''
  }

  return {
    images,
    text: cleanedText.trim(),
  }
}

export function normalizeGeminiImageItem(
  part: Record<string, unknown>,
  index: string
) {
  const inlineData =
    (part.inlineData as Record<string, unknown> | undefined) ??
    (part.inline_data as Record<string, unknown> | undefined)
  const data = String(inlineData?.data ?? '').trim()
  const mimeType = String(
    inlineData?.mimeType ?? inlineData?.mime_type ?? 'image/png'
  ).trim()
  if (!data || !mimeType.startsWith('image/')) return null
  return {
    id: `gemini-${index}`,
    src: `data:${mimeType};base64,${data}`,
    link: '',
    revisedPrompt: '',
  } satisfies DrawingImage
}

export function normalizeGeminiGenerateContentResponse(body: Record<string, unknown>) {
  const images: DrawingImage[] = []
  const textParts: string[] = []
  const candidates = Array.isArray(body.candidates) ? body.candidates : []

  candidates.forEach((candidate, candidateIndex) => {
    const content = isPlainObject(candidate)
      ? (candidate.content as Record<string, unknown> | undefined)
      : undefined
    const parts = Array.isArray(content?.parts) ? content.parts : []

    parts.forEach((part, partIndex) => {
      if (!isPlainObject(part)) return
      const image = normalizeGeminiImageItem(part, `${candidateIndex}-${partIndex}`)
      if (image) {
        images.push(image)
        return
      }
      const text = String(part.text ?? '').trim()
      if (text) {
        const extracted = extractImageSourcesFromText(
          text,
          `${candidateIndex}-${partIndex}`
        )
        if (extracted.images.length > 0) images.push(...extracted.images)
        if (extracted.text) textParts.push(extracted.text)
      }
    })
  })

  const promptFeedback = isPlainObject(body.promptFeedback)
    ? body.promptFeedback
    : isPlainObject(body.prompt_feedback)
      ? (body.prompt_feedback as Record<string, unknown>)
      : null

  return {
    images,
    responseText: textParts.join('\n').trim(),
    blockReason: String(promptFeedback?.blockReason ?? '').trim(),
  }
}

export function normalizeResponsesImageSource(
  value: unknown,
  prefix: string,
  revisedPrompt = ''
) {
  const rawValue = String(value ?? '').trim()
  if (!rawValue) return null

  if (/^https?:\/\//i.test(rawValue)) {
    return {
      id: `responses-${prefix}`,
      src: rawValue,
      link: rawValue,
      revisedPrompt,
    } satisfies DrawingImage
  }

  if (/^data:image\//i.test(rawValue)) {
    return {
      id: `responses-${prefix}`,
      src: rawValue,
      link: '',
      revisedPrompt,
    } satisfies DrawingImage
  }

  return {
    id: `responses-${prefix}`,
    src: `data:image/png;base64,${rawValue}`,
    link: '',
    revisedPrompt,
  } satisfies DrawingImage
}

export function getResponsesContentImageSource(content: Record<string, unknown>) {
  if (typeof content.image_url === 'string') return content.image_url
  if (isPlainObject(content.image_url) && typeof content.image_url.url === 'string') {
    return content.image_url.url
  }
  if (typeof content.url === 'string') return content.url
  if (typeof content.result === 'string') return content.result
  if (typeof content.b64_json === 'string') return `data:image/png;base64,${content.b64_json}`
  return ''
}

export function normalizeResponsesImageGenerationResponse(body: Record<string, unknown>) {
  const images: DrawingImage[] = []
  const textParts: string[] = []
  const seenSources = new Set<string>()
  const outputs = Array.isArray(body.output) ? body.output : []

  const appendImage = (image: DrawingImage | null) => {
    if (!image?.src) return
    const sourceKey = getImageSourceDedupKey(image.src)
    if (!sourceKey || seenSources.has(sourceKey)) return
    seenSources.add(sourceKey)
    images.push(image)
  }

  outputs.forEach((output, outputIndex) => {
    if (!isPlainObject(output)) return
    const revisedPrompt = String(output.revised_prompt ?? '').trim()
    const resultItems = Array.isArray(output.result) ? output.result : [output.result]

    resultItems.forEach((item, resultIndex) => {
      appendImage(
        normalizeResponsesImageSource(
          item,
          `${outputIndex}-${resultIndex}`,
          revisedPrompt
        )
      )
    })

    const contentItems = Array.isArray(output.content) ? output.content : []
    contentItems.forEach((content, contentIndex) => {
      if (!isPlainObject(content)) return
      const source = getResponsesContentImageSource(content)
      if (source) {
        appendImage(
          normalizeResponsesImageSource(
            source,
            `${outputIndex}-${contentIndex}`,
            revisedPrompt
          )
        )
      }
      const text = String(content.text ?? '').trim()
      if (text) {
        const extracted = extractImageSourcesFromText(
          text,
          `${outputIndex}-${contentIndex}`
        )
        extracted.images.forEach((image) =>
          appendImage({
            ...image,
            revisedPrompt: image.revisedPrompt || revisedPrompt,
          })
        )
        if (extracted.text) textParts.push(extracted.text)
      }
    })
  })

  return {
    images,
    responseText: textParts.join('\n').trim(),
  }
}

export function normalizeImageItem(item: Record<string, unknown>, index: number) {
  if (typeof item.url === 'string' && item.url) {
    return {
      id: `url-${index}`,
      src: item.url,
      link: item.url,
      revisedPrompt: String(item.revised_prompt ?? '').trim(),
    } satisfies DrawingImage
  }
  if (typeof item.b64_json === 'string' && item.b64_json) {
    return {
      id: `b64-${index}`,
      src: `data:image/png;base64,${item.b64_json}`,
      link: '',
      revisedPrompt: String(item.revised_prompt ?? '').trim(),
    } satisfies DrawingImage
  }
  return null
}

export function normalizeDrawingErrorMessage(
  message: string,
  t: (key: string) => string
) {
  const rawMessage = message.trim()
  if (!rawMessage) return t('Drawing request failed')

  const loweredMessage = rawMessage.toLowerCase()
  if (
    loweredMessage.includes('system disk overloaded') ||
    loweredMessage.includes('disk overloaded')
  ) {
    return t('The drawing service is currently busy. Please try again later.')
  }
  if (
    loweredMessage.includes('system memory overloaded') ||
    loweredMessage.includes('memory overloaded')
  ) {
    return t('The drawing service is currently busy. Please try again later.')
  }
  if (loweredMessage.includes('no space left on device')) {
    return t('The drawing service is out of disk space. Please contact the administrator.')
  }
  if (loweredMessage.includes('status_code=503')) {
    return t('The drawing service is temporarily unavailable. Please try again later.')
  }

  return rawMessage.replace(/^error:\s*/i, '').trim()
}

export function normalizeDrawingImages(images: DrawingImage[], limit = 1) {
  const seenSources = new Set<string>()
  const normalized: DrawingImage[] = []

  images.forEach((image) => {
    const sourceKey = getImageSourceDedupKey(image?.src ?? '')
    if (!image?.src || !sourceKey || seenSources.has(sourceKey)) return
    seenSources.add(sourceKey)
    normalized.push(image)
  })

  return normalized.slice(0, Math.max(1, limit))
}

export async function uploadDrawingImageToFreeCdn(
  image: DrawingImage,
  recordId: string,
  index: number,
  uploadDrawingImage: (request: {
    image: string
    filename: string
  }) => Promise<{
    success: boolean
    message?: string
    data?: { url?: string; provider?: string }
  }>
) {
  if (!image?.src || isFreeCdnDrawingImage(image.src)) {
    return image
  }

  const uploadSource = normalizeDrawingUploadSource(image.src)
  if (!uploadSource) {
    return image
  }

  const res = await uploadDrawingImage({
    image: uploadSource,
    filename: `drawing-${recordId}-${index + 1}.png`,
  })

  if (!res.success || !res.data?.url) {
    throw new Error(res.message || 'upload image to free cdn failed')
  }

  return {
    ...image,
    src: res.data.url,
    link: res.data.url,
    cdnProvider: res.data.provider || image.cdnProvider || 'catbox',
  } satisfies DrawingImage
}
export function formatTime(timestamp: string) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

export function formatElapsedTime(totalSeconds: number) {
  const seconds = Math.max(0, Number(totalSeconds) || 0)
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`
}

export function formatBytes(bytes: number) {
  const value = Number(bytes) || 0
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${value} B`
}

export function downloadImage(src: string, filename: string) {
  if (!src) return
  const link = document.createElement('a')
  link.href = src
  link.target = '_blank'
  link.rel = 'noreferrer'
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })
}

export function makeRecordId() {
  return `${Date.now()}`
}

export function limitHistory(records: DrawingRecord[]) {
  return records.slice(0, DRAWING_HISTORY_LIMIT)
}



