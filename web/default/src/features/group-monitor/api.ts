import { api } from '@/lib/api'

export interface GroupMonitorBucket {
  index: number
  success_count: number
  error_count: number
  total_count: number
  success_rate: number
  status: 'green' | 'orange' | 'red'
}

export interface GroupMonitorStat {
  group: string
  success_count: number
  error_count: number
  total_count: number
  success_rate: number
  status: 'green' | 'orange' | 'red'
  buckets: GroupMonitorBucket[]
  updated_at: number
}

export interface GroupMonitorModelStat {
  model_name: string
  success_count: number
  error_count: number
  total_count: number
  success_rate: number
  status: 'green' | 'orange' | 'red'
  buckets: GroupMonitorBucket[]
}

export interface GroupMonitorConfig {
  enabled_groups: string[]
  refresh_interval: number
  public_visible: boolean
  model_detail_visible: boolean
  default_window: GroupMonitorWindow
}

export type GroupMonitorWindow = '1h' | '6h' | '12h' | '24h'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export interface GroupMonitorStatusResponse {
  success: boolean
  message: string
  data: GroupMonitorStat[]
  model_detail?: Record<string, GroupMonitorModelStat[]>
  model_detail_visible: boolean
  default_window: GroupMonitorWindow
  refresh_interval?: number
}

export async function getGroupMonitorStatus(
  window: GroupMonitorWindow,
  modelDetail = true
) {
  const res = await api.get<GroupMonitorStatusResponse>(
    '/api/group_monitor/status',
    {
      params: {
        window,
        model_detail: modelDetail,
      },
    }
  )
  return res.data
}

export async function getGroupMonitorConfig() {
  const res = await api.get<ApiEnvelope<GroupMonitorConfig>>(
    '/api/group_monitor/admin/config'
  )
  return res.data
}

export async function updateGroupMonitorConfig(config: GroupMonitorConfig) {
  const res = await api.put<ApiEnvelope<unknown>>(
    '/api/group_monitor/admin/config',
    config
  )
  return res.data
}

export async function getAdminGroups() {
  const res = await api.get<ApiEnvelope<string[]>>('/api/group/')
  return res.data
}
