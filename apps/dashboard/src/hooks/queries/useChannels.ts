import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { Channel, ChannelManifest, ChannelZone, BackgroundConfig } from '@signage/types'

export function useChannels(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['channels', workspaceId],
    queryFn: () => api.channels.list(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useChannel(workspaceId: string, channelId: string) {
  return useQuery({
    queryKey: ['channels', workspaceId, channelId],
    queryFn: () => api.channels.get(workspaceId, channelId),
    enabled: !!workspaceId && !!channelId,
  })
}

export function useChannelManifest(workspaceId: string, channelId: string) {
  return useQuery({
    queryKey: ['channels', workspaceId, channelId, 'manifest'],
    queryFn: () => api.channels.getManifest(workspaceId, channelId),
    enabled: !!workspaceId && !!channelId,
  })
}

export function useCreateChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string
      data: {
        name: string
        description?: string
        layout_type: string
        background?: BackgroundConfig
      }
    }) => api.channels.create(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId] })
    },
  })
}

export function useUpdateChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      channelId,
      data,
    }: {
      workspaceId: string
      channelId: string
      data: Partial<Channel>
    }) => api.channels.update(workspaceId, channelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId] })
    },
  })
}

export function usePublishChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, channelId }: { workspaceId: string; channelId: string }) =>
      api.channels.publish(workspaceId, channelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId] })
    },
  })
}

export function useDeleteChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, channelId }: { workspaceId: string; channelId: string }) =>
      api.channels.delete(workspaceId, channelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId] })
    },
  })
}

// Zone management hooks
export function useChannelZones(workspaceId: string, channelId: string) {
  return useQuery({
    queryKey: ['channels', workspaceId, channelId, 'zones'],
    queryFn: () => api.channels.listZones(workspaceId, channelId),
    enabled: !!workspaceId && !!channelId,
  })
}

export function useCreateZone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      channelId,
      data,
    }: {
      workspaceId: string
      channelId: string
      data: Partial<ChannelZone>
    }) => api.channels.createZone(workspaceId, channelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'zones'] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'manifest'] })
    },
  })
}

export function useAddZoneApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      channelId,
      zoneId,
      data,
    }: {
      workspaceId: string
      channelId: string
      zoneId: string
      data: { app_id: string; duration_seconds: number; order: number }
    }) => api.channels.addZoneApp(workspaceId, channelId, zoneId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'zones'] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'manifest'] })
    },
  })
}

export function useRemoveZoneApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      channelId,
      zoneId,
      zoneAppId,
    }: {
      workspaceId: string
      channelId: string
      zoneId: string
      zoneAppId: string
    }) => api.channels.removeZoneApp(workspaceId, channelId, zoneId, zoneAppId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'zones'] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'manifest'] })
    },
  })
}
