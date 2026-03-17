'use client'

import { useState, useEffect } from 'react'

interface RoomItem {
  name?: string
  floor?: number
  room_number?: string
  type?: string
  capacity?: number
  hours?: string
  phone?: string
}

interface RoomDirectoryConfig {
  property_name?: string
  layout?: string
  background_color?: string
  text_color?: string
  accent_color?: string
  filter_by_floor?: boolean
  rooms?: RoomItem[]
}

interface RendererProps {
  config: Record<string, any>
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

const TYPE_ICONS: Record<string, string> = {
  'meeting-room': '🏢', restaurant: '🍽️', pool: '🏊', gym: '💪',
  spa: '🧘', bar: '🍸', reception: '🛎️', parking: '🅿️',
}

function getTypeIcon(type: string): string {
  return TYPE_ICONS[type] || '📍'
}

function getFloors(rooms: RoomItem[]): number[] {
  var floors: number[] = []
  for (var i = 0; i < rooms.length; i++) {
    var f = rooms[i].floor
    if (f !== undefined && f !== null && floors.indexOf(f) < 0) {
      floors.push(f)
    }
  }
  floors.sort(function (a, b) { return a - b })
  return floors
}

export function RoomDirectoryRenderer({ config, onLoad }: RendererProps) {
  var cfg = config as unknown as RoomDirectoryConfig
  var bg = cfg.background_color || '#0f1b35'
  var text = cfg.text_color || '#ffffff'
  var accent = cfg.accent_color || '#c9a84c'
  var rooms: RoomItem[] = Array.isArray(cfg.rooms) ? cfg.rooms : []
  var layout = cfg.layout || 'card-grid'
  var floors = getFloors(rooms)
  var [activeFloor, setActiveFloor] = useState<number | null>(null)

  useEffect(function () { if (onLoad) onLoad() }, [])

  var displayRooms = (cfg.filter_by_floor && activeFloor !== null)
    ? rooms.filter(function (r) { return r.floor === activeFloor })
    : rooms

  if (rooms.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: bg, color: text, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ fontSize: 'clamp(2rem,5vw,6rem)' }}>🏨</div>
        <div style={{ fontSize: 'clamp(1rem,2vw,2.5rem)', opacity: 0.7 }}>{cfg.property_name || 'Room Directory'}</div>
        <div style={{ fontSize: 'clamp(0.75rem,1.2vw,1.5rem)', opacity: 0.4 }}>Add rooms to get started</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: bg, color: text, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: 'clamp(10px,2vw,24px) clamp(14px,2.5vw,32px)', borderBottom: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem,2.2vw,2.8rem)', fontWeight: 700, color: accent }}>
          {cfg.property_name || 'Facilities & Amenities'}
        </h1>
        {cfg.filter_by_floor && floors.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' as const }}>
            <button
              onClick={function () { setActiveFloor(null) }}
              style={{
                padding: 'clamp(3px,0.5vw,6px) clamp(8px,1.2vw,16px)',
                borderRadius: '20px', border: 'none', cursor: 'pointer',
                backgroundColor: activeFloor === null ? accent : 'rgba(255,255,255,0.15)',
                color: activeFloor === null ? '#000' : text,
                fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', fontWeight: 600,
              }}
            >
              All
            </button>
            {floors.map(function (f) {
              return (
                <button
                  key={f}
                  onClick={function () { setActiveFloor(f) }}
                  style={{
                    padding: 'clamp(3px,0.5vw,6px) clamp(8px,1.2vw,16px)',
                    borderRadius: '20px', border: 'none', cursor: 'pointer',
                    backgroundColor: activeFloor === f ? accent : 'rgba(255,255,255,0.15)',
                    color: activeFloor === f ? '#000' : text,
                    fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', fontWeight: 600,
                  }}
                >
                  Floor {f}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Rooms */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(10px,1.5vw,20px) clamp(14px,2.5vw,32px)' }}>
        {layout === 'list' ? (
          <div>
            {displayRooms.map(function (room, idx) {
              return (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 'clamp(8px,1.5vw,20px)',
                  padding: 'clamp(8px,1.5vw,18px) 0',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  minHeight: '8vh',
                }}>
                  <div style={{ fontSize: 'clamp(1.2rem,2.5vw,3rem)', flexShrink: 0 }}>{getTypeIcon(room.type || '')}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'clamp(0.9rem,1.8vw,2.2rem)', fontWeight: 600 }}>{room.name || ''}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'clamp(6px,1vw,12px)', marginTop: '4px' }}>
                      {room.room_number && <span style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', opacity: 0.65 }}>#{room.room_number}</span>}
                      {room.floor !== undefined && <span style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', opacity: 0.65 }}>Floor {room.floor}</span>}
                      {room.hours && <span style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', opacity: 0.65 }}>🕐 {room.hours}</span>}
                      {room.capacity && <span style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', opacity: 0.65 }}>👥 {room.capacity}</span>}
                      {room.phone && <span style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', color: accent }}>📞 {room.phone}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'clamp(8px,1.5vw,20px)' }}>
            {displayRooms.map(function (room, idx) {
              return (
                <div key={idx} style={{
                  width: 'clamp(140px,22vw,280px)',
                  padding: 'clamp(10px,1.8vw,22px)',
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  minHeight: '8vh',
                }}>
                  <div style={{ fontSize: 'clamp(1.5rem,3vw,3.5rem)', marginBottom: '8px' }}>{getTypeIcon(room.type || '')}</div>
                  <div style={{ fontSize: 'clamp(0.85rem,1.6vw,1.9rem)', fontWeight: 700, marginBottom: '6px', lineHeight: 1.2 }}>{room.name || ''}</div>
                  {room.room_number && (
                    <div style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', color: accent, marginBottom: '4px' }}>Room {room.room_number}</div>
                  )}
                  {room.floor !== undefined && (
                    <div style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', opacity: 0.6, marginBottom: '2px' }}>Floor {room.floor}</div>
                  )}
                  {room.hours && (
                    <div style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', opacity: 0.6, marginBottom: '2px' }}>🕐 {room.hours}</div>
                  )}
                  {room.capacity && (
                    <div style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', opacity: 0.6, marginBottom: '2px' }}>👥 Capacity: {room.capacity}</div>
                  )}
                  {room.phone && (
                    <div style={{ fontSize: 'clamp(0.65rem,1.1vw,1.3rem)', color: accent, marginTop: '6px' }}>📞 {room.phone}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
