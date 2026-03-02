import type { ApiClient } from '../client'
import type { Schedule, ScheduleOverride, ScheduleCreateRequest, ScheduleUpdateRequest } from '@signage/types'

export function createSchedulesEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: number, activeOnly?: boolean) =>
      client.get<Schedule[]>(`/api/v1/workspaces/${workspaceId}/schedules`, { params: activeOnly ? { active_only: activeOnly } : undefined }),
    
    get: (workspaceId: number, scheduleId: number) =>
      client.get<Schedule>(`/api/v1/workspaces/${workspaceId}/schedules/${scheduleId}`),
    
    create: (workspaceId: number, data: ScheduleCreateRequest) =>
      client.post<Schedule>(`/api/v1/workspaces/${workspaceId}/schedules`, data),

    update: (workspaceId: number, scheduleId: number, data: ScheduleUpdateRequest) =>
      client.patch<Schedule>(`/api/v1/workspaces/${workspaceId}/schedules/${scheduleId}`, data),
    
    delete: (workspaceId: number, scheduleId: number) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/schedules/${scheduleId}`),
    
    getScheduleCalendar: (workspaceId: number, params: { start_date: string; end_date: string; timezone?: string }) =>
      client.get<Record<string, { schedules: unknown[]; overrides: unknown[] }>>(`/api/v1/workspaces/${workspaceId}/schedules/calendar`, { params }),
    
    getActiveChannel: (workspaceId: number, params?: { default_channel_id?: string; timezone?: string }) =>
      client.get<{ channel_id: string | null; timestamp: string; timezone: string }>(`/api/v1/workspaces/${workspaceId}/schedules/active`, { params }),
    
    listOverrides: (workspaceId: number, activeOnly?: boolean) =>
      client.get<ScheduleOverride[]>(`/api/v1/workspaces/${workspaceId}/overrides`, { params: activeOnly ? { active_only: activeOnly } : undefined }),
    
    listUpcomingOverrides: (workspaceId: number, daysAhead?: number) =>
      client.get<ScheduleOverride[]>(`/api/v1/workspaces/${workspaceId}/overrides/upcoming`, { params: daysAhead ? { days_ahead: daysAhead } : undefined }),
    
    createOverride: (workspaceId: number, data: Partial<ScheduleOverride> & { channel_id: string; name: string; type: string; start_datetime: string; end_datetime: string }) =>
      client.post<ScheduleOverride>(`/api/v1/workspaces/${workspaceId}/overrides`, data),
    
    deleteOverride: (workspaceId: number, overrideId: number) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/overrides/${overrideId}`),
  }
}
