import { useEffect, useState, useRef, useMemo } from 'react'
import { ChannelRenderer, IntegrationDataProvider } from '@signage/renderer'
import type { IntegrationDataFetcher } from '@signage/renderer'
import type { PlayerConfig, ChannelManifest } from '@signage/types'
import { PlayerEngine } from '../core/PlayerEngine'
import { useDeviceManager } from '../context'

interface PlaybackScreenProps {
  config: PlayerConfig
}

export function PlaybackScreen({ config }: PlaybackScreenProps) {
  const deviceManager = useDeviceManager()
  const [manifest, setManifest] = useState<ChannelManifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const engineRef = useRef<PlayerEngine | null>(null)

  useEffect(() => {
    if (!config.channel) return

    async function loadChannel() {
      try {
        setLoading(true)
        const engine = new PlayerEngine(deviceManager)
        engineRef.current = engine
        const channelManifest = await engine.loadChannel(config.channel!.manifest_url)
        setManifest(channelManifest)
        engine.startHeartbeat()
      } catch (err) {
        console.error('Failed to load channel:', err)
        setError('Failed to load channel content')
      } finally {
        setLoading(false)
      }
    }

    loadChannel()

    return () => {
      engineRef.current?.stopHeartbeat()
    }
  }, [config.channel, deviceManager])

  const integrationFetcher = useMemo<IntegrationDataFetcher | null>(() => {
    const engine = engineRef.current
    if (!engine) return null
    return {
      startFetch: (integrationId, resourceId, resourceType, refreshIntervalMs, onData) =>
        engine.startIntegrationDataFetch(integrationId, resourceId, resourceType, refreshIntervalMs, onData),
      stopFetch: (integrationId, resourceId, resourceType, onData) =>
        engine.stopIntegrationDataFetch(integrationId, resourceId, resourceType, onData),
    }
  }, [manifest]) // re-create when manifest loads (engine is ready)

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-primary rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-400">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error || !manifest) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-2xl font-semibold mb-2">Content Error</p>
          <p className="text-gray-400">{error || 'Failed to load content'}</p>
        </div>
      </div>
    )
  }

  return (
    <IntegrationDataProvider value={integrationFetcher}>
      <div className="h-full w-full bg-black">
        <ChannelRenderer
          manifest={manifest}
          onError={(zoneId, error) => {
            console.error(`Zone ${zoneId} error:`, error)
          }}
          onAppChange={(zoneId, appId) => {
            console.log(`Zone ${zoneId} now showing app ${appId}`)
          }}
        />
      </div>
    </IntegrationDataProvider>
  )
}
