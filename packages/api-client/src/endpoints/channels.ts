import type { ApiClient } from '../client'
import type { Channel, ChannelZone, ZoneApp, ChannelManifest, BackgroundConfig } from '@signage/types'

export function createChannelsEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: string) =>
      client.get<Channel[]>(`/api/v1/workspaces/${workspaceId}/channels`),
    
    get: (workspaceId: string, channelId: string) =>
      client.get<Channel>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}`),
    
    create: (workspaceId: string, data: {
      name: string
      description?: string
      layout_type: string
      background?: BackgroundConfig
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
    
    createZone: (workspaceId: string, channelId: string, data: Partial<ChannelZone>) =>
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
      order: number
    }) => client.post<ZoneApp>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}/apps`, data),
    
    removeZoneApp: (workspaceId: string, channelId: string, zoneId: string, zoneAppId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/zones/${zoneId}/apps/${zoneAppId}`),
  }
}
