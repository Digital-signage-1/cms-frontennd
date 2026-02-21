import { useEffect, useState, useCallback, useRef } from 'react'
import { PairingScreen } from './screens/PairingScreen'
import { WaitingScreen } from './screens/WaitingScreen'
import { PlaybackScreen } from './screens/PlaybackScreen'
import { DeviceManager } from './core/DeviceManager'
import { SocketManager } from './core/SocketManager'

type PlayerState = 'loading' | 'pairing' | 'waiting' | 'playing' | 'error'

export function App() {
  const [state, setState] = useState<PlayerState>('loading')
  const [config, setConfig] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const socketInitialized = useRef(false)

  function connectSocket() {
    if (socketInitialized.current) return

    const deviceManager = DeviceManager.getInstance()
    const playerId = deviceManager.getPlayerId()
    const deviceToken = deviceManager.getDeviceToken()
    if (!playerId || !deviceToken) return

    const socketManager = SocketManager.getInstance()

    socketManager.onChannelUpdate = (manifest) => {
      // Server pushed a new channel manifest — apply it
      setConfig((prev: any) => ({ ...prev, channel: manifest }))
      setState('playing')
    }

    socketManager.onCommand = (cmd) => {
      const type = cmd?.command_type
      if (type === 'refresh') {
        // Re-fetch config from REST
        deviceManager.fetchConfig().then((playerConfig) => {
          setConfig(playerConfig)
          setState(playerConfig?.channel ? 'playing' : 'waiting')
        }).catch(console.error)
      } else if (type === 'restart') {
        window.location.reload()
      }
      // Acknowledge the command
      socketManager.emit('command_ack', {
        command_id: cmd?.command_id,
        status: 'completed',
      })
    }

    socketManager.connect(playerId, deviceToken)
    socketInitialized.current = true
  }

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
          setConfig(playerConfig)
          setState('waiting')
        }
      } catch (err) {
        console.error('Failed to fetch config:', err)
        setState('waiting')
      }
      // Connect WebSocket after initial config load
      connectSocket()
    } else {
      setState('pairing')
    }
  }

  const handlePair = useCallback(async (code: string) => {
    const deviceManager = DeviceManager.getInstance()
    await deviceManager.pairWithCode(code)

    // After pairing, fetch config
    setState('waiting')
    try {
      const playerConfig = await deviceManager.fetchConfig()
      if (playerConfig?.channel) {
        setConfig(playerConfig)
        setState('playing')
      } else {
        setConfig(playerConfig)
        setState('waiting')
      }
    } catch (err) {
      console.error('Failed to fetch config after pairing:', err)
      setState('waiting')
    }
    // Connect WebSocket after pairing
    connectSocket()
  }, [])

  if (state === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin" />
      </div>
    )
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
    return <PairingScreen onPair={handlePair} />
  }

  if (state === 'waiting') {
    return <WaitingScreen playerName={config?.player?.name || 'Player'} />
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
