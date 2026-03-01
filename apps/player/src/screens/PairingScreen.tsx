import { useState, useEffect } from 'react'

interface PairingScreenProps {
  code: string | null
}

export function PairingScreen({ code }: PairingScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(15 * 60)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!code) return
    setSecondsLeft(15 * 60)
    const interval = setInterval(() => {
      setSecondsLeft(s => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [code])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleCopy = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const chars = code ? code.split('') : []

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#F5A624', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#000000', lineHeight: 1 }}>S</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.01em' }}>SignageOS</span>
      </div>

      {/* ── Card ── */}
      <div style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '44px 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 520 }}>

        {code ? (
          <>
            {/* Label */}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F5A624', marginBottom: 12 }}>
              DEVICE PAIRING
            </p>

            {/* Heading */}
            <h1 style={{ fontSize: 40, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px', fontFamily: 'Georgia, serif', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              Verification Code
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 36, textAlign: 'center' }}>
              Enter this code in your dashboard to pair this device
            </p>

            {/* Code boxes with dot separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
              {chars.map((char, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 60, height: 72, backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: 0 }}>{char}</span>
                  </div>
                  {/* Dot separator after 3rd char */}
                  {i === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginLeft: 4, marginRight: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#4B5563' }} />
                      <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#4B5563' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Timer pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,166,36,0.12)', border: '1px solid rgba(245,166,36,0.25)', borderRadius: 100, padding: '8px 16px', marginBottom: 16 }}>
              {/* Animated ring */}
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(245,166,36,0.25)" strokeWidth="2" />
                <circle
                  cx="8" cy="8" r="6"
                  fill="none"
                  stroke="#F5A624"
                  strokeWidth="2"
                  strokeDasharray="37.7"
                  strokeDashoffset={37.7 * (1 - secondsLeft / (15 * 60))}
                  strokeLinecap="round"
                  transform="rotate(-90 8 8)"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F5A624' }}>
                Expires in {formatTime(secondsLeft)}
              </span>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px', borderRadius: 100, backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.10)', color: copied ? '#F5A624' : '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {/* Copy icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? 'Copied!' : 'Copy code'}
            </button>
          </>
        ) : (
          <>
            {/* Loading state */}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F5A624', marginBottom: 24 }}>
              DEVICE PAIRING
            </p>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(245,166,36,0.2)', borderTop: '3px solid #F5A624', marginBottom: 16 }} className="animate-spin" />
            <p style={{ fontSize: 14, color: '#6B7280' }}>Generating pairing code...</p>
          </>
        )}
      </div>

      {/* ── Bottom breadcrumb ── */}
      <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* URL badge */}
        <div style={{ backgroundColor: 'rgba(245,166,36,0.12)', border: '1px solid rgba(245,166,36,0.20)', borderRadius: 6, padding: '4px 10px' }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#F5A624', letterSpacing: '0.02em' }}>app.signageos.com</span>
        </div>
        <span style={{ fontSize: 12, color: '#4B5563' }}>›</span>
        <span style={{ fontSize: 12, color: '#4B5563' }}>Players</span>
        <span style={{ fontSize: 12, color: '#4B5563' }}>›</span>
        <span style={{ fontSize: 12, color: '#6B7280' }}>Register Player</span>

        <div style={{ width: 1, height: 12, backgroundColor: '#2A2A2A', margin: '0 4px' }} />

        {/* Status dot */}
        <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22C55E', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#6B7280' }}>Waiting for connection</span>
      </div>
    </div>
  )
}
