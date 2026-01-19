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

  async function initializePlayer() {
    const deviceManager = DeviceManager.getInstance()
    
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
    } else {
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
  }

  if (state === 'error') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-2xl font-semibold mb-2">Connection Error</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
