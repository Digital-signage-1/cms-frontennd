'use client'

import { useState, useEffect, useMemo, useRef, CSSProperties } from 'react'

interface CalendarEvent {
  id?: string
  summary?: string
  description?: string
  location?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  colorId?: string
  color?: string
  attendees?: Array<{ email: string; displayName?: string }>
}

interface GoogleCalendarConfig {
  calendar_id: string
  display_mode?: 'agenda' | 'day' | 'week' | 'month' | 'meeting_room'
  show_description?: boolean
  show_location?: boolean
  show_attendees?: boolean
  auto_scroll?: boolean
  room_name?: string
  refresh_interval?: number
  theme?: 'dark' | 'light' | 'google'
  _data?: {
    events: CalendarEvent[]
    calendar_name: string
    timezone?: string
    calendar_color?: string
    calendar_text_color?: string
  }
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

// ─── Theme ──────────────────────────────────────────────────────────────────

function resolveTheme(theme: string, calendarColor?: string): ThemeColors {
  var colors: ThemeColors
  switch (theme) {
    case 'light':
      colors = { bg: '#ffffff', text: '#111827', subtext: '#6b7280', accent: '#4285F4', cardBg: '#f9fafb', border: '#e5e7eb', available: '#34A853', busy: '#EA4335' }
      break
    case 'google':
      colors = { bg: '#f8f9fa', text: '#202124', subtext: '#5f6368', accent: calendarColor || '#1a73e8', cardBg: '#ffffff', border: '#dadce0', available: '#34A853', busy: '#EA4335' }
      break
    case 'dark':
    default:
      colors = { bg: '#0f172a', text: '#f1f5f9', subtext: '#94a3b8', accent: '#60a5fa', cardBg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', available: '#4ade80', busy: '#f87171' }
      break
  }
  return colors
}

// ─── Date Helpers (Chrome 38 safe) ──────────────────────────────────────────

function isAllDay(event: CalendarEvent): boolean {
  return !!(event.start?.date && !event.start?.dateTime)
}

function formatEventTime(event: CalendarEvent): string {
  if (isAllDay(event)) return 'All Day'
  return formatTime(event.start?.dateTime || '')
}

function formatTime(dateStr: string): string {
  try {
    if (!dateStr) return ''
    var d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch (_e) {
    return ''
  }
}

function formatDate(dateStr: string): string {
  try {
    var d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  } catch (_e) {
    return ''
  }
}

function startOfDay(d: Date): Date {
  var r = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return r
}

function toDateKey(d: Date): string {
  var y = d.getFullYear()
  var m = d.getMonth() + 1
  var day = d.getDate()
  return y + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day)
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function addDays(d: Date, n: number): Date {
  var r = new Date(d.getTime())
  r.setDate(r.getDate() + n)
  return r
}

function startOfWeek(d: Date): Date {
  var r = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  r.setDate(r.getDate() - r.getDay()) // Sunday = 0
  return r
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

function getDaysInRange(start: Date, end: Date): Date[] {
  var days: Date[] = []
  var cur = new Date(start.getTime())
  while (cur <= end) {
    days.push(new Date(cur.getTime()))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function getTimePosition(d: Date): number {
  return d.getHours() + d.getMinutes() / 60
}

function isNow(event: CalendarEvent): boolean {
  var now = Date.now()
  var start = new Date(event.start?.dateTime || event.start?.date || '').getTime()
  var end = new Date(event.end?.dateTime || event.end?.date || '').getTime()
  return now >= start && now <= end
}

// ─── Event Grouping ─────────────────────────────────────────────────────────

function groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  var groups: Record<string, CalendarEvent[]> = {}
  for (var i = 0; i < events.length; i++) {
    var event = events[i]
    if (isAllDay(event)) {
      // All-day events: Google uses exclusive end date, so "2026-03-12" to "2026-03-13" = 1 day
      var startStr = event.start?.date || ''
      var endStr = event.end?.date || startStr
      // Parse date-only strings as local (split to avoid UTC midnight issues)
      var sp = startStr.split('-')
      var ep = endStr.split('-')
      var sd = new Date(parseInt(sp[0]), parseInt(sp[1]) - 1, parseInt(sp[2]))
      var ed = new Date(parseInt(ep[0]), parseInt(ep[1]) - 1, parseInt(ep[2]))
      // end date is exclusive, so subtract 1 day
      ed.setDate(ed.getDate() - 1)
      var cur = new Date(sd.getTime())
      while (cur <= ed) {
        var key = toDateKey(cur)
        if (!groups[key]) groups[key] = []
        groups[key].push(event)
        cur.setDate(cur.getDate() + 1)
      }
    } else {
      var dt = new Date(event.start?.dateTime || '')
      var k = toDateKey(dt)
      if (!groups[k]) groups[k] = []
      groups[k].push(event)
    }
  }
  return groups
}

function partitionEvents(dayEvents: CalendarEvent[]): { allDay: CalendarEvent[]; timed: CalendarEvent[] } {
  var allDay: CalendarEvent[] = []
  var timed: CalendarEvent[] = []
  for (var i = 0; i < dayEvents.length; i++) {
    if (isAllDay(dayEvents[i])) {
      allDay.push(dayEvents[i])
    } else {
      timed.push(dayEvents[i])
    }
  }
  return { allDay: allDay, timed: timed }
}

// ─── Day Labels ─────────────────────────────────────────────────────────────

var DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getDayLabel(d: Date, today: Date): string {
  if (isSameDay(d, today)) return 'Today'
  if (isSameDay(d, addDays(today, 1))) return 'Tomorrow'
  return formatDate(d.toISOString())
}

// ─── AgendaView ─────────────────────────────────────────────────────────────

function AgendaView({ events, colors, config }: { events: CalendarEvent[]; colors: ThemeColors; config: GoogleCalendarConfig }) {
  if (!events.length) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: colors.subtext, fontSize: '1.2rem' }}>
        No upcoming events
      </div>
    )
  }

  var grouped = groupEventsByDate(events)
  var today = startOfDay(new Date())
  var sortedKeys = Object.keys(grouped).sort()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', height: '100%', padding: '1rem' }}>
      {sortedKeys.map(function (dateKey) {
        var sp = dateKey.split('-')
        var keyDate = new Date(parseInt(sp[0]), parseInt(sp[1]) - 1, parseInt(sp[2]))
        var label = getDayLabel(keyDate, today)
        var dayEvents = grouped[dateKey]

        return (
          <div key={dateKey} style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: isSameDay(keyDate, today) ? colors.accent : colors.subtext,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              paddingBottom: '0.25rem',
              borderBottom: '1px solid ' + colors.border,
            }}>
              {label}
            </div>
            {dayEvents.map(function (event, i) {
              var current = isNow(event)
              var eventColor = event.color || (current ? colors.accent : undefined)
              var borderColor = eventColor || (current ? colors.accent : colors.border)
              return (
                <div key={event.id || dateKey + '-' + i} style={{
                  display: 'flex',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  backgroundColor: current ? colors.accent + '15' : colors.cardBg,
                  borderRadius: '0.5rem',
                  borderLeft: '4px solid ' + borderColor,
                }}>
                  <div style={{ minWidth: '5rem', marginRight: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isAllDay(event) ? colors.accent : colors.text }}>
                      {formatEventTime(event)}
                    </div>
                    {!isAllDay(event) && (
                      <div style={{ fontSize: '0.75rem', color: colors.subtext }}>{formatTime(event.end?.dateTime || '')}</div>
                    )}
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
      })}
    </div>
  )
}

// ─── MonthView ──────────────────────────────────────────────────────────────

function MonthView({ events, colors }: { events: CalendarEvent[]; colors: ThemeColors }) {
  var now = new Date()
  var today = startOfDay(now)
  var monthStart = startOfMonth(now)
  var monthEnd = endOfMonth(now)
  var gridStart = startOfWeek(monthStart)
  // Grid must end on Saturday (6 weeks max)
  var gridEnd = addDays(startOfWeek(addDays(monthEnd, 6)), 6)
  // Ensure we always have complete weeks
  if (gridEnd < monthEnd) gridEnd = addDays(gridEnd, 7)
  var days = getDaysInRange(gridStart, gridEnd)

  var grouped = groupEventsByDate(events)

  var MAX_CHIPS = 3

  var cellStyle: CSSProperties = {
    width: '14.285%',
    minHeight: '4.5rem',
    padding: '0.25rem',
    borderBottom: '1px solid ' + colors.border,
    borderRight: '1px solid ' + colors.border,
    overflow: 'hidden',
    boxSizing: 'border-box',
  }

  // Build week rows
  var weeks: Date[][] = []
  for (var w = 0; w < days.length; w += 7) {
    weeks.push(days.slice(w, w + 7))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Month + Year header */}
      <div style={{ padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: 700, color: colors.text }}>
        {MONTH_NAMES[now.getMonth()] + ' ' + now.getFullYear()}
      </div>

      {/* Day-of-week labels */}
      <div style={{ display: 'flex', borderBottom: '2px solid ' + colors.border }}>
        {DAY_NAMES.map(function (d) {
          return (
            <div key={d} style={{
              width: '14.285%',
              textAlign: 'center',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: colors.subtext,
              padding: '0.25rem 0',
              boxSizing: 'border-box',
            }}>
              {d}
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {weeks.map(function (week, wi) {
          return (
            <div key={wi} style={{ display: 'flex' }}>
              {week.map(function (day, di) {
                var inMonth = day.getMonth() === now.getMonth()
                var isToday = isSameDay(day, today)
                var isPast = day < today && !isToday
                var key = toDateKey(day)
                var dayEvents = grouped[key] || []

                var opacity = !inMonth ? 0.25 : isPast ? 0.4 : 1

                return (
                  <div key={di} style={{
                    ...cellStyle,
                    opacity: opacity,
                  }}>
                    {/* Date number */}
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#fff' : colors.text,
                      width: isToday ? '1.4rem' : 'auto',
                      height: isToday ? '1.4rem' : 'auto',
                      lineHeight: isToday ? '1.4rem' : 'normal',
                      textAlign: 'center',
                      borderRadius: '50%',
                      backgroundColor: isToday ? colors.accent : 'transparent',
                      marginBottom: '0.15rem',
                      display: 'inline-block',
                    }}>
                      {day.getDate()}
                    </div>

                    {/* Event chips */}
                    {dayEvents.slice(0, MAX_CHIPS).map(function (ev, ei) {
                      return (
                        <div key={ev.id || ei} style={{
                          fontSize: '0.6rem',
                          lineHeight: '1.1rem',
                          padding: '0 0.2rem',
                          marginBottom: '1px',
                          borderLeft: '3px solid ' + (ev.color || colors.accent),
                          backgroundColor: (ev.color || colors.accent) + '18',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: colors.text,
                        }}>
                          {ev.summary || 'Untitled'}
                        </div>
                      )
                    })}
                    {dayEvents.length > MAX_CHIPS && (
                      <div style={{ fontSize: '0.55rem', color: colors.subtext, paddingLeft: '0.2rem' }}>
                        +{dayEvents.length - MAX_CHIPS} more
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── TimeGrid (shared by WeekView + DayView) ────────────────────────────────

var HOUR_HEIGHT = 48 // px per hour
var GRID_START_HOUR = 0
var GRID_END_HOUR = 24
var TIME_COL_WIDTH = 50

function TimeGrid({ dates, events, colors, autoScroll }: { dates: Date[]; events: CalendarEvent[]; colors: ThemeColors; autoScroll?: boolean }) {
  var [currentTime, setCurrentTime] = useState(new Date())
  var scrollRef = useRef<HTMLDivElement>(null)
  var today = startOfDay(new Date())
  var grouped = groupEventsByDate(events)

  // Auto-scroll to current time (1 hour before) on mount
  useEffect(function () {
    if (autoScroll !== false && scrollRef.current) {
      var now = new Date()
      var scrollToHour = Math.max(0, getTimePosition(now) - 1)
      scrollRef.current.scrollTop = scrollToHour * HOUR_HEIGHT
    }
  }, [autoScroll])

  // Update current time line every 60s
  useEffect(function () {
    var interval = setInterval(function () {
      setCurrentTime(new Date())
    }, 60000)
    return function () { clearInterval(interval) }
  }, [])

  var hours: number[] = []
  for (var h = GRID_START_HOUR; h < GRID_END_HOUR; h++) {
    hours.push(h)
  }

  var totalHeight = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT

  // Check if any day has all-day events
  var hasAnyAllDay = false
  for (var d = 0; d < dates.length; d++) {
    var dk = toDateKey(dates[d])
    var de = grouped[dk] || []
    var p = partitionEvents(de)
    if (p.allDay.length > 0) { hasAnyAllDay = true; break }
  }

  var colWidth = dates.length === 1 ? '100%' : (100 / dates.length) + '%'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Day headers */}
      <div style={{ display: 'flex', borderBottom: '2px solid ' + colors.border, flexShrink: 0 }}>
        {/* Spacer for time axis */}
        <div style={{ width: TIME_COL_WIDTH + 'px', flexShrink: 0 }} />
        {dates.map(function (date, i) {
          var isToday = isSameDay(date, today)
          return (
            <div key={i} style={{
              width: colWidth,
              textAlign: 'center',
              padding: '0.4rem 0',
              borderLeft: i > 0 ? '1px solid ' + colors.border : 'none',
              boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: isToday ? colors.accent : colors.subtext, textTransform: 'uppercase' }}>
                {DAY_NAMES[date.getDay()]}
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: isToday ? 700 : 400,
                color: isToday ? '#fff' : colors.text,
                width: isToday ? '1.8rem' : 'auto',
                height: isToday ? '1.8rem' : 'auto',
                lineHeight: isToday ? '1.8rem' : 'normal',
                borderRadius: '50%',
                backgroundColor: isToday ? colors.accent : 'transparent',
                display: 'inline-block',
                textAlign: 'center',
              }}>
                {date.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* All-day section */}
      {hasAnyAllDay && (
        <div style={{ display: 'flex', borderBottom: '1px solid ' + colors.border, flexShrink: 0 }}>
          <div style={{ width: TIME_COL_WIDTH + 'px', flexShrink: 0, fontSize: '0.6rem', color: colors.subtext, padding: '0.25rem 0.2rem', textAlign: 'right' }}>
            ALL DAY
          </div>
          {dates.map(function (date, i) {
            var k = toDateKey(date)
            var dayEvts = grouped[k] || []
            var parts = partitionEvents(dayEvts)
            return (
              <div key={i} style={{
                width: colWidth,
                padding: '0.2rem',
                borderLeft: i > 0 ? '1px solid ' + colors.border : 'none',
                boxSizing: 'border-box',
              }}>
                {parts.allDay.map(function (ev, ei) {
                  return (
                    <div key={ev.id || ei} style={{
                      fontSize: '0.65rem',
                      padding: '0.15rem 0.3rem',
                      marginBottom: '2px',
                      backgroundColor: (ev.color || colors.accent) + '25',
                      borderLeft: '3px solid ' + (ev.color || colors.accent),
                      borderRadius: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: colors.text,
                    }}>
                      {ev.summary || 'Untitled'}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* Scrollable time grid */}
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', position: 'relative', minHeight: totalHeight + 'px' }}>
          {/* Time axis */}
          <div style={{ width: TIME_COL_WIDTH + 'px', flexShrink: 0, position: 'relative' }}>
            {hours.map(function (h) {
              var label = h === 0 ? '12 AM' : h < 12 ? h + ' AM' : h === 12 ? '12 PM' : (h - 12) + ' PM'
              return (
                <div key={h} style={{
                  position: 'absolute',
                  top: ((h - GRID_START_HOUR) * HOUR_HEIGHT) + 'px',
                  right: '0.4rem',
                  fontSize: '0.6rem',
                  color: colors.subtext,
                  lineHeight: '1',
                  transform: 'translateY(-50%)',
                }}>
                  {h > 0 ? label : ''}
                </div>
              )
            })}
          </div>

          {/* Day columns */}
          {dates.map(function (date, colIdx) {
            var k = toDateKey(date)
            var dayEvts = grouped[k] || []
            var parts = partitionEvents(dayEvts)
            var isToday = isSameDay(date, today)

            return (
              <div key={colIdx} style={{
                width: colWidth,
                position: 'relative',
                borderLeft: colIdx > 0 ? '1px solid ' + colors.border : 'none',
                boxSizing: 'border-box',
              }}>
                {/* Hour grid lines */}
                {hours.map(function (h) {
                  return (
                    <div key={h} style={{
                      position: 'absolute',
                      top: ((h - GRID_START_HOUR) * HOUR_HEIGHT) + 'px',
                      left: 0,
                      right: 0,
                      borderTop: '1px solid ' + colors.border,
                      height: 0,
                    }} />
                  )
                })}

                {/* Timed events */}
                {parts.timed.map(function (ev, ei) {
                  var evStart = new Date(ev.start?.dateTime || '')
                  var evEnd = new Date(ev.end?.dateTime || '')
                  var startPos = getTimePosition(evStart)
                  var endPos = getTimePosition(evEnd)
                  var duration = endPos - startPos
                  if (duration < 0.25) duration = 0.25 // minimum height

                  return (
                    <div key={ev.id || ei} style={{
                      position: 'absolute',
                      top: ((startPos - GRID_START_HOUR) * HOUR_HEIGHT) + 'px',
                      height: (duration * HOUR_HEIGHT) + 'px',
                      left: '2px',
                      right: '2px',
                      backgroundColor: (ev.color || colors.accent) + '30',
                      borderLeft: '3px solid ' + (ev.color || colors.accent),
                      borderRadius: '3px',
                      padding: '0.15rem 0.25rem',
                      overflow: 'hidden',
                      fontSize: '0.65rem',
                      lineHeight: '1.2',
                      color: colors.text,
                      zIndex: 1,
                    }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.summary || 'Untitled'}
                      </div>
                      <div style={{ color: colors.subtext, fontSize: '0.6rem' }}>
                        {formatTime(ev.start?.dateTime || '')}
                      </div>
                    </div>
                  )
                })}

                {/* Current time line */}
                {isToday && (function () {
                  var pos = getTimePosition(currentTime)
                  var top = (pos - GRID_START_HOUR) * HOUR_HEIGHT
                  return (
                    <div style={{
                      position: 'absolute',
                      top: top + 'px',
                      left: 0,
                      right: 0,
                      zIndex: 2,
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-4px',
                        top: '-4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#EA4335',
                      }} />
                      <div style={{
                        height: '2px',
                        backgroundColor: '#EA4335',
                      }} />
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── WeekView ───────────────────────────────────────────────────────────────

function WeekView({ events, colors, autoScroll }: { events: CalendarEvent[]; colors: ThemeColors; autoScroll?: boolean }) {
  var today = startOfDay(new Date())
  var weekStart = startOfWeek(today)
  var dates: Date[] = []
  for (var i = 0; i < 7; i++) {
    dates.push(addDays(weekStart, i))
  }
  return <TimeGrid dates={dates} events={events} colors={colors} autoScroll={autoScroll} />
}

// ─── DayView ────────────────────────────────────────────────────────────────

function DayView({ events, colors, autoScroll }: { events: CalendarEvent[]; colors: ThemeColors; autoScroll?: boolean }) {
  var today = startOfDay(new Date())
  return <TimeGrid dates={[today]} events={events} colors={colors} autoScroll={autoScroll} />
}

// ─── MeetingRoomView ────────────────────────────────────────────────────────

function MeetingRoomView({ events, colors, config }: { events: CalendarEvent[]; colors: ThemeColors; config: GoogleCalendarConfig }) {
  var now = Date.now()
  var currentEvent = events.find(function (e) { return isNow(e) })
  var nextEvent = events.find(function (e) {
    var start = new Date(e.start?.dateTime || e.start?.date || '').getTime()
    return start > now
  })

  var isAvailable = !currentEvent
  var statusColor = isAvailable ? colors.available : colors.busy

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
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: colors.cardBg, borderRadius: '0.75rem', border: '1px solid ' + colors.border }}>
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

// ─── Main Renderer ──────────────────────────────────────────────────────────

export function GoogleCalendarRenderer({ config }: GoogleCalendarRendererProps) {
  var display_mode = config.display_mode || 'agenda'
  var theme = config.theme || 'dark'
  var _data = config._data

  var calendarColor = _data?.calendar_color
  var colors = useMemo(function () { return resolveTheme(theme, calendarColor) }, [theme, calendarColor])
  var events = _data?.events || []
  var calendarName = _data?.calendar_name || ''

  var containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  var headerStyle: CSSProperties = {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid ' + colors.border,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  }

  function renderView() {
    switch (display_mode) {
      case 'meeting_room':
        return <MeetingRoomView events={events} colors={colors} config={config} />
      case 'month':
        return <MonthView events={events} colors={colors} />
      case 'week':
        return <WeekView events={events} colors={colors} autoScroll={config.auto_scroll} />
      case 'day':
        return <DayView events={events} colors={colors} autoScroll={config.auto_scroll} />
      case 'agenda':
      default:
        return <AgendaView events={events} colors={colors} config={config} />
    }
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
        {renderView()}
      </div>
    </div>
  )
}
