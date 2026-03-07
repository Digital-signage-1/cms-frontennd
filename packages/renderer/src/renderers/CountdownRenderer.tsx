'use client'

import { useState, useEffect, useRef, useMemo, CSSProperties } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CountdownConfig {
  target_date: string
  target_time?: string
  title?: string
  subtitle?: string
  completed_message?: string
  show_days?: boolean
  show_hours?: boolean
  show_minutes?: boolean
  show_seconds?: boolean
  theme?: 'dark' | 'light' | 'transparent' | 'gradient'
  layout?: 'standard' | 'compact' | 'large' | 'minimal'
  background_color?: string
  text_color?: string
  accent_color?: string
}

interface CountdownRendererProps {
  config: CountdownConfig
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  completed: boolean
}

// ---------------------------------------------------------------------------
// CSS-only animated digit component
// ---------------------------------------------------------------------------

function AnimatedDigit({ value, color }: { value: string; color: string }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [animating, setAnimating] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (value !== prevValue.current) {
      setAnimating(true)
      const timeout = setTimeout(() => {
        setDisplayValue(value)
        setAnimating(false)
      }, 250)
      prevValue.current = value
      return () => clearTimeout(timeout)
    }
  }, [value])

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
        width: '0.65em',
        textAlign: 'center',
        color,
      }}
    >
      <span
        style={{
          display: 'block',
          transition: 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out',
          transform: animating ? 'translateY(-100%)' : 'translateY(0)',
          opacity: animating ? 0 : 1,
        }}
      >
        {displayValue}
      </span>
      {animating && (
        <span
          style={{
            display: 'block',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            transition: 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out',
            transform: 'translateY(0)',
            opacity: 1,
          }}
        >
          {value}
        </span>
      )}
    </span>
  )
}

function AnimatedNumber({ value, digits, color }: { value: number; digits: number; color: string }) {
  const padded = String(value).padStart(digits, '0')
  return (
    <span style={{ display: 'inline-flex' }}>
      {padded.split('').map((ch, i) => (
        <AnimatedDigit key={i} value={ch} color={color} />
      ))}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Time calculation
// ---------------------------------------------------------------------------

function calculateTimeRemaining(targetDate: string, targetTime?: string): TimeRemaining {
  const dateStr = targetTime ? `${targetDate}T${targetTime}` : `${targetDate}T00:00:00`
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, completed: false }
}

// ---------------------------------------------------------------------------
// Theme helpers
// ---------------------------------------------------------------------------

interface ThemeColors {
  bg: string
  text: string
  subtext: string
  accent: string
  boxBg: string
  boxBorder: string
}

function resolveTheme(config: CountdownConfig): ThemeColors {
  const {
    theme = 'dark',
    background_color = '#1a1a2e',
    text_color = '#ffffff',
    accent_color = '#f59e0b',
  } = config

  switch (theme) {
    case 'light':
      return {
        bg: '#ffffff',
        text: '#111827',
        subtext: '#6b7280',
        accent: accent_color,
        boxBg: '#f3f4f6',
        boxBorder: '#e5e7eb',
      }
    case 'transparent':
      return {
        bg: 'transparent',
        text: text_color,
        subtext: adjustAlpha(text_color, 0.6),
        accent: accent_color,
        boxBg: 'rgba(255,255,255,0.1)',
        boxBorder: 'rgba(255,255,255,0.2)',
      }
    case 'gradient':
      return {
        bg: `linear-gradient(135deg, ${background_color} 0%, ${adjustBrightness(background_color, 40)} 100%)`,
        text: text_color,
        subtext: adjustAlpha(text_color, 0.7),
        accent: accent_color,
        boxBg: 'rgba(255,255,255,0.1)',
        boxBorder: 'rgba(255,255,255,0.15)',
      }
    case 'dark':
    default:
      return {
        bg: background_color,
        text: text_color,
        subtext: adjustAlpha(text_color, 0.6),
        accent: accent_color,
        boxBg: 'rgba(255,255,255,0.08)',
        boxBorder: 'rgba(255,255,255,0.12)',
      }
  }
}

function adjustAlpha(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '')
  const bigint = parseInt(sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r},${g},${b},${alpha})`
}

function adjustBrightness(hex: string, amount: number): string {
  const sanitized = hex.replace('#', '')
  const bigint = parseInt(sanitized, 16)
  const r = Math.min(255, ((bigint >> 16) & 255) + amount)
  const g = Math.min(255, ((bigint >> 8) & 255) + amount)
  const b = Math.min(255, (bigint & 255) + amount)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// ---------------------------------------------------------------------------
// Layout scaling
// ---------------------------------------------------------------------------

interface LayoutScale {
  numberSize: string
  labelSize: string
  titleSize: string
  subtitleSize: string
  boxPaddingH: string
  boxPaddingV: string
  gap: string
  boxRadius: string
}

/** CSS clamp() with vw-based fallback for older browsers that don't support clamp(). */
function safeClamp(min: string, preferred: string, max: string): string {
  return `clamp(${min}, ${preferred}, ${max})`
}

function resolveLayout(layout: CountdownConfig['layout']): LayoutScale {
  switch (layout) {
    case 'compact':
      return {
        numberSize: safeClamp('1.5rem', '4vw', '3rem'),
        labelSize: safeClamp('0.5rem', '1.2vw', '0.7rem'),
        titleSize: safeClamp('0.8rem', '2vw', '1.2rem'),
        subtitleSize: safeClamp('0.6rem', '1.5vw', '0.9rem'),
        boxPaddingH: safeClamp('0.5rem', '1.5vw', '1rem'),
        boxPaddingV: safeClamp('0.3rem', '1vw', '0.6rem'),
        gap: safeClamp('0.3rem', '1vw', '0.6rem'),
        boxRadius: '0.4rem',
      }
    case 'large':
      return {
        numberSize: safeClamp('4rem', '12vw', '10rem'),
        labelSize: safeClamp('0.8rem', '2vw', '1.2rem'),
        titleSize: safeClamp('1.5rem', '4vw', '2.5rem'),
        subtitleSize: safeClamp('1rem', '2.5vw', '1.5rem'),
        boxPaddingH: safeClamp('1.5rem', '4vw', '3rem'),
        boxPaddingV: safeClamp('1rem', '3vw', '2rem'),
        gap: safeClamp('0.8rem', '2.5vw', '1.5rem'),
        boxRadius: '1rem',
      }
    case 'minimal':
      return {
        numberSize: safeClamp('2.5rem', '8vw', '6rem'),
        labelSize: safeClamp('0.6rem', '1.5vw', '0.9rem'),
        titleSize: safeClamp('1rem', '3vw', '1.8rem'),
        subtitleSize: safeClamp('0.75rem', '2vw', '1.1rem'),
        boxPaddingH: '0',
        boxPaddingV: '0',
        gap: safeClamp('0.8rem', '2.5vw', '1.5rem'),
        boxRadius: '0',
      }
    case 'standard':
    default:
      return {
        numberSize: safeClamp('2.5rem', '7vw', '5.5rem'),
        labelSize: safeClamp('0.6rem', '1.5vw', '0.85rem'),
        titleSize: safeClamp('1rem', '3vw', '1.8rem'),
        subtitleSize: safeClamp('0.75rem', '2vw', '1.1rem'),
        boxPaddingH: safeClamp('1rem', '3vw', '2rem'),
        boxPaddingV: safeClamp('0.6rem', '2vw', '1.2rem'),
        gap: safeClamp('0.5rem', '2vw', '1rem'),
        boxRadius: '0.75rem',
      }
  }
}

// ---------------------------------------------------------------------------
// Unit box component
// ---------------------------------------------------------------------------

function UnitBox({
  value,
  label,
  accentColor,
  textColor,
  scale,
  isMinimal,
  boxBg,
  boxBorder,
}: {
  value: number
  label: string
  accentColor: string
  textColor: string
  scale: LayoutScale
  isMinimal: boolean
  boxBg: string
  boxBorder: string
}) {
  const digits = label === 'Days' && value >= 100 ? 3 : 2

  const boxStyle: CSSProperties = isMinimal
    ? {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25em',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25em',
        background: boxBg,
        border: `1px solid ${boxBorder}`,
        borderRadius: scale.boxRadius,
        padding: `${scale.boxPaddingV} ${scale.boxPaddingH}`,
      }

  return (
    <div style={boxStyle}>
      <span
        style={{
          fontSize: scale.numberSize,
          fontWeight: 700,
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <AnimatedNumber value={value} digits={digits} color={accentColor} />
      </span>
      <span
        style={{
          fontSize: scale.labelSize,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: textColor,
          opacity: 0.7,
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Separator between boxes
// ---------------------------------------------------------------------------

function Separator({ color, size }: { color: string; size: string }) {
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 700,
        color,
        opacity: 0.4,
        alignSelf: 'center',
        marginTop: '-0.3em',
        userSelect: 'none',
      }}
    >
      :
    </span>
  )
}

// ---------------------------------------------------------------------------
// Completed state
// ---------------------------------------------------------------------------

function CompletedView({
  message,
  colors,
  scale,
}: {
  message: string
  colors: ThemeColors
  scale: LayoutScale
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        animation: 'countdownCelebrate 0.6s ease-out',
      }}
    >
      <span
        style={{
          fontSize: scale.titleSize,
          fontWeight: 300,
          color: colors.accent,
          animation: 'countdownPulse 2s ease-in-out infinite',
        }}
      >
        {message}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CountdownRenderer({ config }: CountdownRendererProps) {
  const {
    target_date,
    target_time,
    title,
    subtitle,
    completed_message = 'Event Started!',
    show_days = true,
    show_hours = true,
    show_minutes = true,
    show_seconds = true,
    layout = 'standard',
  } = config

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(target_date, target_time)
  )

  useEffect(() => {
    if (!target_date) return

    const tick = () => setTimeRemaining(calculateTimeRemaining(target_date, target_time))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [target_date, target_time])

  const colors = useMemo(() => resolveTheme(config), [config])
  const scale = useMemo(() => resolveLayout(layout), [layout])
  const isMinimal = layout === 'minimal'
  const isGradient = config.theme === 'gradient'

  // Build visible units
  const units: Array<{ value: number; label: string }> = []
  if (show_days) units.push({ value: timeRemaining.days, label: 'Days' })
  if (show_hours) units.push({ value: timeRemaining.hours, label: 'Hours' })
  if (show_minutes) units.push({ value: timeRemaining.minutes, label: 'Minutes' })
  if (show_seconds) units.push({ value: timeRemaining.seconds, label: 'Seconds' })

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
    fontFamily:
      "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    overflow: 'hidden',
    padding: '1rem',
    boxSizing: 'border-box',
    color: colors.text,
    ...(isGradient
      ? { background: colors.bg }
      : { backgroundColor: colors.bg }),
  }

  const titleStyle: CSSProperties = {
    fontSize: scale.titleSize,
    fontWeight: 300,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '0.5em',
    textAlign: 'center',
    color: colors.text,
  }

  const subtitleStyle: CSSProperties = {
    fontSize: scale.subtitleSize,
    fontWeight: 400,
    color: colors.subtext,
    marginTop: '0.8em',
    textAlign: 'center',
  }

  const unitsRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale.gap,
    flexWrap: 'wrap',
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!target_date) {
    return (
      <div style={containerStyle}>
        <span style={{ color: colors.subtext, fontSize: scale.labelSize }}>
          No target date configured
        </span>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Keyframe animations */}
      <style>{`
        @keyframes countdownPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes countdownCelebrate {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {timeRemaining.completed ? (
        <CompletedView
          message={completed_message}
          colors={colors}
          scale={scale}
        />
      ) : (
        <>
          {title && <div style={titleStyle}>{title}</div>}

          <div style={unitsRowStyle}>
            {units.map((unit, idx) => (
              <span key={unit.label} style={{ display: 'inline-flex', alignItems: 'center', gap: scale.gap }}>
                <UnitBox
                  value={unit.value}
                  label={unit.label}
                  accentColor={colors.accent}
                  textColor={colors.text}
                  scale={scale}
                  isMinimal={isMinimal}
                  boxBg={colors.boxBg}
                  boxBorder={colors.boxBorder}
                />
                {idx < units.length - 1 && !isMinimal && (
                  <Separator color={colors.accent} size={scale.numberSize} />
                )}
              </span>
            ))}
          </div>

          {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
        </>
      )}
    </div>
  )
}
