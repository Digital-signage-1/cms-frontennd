import type { ChannelManifest } from '@signage/types'
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

  /**
   * Transform backend inline channel data into a ChannelManifest
   * that the renderer understands.
   *
   * Backend format (from get_channel_manifest):
   *   { channel_id, name, layout_type, background, zones: [...] }
   *
   * Renderer expects:
   *   { channel: { channel_id, name, ... }, zones: [...] }
   */
  loadFromConfig(channelData: Record<string, any>): ChannelManifest {
    const { zones: rawZones, ...channelFields } = channelData

    // Normalize layout_type casing: backend uses UPPERCASE, renderer expects lowercase
    const layoutType = (channelFields.layout_type || 'single').toLowerCase()

    const channel = {
      channel_id: channelFields.channel_id,
      workspace_id: channelFields.workspace_id || '',
      name: channelFields.name,
      description: channelFields.description,
      layout_type: layoutType as any,
      layout: channelFields.layout_config || { width: 1920, height: 1080, orientation: 'landscape' as const },
      background: channelFields.background || { type: 'color' as const, value: '#000000' },
      transition_type: (channelFields.transition_type || 'fade') as any,
      transition_duration: channelFields.transition_duration ?? 500,
      status: (channelFields.status || 'published').toLowerCase() as any,
      created_at: channelFields.created_at || '',
      updated_at: channelFields.updated_at || '',
      published_at: channelFields.published_at,
    }

    const zones = (rawZones || []).map((z: any) => ({
      zone_id: z.zone_id,
      channel_id: channel.channel_id,
      name: z.name,
      x_percent: z.x_percent ?? z.x ?? 0,
      y_percent: z.y_percent ?? z.y ?? 0,
      width_percent: z.width_percent ?? z.width ?? 100,
      height_percent: z.height_percent ?? z.height ?? 100,
      z_index: z.z_index ?? 1,
      background: z.background,
      app_count: z.apps?.length || 0,
      apps: (z.apps || []).map((a: any) => ({
        zone_app_id: a.zone_app_id,
        zone_id: z.zone_id,
        app_id: a.app_id,
        order: a.sequence ?? a.order ?? 0,
        duration_seconds: a.duration_seconds ?? a.duration ?? 10,
        app: a.app || null,
      })),
    }))

    this.currentManifest = { channel, zones }
    return this.currentManifest
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

    try {
      await fetch(`${API_BASE_URL}/players/${playerId}/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Token': deviceToken,
        },
        body: JSON.stringify({
          status: 'online',
          cpu_percent: Math.random() * 30 + 10,
          memory_percent: Math.random() * 40 + 20,
          storage_free_mb: 5000 + Math.random() * 1000,
          current_channel_version: this.currentManifest?.channel.channel_id,
          timestamp: new Date().toISOString(),
        }),
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
