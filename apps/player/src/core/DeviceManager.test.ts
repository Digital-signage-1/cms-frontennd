import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock localStorage
const mockStorage: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key] }),
  clear: vi.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }),
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

const { DeviceManager } = await import('./DeviceManager')

describe('DeviceManager', () => {
  beforeEach(() => {
    // Reset singleton and storage
    ;(DeviceManager as any).instance = undefined
    localStorageMock.clear()
    mockFetch.mockReset()
    vi.clearAllMocks()
  })

  describe('getInstance', () => {
    it('returns singleton instance', () => {
      const a = DeviceManager.getInstance()
      const b = DeviceManager.getInstance()
      expect(a).toBe(b)
    })
  })

  describe('isPaired', () => {
    it('returns false when no stored device', () => {
      const dm = DeviceManager.getInstance()
      expect(dm.isPaired()).toBe(false)
    })

    it('returns true when device data exists in storage', () => {
      mockStorage['signage_player_device'] = JSON.stringify({
        playerId: 'p-1',
        deviceToken: 'token-1',
        pairedAt: '2024-01-01T00:00:00Z',
      })
      const dm = DeviceManager.getInstance()
      expect(dm.isPaired()).toBe(true)
    })
  })

  describe('getPlayerId / getDeviceToken', () => {
    it('returns null when not paired', () => {
      const dm = DeviceManager.getInstance()
      expect(dm.getPlayerId()).toBeNull()
      expect(dm.getDeviceToken()).toBeNull()
    })

    it('returns stored values when paired', () => {
      mockStorage['signage_player_device'] = JSON.stringify({
        playerId: 'p-1',
        deviceToken: 'token-1',
        pairedAt: '2024-01-01T00:00:00Z',
      })
      const dm = DeviceManager.getInstance()
      expect(dm.getPlayerId()).toBe('p-1')
      expect(dm.getDeviceToken()).toBe('token-1')
    })
  })

  describe('pairWithCode', () => {
    it('successfully pairs with valid code', async () => {
      const dm = DeviceManager.getInstance()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            player: { player_id: 'p-123', name: 'Test Player' },
            device_token: 'tok-abc',
          },
        }),
      })

      await dm.pairWithCode('ABC123')

      expect(dm.isPaired()).toBe(true)
      expect(dm.getPlayerId()).toBe('p-123')
      expect(dm.getDeviceToken()).toBe('tok-abc')
      // Verify saved to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'signage_player_device',
        expect.stringContaining('p-123'),
      )
    })

    it('converts pairing code to uppercase', async () => {
      const dm = DeviceManager.getInstance()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            player: { player_id: 'p-1', name: 'P' },
            device_token: 'tok-1',
          },
        }),
      })

      await dm.pairWithCode('abc123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/players/pair'),
        expect.objectContaining({
          body: expect.stringContaining('"ABC123"'),
        }),
      )
    })

    it('throws on HTTP error', async () => {
      const dm = DeviceManager.getInstance()

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid pairing code' }),
      })

      await expect(dm.pairWithCode('WRONG1')).rejects.toThrow('Invalid pairing code')
      expect(dm.isPaired()).toBe(false)
    })

    it('throws on invalid server response (missing player_id)', async () => {
      const dm = DeviceManager.getInstance()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { player: {} } }),
      })

      await expect(dm.pairWithCode('ABC123')).rejects.toThrow('Invalid response from server')
    })
  })

  describe('fetchConfig', () => {
    it('throws when not paired', async () => {
      const dm = DeviceManager.getInstance()
      await expect(dm.fetchConfig()).rejects.toThrow('Device not paired')
    })

    it('fetches config when paired', async () => {
      mockStorage['signage_player_device'] = JSON.stringify({
        playerId: 'p-1',
        deviceToken: 'token-1',
        pairedAt: '2024-01-01T00:00:00Z',
      })
      const dm = DeviceManager.getInstance()

      const mockConfig = {
        player: { id: 'p-1', name: 'Player', device_type: 'web', settings: null },
        channel: null,
        workspace_id: 'ws-1',
        channel_source: 'default',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockConfig }),
      })

      const config = await dm.fetchConfig()
      expect(config).toEqual(mockConfig)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/players/p-1/config'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Device-Token': 'token-1',
          }),
        }),
      )
    })

    it('throws on HTTP error', async () => {
      mockStorage['signage_player_device'] = JSON.stringify({
        playerId: 'p-1',
        deviceToken: 'token-1',
        pairedAt: '2024-01-01T00:00:00Z',
      })
      const dm = DeviceManager.getInstance()

      mockFetch.mockResolvedValueOnce({ ok: false })

      await expect(dm.fetchConfig()).rejects.toThrow('Failed to fetch config')
    })
  })

  describe('unpair', () => {
    it('clears stored device and removes from localStorage', () => {
      mockStorage['signage_player_device'] = JSON.stringify({
        playerId: 'p-1',
        deviceToken: 'token-1',
        pairedAt: '2024-01-01T00:00:00Z',
      })
      const dm = DeviceManager.getInstance()
      expect(dm.isPaired()).toBe(true)

      dm.unpair()

      expect(dm.isPaired()).toBe(false)
      expect(dm.getPlayerId()).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('signage_player_device')
    })
  })
})
