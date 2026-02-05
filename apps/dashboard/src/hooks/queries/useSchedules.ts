import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { Schedule, ScheduleOverride, ScheduleCreateRequest } from '@signage/types'

export type { Schedule, ScheduleOverride }

export function useSchedules(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['schedules', workspaceId],
    queryFn: () => api.schedules.list(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useSchedule(workspaceId: string, scheduleId: string) {
  return useQuery({
    queryKey: ['schedules', workspaceId, scheduleId],
    queryFn: () => api.schedules.get(workspaceId, scheduleId),
    enabled: !!workspaceId && !!scheduleId,
  })
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: ScheduleCreateRequest }) =>
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
      workspaceId: string
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
    mutationFn: ({ workspaceId, scheduleId }: { workspaceId: string; scheduleId: string }) =>
      api.schedules.delete(workspaceId, scheduleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.workspaceId] })
    },
  })
}
