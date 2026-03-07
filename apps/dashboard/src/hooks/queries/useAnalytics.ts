import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

export function useAnalyticsSummary(workspaceId: number | string | undefined) {
  return useQuery({
    queryKey: ['analytics', workspaceId, 'summary'],
    queryFn: () => api.analytics.getSummary(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function usePlaybackLogs(
  workspaceId: number | string | undefined,
  params?: { limit?: number; offset?: number; days?: number }
) {
  return useQuery({
    queryKey: ['analytics', workspaceId, 'playback-logs', params],
    queryFn: () => api.analytics.getPlaybackLogs(workspaceId!, params),
    enabled: !!workspaceId,
  })
}

export function useContentAnalytics(workspaceId: number | string, contentId: number | string) {
  return useQuery({
    queryKey: ['analytics', workspaceId, 'content', contentId],
    queryFn: () => api.analytics.getContentAnalytics(workspaceId, contentId),
    enabled: !!workspaceId && !!contentId,
  })
}

export function useAuditLogs(
  workspaceId: number | string | undefined,
  params?: { limit?: number; offset?: number; action?: string }
) {
  return useQuery({
    queryKey: ['analytics', workspaceId, 'audit-logs', params],
    queryFn: () => api.analytics.getAuditLogs(workspaceId!, params),
    enabled: !!workspaceId,
  })
}
