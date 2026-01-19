import type { ApiClient } from '../client'
import type { 
  Player, 
  PlayerGroup, 
  PlayerLocation, 
  PlayerCommand, 
  PlayerConfig,
  PairingRequest,
  PairingResponse,
  PlayerHeartbeat
} from '@signage/types'

export function createPlayersEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: string) =>
      client.get<Player[]>(`/api/v1/workspaces/${workspaceId}/players`),
    
    get: (workspaceId: string, playerId: string) =>
      client.get<Player>(`/api/v1/workspaces/${workspaceId}/players/${playerId}`),
    
    create: (workspaceId: string, data: { name: string; device_type?: string }) =>
      client.post<Player>(`/api/v1/workspaces/${workspaceId}/players`, data),
    
    update: (workspaceId: string, playerId: string, data: Partial<Player>) =>
      client.patch<Player>(`/api/v1/workspaces/${workspaceId}/players/${playerId}`, data),
    
    delete: (workspaceId: string, playerId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/players/${playerId}`),
    
    assignChannel: (workspaceId: string, playerId: string, channelId: string | null) =>
      client.patch<Player>(`/api/v1/workspaces/${workspaceId}/players/${playerId}`, { channel_id: channelId }),
    
    pair: (workspaceId: string, data: PairingRequest) =>
      client.post<PairingResponse>(`/api/v1/workspaces/${workspaceId}/players/pair`, data),
    
    sendCommand: (workspaceId: string, playerId: string, command: {
      type: string
      params?: Record<string, unknown>
    }) => client.post<PlayerCommand>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/commands`, command),
    
    listCommands: (workspaceId: string, playerId: string) =>
      client.get<PlayerCommand[]>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/commands`),
    
    requestScreenshot: (workspaceId: string, playerId: string) =>
      client.post<void>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/screenshots`),
    
    getLocation: (workspaceId: string, playerId: string) =>
      client.get<PlayerLocation>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/location`),
    
    updateLocation: (workspaceId: string, playerId: string, data: Partial<PlayerLocation>) =>
      client.patch<PlayerLocation>(`/api/v1/workspaces/${workspaceId}/players/${playerId}/location`, data),
    
    listGroups: (workspaceId: string) =>
      client.get<PlayerGroup[]>(`/api/v1/workspaces/${workspaceId}/player-groups`),
    
    createGroup: (workspaceId: string, data: { name: string; color: string }) =>
      client.post<PlayerGroup>(`/api/v1/workspaces/${workspaceId}/player-groups`, data),
    
    deleteGroup: (workspaceId: string, groupId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/player-groups/${groupId}`),
    
    getConfig: (playerId: string, deviceToken: string) =>
      client.get<PlayerConfig>(`/api/v1/players/${playerId}/config`, {
        headers: { 'X-Device-Token': deviceToken }
      }),
    
    sendHeartbeat: (playerId: string, deviceToken: string, data: Partial<PlayerHeartbeat>) =>
      client.post<void>(`/api/v1/players/${playerId}/heartbeat`, data, {
        headers: { 'X-Device-Token': deviceToken }
      }),
    
    requestPairingCode: () =>
      client.get<{ code: string; expires_at: string }>('/api/v1/players/pairing-code'),
  }
}
