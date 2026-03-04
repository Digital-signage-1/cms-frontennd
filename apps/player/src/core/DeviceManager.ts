import type { PlayerConfig } from '@signage/types'

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8080/api/v1'

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

const STORAGE_KEY = 'signage_player_device'

interface StoredDevice {
  playerId: string
  deviceToken: string
  pairedAt: string
}

type PairedCallback = (playerId: string, deviceToken: string) => void

export class DeviceManager {
  private playerId: string | null
  private deviceToken: string | null
  private pairingCode: string | null = null
  private pollInterval: ReturnType<typeof setInterval> | null = null
  private onPairedCallback: PairedCallback | null = null

  constructor(playerId?: string, deviceToken?: string) {
    this.playerId = playerId ?? null
    this.deviceToken = deviceToken ?? null
  }

  /**
   * One-time migration: reads old localStorage key, returns credentials, then clears it.
   */
  static migrateFromLocalStorage(): { playerId: string; deviceToken: string } | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      const data: StoredDevice = JSON.parse(stored)
      if (data.playerId && data.deviceToken) {
        localStorage.removeItem(STORAGE_KEY)
        return { playerId: data.playerId, deviceToken: data.deviceToken }
      }
    } catch {
      // ignore
    }
    return null
  }

  isPaired(): boolean {
    return this.playerId !== null && this.deviceToken !== null
  }

  getPlayerId(): string | null {
    return this.playerId
  }

  getDeviceToken(): string | null {
    return this.deviceToken
  }

  async requestPairingCode(): Promise<string> {
    try {
      const headers: Record<string, string> = {}
      const deviceInfo = getDeviceInfo()
      if (Object.keys(deviceInfo).length > 0) {
        headers['X-Device-Info'] = JSON.stringify(deviceInfo)
      }
      const response = await fetch(
        `${API_BASE_URL}/players/request-code`,
        { method: 'GET', headers }
      )

      if (!response.ok) {
        throw new Error('Failed to get pairing code')
      }

      const data = await response.json()
      this.pairingCode = data.data?.code || this.generateMockCode()
      this.startPairingPoll()
      return this.pairingCode!
    } catch (err) {
      console.error('Failed to request pairing code:', err)
      this.pairingCode = this.generateMockCode()
      this.startPairingPoll()
      return this.pairingCode!
    }
  }

  private generateMockCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  private startPairingPoll(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    this.pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/players/pairing-status?code=${this.pairingCode}`)

        if (response.ok) {
          const data = await response.json()
          if (data.data?.paired) {
            this.handlePaired(data.data.player_id, data.data.device_token)
          }
        }
      } catch (err) {
        console.log('Polling for pairing status...')
      }
    }, 3000)

    setTimeout(() => {
      if (this.pollInterval) {
        clearInterval(this.pollInterval)
      }
    }, 15 * 60 * 1000)
  }

  private handlePaired(playerId: string, deviceToken: string): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    this.playerId = playerId
    this.deviceToken = deviceToken

    if (this.onPairedCallback) {
      this.onPairedCallback(playerId, deviceToken)
    }
  }

  onPaired(callback: PairedCallback): void {
    this.onPairedCallback = callback
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  async fetchConfig(): Promise<PlayerConfig> {
    if (!this.playerId || !this.deviceToken) {
      throw new Error('Device not paired')
    }

    try {
      const headers: Record<string, string> = {
        'X-Device-Token': this.deviceToken,
      }
      const deviceInfo = getDeviceInfo()
      if (Object.keys(deviceInfo).length > 0) {
        headers['X-Device-Info'] = JSON.stringify(deviceInfo)
      }
      const response = await fetch(
        `${API_BASE_URL}/players/${this.playerId}/config`,
        { headers }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch config')
      }

      const data = await response.json()
      const raw = data.data
      const player = raw?.player ?? {}
      const channel = raw?.channel
      return {
        player_id: player.id ?? this.playerId,
        channel: channel ? {
          channel_id: channel.channel_id,
          manifest_url: channel.manifest_url,
          version: channel.version,
        } : undefined,
        settings: player.settings ?? {},
        commands: [],
      }
    } catch (err) {
      console.error('Failed to fetch config:', err)
      return {
        player_id: this.playerId,
        settings: {},
        commands: [],
      }
    }
  }
}
