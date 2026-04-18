'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import type { RendererProps } from './registry'

interface RoomEntry {
  name?: string
  floor?: number
  room_number?: string
  type?: string
  capacity?: number
  hours?: string
  phone?: string
  image_content_id?: string
  image_url?: string
}

interface RoomDirectoryConfig {
  property_name?: string
  layout?: 'list' | 'card-grid' | 'floor-plan'
  background_color?: string
  text_color?: string
  accent_color?: string
  filter_by_floor?: boolean
  rooms?: RoomEntry[]
}

const TYPE_LABEL: Record<string, string> = {
  'meeting-room': 'Meeting Room',
  restaurant: 'Restaurant',
  pool: 'Pool',
  gym: 'Gym',
  spa: 'Spa',
  bar: 'Bar',
  reception: 'Reception',
  parking: 'Parking',
}

export function RoomDirectoryRenderer({ config }: RendererProps) {
  const c = config as RoomDirectoryConfig
  const bg = c.background_color || '#0f1b35'
  const textCol = c.text_color || '#ffffff'
  const accent = c.accent_color || '#c9a84c'
  const rooms = Array.isArray(c.rooms) ? c.rooms : []
  const layout = c.layout || 'card-grid'

  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all')

  const floors = useMemo(() => {
    const s = new Set<number>()
    for (const r of rooms) {
      if (typeof r.floor === 'number' && !Number.isNaN(r.floor)) s.add(r.floor)
    }
    return Array.from(s).sort((a, b) => a - b)
  }, [rooms])

  const filtered = useMemo(() => {
    if (!c.filter_by_floor || floorFilter === 'all') return rooms
    return rooms.filter((r) => r.floor === floorFilter)
  }, [rooms, c.filter_by_floor, floorFilter])

  const byFloor = useMemo(() => {
    const m = new Map<number, RoomEntry[]>()
    for (const r of filtered) {
      const f = typeof r.floor === 'number' ? r.floor : -999
      if (!m.has(f)) m.set(f, [])
      m.get(f)!.push(r)
    }
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0])
  }, [filtered])

  const outer: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '100%',
    boxSizing: 'border-box',
    overflow: 'auto',
    background: bg,
    color: textCol,
    fontFamily: 'system-ui, sans-serif',
    padding: 'clamp(1rem, 3vw, 2rem)',
  }

  return (
    <div style={outer}>
      <header style={{ marginBottom: '1.25rem', borderBottom: `2px solid ${accent}`, paddingBottom: '0.75rem' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', fontWeight: 800 }}>
          {c.property_name || 'Directory'}
        </h1>
        <p style={{ margin: '0.35rem 0 0', opacity: 0.85, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>Wayfinding</p>
      </header>

      {c.filter_by_floor && floors.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setFloorFilter('all')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: 999,
              border: `1px solid ${accent}`,
              background: floorFilter === 'all' ? accent : 'transparent',
              color: floorFilter === 'all' ? bg : textCol,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            All
          </button>
          {floors.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFloorFilter(f)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 999,
                border: `1px solid ${accent}`,
                background: floorFilter === f ? accent : 'transparent',
                color: floorFilter === f ? bg : textCol,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Floor {f}
            </button>
          ))}
        </div>
      ) : null}

      {layout === 'list' ? (
        <ListLayout rooms={filtered} accent={accent} />
      ) : layout === 'floor-plan' ? (
        <FloorPlanLayout byFloor={byFloor} accent={accent} />
      ) : (
        <CardGridLayout rooms={filtered} accent={accent} />
      )}
    </div>
  )
}

function typeLabel(t: string | undefined): string {
  if (!t) return ''
  return TYPE_LABEL[t] || t
}

function CardGridLayout({
  rooms,
  accent,
}: {
  rooms: RoomEntry[]
  accent: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
        gap: '1rem',
      }}
    >
      {rooms.map((r, i) => (
        <RoomCard key={i} room={r} accent={accent} />
      ))}
    </div>
  )
}

function RoomCard({
  room,
  accent,
}: {
  room: RoomEntry
  accent: string
}) {
  const img = room.image_url
  return (
    <div
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${accent}44`,
      }}
    >
      {img ? (
        <div style={{ height: 120, background: `url(${img}) center/cover` }} />
      ) : (
        <div style={{ height: 6, background: accent }} />
      )}
      <div style={{ padding: '1rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{room.name || 'Room'}</div>
        {room.room_number ? (
          <div style={{ color: accent, fontWeight: 700, marginTop: 4 }}>#{room.room_number}</div>
        ) : null}
        {typeof room.floor === 'number' ? (
          <div style={{ opacity: 0.85, marginTop: 4, fontSize: '0.92rem' }}>Floor {room.floor}</div>
        ) : null}
        {room.type ? <div style={{ marginTop: 6, fontSize: '0.88rem', opacity: 0.9 }}>{typeLabel(room.type)}</div> : null}
        {room.capacity != null ? (
          <div style={{ marginTop: 4, fontSize: '0.85rem' }}>Capacity: {room.capacity}</div>
        ) : null}
        {room.hours ? <div style={{ marginTop: 6, fontSize: '0.85rem' }}>{room.hours}</div> : null}
        {room.phone ? <div style={{ marginTop: 4, fontSize: '0.85rem' }}>{room.phone}</div> : null}
      </div>
    </div>
  )
}

function ListLayout({
  rooms,
  accent,
}: {
  rooms: RoomEntry[]
  accent: string
}) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {rooms.map((r, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '0.85rem 0',
            borderBottom: `1px solid ${accent}22`,
            alignItems: 'center',
          }}
        >
          {r.image_url ? (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 10,
                flexShrink: 0,
                background: `url(${r.image_url}) center/cover`,
              }}
            />
          ) : null}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800 }}>{r.name}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: 4 }}>
              {[typeLabel(r.type), r.room_number ? `· ${r.room_number}` : '', typeof r.floor === 'number' ? `· Floor ${r.floor}` : '']
                .filter(Boolean)
                .join(' ')}
            </div>
            {r.hours ? <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{r.hours}</div> : null}
          </div>
          {r.phone ? (
            <div style={{ color: accent, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.phone}</div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function FloorPlanLayout({
  byFloor,
  accent,
}: {
  byFloor: [number, RoomEntry[]][]
  accent: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        alignItems: 'start',
      }}
    >
      {byFloor.map(([floor, list]) => (
        <div
          key={floor}
          style={{
            borderRadius: 12,
            padding: '1rem',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${accent}44`,
          }}
        >
          <div style={{ fontWeight: 800, color: accent, marginBottom: '0.75rem', fontSize: '1.05rem' }}>
            {floor === -999 ? 'Unspecified floor' : `Floor ${floor}`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {list.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: '0.65rem',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: '0.88rem', opacity: 0.9, marginTop: 4 }}>
                  {typeLabel(r.type)} {r.room_number ? `· ${r.room_number}` : ''}
                </div>
                {r.hours ? <div style={{ fontSize: '0.8rem', marginTop: 4 }}>{r.hours}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
