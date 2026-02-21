import { useEffect, useMemo } from 'react'
import { ChannelRenderer } from '@signage/renderer'
import type { PlayerConfig } from '@signage/types'
import { PlayerEngine } from '../core/PlayerEngine'

interface PlaybackScreenProps {
  config: PlayerConfig
}

export function PlaybackScreen({ config }: PlaybackScreenProps) {
  const engine = PlayerEngine.getInstance()

  const manifest = useMemo(() => {
    if (!config.channel) return null
    return engine.loadFromConfig(config.channel)
  }, [config.channel])

  useEffect(() => {
    engine.startHeartbeat()
    return () => {
      engine.stopHeartbeat()
    }
  }, [])

  if (!manifest) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-2xl font-semibold mb-2">No Content</p>
          <p className="text-gray-400">No channel assigned to this player</p>
        </div>
      </div>
    )
  }

  return (
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
  )
}
