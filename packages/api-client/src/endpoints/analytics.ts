import type { ApiClient } from '../client'

export interface AnalyticsSummary {
  workspace_id: number | string
  period_days: number
  total_playback_duration_seconds: number
  total_content_views: number
  active_players: number
  total_errors: number
}

export interface AuditLogItem {
  log_id: string
  actor_sub: string
  actor_email?: string
  action: string
  resource_type: string
  resource_id?: string
  resource_name?: string
  ip_address?: string
  timestamp: string
}

export interface PlaybackLog {
  log_id: string
  player_id: number
  channel_id?: number
  zone_id?: number
  app_id?: number
  content_id?: number
  duration_seconds: number
  started_at: string
  ended_at?: string
}

export interface ContentAnalytics {
  content_id: string
  date: string
  view_count: number
  total_duration_seconds: number
  unique_players: number
}

export function createAnalyticsEndpoints(client: ApiClient) {
  return {
    getSummary: (workspaceId: number | string) =>
      client.get<AnalyticsSummary>(`/api/v1/workspaces/${workspaceId}/analytics/summary`),

    getPlaybackLogs: (workspaceId: number | string, params?: { limit?: number; offset?: number; days?: number }) =>
      client.get<PlaybackLog[]>(`/api/v1/workspaces/${workspaceId}/playback-logs`, { params }),

    getContentAnalytics: (workspaceId: number | string, contentId: number | string) =>
      client.get<ContentAnalytics>(`/api/v1/workspaces/${workspaceId}/content/${contentId}/analytics`),

    getAuditLogs: (workspaceId: number | string, params?: { limit?: number; offset?: number; action?: string }) =>
      client.get<AuditLogItem[]>(`/api/v1/workspaces/${workspaceId}/audit-logs`, { params }),
  }
}
