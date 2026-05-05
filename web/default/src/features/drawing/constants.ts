import type { ReferenceImage } from './types'

export const MAX_REFERENCE_IMAGES = 3
export const MAX_REFERENCE_IMAGE_BYTES = 5 * 1024 * 1024
export const DRAWING_HISTORY_LIMIT = 12
export const DRAWING_HISTORY_PAGE_SIZE = 8
export const SYSTEM_DRAWING_TOKEN_NAME = '系统：生图专用'
export const LEGACY_SYSTEM_DRAWING_TOKEN_NAME = 'system-drawing-token'

export const DRAWING_REQUEST_MODE_IMAGE_GENERATION = 'image_generation'
export const DRAWING_REQUEST_MODE_GEMINI_NATIVE = 'gemini_generate_content'
export const DRAWING_REQUEST_MODE_RESPONSES_IMAGE_GENERATION =
  'responses_image_generation'
export const DRAWING_REQUEST_MODE_OPENAI_IMAGE_EDIT = 'openai_image_edit'

export const DEFAULT_FORM = {
  prompt: '',
  model: '',
  aspectRatio: '1:1',
  imageSize: '1K',
}

export const INITIAL_CONFIG = {
  enabled: false,
  group: '',
  models: [],
  default_model: '',
  default_request_mode: '',
  model_request_modes: {},
  token_name: '',
  authorization: '',
  endpoint: '/v1/images/generations',
  responses_endpoint: '/v1/responses',
  edit_endpoint: '/v1/images/edits',
}

export const DRAWING_ASPECT_RATIO_OPTIONS = [
  { labelKey: '1:1 · Square', value: '1:1' },
  { labelKey: '16:9 · Wide', value: '16:9' },
  { labelKey: '9:16 · Poster', value: '9:16' },
  { labelKey: '4:3 · Standard', value: '4:3' },
  { labelKey: '3:4 · Portrait', value: '3:4' },
] as const

export const DRAWING_IMAGE_SIZE_OPTIONS = [
  { label: '1K', value: '1K' },
  { label: '2K', value: '2K' },
  { label: '4K', value: '4K' },
] as const

export function getDrawingTokenName(tokenName?: string) {
  return tokenName?.trim() || SYSTEM_DRAWING_TOKEN_NAME
}

export function getDrawingHistoryKey(tokenName?: string) {
  return `drawing-history:${getDrawingTokenName(tokenName)}`
}

export function isInlineDrawingImage(src: string) {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(src.trim())
}

export function isFreeCdnDrawingImage(src: string) {
  return /^https?:\/\/(?:files\.catbox\.moe|litterbox\.catbox\.moe|skyimg\.net|img\.scdn\.io|(?:cloudflarecnimg|edgeoneimg|anycastimg)\.(?:scdn\.io|cdn\.sn)|tuchuang\.xqd\.cn|wzapi\.com)\//i.test(
    src.trim()
  )
}

export function normalizeDrawingUploadSource(src: string) {
  const value = src.trim()
  if (!value) return ''
  if (/^(?:data:image\/|https?:\/\/)/i.test(value)) return value
  try {
    return new URL(value, window.location.origin).href
  } catch {
    return value
  }
}

export function getImageSourceDedupKey(src: string) {
  return src
    .trim()
    .replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/i, '')
    .replace(/\s+/g, '')
}

export function sanitizeDrawingHistoryRecords<T extends { images: { src: string }[] }>(
  records: T[]
) {
  return (Array.isArray(records) ? records : [])
    .map((record) => ({
      ...record,
      images: (Array.isArray(record.images) ? record.images : []).filter(
        (image) => image?.src && !isInlineDrawingImage(image.src)
      ),
    }))
    .filter((record) => record.images.length > 0)
    .slice(0, DRAWING_HISTORY_LIMIT)
}

export function readDrawingHistory<T extends { images: { src: string }[] }>(
  tokenName?: string
) {
  if (typeof window === 'undefined') return [] as T[]
  try {
    const raw = window.localStorage.getItem(getDrawingHistoryKey(tokenName))
    if (!raw) return []
    const parsed = JSON.parse(raw) as T[]
    return sanitizeDrawingHistoryRecords(parsed)
  } catch {
    return []
  }
}

export function writeDrawingHistory<T extends { images: { src: string }[] }>(
  tokenName: string | undefined,
  records: T[]
) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      getDrawingHistoryKey(tokenName),
      JSON.stringify(sanitizeDrawingHistoryRecords(records))
    )
  } catch {
    /* empty */
  }
}

export function readDrawingHistoryWithFallback<
  T extends { images: { src: string }[] },
>(tokenName?: string) {
  const primary = readDrawingHistory<T>(tokenName)
  if (
    primary.length > 0 ||
    getDrawingTokenName(tokenName) !== SYSTEM_DRAWING_TOKEN_NAME
  ) {
    return primary
  }
  const legacy = readDrawingHistory<T>(LEGACY_SYSTEM_DRAWING_TOKEN_NAME)
  if (legacy.length > 0) {
    writeDrawingHistory(tokenName, legacy)
  }
  return legacy
}

export function buildDrawingPrompt(input: {
  prompt: string
  aspectRatio: string
  imageSize: string
  referenceImages: ReferenceImage[]
}) {
  const lines = [input.prompt.trim()]
  lines.push('')
  lines.push(
    `生成参数: 宽高比=${input.aspectRatio || '1:1'}, 尺寸=${input.imageSize || '1K'}`
  )
  if (input.referenceImages.length > 0) {
    lines.push(
      `参考图: 已附带 ${input.referenceImages.length} 张参考图，请结合参考图中的主体、构图、风格和色彩进行生成。`
    )
  }
  return lines.filter(Boolean).join('\n')
}
