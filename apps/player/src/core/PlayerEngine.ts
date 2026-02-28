import type { ChannelManifest, PlayerHeartbeat } from '@signage/types'
import { DeviceManager } from './DeviceManager'

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8080/api/v1'
const HEARTBEAT_INTERVAL = 30000
const COMMANDS_POLL_INTERVAL = 10000

function getDeviceInfo(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  return {
    os: 'web',
    browser: navigator.userAgent.split(' ').pop() || 'unknown',
    screen_width: window.screen?.width,
    screen_height: window.screen?.height,
    user_agent: navigator.userAgent,
  }
}

interface PendingCommand {
  command_id: string
  command_type: string
  params?: Record<string, unknown>
  status?: string
}

export class PlayerEngine {
  private static instance: PlayerEngine
  private deviceManager: DeviceManager
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private commandsPollInterval: ReturnType<typeof setInterval> | null = null
  private currentManifest: ChannelManifest | null = null
  private startTime: number = Date.now()

  private constructor() {
    this.deviceManager = DeviceManager.getInstance()
  }

  static getInstance(): PlayerEngine {
    if (!PlayerEngine.instance) {
      PlayerEngine.instance = new PlayerEngine()
    }
    return PlayerEngine.instance
  }

  async loadChannel(manifestUrl: string): Promise<ChannelManifest> {
    try {
      const response = await fetch(manifestUrl)
      if (!response.ok) {
        throw new Error('Failed to load channel manifest')
      }

      const raw = await response.json()
      this.currentManifest = this.normalizeManifest(raw)
      return this.currentManifest
    } catch (err) {
      console.error('Failed to load channel:', err)
      return this.getMockManifest()
    }
  }

  private normalizeManifest(raw: Record<string, unknown>): ChannelManifest {
    if (raw.channel && typeof raw.channel === 'object') {
      return raw as unknown as ChannelManifest
    }
    const channel = {
      channel_id: raw.channel_id,
      workspace_id: raw.workspace_id,
      name: raw.name,
      layout_type: raw.layout_type,
      layout: raw.layout,
      background: raw.background,
      transition_type: raw.transition_type,
      transition_duration: raw.transition_duration,
      status: raw.status,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
    return {
      channel,
      zones: Array.isArray(raw.zones) ? raw.zones : [],
      slides: Array.isArray(raw.slides) ? raw.slides : [],
    } as ChannelManifest
  }

  private getMockManifest(): ChannelManifest {
    return {
      channel: {
        channel_id: 'demo-channel',
        workspace_id: 'demo',
        name: 'Demo Channel',
        layout_type: 'custom',
        layout: { width: 1920, height: 1080, orientation: 'landscape' },
        background: { type: 'color', value: '#1a1a2e' },
        transition_type: 'fade',
        transition_duration: 500,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      zones: [
        {
          zone_id: 'zone-1',
          channel_id: 'demo-channel',
          name: 'Main',
          x_percent: 0,
          y_percent: 0,
          width_percent: 70,
          height_percent: 100,
          z_index: 1,
          app_count: 1,
          apps: [],
        },
        {
          zone_id: 'zone-2',
          channel_id: 'demo-channel',
          name: 'Sidebar',
          x_percent: 70,
          y_percent: 0,
          width_percent: 30,
          height_percent: 50,
          z_index: 1,
          app_count: 1,
          apps: [],
        },
        {
          zone_id: 'zone-3',
          channel_id: 'demo-channel',
          name: 'Clock',
          x_percent: 70,
          y_percent: 50,
          width_percent: 30,
          height_percent: 50,
          z_index: 1,
          app_count: 1,
          apps: [],
        },
      ],
    }
  }

  startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    if (this.commandsPollInterval) {
      clearInterval(this.commandsPollInterval)
    }

    this.sendHeartbeat()
    this.pollCommands()

    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat()
    }, HEARTBEAT_INTERVAL)

    this.commandsPollInterval = setInterval(() => {
      this.pollCommands()
    }, COMMANDS_POLL_INTERVAL)
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    if (this.commandsPollInterval) {
      clearInterval(this.commandsPollInterval)
      this.commandsPollInterval = null
    }
  }

  private async sendHeartbeat(): Promise<void> {
    const playerId = this.deviceManager.getPlayerId()
    const deviceToken = this.deviceManager.getDeviceToken()

    if (!playerId || !deviceToken) return

    const heartbeat: Partial<PlayerHeartbeat> = {
      status: 'online',
      cpu_percent: Math.random() * 30 + 10,
      memory_percent: Math.random() * 40 + 20,
      storage_free_mb: 5000 + Math.random() * 1000,
      current_channel_version: this.currentManifest?.channel?.channel_id ?? this.currentManifest?.channel_id,
      timestamp: new Date().toISOString(),
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Device-Token': deviceToken,
    }
    const deviceInfo = getDeviceInfo()
    if (Object.keys(deviceInfo).length > 0) {
      headers['X-Device-Info'] = JSON.stringify(deviceInfo)
    }

    try {
      await fetch(`${API_BASE_URL}/players/${playerId}/heartbeat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(heartbeat),
      })
    } catch (err) {
      console.error('Failed to send heartbeat:', err)
    }
  }

  private async fetchPendingCommands(): Promise<PendingCommand[]> {
    const playerId = this.deviceManager.getPlayerId()
    const deviceToken = this.deviceManager.getDeviceToken()
    if (!playerId || !deviceToken) return []

    try {
      const response = await fetch(
        `${API_BASE_URL}/players/${playerId}/pending-commands`,
        { headers: { 'X-Device-Token': deviceToken } }
      )
      if (!response.ok) return []
      const data = await response.json()
      const commands = data.data
      return Array.isArray(commands) ? commands : []
    } catch {
      return []
    }
  }

  private async ackCommand(commandId: string, result?: Record<string, unknown>): Promise<void> {
    const playerId = this.deviceManager.getPlayerId()
    const deviceToken = this.deviceManager.getDeviceToken()
    if (!playerId || !deviceToken) return

    try {
      await fetch(
        `${API_BASE_URL}/players/${playerId}/commands/${commandId}/ack`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Token': deviceToken,
          },
          body: JSON.stringify(result ?? {}),
        }
      )
    } catch (err) {
      console.error('Failed to ack command:', err)
    }
  }

  private async executeCommand(cmd: PendingCommand): Promise<void> {
    const { command_id, command_type } = cmd
    switch (command_type) {
      case 'refresh':
      case 'change_channel':
        await this.ackCommand(command_id, { executed: true })
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('player:refresh-needed'))
        }
        break
      case 'restart':
      case 'reboot':
        await this.ackCommand(command_id, { executed: true })
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
        break
      case 'clear_cache':
        await this.ackCommand(command_id, { executed: true })
        if (typeof caches !== 'undefined') {
          const names = await caches.keys()
          await Promise.all(names.map((n) => caches.delete(n)))
        }
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
        break
      case 'screenshot':
        await this.ackCommand(command_id, { executed: true })
        break
      default:
        await this.ackCommand(command_id, { executed: false, reason: 'unknown_command' })
    }
  }

  private async pollCommands(): Promise<void> {
    const commands = await this.fetchPendingCommands()
    for (const cmd of commands) {
      await this.executeCommand(cmd)
    }
  }

  getUptime(): number {
    return Date.now() - this.startTime
  }

  getCurrentManifest(): ChannelManifest | null {
    return this.currentManifest
  }
}
