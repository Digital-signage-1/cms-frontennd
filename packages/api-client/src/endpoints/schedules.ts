import type { ApiClient } from '../client'
import type { Schedule, ScheduleOverride, ScheduleCreateRequest, ScheduleUpdateRequest } from '@signage/types'

export function createSchedulesEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: string) =>
      client.get<Schedule[]>(`/api/v1/workspaces/${workspaceId}/schedules`),
    
    get: (workspaceId: string, scheduleId: string) =>
      client.get<Schedule>(`/api/v1/workspaces/${workspaceId}/schedules/${scheduleId}`),
    
    create: (workspaceId: string, data: ScheduleCreateRequest) =>
      client.post<Schedule>(`/api/v1/workspaces/${workspaceId}/schedules`, data),

    update: (workspaceId: string, scheduleId: string, data: ScheduleUpdateRequest) =>
      client.patch<Schedule>(`/api/v1/workspaces/${workspaceId}/schedules/${scheduleId}`, data),
    
    delete: (workspaceId: string, scheduleId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/schedules/${scheduleId}`),
    
    listOverrides: (workspaceId: string) =>
      client.get<ScheduleOverride[]>(`/api/v1/workspaces/${workspaceId}/schedule-overrides`),
    
    createOverride: (workspaceId: string, data: Partial<ScheduleOverride>) =>
      client.post<ScheduleOverride>(`/api/v1/workspaces/${workspaceId}/schedule-overrides`, data),
    
    deleteOverride: (workspaceId: string, overrideId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/schedule-overrides/${overrideId}`),
    
    getActiveChannel: (workspaceId: string, playerId: string) =>
      client.get<{ channel_id: string | null }>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/active-channel`),
  }
}
