import { useEffect, useState } from 'react'
import { DeviceManager } from './core/DeviceManager'
import { DeviceManagerContext } from './context'
import { WaitingScreen } from './screens/WaitingScreen'
import { PlaybackScreen } from './screens/PlaybackScreen'
import type { PlayerConfig } from '@signage/types'

interface PlayerViewProps {
  playerId: string
  deviceToken: string
}

export function PlayerView({ playerId, deviceToken }: PlayerViewProps) {
  const [deviceManager] = useState(() => new DeviceManager(playerId, deviceToken))
  const [config, setConfig] = useState<PlayerConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const playerConfig = await deviceManager.fetchConfig()
        if (!cancelled) {
          setConfig(playerConfig)
        }
      } catch (err) {
        console.error('Failed to fetch config:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [deviceManager])

  useEffect(() => {
    const handleRefresh = async () => {
      try {
        const playerConfig = await deviceManager.fetchConfig()
        setConfig(playerConfig)
      } catch {
        // keep current state
      }
    }
    window.addEventListener('player:refresh-needed', handleRefresh)
    return () => window.removeEventListener('player:refresh-needed', handleRefresh)
  }, [deviceManager])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <DeviceManagerContext.Provider value={deviceManager}>
      {config?.channel ? (
        <PlaybackScreen config={config} />
      ) : (
        <WaitingScreen playerName={config?.player_id || playerId} />
      )}
    </DeviceManagerContext.Provider>
  )
}
