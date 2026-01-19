export type PlayerStatus = 'online' | 'offline' | 'pending' | 'error'

export type DeviceType = 'web' | 'android' | 'ios' | 'windows' | 'linux' | 'raspberry_pi' | 'chrome_os' | 'smart_tv'

export interface Player {
  player_id: string
  workspace_id: string
  name: string
  device_type: DeviceType
  pairing_code?: string
  pairing_expires?: string
  channel_id?: string
  group_id?: string
  status: PlayerStatus
  device_token?: string
  device_info?: DeviceInfo
  settings?: PlayerSettings
  last_seen_at?: string
  created_at: string
}

export interface DeviceInfo {
  os?: string
  os_version?: string
  browser?: string
  browser_version?: string
  screen_width?: number
  screen_height?: number
  user_agent?: string
}

export interface PlayerSettings {
  orientation?: 'landscape' | 'portrait'
  volume?: number
  brightness?: number
  auto_restart?: boolean
  restart_time?: string
}

export interface PlayerGroup {
  group_id: string
  workspace_id: string
  name: string
  description?: string
  channel_id?: string
  color: string
  player_count: number
  created_at: string
}

export interface PlayerLocation {
  player_id: string
  latitude?: number
  longitude?: number
  address?: string
  city?: string
  country?: string
  timezone?: string
  location_type: 'gps' | 'manual' | 'ip'
  updated_at: string
}

export interface PlayerHeartbeat {
  heartbeat_id: string
  player_id: string
  status: PlayerStatus
  cpu_percent?: number
  memory_percent?: number
  storage_free_mb?: number
  current_channel_version?: string
  current_app_id?: string
  timestamp: string
}

export interface PlayerCommand {
  command_id: string
  player_id: string
  type: 'refresh' | 'restart' | 'screenshot' | 'update' | 'reboot' | 'clear_cache' | 'change_channel'
  params?: Record<string, unknown>
  status: 'pending' | 'sent' | 'acknowledged' | 'completed' | 'failed' | 'expired'
  sent_by: string
  sent_at: string
  completed_at?: string
}

export interface PlayerConfig {
  player_id: string
  channel?: {
    channel_id: string
    manifest_url: string
    version: string
  }
  settings: PlayerSettings
  commands: PlayerCommand[]
}

export interface PairingRequest {
  code: string
  name: string
  location?: string
  group_id?: string
}

export interface PairingResponse {
  player_id: string
  device_token: string
  config: PlayerConfig
}
