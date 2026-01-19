import type { PlayerConfig } from '@signage/types'

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8080/api/v1'
const STORAGE_KEY = 'signage_player_device'

interface StoredDevice {
  playerId: string
  deviceToken: string
  pairedAt: string
}

type PairedCallback = (config: PlayerConfig) => void

export class DeviceManager {
  private static instance: DeviceManager
  private storedDevice: StoredDevice | null = null
  private pairingCode: string | null = null
  private pollInterval: ReturnType<typeof setInterval> | null = null
  private onPairedCallback: PairedCallback | null = null

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

  async requestPairingCode(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/players/pairing-code`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to get pairing code')
      }

      const data = await response.json()
      this.pairingCode = data.data.code || this.generateMockCode()
      
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

    this.storedDevice = {
      playerId,
      deviceToken,
      pairedAt: new Date().toISOString(),
    }
    this.saveToStorage()

    if (this.onPairedCallback) {
      this.fetchConfig().then((config) => {
        this.onPairedCallback!(config)
      })
    }
  }

  onPaired(callback: PairedCallback): void {
    this.onPairedCallback = callback
  }

  async fetchConfig(): Promise<PlayerConfig> {
    if (!this.storedDevice) {
      throw new Error('Device not paired')
    }

    try {
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
    } catch (err) {
      console.error('Failed to fetch config:', err)
      return {
        player_id: this.storedDevice.playerId,
        settings: {},
        commands: [],
      }
    }
  }

  unpair(): void {
    this.storedDevice = null
    this.saveToStorage()
  }
}
