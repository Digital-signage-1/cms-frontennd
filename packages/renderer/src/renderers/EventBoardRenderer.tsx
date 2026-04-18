'use client'

import { useMemo, useState, useEffect, type CSSProperties } from 'react'
import type { RendererProps } from './registry'

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
  layout?: 'agenda' | 'timeline' | 'room-grid'
  theme?: 'hotel-luxury' | 'corporate' | 'dark' | 'light'
  background_image_content_id?: string
  background_image_url?: string
  highlight_current?: boolean
  events?: EventItem[]
}

function parseMinutes(t: string | undefined): number | null {
  if (!t || typeof t !== 'string') return null
  const m = t.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function themeStyles(theme: string): {
  bg: string
  text: string
  accent: string
  sub: string
  card: string
} {
  switch (theme) {
    case 'corporate':
      return {
        bg: 'linear-gradient(160deg, #0c4a6e 0%, #0369a1 45%, #e0f2fe 100%)',
        text: '#0f172a',
        accent: '#0369a1',
        sub: '#475569',
        card: 'rgba(255,255,255,0.92)',
      }
    case 'dark':
      return {
        bg: '#0a0a0a',
        text: '#f8fafc',
        accent: '#94a3b8',
        sub: '#cbd5e1',
        card: 'rgba(30,41,59,0.85)',
      }
    case 'light':
      return {
        bg: '#f8fafc',
        text: '#0f172a',
        accent: '#2563eb',
        sub: '#64748b',
        card: '#ffffff',
      }
    case 'hotel-luxury':
    default:
      return {
        bg: 'linear-gradient(145deg, #0c1929 0%, #1e293b 42%, #0f172a 100%)',
        text: '#fefce8',
        accent: '#c9a84c',
        sub: '#94a3b8',
        card: 'rgba(15,23,42,0.75)',
      }
  }
}

export function EventBoardRenderer({ config, contentUrl }: RendererProps) {
  const c = config as EventBoardConfig
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 30000)
    return () => clearInterval(id)
  }, [])
  const nm = useMemo(() => nowMinutes(), [tick])

  const t = themeStyles(c.theme || 'hotel-luxury')
  const bgUrl =
    c.background_image_url ||
    (c.background_image_content_id && contentUrl ? contentUrl : undefined)

  const sorted = useMemo(() => {
    const ev = Array.isArray(c.events) ? [...c.events] : []
    ev.sort(
      (a, b) =>
        (parseMinutes(a.time_start) ?? 99999) - (parseMinutes(b.time_start) ?? 99999)
    )
    return ev
  }, [c.events])

  const highlight = c.highlight_current !== false

  const isCurrent = (e: EventItem) => {
    if (!highlight) return false
    const start = parseMinutes(e.time_start)
    const end = parseMinutes(e.time_end)
    if (start === null) return false
    if (end === null) return nm >= start && nm < start + 120
    return nm >= start && nm < end
  }

  const layout = c.layout || 'agenda'

  const outer: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '100%',
    boxSizing: 'border-box',
    overflow: 'auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  }

  const innerBg: CSSProperties = bgUrl
    ? {
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        position: 'absolute',
        inset: 0,
        background: t.bg,
      }

  const layoutMode = layout === 'room-grid' ? 'room-grid' : layout === 'timeline' ? 'timeline' : 'agenda'

  return (
    <div style={outer}>
      <div style={innerBg} />
      {bgUrl ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(15,23,42,0.72), rgba(15,23,42,0.9))',
            pointerEvents: 'none',
          }}
        />
      ) : null}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 'clamp(1rem, 3vw, 2.5rem)',
          color: bgUrl ? '#fefce8' : t.text,
        }}
      >
        <header
          style={{
            marginBottom: '1.5rem',
            borderBottom: `2px solid ${bgUrl ? '#c9a84c' : t.accent}`,
            paddingBottom: '0.75rem',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 700,
              margin: 0,
            }}
          >
            {c.title || "Today's Events"}
          </h1>
          {c.venue_name ? (
            <p
              style={{
                margin: '0.35rem 0 0',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                opacity: 0.85,
              }}
            >
              {c.venue_name}
            </p>
          ) : null}
        </header>

        {layoutMode === 'room-grid' ? (
          <RoomGridView events={sorted} palette={t} isCurrent={isCurrent} bgOverlay={!!bgUrl} />
        ) : layoutMode === 'timeline' ? (
          <TimelineView events={sorted} palette={t} isCurrent={isCurrent} bgOverlay={!!bgUrl} />
        ) : (
          <AgendaView events={sorted} palette={t} isCurrent={isCurrent} bgOverlay={!!bgUrl} />
        )}
      </div>
    </div>
  )
}

function timeLabel(e: EventItem): string {
  const a = e.time_start || '—'
  const b = e.time_end ? ` – ${e.time_end}` : ''
  return `${a}${b}`
}

function AgendaView({
  events,
  palette,
  isCurrent,
  bgOverlay,
}: {
  events: EventItem[]
  palette: ReturnType<typeof themeStyles>
  isCurrent: (e: EventItem) => boolean
  bgOverlay: boolean
}) {
  const text = bgOverlay ? '#fefce8' : palette.text
  const sub = bgOverlay ? 'rgba(254,252,232,0.75)' : palette.sub
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {events.map((e, i) => {
        const cur = isCurrent(e)
        return (
          <li
            key={i}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 12,
              border: cur ? `2px solid ${palette.accent}` : `1px solid ${bgOverlay ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}`,
              background: cur ? (bgOverlay ? 'rgba(201,168,76,0.15)' : palette.card) : (bgOverlay ? 'rgba(15,23,42,0.45)' : palette.card),
              boxShadow: e.featured ? `0 0 0 1px ${palette.accent}55` : undefined,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', color: text }}>
                {e.title || 'Event'}
              </span>
              <span style={{ fontWeight: 600, color: palette.accent, whiteSpace: 'nowrap' }}>{timeLabel(e)}</span>
            </div>
            {e.room ? (
              <div style={{ marginTop: '0.35rem', fontSize: 'clamp(0.85rem, 2vw, 1rem)', color: sub }}>{e.room}</div>
            ) : null}
            {e.host ? (
              <div style={{ marginTop: '0.2rem', fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)', color: sub }}>{e.host}</div>
            ) : null}
            {e.description ? (
              <div style={{ marginTop: '0.45rem', fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)', opacity: 0.9 }}>{e.description}</div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function TimelineView({
  events,
  palette,
  isCurrent,
  bgOverlay,
}: {
  events: EventItem[]
  palette: ReturnType<typeof themeStyles>
  isCurrent: (e: EventItem) => boolean
  bgOverlay: boolean
}) {
  const text = bgOverlay ? '#fefce8' : palette.text
  const sub = bgOverlay ? 'rgba(254,252,232,0.75)' : palette.sub
  return (
    <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
      <div
        style={{
          position: 'absolute',
          left: 6,
          top: 0,
          bottom: 0,
          width: 3,
          borderRadius: 2,
          background: bgOverlay ? 'rgba(201,168,76,0.5)' : palette.accent,
          opacity: 0.6,
        }}
      />
      {events.map((e, i) => {
        const cur = isCurrent(e)
        return (
          <div key={i} style={{ position: 'relative', marginBottom: '1.25rem', paddingLeft: '0.5rem' }}>
            <div
              style={{
                position: 'absolute',
                left: -11,
                top: 6,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: cur ? palette.accent : (bgOverlay ? 'rgba(255,255,255,0.35)' : palette.sub),
                border: `2px solid ${bgOverlay ? '#0f172a' : '#fff'}`,
              }}
            />
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 10,
                background: bgOverlay ? 'rgba(15,23,42,0.5)' : palette.card,
                border: cur ? `1px solid ${palette.accent}` : undefined,
              }}
            >
              <div style={{ fontWeight: 700, color: text }}>{e.title || 'Event'}</div>
              <div style={{ color: palette.accent, fontWeight: 600, marginTop: 4 }}>{timeLabel(e)}</div>
              {e.room ? <div style={{ color: sub, marginTop: 4 }}>{e.room}</div> : null}
              {e.description ? <div style={{ marginTop: 6, fontSize: '0.95rem', opacity: 0.9 }}>{e.description}</div> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RoomGridView({
  events,
  palette,
  isCurrent,
  bgOverlay,
}: {
  events: EventItem[]
  palette: ReturnType<typeof themeStyles>
  isCurrent: (e: EventItem) => boolean
  bgOverlay: boolean
}) {
  const byRoom = useMemo(() => {
    const m = new Map<string, EventItem[]>()
    for (const e of events) {
      const r = (e.room || 'General').trim() || 'General'
      if (!m.has(r)) m.set(r, [])
      m.get(r)!.push(e)
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => (parseMinutes(a.time_start) ?? 0) - (parseMinutes(b.time_start) ?? 0))
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [events])

  const text = bgOverlay ? '#fefce8' : palette.text
  const sub = bgOverlay ? 'rgba(254,252,232,0.75)' : palette.sub

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
        gap: '1rem',
      }}
    >
      {byRoom.map(([room, list]) => (
        <div
          key={room}
          style={{
            padding: '1rem',
            borderRadius: 12,
            background: bgOverlay ? 'rgba(15,23,42,0.55)' : palette.card,
            border: `1px solid ${bgOverlay ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem', color: palette.accent }}>{room}</div>
          {list.map((e, i) => {
            const cur = isCurrent(e)
            return (
              <div
                key={i}
                style={{
                  padding: '0.65rem 0',
                  borderTop: i ? `1px solid ${bgOverlay ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}` : undefined,
                  outline: cur ? `1px solid ${palette.accent}` : undefined,
                  borderRadius: cur ? 8 : undefined,
                  marginBottom: cur ? 4 : 0,
                }}
              >
                <div style={{ fontWeight: 700, color: text }}>{e.title || 'Event'}</div>
                <div style={{ fontSize: '0.9rem', color: palette.accent, fontWeight: 600 }}>{timeLabel(e)}</div>
                {e.host ? <div style={{ fontSize: '0.85rem', color: sub, marginTop: 2 }}>{e.host}</div> : null}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
