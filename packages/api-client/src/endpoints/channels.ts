import type { ApiClient } from '../client'
import type { Channel, ChannelZone, Slide, ZoneApp, ChannelManifest, BackgroundConfig } from '@signage/types'

export function createChannelsEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: string) =>
      client.get<Channel[]>(`/api/v1/workspaces/${workspaceId}/channels`),
    
    get: (workspaceId: string, channelId: string, includeSlides?: boolean) =>
      client.get<Channel>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}`, { params: includeSlides ? { include_slides: true } : {} }),
    
    create: (workspaceId: string, data: {
      name: string
      description?: string
      layout_type?: string
      background?: BackgroundConfig
      slides?: { layout_type: string; duration_seconds?: number; zones?: Array<{ name: string; x: number; y: number; width: number; height: number; z_index?: number; background?: any }> }[]
    }) => client.post<Channel>(`/api/v1/workspaces/${workspaceId}/channels`, data),
    
    update: (workspaceId: string, channelId: string, data: Partial<Channel>) =>
      client.patch<Channel>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}`, data),
    
    delete: (workspaceId: string, channelId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}`),
    
    publish: (workspaceId: string, channelId: string) =>
      client.post<Channel>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/publish`),
    
    getManifest: (workspaceId: string, channelId: string) =>
      client.get<ChannelManifest>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/manifest`),
    
    listZones: (workspaceId: string, channelId: string) =>
      client.get<ChannelZone[]>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones`),
    
    listSlides: (workspaceId: string, channelId: string) =>
      client.get<Slide[]>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/slides`),

    createSlide: (workspaceId: string, channelId: string, data: { layout_type?: string; duration_seconds?: number; position?: number; zones?: Array<{ name: string; x: number; y: number; width: number; height: number; z_index?: number; background?: any }> }) =>
      client.post<Slide>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/slides`, data),

    updateSlide: (workspaceId: string, channelId: string, slideId: string, data: Partial<Slide>) =>
      client.patch<Slide>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/slides/${slideId}`, data),

    deleteSlide: (workspaceId: string, channelId: string, slideId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/slides/${slideId}`),

    createZone: (workspaceId: string, channelId: string, data: Partial<ChannelZone> & { slide_id?: string }) =>
      client.post<ChannelZone>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones`, data),

    createZonesBulk: (workspaceId: string, channelId: string, zones: Partial<ChannelZone>[]) =>
      client.post<ChannelZone[]>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/bulk`, zones),
    
    updateZone: (workspaceId: string, channelId: string, zoneId: string, data: Partial<ChannelZone>) =>
      client.patch<ChannelZone>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}`, data),
    
    deleteZone: (workspaceId: string, channelId: string, zoneId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}`),
    
    listZoneApps: (workspaceId: string, channelId: string, zoneId: string) =>
      client.get<ZoneApp[]>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}/apps`),
    
    addZoneApp: (workspaceId: string, channelId: string, zoneId: string, data: {
      app_id: string
      duration_seconds: number
      order?: number
      sequence?: number
    }) => client.post<ZoneApp>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}/apps`, {
      app_id: data.app_id,
      duration_seconds: data.duration_seconds,
      sequence: data.sequence ?? data.order ?? 0,
    }),
    
    removeZoneApp: (workspaceId: string, channelId: string, zoneId: string, zoneAppId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}/apps/${zoneAppId}`),
  }
}
