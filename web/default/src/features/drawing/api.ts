import { api } from '@/lib/api'
import type {
  ApiEnvelope,
  DrawingConfig,
  DrawingResolvePayload,
  DrawingUploadPayload,
} from './types'

export async function getDrawingInit() {
  const res = await api.get<ApiEnvelope<Partial<DrawingConfig>>>('/api/user/self/drawing/init')
  return res.data
}

export async function uploadDrawingImage(request: {
  image: string
  filename: string
}) {
  const res = await api.post<ApiEnvelope<DrawingUploadPayload>>(
    '/api/user/self/drawing/upload',
    request
  )
  return res.data
}

export async function resolveDrawingImage(request: {
  image: string
  filename: string
}) {
  const res = await api.post<ApiEnvelope<DrawingResolvePayload>>(
    '/api/user/self/drawing/resolve',
    request
  )
  return res.data
}
