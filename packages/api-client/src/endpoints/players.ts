import type { ApiClient } from '../client'
import type {
  Player,
  PlayerGroup,
  PlayerCommand,
  PlayerConfig,
  PairingRequest,
  PairingResponse,
  PlayerHeartbeat
} from '@signage/types'

export function createPlayersEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: number | string) =>
      client.get<Player[]>(`/api/v1/workspaces/${workspaceId}/players`),
    
    get: (workspaceId: number | string, playerId: number | string) =>
      client.get<Player>(`/api/v1/workspaces/${workspaceId}/players/${playerId}`),
    
    create: (workspaceId: number | string, data: { name: string; device_type?: string; channel_id?: string }) =>
      client.post<Player>(`/api/v1/workspaces/${workspaceId}/players`, data),
    
    update: (workspaceId: number | string, playerId: number | string, data: Partial<Player>) =>
      client.patch<Player>(`/api/v1/workspaces/${workspaceId}/players/${playerId}`, data),
    
    delete: (workspaceId: number | string, playerId: number | string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/players/${playerId}`),
    
    assignChannel: (workspaceId: number | string, playerId: number | string, channelId: number | string | null) =>
      channelId
        ? client.post<Player>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/assign-channel`, { channel_id: channelId })
        : client.patch<Player>(`/api/v1/workspaces/${workspaceId}/players/${playerId}`, { channel_id: null }),
    
    pair: (_workspaceId: number | string, data: PairingRequest) =>
      client.post<PairingResponse>(`/api/v1/players/pair`, data),
    
    sendCommand: (workspaceId: number | string, playerId: number | string, command: {
      command_type?: string
      type?: string
      params?: Record<string, unknown>
    }) => client.post<PlayerCommand>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/commands`, {
      command_type: command.command_type ?? command.type ?? 'refresh',
      params: command.params ?? {},
    }),
    
    listCommands: (workspaceId: number | string, playerId: number | string) =>
      client.get<PlayerCommand[]>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/commands`),
    
    requestScreenshot: (workspaceId: number | string, playerId: number | string) =>
      client.post<void>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/screenshots`),
    
    listScreenshots: (workspaceId: number | string, playerId: number | string, limit?: number) =>
      client.get<unknown[]>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/screenshots`, { params: limit ? { limit } : undefined }),
    
    getMetrics: (workspaceId: number | string, playerId: number | string, days?: number) =>
      client.get<Record<string, unknown>>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/metrics`, { params: days ? { days } : undefined }),
    
    listGroups: (workspaceId: number | string) =>
      client.get<PlayerGroup[]>(`/api/v1/workspaces/${workspaceId}/player-groups`),
    
    createGroup: (workspaceId: number | string, data: { name: string; color: string }) =>
      client.post<PlayerGroup>(`/api/v1/workspaces/${workspaceId}/player-groups`, data),
    
    deleteGroup: (workspaceId: number | string, groupId: number | string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/player-groups/${groupId}`),
    
    getConfig: (playerId: number | string, deviceToken: string) =>
      client.get<PlayerConfig>(`/api/v1/players/${playerId}/config`, {
        headers: { 'X-Device-Token': deviceToken }
      }),
    
    sendHeartbeat: (playerId: number | string, deviceToken: string, data: Partial<PlayerHeartbeat>) =>
      client.post<void>(`/api/v1/players/${playerId}/heartbeat`, data, {
        headers: { 'X-Device-Token': deviceToken }
      }),
    
    requestPairingCode: (workspaceId: number | string, channelId: number | string) =>
      client.get<{ code: string; expires_at: string }>(`/api/v1/workspaces/${workspaceId}/players/pairing-code`, { params: { channel_id: channelId } }),
  }
}
