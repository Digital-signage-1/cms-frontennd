'use client'

import { useState, useEffect, useRef } from 'react'

interface EventItem {
  title?: string
  time_start?: string
  time_end?: string
  room?: string
  host?: string
  description?: string
  featured?: boolean
}

interface EventBoardConfig {
  title?: string
  venue_name?: string
  layout?: string
  theme?: string
  highlight_current?: boolean
  events?: EventItem[]
}

interface RendererProps {
  config: Record<string, any>
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

const THEMES: Record<string, { bg: string; text: string; accent: string; card: string; border: string }> = {
  'hotel-luxury': { bg: '#0f1b35', text: '#f0e6cc', accent: '#c9a84c', card: 'rgba(255,255,255,0.07)', border: 'rgba(201,168,76,0.3)' },
  'corporate': { bg: '#1a2744', text: '#e8eaf6', accent: '#4f8ef7', card: 'rgba(255,255,255,0.08)', border: 'rgba(79,142,247,0.3)' },
  'dark': { bg: '#111827', text: '#f9fafb', accent: '#6366f1', card: 'rgba(255,255,255,0.07)', border: 'rgba(99,102,241,0.3)' },
  'light': { bg: '#f9fafb', text: '#111827', accent: '#4f46e5', card: 'rgba(0,0,0,0.04)', border: 'rgba(79,70,229,0.2)' },
}

function parseHHMM(t: string): number {
  var parts = (t || '00:00').split(':')
  return parseInt(parts[0] || '0', 10) * 60 + (parseInt(parts[1] || '0', 10))
}

function getEventStatus(ev: EventItem): 'past' | 'now' | 'next' | 'future' {
  if (!ev.time_start) return 'future'
  var now = new Date()
  var cur = now.getHours() * 60 + now.getMinutes()
  var start = parseHHMM(ev.time_start)
  var end = ev.time_end ? parseHHMM(ev.time_end) : start + 60
  if (cur > end) return 'past'
  if (cur >= start && cur <= end) return 'now'
  return 'future'
}

function formatTime(t: string): string {
  if (!t) return ''
  var parts = t.split(':')
  var h = parseInt(parts[0] || '0', 10)
  var m = parts[1] || '00'
  var ampm = h >= 12 ? 'PM' : 'AM'
  var h12 = h % 12 || 12
  return h12 + ':' + m + ' ' + ampm
}

function PulsingDot({ color }: { color: string }) {
  var [big, setBig] = useState(false)
  var ref = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(function () {
    ref.current = setInterval(function () { setBig(function (v) { return !v }) }, 800)
    return function () { if (ref.current) clearInterval(ref.current) }
  }, [])
  return (
    <span style={{
      display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
      backgroundColor: color, marginRight: '8px', flexShrink: 0,
      transform: big ? 'scale(1.35)' : 'scale(1)',
      transition: 'transform 0.4s ease',
      boxShadow: big ? ('0 0 6px ' + color) : 'none',
    }} />
  )
}

function AgendaLayout({ events, cfg, theme }: { events: EventItem[]; cfg: EventBoardConfig; theme: typeof THEMES['dark'] }) {
  var sorted = events.slice().sort(function (a, b) {
    return parseHHMM(a.time_start || '00:00') - parseHHMM(b.time_start || '00:00')
  })

  // Figure out which is "next" (first future event)
  var nowIdx = -1
  var nextIdx = -1
  for (var i = 0; i < sorted.length; i++) {
    var st = getEventStatus(sorted[i])
    if (st === 'now' && nowIdx < 0) nowIdx = i
    if (st === 'future' && nextIdx < 0) nextIdx = i
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: 'clamp(10px,2vw,28px) clamp(12px,2.5vw,36px)',
        borderBottom: '1px solid ' + theme.border,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(8px,1.5vw,20px)', flexWrap: 'wrap' as const }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem,2.5vw,3.2rem)', fontWeight: 700, color: theme.accent, letterSpacing: '0.05em' }}>
            {cfg.title || "Today's Events"}
          </h1>
          {cfg.venue_name && (
            <span style={{ fontSize: 'clamp(0.8rem,1.4vw,1.8rem)', opacity: 0.65, fontStyle: 'italic' as const }}>
              {cfg.venue_name}
            </span>
          )}
        </div>
        <div style={{ width: '100%', height: '1px', backgroundColor: theme.accent, marginTop: '8px', opacity: 0.5 }} />
      </div>

      {/* Event list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(8px,1.5vw,20px) clamp(12px,2.5vw,36px)' }}>
        {sorted.map(function (ev, idx) {
          var status = cfg.highlight_current !== false ? getEventStatus(ev) : 'future'
          var isNow = status === 'now'
          var isNext = !isNow && idx === nextIdx
          var isPast = status === 'past'
          return (
            <div key={idx} style={{
              display: 'flex', alignItems: 'flex-start', gap: 'clamp(8px,1.5vw,20px)',
              padding: 'clamp(8px,1.5vw,20px)',
              marginBottom: 'clamp(6px,1vw,12px)',
              backgroundColor: isNow ? (theme.accent + '18') : theme.card,
              borderRadius: '8px',
              borderLeft: isNow ? ('3px solid ' + theme.accent) : (isNext ? ('3px solid ' + theme.accent + '60') : '3px solid transparent'),
              opacity: isPast ? 0.35 : (isNow ? 1 : 0.88),
              minHeight: '8vh',
              transition: 'opacity 0.3s',
            }}>
              {/* Status indicator */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px', minWidth: 'clamp(40px,7vw,90px)' }}>
                {isNow ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PulsingDot color={theme.accent} />
                    <span style={{ fontSize: 'clamp(0.6rem,1vw,1.2rem)', fontWeight: 700, color: theme.accent, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>NOW</span>
                  </div>
                ) : isNext ? (
                  <span style={{ fontSize: 'clamp(0.6rem,1vw,1.2rem)', fontWeight: 700, color: theme.accent, opacity: 0.7, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>NEXT</span>
                ) : null}
                <div style={{ fontSize: 'clamp(0.75rem,1.3vw,1.6rem)', fontWeight: 600, color: isNow ? theme.accent : theme.text, opacity: isNow ? 1 : 0.8 }}>
                  {formatTime(ev.time_start || '')}
                </div>
                {ev.time_end && (
                  <div style={{ fontSize: 'clamp(0.6rem,1vw,1.2rem)', opacity: 0.55 }}>
                    {formatTime(ev.time_end)}
                  </div>
                )}
              </div>
              {/* Event details */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'clamp(0.9rem,1.8vw,2.2rem)', fontWeight: 700, lineHeight: 1.2 }}>
                  {ev.featured ? '★ ' : ''}{ev.title || ''}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'clamp(4px,0.8vw,10px)', marginTop: '4px' }}>
                  {ev.room && (
                    <span style={{ fontSize: 'clamp(0.7rem,1.2vw,1.4rem)', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      📍 {ev.room}
                    </span>
                  )}
                  {ev.host && (
                    <span style={{ fontSize: 'clamp(0.7rem,1.2vw,1.4rem)', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      👤 {ev.host}
                    </span>
                  )}
                </div>
                {ev.description && (
                  <div style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', opacity: 0.55, marginTop: '4px' }}>{ev.description}</div>
                )}
              </div>
            </div>
          )
        })}

        {sorted.length === 0 && (
          <div style={{ textAlign: 'center' as const, opacity: 0.4, marginTop: '20%', fontSize: 'clamp(1rem,2vw,2.5rem)' }}>
            No events scheduled today
          </div>
        )}
      </div>
    </div>
  )
}

function RoomGridLayout({ events, cfg, theme }: { events: EventItem[]; cfg: EventBoardConfig; theme: typeof THEMES['dark'] }) {
  var rooms: string[] = []
  for (var i = 0; i < events.length; i++) {
    var r = events[i].room || 'Main'
    if (rooms.indexOf(r) < 0) rooms.push(r)
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
      <div style={{ padding: 'clamp(8px,1.5vw,20px) clamp(12px,2vw,28px)', borderBottom: '1px solid ' + theme.border, flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem,2.2vw,2.8rem)', fontWeight: 700, color: theme.accent }}>
          {cfg.title || "Today's Events"}{cfg.venue_name ? ' — ' + cfg.venue_name : ''}
        </h1>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(8px,1.5vw,20px) clamp(12px,2vw,28px)' }}>
        {rooms.map(function (room) {
          var roomEvents = events.filter(function (e) { return (e.room || 'Main') === room })
          roomEvents.sort(function (a, b) { return parseHHMM(a.time_start || '00:00') - parseHHMM(b.time_start || '00:00') })
          return (
            <div key={room} style={{ marginBottom: 'clamp(12px,2vw,24px)' }}>
              <div style={{ fontSize: 'clamp(0.85rem,1.5vw,1.8rem)', fontWeight: 700, color: theme.accent, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📍 {room}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'clamp(6px,1vw,12px)' }}>
                {roomEvents.map(function (ev, idx) {
                  var status = cfg.highlight_current !== false ? getEventStatus(ev) : 'future'
                  var isNow = status === 'now'
                  return (
                    <div key={idx} style={{
                      padding: 'clamp(6px,1.2vw,14px)', borderRadius: '6px',
                      backgroundColor: isNow ? (theme.accent + '20') : theme.card,
                      border: '1px solid ' + (isNow ? theme.accent : theme.border),
                      minWidth: 'clamp(100px,16vw,200px)', opacity: status === 'past' ? 0.4 : 1,
                    }}>
                      {isNow && <div style={{ fontSize: 'clamp(0.55rem,0.9vw,1rem)', color: theme.accent, fontWeight: 700, marginBottom: '4px' }}>● NOW</div>}
                      <div style={{ fontSize: 'clamp(0.75rem,1.3vw,1.6rem)', fontWeight: 600 }}>{ev.title}</div>
                      <div style={{ fontSize: 'clamp(0.65rem,1vw,1.2rem)', opacity: 0.65, marginTop: '4px' }}>
                        {formatTime(ev.time_start || '')}{ev.time_end ? ' – ' + formatTime(ev.time_end) : ''}
                      </div>
                      {ev.host && <div style={{ fontSize: 'clamp(0.6rem,0.9vw,1.1rem)', opacity: 0.55, marginTop: '2px' }}>{ev.host}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function EventBoardRenderer({ config, onLoad }: RendererProps) {
  var cfg = config as unknown as EventBoardConfig
  var themeKey = cfg.theme || 'hotel-luxury'
  var theme = THEMES[themeKey] || THEMES['hotel-luxury']
  var events: EventItem[] = Array.isArray(cfg.events) ? cfg.events : []
  var layout = cfg.layout || 'agenda'

  useEffect(function () { if (onLoad) onLoad() }, [])

  if (layout === 'room-grid') {
    return <RoomGridLayout events={events} cfg={cfg} theme={theme} />
  }
  return <AgendaLayout events={events} cfg={cfg} theme={theme} />
}
