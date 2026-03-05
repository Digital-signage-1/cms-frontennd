'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface AudioRendererProps {
  config: {
    url?: string
    autoplay?: boolean
    loop?: boolean
    volume?: number
    show_visualizer?: boolean
    background_color?: string
    accent_color?: string
  }
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
  onEnded?: () => void
}

export function AudioRenderer({
  config,
  contentUrl,
  onError,
  onLoad,
  onEnded,
}: AudioRendererProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number>(0)
  const contextRef = useRef<AudioContext | null>(null)

  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [playing, setPlaying] = useState(false)

  const audioUrl = config.url || contentUrl
  const autoplay = config.autoplay !== false
  const loop = config.loop !== false
  const volume = (config.volume ?? 75) / 100
  const showVisualizer = config.show_visualizer !== false
  const bgColor = config.background_color || '#0f172a'
  const accentColor = config.accent_color || '#8b5cf6'

  // Set up Web Audio API analyser for visualizer
  const setupAnalyser = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !showVisualizer || contextRef.current) return

    try {
      const ctx = new AudioContext()
      const source = ctx.createMediaElementSource(audio)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      source.connect(analyser)
      analyser.connect(ctx.destination)
      contextRef.current = ctx
      analyserRef.current = analyser
    } catch {
      // Web Audio not available
    }
  }, [showVisualizer])

  // Visualizer animation loop
  useEffect(() => {
    if (!showVisualizer || !playing) return

    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const barCount = Math.min(bufferLength, 48)
      const barWidth = (width / barCount) * 0.7
      const gap = (width / barCount) * 0.3

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] / 255
        const barHeight = Math.max(value * height * 0.8, 2)
        const x = i * (barWidth + gap) + gap / 2
        const y = (height - barHeight) / 2

        ctx.fillStyle = accentColor
        ctx.globalAlpha = 0.3 + value * 0.7
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 3)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    draw()
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [showVisualizer, playing, accentColor])

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1)
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleCanPlay = () => {
      setLoaded(true)
      audio.volume = volume
      onLoad?.()
      if (autoplay) {
        setupAnalyser()
        audio.play().then(() => setPlaying(true)).catch(() => {})
      }
    }
    const handleError = () => {
      setError(true)
      onError?.(new Error('Failed to load audio'))
    }
    const handleEnded = () => {
      setPlaying(false)
      onEnded?.()
    }
    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)

    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [autoplay, volume, onError, onLoad, onEnded, setupAnalyser])

  // Cleanup audio context
  useEffect(() => {
    return () => {
      contextRef.current?.close().catch(() => {})
    }
  }, [])

  if (!audioUrl) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor, color: '#6B7280' }}>
        <span style={{ fontSize: 14 }}>No audio file configured</span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor, color: '#EF4444' }}>
        <span style={{ fontSize: 14 }}>Failed to load audio</span>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      )}

      {showVisualizer && (
        <canvas
          ref={canvasRef}
          style={{ width: '80%', height: '60%', opacity: loaded ? 1 : 0, transition: 'opacity 300ms' }}
        />
      )}

      {!showVisualizer && loaded && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              {playing
                ? <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>
                : <polygon points="5,3 19,12 5,21" />
              }
            </svg>
          </div>
          <span style={{ color: '#9CA3AF', fontSize: 13 }}>
            {playing ? 'Playing...' : 'Paused'}
          </span>
        </div>
      )}

      <audio
        ref={audioRef}
        src={audioUrl}
        loop={loop}
        preload="auto"
        crossOrigin="anonymous"
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
