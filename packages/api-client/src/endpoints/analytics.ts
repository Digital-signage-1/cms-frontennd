import type { ApiClient } from '../client'

export interface AnalyticsSummary {
  total_impressions: number
  total_play_time_seconds: number
  active_players: number
  total_content_plays: number
  period_start: string
  period_end: string
}

export interface PlaybackLog {
  log_id: string
  player_id: string
  channel_id?: string
  zone_id?: string
  app_id?: string
  content_id?: string
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
    getSummary: (workspaceId: string) =>
      client.get<AnalyticsSummary>(`/api/v1/workspaces/${workspaceId}/analytics/summary`),
    
    getPlaybackLogs: (workspaceId: string, params?: { limit?: number; offset?: number }) =>
      client.get<{ items: PlaybackLog[]; total: number }>(`/api/v1/workspaces/${workspaceId}/playback-logs`, { params }),
    
    getContentAnalytics: (workspaceId: string, contentId: string) =>
      client.get<ContentAnalytics>(`/api/v1/workspaces/${workspaceId}/content/${contentId}/analytics`),
    
    getAuditLogs: (workspaceId: string, params?: { limit?: number; offset?: number; action?: string }) =>
      client.get<{ items: unknown[]; total: number }>(`/api/v1/workspaces/${workspaceId}/audit-logs`, { params }),
  }
}
