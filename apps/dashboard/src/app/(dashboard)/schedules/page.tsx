'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Calendar, Grid3X3, Trash2, X } from 'lucide-react'
import {
  useSchedules, useDeleteSchedule,
  useUpcomingOverrides, useCreateOverride, useDeleteOverride, useChannels,
} from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import { ScheduleModal } from '@/components/schedules/ScheduleModal'
import { Select } from '@/components/ui/select'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'

// ── Design tokens ──────────────────────────────────────────────────────────────
const PALETTE = [
  { bg: 'rgba(245,166,36,0.15)',  border: 'rgba(217,119,6,0.55)',   text: '#D97706', dot: '#D97706' },
  { bg: 'rgba(29,78,216,0.10)',   border: 'rgba(29,78,216,0.40)',   text: '#1D4ED8', dot: '#1D4ED8' },
  { bg: 'rgba(6,95,70,0.12)',     border: 'rgba(6,95,70,0.40)',     text: '#065F46', dot: '#065F46' },
  { bg: 'rgba(109,40,217,0.12)', border: 'rgba(109,40,217,0.40)',  text: '#6D28D9', dot: '#6D28D9' },
  { bg: 'rgba(190,18,60,0.10)',  border: 'rgba(190,18,60,0.40)',   text: '#BE123C', dot: '#BE123C' },
  { bg: 'rgba(15,118,110,0.12)', border: 'rgba(15,118,110,0.40)',  text: '#0F766E', dot: '#0F766E' },
]

const DAYS      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS     = Array.from({ length: 24 }, (_, i) => i)
const HOUR_W    = 76  // px per hour column
const BLOCK_H   = 26  // px per schedule block
const BLOCK_GAP = 4   // px gap between stacked blocks
const ROW_PAD   = 6   // top + bottom padding within a row

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseHour(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

function scheduleMatchesDay(s: any, dayIndex: number): boolean {
  if (!s.days_of_week || !Array.isArray(s.days_of_week)) return true
  return s.days_of_week.includes(dayIndex)
}

// ── Timeline component ────────────────────────────────────────────────────────
interface TimelineProps {
  schedules: any[]
  currentHourDecimal: number
  currentHourLabel: string
  todayIndex: number
}

function GanttTimeline({ schedules, currentHourDecimal, currentHourLabel, todayIndex }: TimelineProps) {
  const currentHour = Math.floor(currentHourDecimal)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}
    >
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${60 + 24 * HOUR_W}px` }}>

          {/* ── Time header row ── */}
          <div
            className="flex sticky top-0 z-20"
            style={{ backgroundColor: '#f0f9ff', borderBottom: '1px solid #bae6fd' }}
          >
            {/* DAY label */}
            <div
              className="flex-shrink-0 flex items-center justify-center text-xs font-semibold tracking-widest uppercase"
              style={{ width: 60, height: 40, color: '#0369a1', borderRight: '1px solid #bae6fd' }}
            >
              DAY
            </div>
            {/* Hour labels */}
            {HOURS.map((h) => {
              const isCurrent = h === currentHour
              return (
                <div
                  key={h}
                  className="flex-shrink-0 flex items-end pb-1 pl-1.5 text-xs font-medium relative"
                  style={{
                    width: HOUR_W,
                    height: 40,
                    color: isCurrent ? '#0ea5e9' : '#0369a1',
                    borderRight: '1px solid rgba(186,230,253,0.6)',
                  }}
                >
                  {h.toString().padStart(2, '0')}:00
                  {/* Current time tick mark */}
                  {isCurrent && (
                    <div
                      className="absolute bottom-0 left-0 w-0.5"
                      style={{ height: 6, backgroundColor: '#0ea5e9', left: (currentHourDecimal - h) * HOUR_W }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Day rows ── */}
          {DAYS.map((day, dayIndex) => {
            const daySchedules = schedules.filter((s) => scheduleMatchesDay(s, dayIndex))
            const rowHeight = Math.max(44, daySchedules.length * (BLOCK_H + BLOCK_GAP) + ROW_PAD * 2)
            const isToday = dayIndex === todayIndex

            return (
              <div
                key={day}
                className="flex relative"
                style={{
                  height: rowHeight,
                  borderBottom: '1px solid #bae6fd',
                  backgroundColor: isToday ? 'rgba(14,165,233,0.06)' : 'transparent',
                }}
              >
                {/* Day label */}
                <div
                  className="flex-shrink-0 flex items-center justify-center text-xs font-semibold"
                  style={{
                    width: 60,
                    color: isToday ? '#0ea5e9' : '#0369a1',
                    borderRight: '1px solid #bae6fd',
                  }}
                >
                  {day}
                </div>

                {/* Grid + blocks container */}
                <div className="flex-1 relative">
                  {/* Vertical hour grid lines */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0"
                      style={{
                        left: h * HOUR_W,
                        width: 1,
                        backgroundColor: 'rgba(186,230,253,0.7)',
                      }}
                    />
                  ))}

                  {/* Current time vertical line */}
                  <div
                    className="absolute top-0 bottom-0 z-10 pointer-events-none"
                    style={{
                      left: currentHourDecimal * HOUR_W,
                      width: 2,
                      backgroundColor: '#0ea5e9',
                    }}
                  />

                  {/* Schedule blocks */}
                  {daySchedules.map((schedule, blockIdx) => {
                    if (!schedule.start_time || !schedule.end_time) return null
                    const startH = parseHour(schedule.start_time)
                    const endH   = parseHour(schedule.end_time)
                    const left   = startH * HOUR_W
                    const width  = Math.max((endH - startH) * HOUR_W - 4, 60)
                    const top    = ROW_PAD + blockIdx * (BLOCK_H + BLOCK_GAP)
                    const pal    = PALETTE[schedule.colorIndex ?? blockIdx % PALETTE.length]

                    return (
                      <div
                        key={schedule.schedule_id}
                        className="absolute rounded-md overflow-hidden flex flex-col justify-center px-2"
                        style={{
                          left,
                          top,
                          width,
                          height: BLOCK_H,
                          backgroundColor: pal.bg,
                          borderTop: `1px solid ${pal.border}`,
                          borderRight: `1px solid ${pal.border}`,
                          borderBottom: `1px solid ${pal.border}`,
                          borderLeft: `2px solid ${pal.dot}`,
                        }}
                      >
                        <span
                          className="text-[10px] font-semibold leading-tight truncate"
                          style={{ color: pal.text }}
                        >
                          {schedule.name}
                        </span>
                        <span
                          className="text-[9px] leading-tight truncate"
                          style={{ color: `${pal.text}99` }}
                        >
                          {schedule.start_time} – {schedule.end_time}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SchedulesPage() {
  const workspace  = useAuthStore((s) => s.workspace)
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)
  const { data: rawSchedules = [], isLoading } = useSchedules(workspaceId)
  const deleteScheduleMutation = useDeleteSchedule()
  const { setBreadcrumbItems } = useBreadcrumb()

  const [filter,     setFilter]     = useState<'all' | 'active' | 'paused' | 'draft'>('all')
  const [searchQuery,setSearchQuery] = useState('')
  const [viewMode,   setViewMode]   = useState<'timeline' | 'grid'>('timeline')
  const [isModalOpen,setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)
  const [now, setNow] = useState(new Date())

  // Overrides
  const [showOverrideForm, setShowOverrideForm] = useState(false)
  const [overrideData, setOverrideData] = useState<{
    name: string; channel_id: string; type: 'emergency' | 'special' | 'maintenance'
    start_datetime: string; end_datetime: string; reason: string
  }>({
    name: '', channel_id: '', type: 'emergency', start_datetime: '', end_datetime: '', reason: '',
  })
  const { data: upcomingOverrides = [], isLoading: overridesLoading } = useUpcomingOverrides(workspaceId)
  const { data: channelsData = [] } = useChannels(workspaceId)
  const createOverrideMutation = useCreateOverride()
  const deleteOverrideMutation = useDeleteOverride()

  const handleCreateOverride = () => {
    if (!overrideData.name || !overrideData.channel_id || !overrideData.start_datetime || !overrideData.end_datetime) return
    createOverrideMutation.mutate(
      { workspaceId, data: overrideData },
      { onSuccess: () => { setShowOverrideForm(false); setOverrideData({ name: '', channel_id: '', type: 'emergency', start_datetime: '', end_datetime: '', reason: '' }) } }
    )
  }

  useEffect(() => {
    setBreadcrumbItems([{ label: 'Schedules' }])
  }, [setBreadcrumbItems])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const currentHourDecimal = now.getHours() + now.getMinutes() / 60
  const currentHourLabel   = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const todayIndex = now.getDay() // 0 = Sun

  // Enrich schedules with colorIndex + status
  const schedules = useMemo(() => {
    const list = Array.isArray(rawSchedules) ? rawSchedules : []
    return list.map((s: any, idx: number) => ({
      ...s,
      colorIndex: idx % PALETTE.length,
      status: s.is_active ? 'active' : (s.status ?? 'draft'),
    }))
  }, [rawSchedules])

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s: any) => {
      const matchSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchFilter =
        filter === 'all'    ||
        (filter === 'active' && s.status === 'active') ||
        (filter === 'paused' && s.status === 'paused') ||
        (filter === 'draft'  && s.status === 'draft')
      return matchSearch && matchFilter
    })
  }, [schedules, searchQuery, filter])

  // Stats
  const stats = useMemo(() => {
    const all = Array.isArray(rawSchedules) ? rawSchedules : []
    const active  = all.filter((s: any) => s.is_active).length
    const paused  = all.filter((s: any) => !s.is_active && s.status === 'paused').length
    const drafts  = all.filter((s: any) => s.status === 'draft').length
    const timeSlots = all.reduce((acc: number, s: any) => acc + (s.days_of_week?.length ?? 7), 0)
    return { total: all.length, active, paused, drafts, timeSlots }
  }, [rawSchedules])

  const FILTER_TABS = [
    { key: 'all',    label: 'All Schedules' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'draft',  label: 'Draft' },
  ] as const

  return (
    <div style={{ backgroundColor: '#f0f9ff', minHeight: '100vh' }}>

      {/* ── Hero Banner ── */}
      <div className="page-container pt-4 sm:pt-5">
        <div
          className="rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
            border: '1px solid #bae6fd',
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 responsive-hero pb-3">
            {/* Top row: label + heading + button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2.5">
              <div>
                <p
                  className="text-[10px] font-semibold tracking-widest uppercase mb-0.5"
                  style={{ color: '#0ea5e9' }}
                >
                  Schedule Timeline
                </p>
                <h1 className="text-lg sm:text-xl font-bold" style={{ color: '#0c4a6e' }}>Schedules</h1>
                <p className="text-xs mt-0.5 max-w-xl" style={{ color: '#0369a1' }}>
                  Visualize and manage your content schedules. Automate playback across your display network.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm flex-shrink-0 self-start sm:self-center touch-target"
                style={{ backgroundColor: '#0ea5e9', color: '#FFFFFF' }}
              >
                <Plus className="h-4 w-4" />
                New Schedule
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {/* Total Schedules */}
              <div
                className="rounded-lg px-3 py-2 flex items-center gap-2.5"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(14,165,233,0.07)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: 'rgba(14,165,233,0.08)' }}
                >
                  📅
                </div>
                <div>
                  <p className="text-[10px] leading-tight" style={{ color: '#0369a1' }}>Total Schedules</p>
                  <p className="text-sm font-bold" style={{ color: '#0ea5e9' }}>{stats.total}</p>
                </div>
              </div>

              {/* Active */}
              <div
                className="rounded-lg px-3 py-2 flex items-center gap-2.5"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(14,165,233,0.07)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(14,165,233,0.08)' }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22C55E' }} />
                </div>
                <div>
                  <p className="text-[10px] leading-tight" style={{ color: '#0369a1' }}>Active</p>
                  <p className="text-sm font-bold" style={{ color: '#34D399' }}>{stats.active}</p>
                </div>
              </div>

              {/* Paused */}
              <div
                className="rounded-lg px-3 py-2 flex items-center gap-2.5"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(14,165,233,0.07)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: 'rgba(14,165,233,0.08)' }}
                >
                  ⏸
                </div>
                <div>
                  <p className="text-[10px] leading-tight" style={{ color: '#0369a1' }}>Paused</p>
                  <p className="text-sm font-bold" style={{ color: '#0c4a6e' }}>{stats.paused}</p>
                </div>
              </div>

              {/* Drafts */}
              <div
                className="rounded-lg px-3 py-2 flex items-center gap-2.5"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(14,165,233,0.07)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: 'rgba(14,165,233,0.08)' }}
                >
                  📝
                </div>
                <div>
                  <p className="text-[10px] leading-tight" style={{ color: '#0369a1' }}>Drafts</p>
                  <p className="text-sm font-bold" style={{ color: '#0c4a6e' }}>{stats.drafts}</p>
                </div>
              </div>

              {/* Time Slots */}
              <div
                className="rounded-lg px-3 py-2 flex items-center gap-2.5"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(14,165,233,0.07)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: 'rgba(14,165,233,0.08)' }}
                >
                  ⏰
                </div>
                <div>
                  <p className="text-[10px] leading-tight" style={{ color: '#0369a1' }}>Time Slots</p>
                  <p className="text-sm font-bold" style={{ color: '#0ea5e9' }}>{stats.timeSlots}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar: filter tabs + search + view toggle ── */}
      <div className="page-container py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scroll-x">
          {FILTER_TABS.map(({ key, label }) => {
            const isActive = filter === key
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex-shrink-0 touch-target"
                style={
                  isActive
                    ? { backgroundColor: '#0ea5e9', color: '#FFFFFF' }
                    : { color: '#0369a1' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Search + view toggle */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: '#0369a1' }}
            />
            <input
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none w-52"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #bae6fd',
                color: '#0c4a6e',
              }}
            />
          </div>

          {/* Calendar / timeline view */}
          <button
            onClick={() => setViewMode('timeline')}
            className="p-2 rounded-lg transition-colors"
            style={
              viewMode === 'timeline'
                ? { backgroundColor: '#0ea5e9', color: '#FFFFFF' }
                : { backgroundColor: '#FFFFFF', border: '1px solid #bae6fd', color: '#0369a1' }
            }
          >
            <Calendar className="h-4 w-4" />
          </button>

          {/* Grid view */}
          <button
            onClick={() => setViewMode('grid')}
            className="p-2 rounded-lg transition-colors"
            style={
              viewMode === 'grid'
                ? { backgroundColor: '#0ea5e9', color: '#FFFFFF' }
                : { backgroundColor: '#FFFFFF', border: '1px solid #bae6fd', color: '#0369a1' }
            }
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      {filteredSchedules.length > 0 && (
        <div className="page-container pb-3 flex items-center gap-5 flex-wrap">
          {filteredSchedules.map((s: any, idx: number) => {
            const pal = PALETTE[s.colorIndex ?? idx % PALETTE.length]
            return (
              <div key={s.schedule_id} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: pal.dot }}
                />
                <span className="text-xs" style={{ color: '#0369a1' }}>
                  {s.name}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Main content ── */}
      <div className="page-container pb-5">
        {isLoading ? (
          <div
            className="rounded-xl animate-pulse"
            style={{ height: 400, backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
          />
        ) : viewMode === 'timeline' ? (
          <GanttTimeline
            schedules={filteredSchedules}
            currentHourDecimal={currentHourDecimal}
            currentHourLabel={currentHourLabel}
            todayIndex={todayIndex}
          />
        ) : (
          /* Grid / card view */
          filteredSchedules.length === 0 ? (
            <div
              className="rounded-xl flex flex-col items-center justify-center py-16"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
            >
              <p className="text-sm" style={{ color: '#0369a1' }}>No schedules found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchedules.map((s: any, idx: number) => {
                const pal = PALETTE[s.colorIndex ?? idx % PALETTE.length]
                return (
                  <div
                    key={s.schedule_id}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: pal.dot }}
                      />
                      <p className="text-sm font-semibold truncate" style={{ color: '#0c4a6e' }}>{s.name}</p>
                    </div>
                    {s.start_time && s.end_time && (
                      <p className="text-xs mb-2" style={{ color: '#0369a1' }}>
                        {s.start_time} – {s.end_time}
                      </p>
                    )}
                    <div
                      className="text-xs px-2 py-0.5 rounded-full inline-block font-medium"
                      style={
                        s.status === 'active'
                          ? { backgroundColor: 'rgba(52,211,153,0.15)', color: '#34D399' }
                          : s.status === 'paused'
                          ? { backgroundColor: 'rgba(14,165,233,0.12)', color: '#0ea5e9' }
                          : { backgroundColor: 'rgba(148,163,184,0.15)', color: '#6b7280' }
                      }
                    >
                      {s.status === 'active' ? 'Active' : s.status === 'paused' ? 'Paused' : 'Draft'}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* ── Overrides Panel ── */}
      <div className="px-5 pb-5">
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #bae6fd' }}>
            <div>
              <h2 className="text-base font-bold" style={{ color: '#0c4a6e' }}>Schedule Overrides</h2>
              <p className="text-xs mt-0.5" style={{ color: '#0369a1' }}>
                Temporary overrides that take priority over regular schedules
              </p>
            </div>
            <button
              onClick={() => setShowOverrideForm(!showOverrideForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#0ea5e9', color: '#FFFFFF' }}
            >
              {showOverrideForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showOverrideForm ? 'Cancel' : 'Add Override'}
            </button>
          </div>

          {/* Inline form */}
          {showOverrideForm && (
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #bae6fd', backgroundColor: 'rgba(14,165,233,0.06)' }}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={{ fontSize: 11, color: '#0369a1', display: 'block', marginBottom: 4 }}>Override Name *</label>
                  <input
                    value={overrideData.name}
                    onChange={(e) => setOverrideData({ ...overrideData, name: e.target.value })}
                    placeholder="e.g. Holiday Special"
                    style={{ width: '100%', height: 36, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 8, padding: '0 10px', fontSize: 13, color: '#0c4a6e', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0ea5e9')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#bae6fd')}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#0369a1', display: 'block', marginBottom: 4 }}>Channel *</label>
                  <Select
                    value={overrideData.channel_id || undefined}
                    onValueChange={(val) => setOverrideData({ ...overrideData, channel_id: val })}
                    placeholder="Select channel…"
                    options={(channelsData as { channel_id: string; name: string }[]).map((ch) => ({
                      value: ch.channel_id, label: ch.name,
                    }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#0369a1', display: 'block', marginBottom: 4 }}>Type *</label>
                  <Select
                    value={overrideData.type}
                    onValueChange={(val) => setOverrideData({ ...overrideData, type: val as 'emergency' | 'special' | 'maintenance' })}
                    options={[
                      { value: 'emergency', label: 'Emergency' },
                      { value: 'special', label: 'Special' },
                      { value: 'maintenance', label: 'Maintenance' },
                    ]}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#0369a1', display: 'block', marginBottom: 4 }}>Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={overrideData.start_datetime}
                    onChange={(e) => setOverrideData({ ...overrideData, start_datetime: e.target.value })}
                    style={{ width: '100%', height: 36, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 8, padding: '0 10px', fontSize: 13, color: '#0c4a6e', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#0369a1', display: 'block', marginBottom: 4 }}>End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={overrideData.end_datetime}
                    onChange={(e) => setOverrideData({ ...overrideData, end_datetime: e.target.value })}
                    style={{ width: '100%', height: 36, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 8, padding: '0 10px', fontSize: 13, color: '#0c4a6e', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label style={{ fontSize: 11, color: '#0369a1', display: 'block', marginBottom: 4 }}>Reason (optional)</label>
                <input
                  value={overrideData.reason}
                  onChange={(e) => setOverrideData({ ...overrideData, reason: e.target.value })}
                  placeholder="e.g. Public holiday, special event..."
                  style={{ width: '100%', height: 36, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 8, padding: '0 10px', fontSize: 13, color: '#0c4a6e', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#0ea5e9')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#bae6fd')}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowOverrideForm(false)}
                  style={{ height: 36, padding: '0 16px', borderRadius: 8, backgroundColor: '#e0f2fe', border: 'none', color: '#0369a1', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOverride}
                  disabled={!overrideData.name || !overrideData.channel_id || !overrideData.start_datetime || !overrideData.end_datetime || createOverrideMutation.isPending}
                  style={{ height: 36, padding: '0 20px', borderRadius: 8, backgroundColor: '#0ea5e9', color: '#FFFFFF', fontSize: 13, fontWeight: 700, border: 'none', cursor: createOverrideMutation.isPending ? 'not-allowed' : 'pointer', opacity: (!overrideData.name || !overrideData.channel_id || !overrideData.start_datetime || !overrideData.end_datetime || createOverrideMutation.isPending) ? 0.6 : 1 }}
                >
                  {createOverrideMutation.isPending ? 'Creating...' : 'Create Override'}
                </button>
              </div>
            </div>
          )}

          {/* Override list */}
          {overridesLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: '#0369a1' }}>Loading overrides…</div>
          ) : (upcomingOverrides as any[]).length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: '#0369a1' }}>
              No upcoming overrides scheduled
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#bae6fd' }}>
              {(upcomingOverrides as any[]).map((override: any) => (
                <div key={override.override_id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#0ea5e9', flexShrink: 0 }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0c4a6e' }}>{override.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#0369a1' }}>
                        {override.start_datetime ? new Date(override.start_datetime).toLocaleString() : '—'}
                        {' → '}
                        {override.end_datetime ? new Date(override.end_datetime).toLocaleString() : '—'}
                        {override.reason && ` · ${override.reason}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteOverrideMutation.mutate({ workspaceId, overrideId: override.override_id })}
                    disabled={deleteOverrideMutation.isPending}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 8, backgroundColor: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.20)', color: '#F87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSchedule(null) }}
        schedule={editingSchedule}
        workspaceId={workspaceId}
      />
    </div>
  )
}
