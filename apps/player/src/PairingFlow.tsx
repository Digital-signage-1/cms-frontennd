import { useEffect, useState } from 'react'
import { DeviceManager } from './core/DeviceManager'
import { PairingScreen } from './screens/PairingScreen'
import { navigateToPlayer } from './router'

export function PairingFlow() {
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deviceManager] = useState(() => new DeviceManager())

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const code = await deviceManager.requestPairingCode()
        if (!cancelled) setPairingCode(code)

        deviceManager.onPaired((playerId, deviceToken) => {
          navigateToPlayer(playerId, deviceToken)
        })
      } catch {
        if (!cancelled) setError('Failed to get pairing code')
      }
    }

    start()
    return () => {
      cancelled = true
      deviceManager.stopPolling()
    }
  }, [deviceManager])

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-2xl font-semibold mb-2">Connection Error</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => { setError(null); window.location.reload() }}
            className="mt-4 px-6 py-2 bg-primary rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <PairingScreen code={pairingCode} />
}
