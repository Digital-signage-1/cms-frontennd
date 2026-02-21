import { useState, useRef, useEffect } from 'react'

interface PairingScreenProps {
  onPair: (code: string) => Promise<void>
}

export function PairingScreen({ onPair }: PairingScreenProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function handleChange(index: number, value: string) {
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = char
    setDigits(newDigits)
    setError(null)

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (char && index === 5) {
      const code = newDigits.join('')
      if (code.length === 6) {
        handleSubmit(code)
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      const code = digits.join('')
      if (code.length === 6) {
        handleSubmit(code)
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    if (pasted.length > 0) {
      const newDigits = [...digits]
      for (let i = 0; i < pasted.length && i < 6; i++) {
        newDigits[i] = pasted[i]
      }
      setDigits(newDigits)
      const nextIndex = Math.min(pasted.length, 5)
      inputRefs.current[nextIndex]?.focus()

      if (pasted.length === 6) {
        handleSubmit(pasted)
      }
    }
  }

  async function handleSubmit(code: string) {
    setLoading(true)
    setError(null)
    try {
      await onPair(code)
    } catch (err: any) {
      setError(err.message || 'Failed to pair device')
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="mb-8 flex items-center space-x-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
          <span className="text-2xl font-bold">S</span>
        </div>
        <span className="text-3xl font-semibold">SignageOS Player</span>
      </div>

      <div className="glass-card p-12">
        <p className="text-center text-lg text-gray-400 mb-6">
          Enter the pairing code from your dashboard
        </p>
        <div className="flex justify-center space-x-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              disabled={loading}
              className="flex h-20 w-16 items-center justify-center rounded-xl bg-white/10 text-center text-4xl font-bold tracking-wider text-white outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          ))}
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        )}

        {loading && (
          <div className="mt-6 flex justify-center">
            <div className="w-8 h-8 border-3 border-gray-700 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Create a player in your dashboard to get a pairing code
        </p>
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p className="text-sm">
          Open your{' '}
          <span className="font-medium text-white">dashboard</span>
          {' '}and go to Players &rarr; Add Player
        </p>
      </div>
    </div>
  )
}
