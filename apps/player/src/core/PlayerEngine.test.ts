import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock DeviceManager before importing PlayerEngine
vi.mock('./DeviceManager', () => ({
  DeviceManager: {
    getInstance: () => ({
      getPlayerId: () => 'test-player-id',
      getDeviceToken: () => 'test-token',
    }),
  },
}))

// Must import after mock
const { PlayerEngine } = await import('./PlayerEngine')

describe('PlayerEngine', () => {
  let engine: ReturnType<typeof PlayerEngine.getInstance>

  beforeEach(() => {
    // Reset singleton for each test
    ;(PlayerEngine as any).instance = undefined
    engine = PlayerEngine.getInstance()
  })

  describe('getInstance', () => {
    it('returns the same instance on multiple calls', () => {
      const a = PlayerEngine.getInstance()
      const b = PlayerEngine.getInstance()
      expect(a).toBe(b)
    })
  })

  describe('loadFromConfig', () => {
    it('transforms backend channel data to ChannelManifest', () => {
      const backendData = {
        channel_id: 'ch-123',
        workspace_id: 'ws-456',
        name: 'Lobby Display',
        description: 'Main lobby',
        layout_type: 'SINGLE',
        background: { type: 'color', value: '#000000' },
        transition_type: 'fade',
        transition_duration: 500,
        status: 'published',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        zones: [],
      }

      const manifest = engine.loadFromConfig(backendData)

      expect(manifest.channel.channel_id).toBe('ch-123')
      expect(manifest.channel.name).toBe('Lobby Display')
      expect(manifest.channel.layout_type).toBe('single') // normalized to lowercase
      expect(manifest.channel.status).toBe('published')
      expect(manifest.zones).toHaveLength(0)
    })

    it('normalizes layout_type to lowercase', () => {
      const manifest = engine.loadFromConfig({
        channel_id: 'ch-1',
        name: 'Test',
        layout_type: 'SPLIT_HORIZONTAL',
        zones: [],
      })
      expect(manifest.channel.layout_type).toBe('split_horizontal')
    })

    it('sets default values for missing fields', () => {
      const manifest = engine.loadFromConfig({
        channel_id: 'ch-1',
        name: 'Minimal',
        zones: [],
      })

      expect(manifest.channel.layout_type).toBe('single')
      expect(manifest.channel.workspace_id).toBe('')
      expect(manifest.channel.transition_type).toBe('fade')
      expect(manifest.channel.transition_duration).toBe(500)
      expect(manifest.channel.status).toBe('published')
      expect(manifest.channel.background).toEqual({ type: 'color', value: '#000000' })
    })

    it('transforms zones with correct field mapping', () => {
      const manifest = engine.loadFromConfig({
        channel_id: 'ch-1',
        name: 'Multi-zone',
        zones: [
          {
            zone_id: 'z-1',
            name: 'Main',
            x_percent: 0,
            y_percent: 0,
            width_percent: 70,
            height_percent: 100,
            z_index: 1,
            background: { type: 'transparent' },
            apps: [],
          },
          {
            zone_id: 'z-2',
            name: 'Sidebar',
            x_percent: 70,
            y_percent: 0,
            width_percent: 30,
            height_percent: 100,
            z_index: 2,
            background: null,
            apps: [],
          },
        ],
      })

      expect(manifest.zones).toHaveLength(2)
      expect(manifest.zones[0].zone_id).toBe('z-1')
      expect(manifest.zones[0].x_percent).toBe(0)
      expect(manifest.zones[0].width_percent).toBe(70)
      expect(manifest.zones[0].channel_id).toBe('ch-1')
      expect(manifest.zones[1].x_percent).toBe(70)
      expect(manifest.zones[1].width_percent).toBe(30)
    })

    it('handles zones with x/y/width/height fallback fields', () => {
      const manifest = engine.loadFromConfig({
        channel_id: 'ch-1',
        name: 'Fallback',
        zones: [
          {
            zone_id: 'z-1',
            name: 'Zone',
            x: 10,
            y: 20,
            width: 80,
            height: 60,
          },
        ],
      })

      expect(manifest.zones[0].x_percent).toBe(10)
      expect(manifest.zones[0].y_percent).toBe(20)
      expect(manifest.zones[0].width_percent).toBe(80)
      expect(manifest.zones[0].height_percent).toBe(60)
    })

    it('transforms zone apps with sequence → order mapping', () => {
      const manifest = engine.loadFromConfig({
        channel_id: 'ch-1',
        name: 'With Apps',
        zones: [
          {
            zone_id: 'z-1',
            name: 'Main',
            x_percent: 0,
            y_percent: 0,
            width_percent: 100,
            height_percent: 100,
            apps: [
              {
                zone_app_id: 'za-1',
                app_id: 'app-1',
                sequence: 0,
                duration_seconds: 30,
                app: {
                  app_id: 'app-1',
                  name: 'Image App',
                  template_type: 'image',
                  config: {},
                  preview_url: 'https://example.com/preview.jpg',
                  content_url: 'https://s3.amazonaws.com/content.jpg',
                },
              },
              {
                zone_app_id: 'za-2',
                app_id: 'app-2',
                sequence: 1,
                duration_seconds: 15,
                app: null,
              },
            ],
          },
        ],
      })

      const apps = manifest.zones[0].apps!
      expect(apps).toHaveLength(2)
      expect(apps[0].zone_app_id).toBe('za-1')
      expect(apps[0].order).toBe(0) // sequence → order
      expect(apps[0].duration_seconds).toBe(30)
      expect((apps[0] as any).app).toBeTruthy()
      expect((apps[0] as any).app!.name).toBe('Image App')
      expect(apps[1].order).toBe(1)
      expect((apps[1] as any).app).toBeNull()
    })

    it('handles missing zones gracefully', () => {
      const manifest = engine.loadFromConfig({
        channel_id: 'ch-1',
        name: 'No Zones',
      })
      expect(manifest.zones).toHaveLength(0)
    })

    it('counts apps correctly', () => {
      const manifest = engine.loadFromConfig({
        channel_id: 'ch-1',
        name: 'Test',
        zones: [
          {
            zone_id: 'z-1',
            name: 'Zone',
            apps: [
              { zone_app_id: 'za-1', app_id: 'a1', sequence: 0, duration_seconds: 10 },
              { zone_app_id: 'za-2', app_id: 'a2', sequence: 1, duration_seconds: 20 },
            ],
          },
        ],
      })
      expect(manifest.zones[0].app_count).toBe(2)
    })

    it('stores manifest for later retrieval', () => {
      expect(engine.getCurrentManifest()).toBeNull()

      const manifest = engine.loadFromConfig({
        channel_id: 'ch-1',
        name: 'Test',
        zones: [],
      })

      expect(engine.getCurrentManifest()).toBe(manifest)
    })
  })

  describe('getUptime', () => {
    it('returns a positive number', () => {
      expect(engine.getUptime()).toBeGreaterThanOrEqual(0)
    })
  })
})
