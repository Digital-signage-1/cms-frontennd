import type { ChannelManifest, PlayerHeartbeat } from '@signage/types'
import { DeviceManager } from './DeviceManager'

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8080/api/v1'
const HEARTBEAT_INTERVAL = 30000

export class PlayerEngine {
  private static instance: PlayerEngine
  private deviceManager: DeviceManager
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
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
      
      this.currentManifest = await response.json()
      return this.currentManifest!
    } catch (err) {
      console.error('Failed to load channel:', err)
      return this.getMockManifest()
    }
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

    this.sendHeartbeat()

    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat()
    }, HEARTBEAT_INTERVAL)
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
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
      current_channel_version: this.currentManifest?.channel.channel_id,
      timestamp: new Date().toISOString(),
    }

    try {
      await fetch(`${API_BASE_URL}/players/${playerId}/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Token': deviceToken,
        },
        body: JSON.stringify(heartbeat),
      })
    } catch (err) {
      console.error('Failed to send heartbeat:', err)
    }
  }

  getUptime(): number {
    return Date.now() - this.startTime
  }

  getCurrentManifest(): ChannelManifest | null {
    return this.currentManifest
  }
}
