'use client'

import { useState, useEffect, useMemo, CSSProperties } from 'react'

interface CalendarEvent {
  id?: string
  summary?: string
  description?: string
  location?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  colorId?: string
  attendees?: Array<{ email: string; displayName?: string }>
}

interface GoogleCalendarConfig {
  calendar_id: string
  display_mode?: 'agenda' | 'day' | 'week' | 'meeting_room'
  max_events?: number
  days_ahead?: number
  show_description?: boolean
  show_location?: boolean
  show_attendees?: boolean
  room_name?: string
  refresh_interval?: number
  theme?: 'dark' | 'light' | 'google'
  // data is fetched by player engine and passed as config
  _data?: { events: CalendarEvent[]; calendar_name: string; timezone?: string }
}

interface GoogleCalendarRendererProps {
  config: GoogleCalendarConfig
}

interface ThemeColors {
  bg: string
  text: string
  subtext: string
  accent: string
  cardBg: string
  border: string
  available: string
  busy: string
}

function resolveTheme(theme: string): ThemeColors {
  switch (theme) {
    case 'light':
      return { bg: '#ffffff', text: '#111827', subtext: '#6b7280', accent: '#4285F4', cardBg: '#f9fafb', border: '#e5e7eb', available: '#34A853', busy: '#EA4335' }
    case 'google':
      return { bg: '#f8f9fa', text: '#202124', subtext: '#5f6368', accent: '#1a73e8', cardBg: '#ffffff', border: '#dadce0', available: '#34A853', busy: '#EA4335' }
    case 'dark':
    default:
      return { bg: '#0f172a', text: '#f1f5f9', subtext: '#94a3b8', accent: '#60a5fa', cardBg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', available: '#4ade80', busy: '#f87171' }
  }
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch {
    return ''
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function isNow(event: CalendarEvent): boolean {
  const now = Date.now()
  const start = new Date(event.start?.dateTime || event.start?.date || '').getTime()
  const end = new Date(event.end?.dateTime || event.end?.date || '').getTime()
  return now >= start && now <= end
}

function AgendaView({ events, colors, config }: { events: CalendarEvent[]; colors: ThemeColors; config: GoogleCalendarConfig }) {
  if (!events.length) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: colors.subtext, fontSize: '1.2rem' }}>
        No upcoming events
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', height: '100%', padding: '1rem' }}>
      {events.map((event, i) => {
        const startTime = event.start?.dateTime || event.start?.date || ''
        const endTime = event.end?.dateTime || event.end?.date || ''
        const current = isNow(event)
        return (
          <div key={event.id || i} style={{
            display: 'flex',
            padding: '0.75rem 1rem',
            marginBottom: '0.5rem',
            backgroundColor: current ? colors.accent + '15' : colors.cardBg,
            borderRadius: '0.5rem',
            borderLeft: `4px solid ${current ? colors.accent : colors.border}`,
          }}>
            <div style={{ minWidth: '5rem', marginRight: '1rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.text }}>{formatTime(startTime)}</div>
              <div style={{ fontSize: '0.75rem', color: colors.subtext }}>{formatTime(endTime)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {event.summary || 'Untitled'}
              </div>
              {config.show_location && event.location && (
                <div style={{ fontSize: '0.75rem', color: colors.subtext, marginTop: '0.25rem' }}>
                  {event.location}
                </div>
              )}
              {config.show_description && event.description && (
                <div style={{ fontSize: '0.75rem', color: colors.subtext, marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.description}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MeetingRoomView({ events, colors, config }: { events: CalendarEvent[]; colors: ThemeColors; config: GoogleCalendarConfig }) {
  const now = Date.now()
  const currentEvent = events.find(e => isNow(e))
  const nextEvent = events.find(e => {
    const start = new Date(e.start?.dateTime || e.start?.date || '').getTime()
    return start > now
  })

  const isAvailable = !currentEvent
  const statusColor = isAvailable ? colors.available : colors.busy

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
      {config.room_name && (
        <div style={{ fontSize: '1.5rem', fontWeight: 300, color: colors.subtext, marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {config.room_name}
        </div>
      )}
      <div style={{ width: '6rem', height: '6rem', borderRadius: '50%', backgroundColor: statusColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: statusColor }} />
      </div>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: statusColor, marginBottom: '0.5rem' }}>
        {isAvailable ? 'Available' : 'In Use'}
      </div>
      {currentEvent && (
        <div style={{ fontSize: '1.2rem', color: colors.text, marginBottom: '0.5rem' }}>
          {currentEvent.summary || 'Untitled Meeting'}
        </div>
      )}
      {currentEvent && currentEvent.end?.dateTime && (
        <div style={{ fontSize: '0.875rem', color: colors.subtext }}>
          Until {formatTime(currentEvent.end.dateTime)}
        </div>
      )}
      {nextEvent && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: colors.cardBg, borderRadius: '0.75rem', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '0.75rem', color: colors.subtext, marginBottom: '0.25rem' }}>Next Meeting</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: colors.text }}>{nextEvent.summary || 'Untitled'}</div>
          <div style={{ fontSize: '0.875rem', color: colors.subtext }}>
            {formatTime(nextEvent.start?.dateTime || '')} - {formatTime(nextEvent.end?.dateTime || '')}
          </div>
        </div>
      )}
    </div>
  )
}

export function GoogleCalendarRenderer({ config }: GoogleCalendarRendererProps) {
  const {
    display_mode = 'agenda',
    theme = 'dark',
    _data,
  } = config

  const colors = useMemo(() => resolveTheme(theme), [theme])
  const events = _data?.events || []
  const calendarName = _data?.calendar_name || ''

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const headerStyle: CSSProperties = {
    padding: '0.75rem 1rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  return (
    <div style={containerStyle}>
      {display_mode !== 'meeting_room' && (
        <div style={headerStyle}>
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>{calendarName || 'Calendar'}</span>
          <span style={{ fontSize: '0.75rem', color: colors.subtext }}>{formatDate(new Date().toISOString())}</span>
        </div>
      )}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {display_mode === 'meeting_room' ? (
          <MeetingRoomView events={events} colors={colors} config={config} />
        ) : (
          <AgendaView events={events} colors={colors} config={config} />
        )}
      </div>
    </div>
  )
}
