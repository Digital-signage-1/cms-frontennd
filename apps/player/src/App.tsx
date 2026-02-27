import { useEffect, useState } from 'react'
import { PairingScreen } from './screens/PairingScreen'
import { WaitingScreen } from './screens/WaitingScreen'
import { PlaybackScreen } from './screens/PlaybackScreen'
import { DeviceManager } from './core/DeviceManager'
import type { PlayerConfig } from '@signage/types'

type PlayerState = 'pairing' | 'waiting' | 'playing' | 'error'

export function App() {
  const [state, setState] = useState<PlayerState>('pairing')
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [config, setConfig] = useState<PlayerConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializePlayer()
  }, [])

  useEffect(() => {
    const handleRefresh = async () => {
      const deviceManager = DeviceManager.getInstance()
      if (!deviceManager.isPaired()) return
      try {
        const playerConfig = await deviceManager.fetchConfig()
        setConfig(playerConfig)
        if (playerConfig?.channel) {
          setState('playing')
        } else {
          setState('waiting')
        }
      } catch {
        setState('waiting')
      }
    }
    window.addEventListener('player:refresh-needed', handleRefresh)
    return () => window.removeEventListener('player:refresh-needed', handleRefresh)
  }, [])

  async function initializePlayer() {
    const deviceManager = DeviceManager.getInstance()

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlPlayerId = params.get('player_id')
      const urlDeviceToken = params.get('device_token')
      if (urlPlayerId && urlDeviceToken) {
        deviceManager.setPairedFromUrl(urlPlayerId, urlDeviceToken)
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    if (deviceManager.isPaired()) {
      setState('waiting')
      try {
        const playerConfig = await deviceManager.fetchConfig()
        if (playerConfig?.channel) {
          setConfig(playerConfig)
          setState('playing')
        } else {
          setState('waiting')
        }
      } catch (err) {
        console.error('Failed to fetch config:', err)
        setState('waiting')
      }
      return
    }

    try {
      const code = await deviceManager.requestPairingCode()
      setPairingCode(code)
      setState('pairing')

      deviceManager.onPaired((playerConfig) => {
        setConfig(playerConfig)
        if (playerConfig.channel) {
          setState('playing')
        } else {
          setState('waiting')
        }
      })
    } catch (err) {
      setError('Failed to get pairing code')
      setState('error')
    }
  }

  if (state === 'error') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-2xl font-semibold mb-2">Connection Error</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => { setError(null); initializePlayer(); }}
            className="mt-4 px-6 py-2 bg-primary rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (state === 'pairing') {
    return <PairingScreen code={pairingCode} />
  }

  if (state === 'waiting') {
    return <WaitingScreen playerName={config?.player_id || 'Player'} />
  }

  if (state === 'playing' && config?.channel) {
    return <PlaybackScreen config={config} />
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin" />
    </div>
  )
}
