import { DeviceManager } from './core/DeviceManager'
import { parseRoute, getTokenFromUrl, navigateToPlayer } from './router'
import { PlayerView } from './PlayerView'
import { PairingFlow } from './PairingFlow'

export function App() {
  // One-time migration: if old localStorage data exists, redirect to URL-based player
  const migrated = DeviceManager.migrateFromLocalStorage()
  if (migrated) {
    navigateToPlayer(migrated.playerId, migrated.deviceToken)
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const route = parseRoute()

  if (route.type === 'player') {
    const token = getTokenFromUrl()
    if (!token) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-black text-white">
          <div className="text-center">
            <p className="text-2xl font-semibold mb-2">Missing Token</p>
            <p className="text-gray-400">This player URL is missing the authentication token.</p>
            <p className="text-gray-500 text-sm mt-2">Re-pair the device from the dashboard to get a valid URL.</p>
            <a
              href="/"
              className="mt-4 inline-block px-6 py-2 bg-primary rounded-lg text-black font-semibold"
            >
              Go to Pairing
            </a>
          </div>
        </div>
      )
    }
    return <PlayerView playerId={route.playerId} deviceToken={token} />
  }

  return <PairingFlow />
}
