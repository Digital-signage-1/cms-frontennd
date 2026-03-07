import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { Schedule, ScheduleOverride, ScheduleCreateRequest } from '@signage/types'

export type { Schedule, ScheduleOverride }

export function useSchedules(workspaceId: number | string | undefined) {
  return useQuery({
    queryKey: ['schedules', workspaceId],
    queryFn: () => api.schedules.list(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useSchedule(workspaceId: number | string, scheduleId: string) {
  return useQuery({
    queryKey: ['schedules', workspaceId, scheduleId],
    queryFn: () => api.schedules.get(workspaceId, scheduleId),
    enabled: !!workspaceId && !!scheduleId,
  })
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: number | string; data: ScheduleCreateRequest }) =>
      api.schedules.create(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.workspaceId] })
    },
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      scheduleId,
      data,
    }: {
      workspaceId: number | string
      scheduleId: string
      data: Partial<Schedule>
    }) => api.schedules.update(workspaceId, scheduleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.workspaceId, variables.scheduleId] })
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, scheduleId }: { workspaceId: number | string; scheduleId: string }) =>
      api.schedules.delete(workspaceId, scheduleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.workspaceId] })
    },
  })
}

export function useScheduleOverrides(workspaceId: number | string | undefined) {
  return useQuery({
    queryKey: ['overrides', workspaceId],
    queryFn: () => api.schedules.listOverrides(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useUpcomingOverrides(workspaceId: number | string | undefined) {
  return useQuery({
    queryKey: ['overrides', workspaceId, 'upcoming'],
    queryFn: () => api.schedules.listUpcomingOverrides(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useCreateOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: number | string
      data: {
        name: string
        channel_id: string
        type: 'emergency' | 'special' | 'maintenance'
        start_datetime: string
        end_datetime: string
        reason?: string
      }
    }) => api.schedules.createOverride(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['overrides', variables.workspaceId] })
    },
  })
}

export function useDeleteOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, overrideId }: { workspaceId: number | string; overrideId: string }) =>
      api.schedules.deleteOverride(workspaceId, overrideId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['overrides', variables.workspaceId] })
    },
  })
}
