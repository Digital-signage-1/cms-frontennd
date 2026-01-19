interface PairingScreenProps {
  code: string | null
}

export function PairingScreen({ code }: PairingScreenProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
          <span className="text-2xl font-bold">S</span>
        </div>
        <span className="text-3xl font-semibold">SignageOS Player</span>
      </div>

      <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-12">
        {code ? (
          <>
            <p className="text-center text-lg text-gray-400 mb-6">
              Enter this code in your dashboard
            </p>
            <div className="flex justify-center gap-3">
              {code.split('').map((char, i) => (
                <div
                  key={i}
                  className="flex h-20 w-16 items-center justify-center rounded-xl bg-white/10 text-4xl font-bold tracking-wider"
                >
                  {char}
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-gray-500">
              This code will expire in 15 minutes
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Generating pairing code...</p>
          </div>
        )}
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p className="text-sm">
          Open{' '}
          <span className="font-medium text-white">app.signageos.com</span>
          {' '}and go to Players → Register Player
        </p>
      </div>
    </div>
  )
}
