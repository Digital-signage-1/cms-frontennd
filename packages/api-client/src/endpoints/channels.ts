import type { ApiClient } from '../client'
import type { Channel, ChannelZone, Slide, ZoneApp, ChannelManifest, BackgroundConfig } from '@signage/types'

export function createChannelsEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: number) =>
      client.get<Channel[]>(`/api/v1/workspaces/${workspaceId}/channels`),
    
    get: (workspaceId: number, channelId: number, includeSlides?: boolean) =>
      client.get<Channel>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}`, { params: includeSlides ? { include_slides: true } : {} }),
    
    create: (workspaceId: number, data: {
      name: string
      description?: string
      layout_type?: string
      background?: BackgroundConfig
      slides?: { layout_type: string; duration_seconds?: number; zones?: Array<{ name: string; x: number; y: number; width: number; height: number; z_index?: number; background?: any }> }[]
    }) => client.post<Channel>(`/api/v1/workspaces/${workspaceId}/channels`, data),
    
    update: (workspaceId: number, channelId: number, data: Partial<Channel>) =>
      client.patch<Channel>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}`, data),
    
    delete: (workspaceId: number, channelId: number) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}`),
    
    publish: (workspaceId: number, channelId: number) =>
      client.post<Channel>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/publish`),
    
    getManifest: (workspaceId: number, channelId: number) =>
      client.get<ChannelManifest>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/manifest`),
    
    listZones: (workspaceId: number, channelId: number) =>
      client.get<ChannelZone[]>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones`),
    
    listSlides: (workspaceId: number, channelId: number) =>
      client.get<Slide[]>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/slides`),

    createSlide: (workspaceId: number, channelId: number, data: { layout_type?: string; duration_seconds?: number; position?: number; zones?: Array<{ name: string; x: number; y: number; width: number; height: number; z_index?: number; background?: any }> }) =>
      client.post<Slide>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/slides`, data),

    updateSlide: (workspaceId: number, channelId: number, slideId: number, data: Partial<Slide>) =>
      client.patch<Slide>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/slides/${slideId}`, data),

    deleteSlide: (workspaceId: number, channelId: number, slideId: number) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/slides/${slideId}`),

    createZone: (workspaceId: number, channelId: number, data: Partial<ChannelZone> & { slide_id?: string }) =>
      client.post<ChannelZone>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones`, data),

    createZonesBulk: (workspaceId: number, channelId: number, zones: Partial<ChannelZone>[]) =>
      client.post<ChannelZone[]>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/bulk`, zones),
    
    updateZone: (workspaceId: number, channelId: number, zoneId: number, data: Partial<ChannelZone>) =>
      client.patch<ChannelZone>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}`, data),
    
    deleteZone: (workspaceId: number, channelId: number, zoneId: number | string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}`),
    
    listZoneApps: (workspaceId: number, channelId: number, zoneId: number) =>
      client.get<ZoneApp[]>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}/apps`),
    
    addZoneApp: (workspaceId: number, channelId: number, zoneId: number | string, data: {
      app_id: number | string
      duration_seconds: number
      order?: number
      sequence?: number
    }) => client.post<ZoneApp>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}/apps`, {
      app_id: data.app_id,
      duration_seconds: data.duration_seconds,
      sequence: data.sequence ?? data.order ?? 0,
    }),
    
    removeZoneApp: (workspaceId: number, channelId: number, zoneId: number, zoneAppId: number) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}/apps/${zoneAppId}`),
    
    reorderZoneApps: (workspaceId: number, channelId: number, zoneId: number, zoneAppIds: string[]) =>
      client.put<ZoneApp[]>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}/apps/reorder`, { zone_app_ids: zoneAppIds }),
  }
}
