interface WaitingScreenProps {
  playerName: string
}

export function WaitingScreen({ playerName }: WaitingScreenProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
          <span className="text-2xl font-bold">S</span>
        </div>
        <span className="text-3xl font-semibold">SignageOS Player</span>
      </div>

      <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-12 text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mb-4">
            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Player Connected</h2>
          <p className="text-gray-400">{playerName}</p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-gray-400 mb-2">Status: Online</p>
          <p className="text-sm text-gray-500">
            No channel assigned to this player yet.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Assign a channel from the dashboard to start displaying content.
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm">Connected to server</span>
      </div>
    </div>
  )
}
