'use client'

import { useState, useEffect, useRef, useMemo, CSSProperties } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClockConfig {
  format?: '12h' | '24h'
  show_seconds?: boolean
  show_date?: boolean
  timezone?: string
  date_format?: 'full' | 'long' | 'medium' | 'short' | 'iso'
  theme?: 'light' | 'dark' | 'transparent' | 'custom'
  background_color?: string
  text_color?: string
  font_size?: 'small' | 'medium' | 'large' | 'xlarge'
}

interface ClockRendererProps {
  config: ClockConfig
}

// ---------------------------------------------------------------------------
// CSS-only digit transition component
// ---------------------------------------------------------------------------

/** Renders a single character with a vertical slide transition on change. */
function AnimatedChar({ char }: { char: string }) {
  const [displayChar, setDisplayChar] = useState(char)
  const [animating, setAnimating] = useState(false)
  const prevChar = useRef(char)

  useEffect(() => {
    if (char !== prevChar.current) {
      setAnimating(true)
      const timeout = setTimeout(() => {
        setDisplayChar(char)
        setAnimating(false)
      }, 200) // match CSS transition duration
      prevChar.current = char
      return () => clearTimeout(timeout)
    }
  }, [char])

  // Separators (:, space, AM/PM letters) don't animate
  const isDigit = /\d/.test(char)
  if (!isDigit) {
    return <span style={{ display: 'inline-block' }}>{char}</span>
  }

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
        width: '0.62em', // monospace-ish width
        textAlign: 'center',
      }}
    >
      {/* Outgoing character */}
      <span
        style={{
          display: 'block',
          transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
          transform: animating ? 'translateY(-100%)' : 'translateY(0)',
          opacity: animating ? 0 : 1,
        }}
      >
        {displayChar}
      </span>
      {/* Incoming character */}
      {animating && (
        <span
          style={{
            display: 'block',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
            transform: 'translateY(0)',
            opacity: 1,
          }}
        >
          {char}
        </span>
      )}
    </span>
  )
}

/** Renders a string where each character animates independently. */
function AnimatedText({ text, style }: { text: string; style?: CSSProperties }) {
  return (
    <span style={{ ...style, display: 'inline-flex' }}>
      {text.split('').map((ch, i) => (
        <AnimatedChar key={i} char={ch} />
      ))}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Date formatting helpers
// ---------------------------------------------------------------------------

/** Safe formatToParts with fallback for older browsers (Chrome < 57). */
function safeFormatToParts(
  locale: string,
  opts: Intl.DateTimeFormatOptions,
  date: Date,
): Intl.DateTimeFormatPart[] {
  const formatter = new Intl.DateTimeFormat(locale, opts)
  if (typeof formatter.formatToParts === 'function') {
    return formatter.formatToParts(date)
  }
  // Fallback: parse the formatted string (less accurate but works on old browsers)
  const formatted = formatter.format(date)
  return [{ type: 'literal', value: formatted }]
}

function formatDateString(
  date: Date,
  dateFormat: ClockConfig['date_format'],
  timezone?: string,
): string {
  const tz = timezone && timezone !== 'local' ? timezone : undefined

  switch (dateFormat) {
    case 'iso': {
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...(tz && { timeZone: tz }),
      }
      const parts = safeFormatToParts('en-CA', opts, date)
      const y = parts.find((p) => p.type === 'year')?.value
      const m = parts.find((p) => p.type === 'month')?.value
      const d = parts.find((p) => p.type === 'day')?.value
      // If formatToParts wasn't available, fall back to formatting directly
      if (!y) {
        return new Intl.DateTimeFormat('en-CA', opts).format(date)
      }
      return `${y}-${m}-${d}`
    }
    case 'short': {
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...(tz && { timeZone: tz }),
      }
      return date.toLocaleDateString('en-US', opts)
    }
    case 'medium': {
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(tz && { timeZone: tz }),
      }
      return date.toLocaleDateString('en-US', opts)
    }
    case 'long': {
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(tz && { timeZone: tz }),
      }
      return date.toLocaleDateString('en-US', opts)
    }
    case 'full':
    default: {
      const opts: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(tz && { timeZone: tz }),
      }
      return date.toLocaleDateString('en-US', opts)
    }
  }
}

// ---------------------------------------------------------------------------
// Theme helpers
// ---------------------------------------------------------------------------

interface ThemeColors {
  bg: string
  text: string
  subtext: string
}

function resolveTheme(config: ClockConfig): ThemeColors {
  const { theme = 'dark', background_color, text_color } = config

  switch (theme) {
    case 'light':
      return { bg: '#ffffff', text: '#111827', subtext: '#6b7280' }
    case 'transparent':
      return { bg: 'transparent', text: '#ffffff', subtext: 'rgba(255,255,255,0.7)' }
    case 'custom':
      return {
        bg: background_color || '#000000',
        text: text_color || '#ffffff',
        subtext: text_color
          ? adjustAlpha(text_color, 0.65)
          : 'rgba(255,255,255,0.65)',
      }
    case 'dark':
    default:
      return { bg: '#0f172a', text: '#f1f5f9', subtext: '#94a3b8' }
  }
}

/** Produce an rgba version of a hex color with the given alpha. */
function adjustAlpha(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '')
  const bigint = parseInt(sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r},${g},${b},${alpha})`
}

// ---------------------------------------------------------------------------
// Font-size scaling
// ---------------------------------------------------------------------------

interface FontScale {
  time: string   // CSS clamp value
  date: string
  ampm: string
}

function resolveFontScale(size: ClockConfig['font_size']): FontScale {
  switch (size) {
    case 'small':
      return {
        time: 'clamp(1.5rem, 5vw, 3rem)',
        date: 'clamp(0.75rem, 2vw, 1rem)',
        ampm: 'clamp(0.75rem, 2vw, 1.25rem)',
      }
    case 'medium':
      return {
        time: 'clamp(2rem, 7vw, 4.5rem)',
        date: 'clamp(0.875rem, 2.5vw, 1.25rem)',
        ampm: 'clamp(0.875rem, 2.5vw, 1.5rem)',
      }
    case 'xlarge':
      return {
        time: 'clamp(4rem, 14vw, 10rem)',
        date: 'clamp(1.25rem, 4vw, 2.25rem)',
        ampm: 'clamp(1.25rem, 4vw, 2.75rem)',
      }
    case 'large':
    default:
      return {
        time: 'clamp(3rem, 10vw, 7rem)',
        date: 'clamp(1rem, 3vw, 1.75rem)',
        ampm: 'clamp(1rem, 3vw, 2rem)',
      }
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ClockRenderer({ config }: ClockRendererProps) {
  const [time, setTime] = useState(new Date())

  const {
    format = '12h',
    show_seconds = false,
    show_date = true,
    timezone,
    date_format = 'full',
    font_size = 'large',
  } = config

  // Tick every second
  useEffect(() => {
    // Align to the next whole second for accuracy
    const start = () => {
      setTime(new Date())
    }
    start()
    const interval = setInterval(start, 1000)
    return () => clearInterval(interval)
  }, [])

  // Resolve timezone option for Intl
  const tz = timezone && timezone !== 'local' ? timezone : undefined

  // Build time string
  const timeString = useMemo(() => {
    const opts: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12h',
      ...(show_seconds && { second: '2-digit' }),
      ...(tz && { timeZone: tz }),
    }
    let str = time.toLocaleTimeString('en-US', opts)
    // For 12h, split off AM/PM so we can style it separately
    if (format === '12h') {
      str = str.replace(/\s?(AM|PM)/i, '') // strip AM/PM, we render it separately
    }
    return str
  }, [time, format, show_seconds, tz])

  // AM/PM label (only for 12h)
  const ampmLabel = useMemo(() => {
    if (format !== '12h') return null
    const opts: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      hour12: true,
      ...(tz && { timeZone: tz }),
    }
    const parts = safeFormatToParts('en-US', opts, time)
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value?.toUpperCase()
    if (dayPeriod) return dayPeriod
    // Fallback: extract AM/PM from formatted string
    const formatted = time.toLocaleTimeString('en-US', opts)
    const match = formatted.match(/\b(AM|PM)\b/i)
    return match ? match[1].toUpperCase() : null
  }, [time, format, tz])

  // Date string
  const dateString = useMemo(() => {
    if (!show_date) return ''
    return formatDateString(time, date_format, timezone)
  }, [time, show_date, date_format, timezone])

  // Theme colors
  const colors = useMemo(() => resolveTheme(config), [config])

  // Font scale
  const fonts = useMemo(() => resolveFontScale(font_size), [font_size])

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily:
      "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    overflow: 'hidden',
    padding: '1rem',
    boxSizing: 'border-box',
  }

  const timeRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.15em',
    fontSize: fonts.time,
    fontWeight: 200,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  }

  const ampmStyle: CSSProperties = {
    fontSize: fonts.ampm,
    fontWeight: 400,
    opacity: 0.7,
    marginLeft: '0.2em',
    letterSpacing: '0.05em',
  }

  const dateStyle: CSSProperties = {
    marginTop: '0.5em',
    fontSize: fonts.date,
    fontWeight: 400,
    color: colors.subtext,
    letterSpacing: '0.02em',
    textAlign: 'center',
  }

  const separatorStyle: CSSProperties = {
    display: 'inline-block',
    width: '0.35em',
    textAlign: 'center',
    animation: 'clockBlink 1s step-end infinite',
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Split time into segments around ":" for blinking separator
  const timeSegments = timeString.split(':')

  return (
    <div style={containerStyle}>
      {/* Inject keyframe animation for colon blink */}
      <style>{`
        @keyframes clockBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div style={timeRowStyle}>
        {timeSegments.map((segment, idx) => (
          <span key={idx} style={{ display: 'inline-flex', alignItems: 'baseline' }}>
            <AnimatedText text={segment} />
            {idx < timeSegments.length - 1 && (
              <span style={separatorStyle}>:</span>
            )}
          </span>
        ))}
        {ampmLabel && <span style={ampmStyle}>{ampmLabel}</span>}
      </div>

      {show_date && dateString && (
        <div style={dateStyle}>{dateString}</div>
      )}
    </div>
  )
}
