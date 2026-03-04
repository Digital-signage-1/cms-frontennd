import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { Channel, ChannelManifest, ChannelZone, BackgroundConfig } from '@signage/types'

export function useChannels(workspaceId: number | string | undefined) {
  const id = workspaceId ? Number(workspaceId) : undefined
  return useQuery({
    queryKey: ['channels', id],
    queryFn: () => api.channels.list(id!),
    enabled: !!id && id > 0,
  })
}

export function useChannel(workspaceId: number | string, channelId: number | string) {
  const w = Number(workspaceId)
  const c = Number(channelId)
  return useQuery({
    queryKey: ['channels', w, c],
    queryFn: () => api.channels.get(w, c),
    enabled: !!w && c > 0,
  })
}

export function useChannelManifest(workspaceId: number | string, channelId: number | string) {
  const w = Number(workspaceId)
  const c = Number(channelId)
  return useQuery({
    queryKey: ['channels', w, c, 'manifest'],
    queryFn: () => api.channels.getManifest(w, c),
    enabled: !!w && c > 0,
  })
}

export function useCreateChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: number
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
      workspaceId: number
      channelId: number
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
    mutationFn: ({ workspaceId, channelId }: { workspaceId: number; channelId: number }) =>
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
    mutationFn: ({ workspaceId, channelId }: { workspaceId: number; channelId: number }) =>
      api.channels.delete(workspaceId, channelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId] })
    },
  })
}

export function useChannelSlides(workspaceId: number, channelId: number) {
  return useQuery({
    queryKey: ['channels', workspaceId, channelId, 'slides'],
    queryFn: () => api.channels.listSlides(workspaceId, channelId),
    enabled: !!workspaceId && channelId > 0,
  })
}

export function useCreateSlide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      channelId,
      data,
    }: {
      workspaceId: number
      channelId: number
      data: { layout_type?: string; duration_seconds?: number; position?: number; zones?: Array<{ name: string; x: number; y: number; width: number; height: number; z_index?: number; background?: any }> }
    }) => api.channels.createSlide(workspaceId, channelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'manifest'] })
    },
  })
}

export function useUpdateSlide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      channelId,
      slideId,
      data,
    }: {
      workspaceId: number
      channelId: number
      slideId: number
      data: { position?: number; duration_seconds?: number; layout_type?: string }
    }) => api.channels.updateSlide(workspaceId, channelId, slideId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'manifest'] })
    },
  })
}

export function useDeleteSlide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      channelId,
      slideId,
    }: {
      workspaceId: number
      channelId: number
      slideId: number
    }) => api.channels.deleteSlide(workspaceId, channelId, slideId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'manifest'] })
    },
  })
}

// Zone management hooks
export function useChannelZones(workspaceId: number, channelId: number) {
  return useQuery({
    queryKey: ['channels', workspaceId, channelId, 'zones'],
    queryFn: () => api.channels.listZones(workspaceId, channelId),
    enabled: !!workspaceId && channelId > 0,
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
      workspaceId: number
      channelId: number
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
      workspaceId: number
      channelId: number
      zoneId: number | string
      data: { app_id: number | string; duration_seconds: number; order?: number; sequence?: number }
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
      workspaceId: number
      channelId: number
      zoneId: number
      zoneAppId: number
    }) => api.channels.removeZoneApp(workspaceId, channelId, zoneId, zoneAppId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'zones'] })
      queryClient.invalidateQueries({ queryKey: ['channels', variables.workspaceId, variables.channelId, 'manifest'] })
    },
  })
}
