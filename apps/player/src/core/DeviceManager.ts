import type { PlayerConfig } from '@signage/types'

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8080/api/v1'
const STORAGE_KEY = 'signage_player_device'

interface StoredDevice {
  playerId: string
  deviceToken: string
  pairedAt: string
}

export class DeviceManager {
  private static instance: DeviceManager
  private storedDevice: StoredDevice | null = null

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): DeviceManager {
    if (!DeviceManager.instance) {
      DeviceManager.instance = new DeviceManager()
    }
    return DeviceManager.instance
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.storedDevice = JSON.parse(stored)
      }
    } catch (err) {
      console.error('Failed to load device from storage:', err)
    }
  }

  private saveToStorage(): void {
    try {
      if (this.storedDevice) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.storedDevice))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (err) {
      console.error('Failed to save device to storage:', err)
    }
  }

  isPaired(): boolean {
    return this.storedDevice !== null
  }

  getPlayerId(): string | null {
    return this.storedDevice?.playerId || null
  }

  getDeviceToken(): string | null {
    return this.storedDevice?.deviceToken || null
  }

  async pairWithCode(pairingCode: string): Promise<void> {
    const deviceInfo = {
      os: navigator.platform,
      browser: navigator.userAgent.split(' ').pop() || 'unknown',
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      user_agent: navigator.userAgent,
    }

    const response = await fetch(`${API_BASE_URL}/players/pair`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Info': JSON.stringify(deviceInfo),
      },
      body: JSON.stringify({ pairing_code: pairingCode.toUpperCase() }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || 'Invalid or expired pairing code')
    }

    const data = await response.json()
    const playerData = data.data?.player || data.data
    const deviceToken = data.data?.device_token || playerData?.device_token

    if (!playerData?.player_id || !deviceToken) {
      throw new Error('Invalid response from server')
    }

    this.storedDevice = {
      playerId: playerData.player_id,
      deviceToken: deviceToken,
      pairedAt: new Date().toISOString(),
    }
    this.saveToStorage()
  }

  async fetchConfig(): Promise<PlayerConfig> {
    if (!this.storedDevice) {
      throw new Error('Device not paired')
    }

    const response = await fetch(
      `${API_BASE_URL}/players/${this.storedDevice.playerId}/config`,
      {
        headers: {
          'X-Device-Token': this.storedDevice.deviceToken,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch config')
    }

    const data = await response.json()
    return data.data
  }

  unpair(): void {
    this.storedDevice = null
    this.saveToStorage()
  }
}
