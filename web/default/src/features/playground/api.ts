import { api } from '@/lib/api'
import { API_ENDPOINTS } from './constants'
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ModelOption,
  GroupOption,
} from './types'

/**
 * Send chat completion request (non-streaming)
 */
export async function sendChatCompletion(
  payload: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const res = await api.post(API_ENDPOINTS.CHAT_COMPLETIONS, payload, {
    skipErrorHandler: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Get user available models
 */
export async function getUserModels(): Promise<ModelOption[]> {
  const res = await api.get(API_ENDPOINTS.USER_MODELS)
  const { data } = res

  if (!data.success || !Array.isArray(data.data)) {
    return []
  }

  return data.data.map((model: string) => ({
    label: model,
    value: model,
  }))
}

/**
 * Get user groups
 */
export async function getUserGroups(): Promise<GroupOption[]> {
  const res = await api.get(API_ENDPOINTS.USER_GROUPS)
  const { data } = res

  if (!data.success || !data.data) {
    return []
  }

  const rawGroups = data.data as unknown

  if (Array.isArray(rawGroups)) {
    const normalizedGroups: GroupOption[] = []

    rawGroups.forEach((item) => {
      if (typeof item === 'string') {
        normalizedGroups.push({
          label: item,
          value: item,
          desc: item,
        })
        return
      }

      if (!item || typeof item !== 'object') {
        return
      }

      const group = item as Record<string, unknown>
      const value =
        typeof group.value === 'string'
          ? group.value
          : typeof group.label === 'string'
            ? group.label
            : ''

      if (!value) {
        return
      }

      normalizedGroups.push({
        label:
          typeof group.label === 'string' && group.label.trim()
            ? group.label
            : value,
        value,
        ratio:
          typeof group.ratio === 'number' || typeof group.ratio === 'string'
            ? group.ratio
            : undefined,
        desc:
          typeof group.desc === 'string'
            ? group.desc
            : typeof group.description === 'string'
              ? group.description
              : value,
      })
    })

    return normalizedGroups
  }

  if (typeof rawGroups !== 'object') {
    return []
  }

  const groupData = rawGroups as Record<string, unknown>

  // label is for button display (name only); desc is for dropdown content
  return Object.entries(groupData).map(([group, info]) => {
    const normalizedInfo =
      info && typeof info === 'object'
        ? (info as Record<string, unknown>)
        : ({} as Record<string, unknown>)

    return {
      label: group,
      value: group,
      ratio:
        typeof normalizedInfo.ratio === 'number' ||
        typeof normalizedInfo.ratio === 'string'
          ? normalizedInfo.ratio
          : undefined,
      desc:
        typeof normalizedInfo.desc === 'string'
          ? normalizedInfo.desc
          : typeof normalizedInfo.description === 'string'
            ? normalizedInfo.description
            : group,
    }
  })
}
