export type DrawingConfig = {
  enabled: boolean
  group: string
  models: string[]
  default_model: string
  default_request_mode: string
  model_request_modes: Record<string, string>
  token_name: string
  authorization: string
  endpoint: string
  responses_endpoint: string
  edit_endpoint: string
}

export type DrawingFormState = {
  prompt: string
  model: string
  aspectRatio: string
  imageSize: string
}

export type DrawingImage = {
  id: string
  src: string
  link: string
  revisedPrompt?: string
  cdnProvider?: string
}

export type ReferenceImage = {
  id: string
  name: string
  mimeType: string
  size: number
  base64: string
  previewUrl: string
}

export type DrawingRecord = {
  id: string
  createdAt: string
  prompt: string
  rawPrompt: string
  model: string
  aspectRatio: string
  imageSize: string
  sizeLabel: string
  count: number
  requestMode: string
  responseText: string
  images: DrawingImage[]
}

export type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data?: T
}

export type DrawingResolvePayload = {
  base64: string
  mimeType?: string
  mime_type?: string
  data_url?: string
  size?: number
}

export type DrawingUploadPayload = {
  url: string
  provider?: string
  elapsed_ms?: number
}

export type DrawingRequestMode =
  | 'image_generation'
  | 'gemini_generate_content'
  | 'responses_image_generation'
  | 'openai_image_edit'
