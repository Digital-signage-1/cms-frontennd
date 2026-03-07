'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Calendar, Grid3X3, Trash2, X } from 'lucide-react'
import {
  useSchedules, useDeleteSchedule,
  useUpcomingOverrides, useCreateOverride, useDeleteOverride, useChannels,
} from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import { ScheduleModal } from '@/components/schedules/ScheduleModal'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'

// ── Design tokens ──────────────────────────────────────────────────────────────
const PALETTE = [
  { bg: 'rgba(245,166,36,0.22)',  border: 'rgba(245,166,36,0.55)',  text: '#F5A624', dot: '#F5A624' },
  { bg: 'rgba(96,165,250,0.20)', border: 'rgba(96,165,250,0.50)',  text: '#93C5FD', dot: '#60A5FA' },
  { bg: 'rgba(52,211,153,0.20)', border: 'rgba(52,211,153,0.50)',  text: '#6EE7B7', dot: '#34D399' },
  { bg: 'rgba(167,139,250,0.20)',border: 'rgba(167,139,250,0.50)', text: '#C4B5FD', dot: '#818CF8' },
  { bg: 'rgba(251,113,133,0.20)',border: 'rgba(251,113,133,0.50)', text: '#FDA4AF', dot: '#FB7185' },
  { bg: 'rgba(45,212,191,0.20)', border: 'rgba(45,212,191,0.50)',  text: '#5EEAD4', dot: '#2DD4BF' },
]

const DAYS      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS     = Array.from({ length: 24 }, (_, i) => i)
const HOUR_W    = 76  // px per hour column
const BLOCK_H   = 26  // px per schedule block
const BLOCK_GAP = 4   // px gap between stacked blocks
const ROW_PAD   = 6   // top + bottom padding within a row

const OVERRIDE_INPUT_CLASSES = 'w-full h-9 bg-input border border-input-border rounded-lg px-2.5 text-[13px] text-text-primary outline-none focus:border-primary'

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
    <div className="rounded-xl overflow-hidden bg-surface border border-border">
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${60 + 24 * HOUR_W}px` }}>

          {/* ── Time header row ── */}
          <div className="flex sticky top-0 z-20 bg-surface border-b border-border">
            {/* DAY label */}
            <div
              className="flex-shrink-0 flex items-center justify-center text-xs font-semibold tracking-widest uppercase text-text-muted border-r border-border"
              style={{ width: 60, height: 40 }}
            >
              DAY
            </div>
            {/* Hour labels */}
            {HOURS.map((h) => {
              const isCurrent = h === currentHour
              return (
                <div
                  key={h}
                  className={`flex-shrink-0 flex items-end pb-1 pl-1.5 text-xs font-medium relative ${isCurrent ? 'text-primary' : 'text-text-muted'}`}
                  style={{
                    width: HOUR_W,
                    height: 40,
                    borderRight: '1px solid var(--color-border-subtle)',
                  }}
                >
                  {h.toString().padStart(2, '0')}:00
                  {/* Current time tick mark */}
                  {isCurrent && (
                    <div
                      className="absolute bottom-0 w-0.5 bg-primary"
                      style={{ height: 6, left: (currentHourDecimal - h) * HOUR_W }}
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
                className="flex relative border-b border-border"
                style={{
                  height: rowHeight,
                  backgroundColor: isToday ? 'var(--color-primary-light)' : 'transparent',
                }}
              >
                {/* Day label */}
                <div
                  className={`flex-shrink-0 flex items-center justify-center text-xs font-semibold border-r border-border ${isToday ? 'text-primary' : 'text-text-muted'}`}
                  style={{ width: 60 }}
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
                        backgroundColor: 'var(--color-border-subtle)',
                      }}
                    />
                  ))}

                  {/* Current time vertical line */}
                  <div
                    className="absolute top-0 bottom-0 z-10 pointer-events-none bg-primary"
                    style={{
                      left: currentHourDecimal * HOUR_W,
                      width: 2,
                    }}
                  />

                  {/* Schedule blocks — data-driven colors kept as-is */}
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
    <div className="min-h-screen">

      {/* ── Hero Banner ── */}
      <div className="page-container pt-4 sm:pt-5">
        <div
          className="rounded-xl relative overflow-hidden border border-primary/20"
          style={{
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 50%, var(--color-surface-hover) 100%)',
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 responsive-hero pb-5">
            {/* Top row: label + heading + button */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2 text-primary">
                  Schedule Timeline
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold text-text-primary mb-2">Schedules</h1>
                <p className="text-sm max-w-xl text-text-muted">
                  Visualize and manage your content schedules. Automate playback across your display network.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm flex-shrink-0 sm:mt-1 self-start touch-target bg-primary text-on-primary"
              >
                <Plus className="h-4 w-4" />
                New Schedule
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Total Schedules */}
              <div className="rounded-xl p-4 flex items-center gap-3 bg-surface border border-border">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 bg-surface-hover">
                  📅
                </div>
                <div>
                  <p className="text-xs mb-0.5 text-text-muted">Total Schedules</p>
                  <p className="text-xl font-bold text-primary">{stats.total}</p>
                </div>
              </div>

              {/* Active */}
              <div className="rounded-xl p-4 flex items-center gap-3 bg-surface border border-border">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-surface-hover">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22C55E' }} />
                </div>
                <div>
                  <p className="text-xs mb-0.5 text-text-muted">Active</p>
                  <p className="text-xl font-bold" style={{ color: '#34D399' }}>{stats.active}</p>
                </div>
              </div>

              {/* Paused */}
              <div className="rounded-xl p-4 flex items-center gap-3 bg-surface border border-border">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 bg-surface-hover">
                  ⏸
                </div>
                <div>
                  <p className="text-xs mb-0.5 text-text-muted">Paused</p>
                  <p className="text-xl font-bold text-text-primary">{stats.paused}</p>
                </div>
              </div>

              {/* Drafts */}
              <div className="rounded-xl p-4 flex items-center gap-3 bg-surface border border-border">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 bg-surface-hover">
                  📝
                </div>
                <div>
                  <p className="text-xs mb-0.5 text-text-muted">Drafts</p>
                  <p className="text-xl font-bold text-text-primary">{stats.drafts}</p>
                </div>
              </div>

              {/* Time Slots */}
              <div className="rounded-xl p-4 flex items-center gap-3 bg-surface border border-border">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 bg-surface-hover">
                  ⏰
                </div>
                <div>
                  <p className="text-xs mb-0.5 text-text-muted">Time Slots</p>
                  <p className="text-xl font-bold" style={{ color: '#60A5FA' }}>{stats.timeSlots}</p>
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
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex-shrink-0 touch-target ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Search + view toggle */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none w-52 bg-surface border border-border text-text-primary focus:border-primary"
            />
          </div>

          {/* Calendar / timeline view */}
          <button
            onClick={() => setViewMode('timeline')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'timeline'
                ? 'bg-primary text-on-primary'
                : 'bg-surface border border-border text-text-muted hover:bg-surface-hover'
            }`}
          >
            <Calendar className="h-4 w-4" />
          </button>

          {/* Grid view */}
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary text-on-primary'
                : 'bg-surface border border-border text-text-muted hover:bg-surface-hover'
            }`}
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
                <span className="text-xs text-text-secondary">
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
          <div className="rounded-xl animate-pulse bg-surface border border-border" style={{ height: 400 }} />
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
            <div className="rounded-xl flex flex-col items-center justify-center py-16 bg-surface border border-border">
              <p className="text-sm text-text-muted">No schedules found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchedules.map((s: any, idx: number) => {
                const pal = PALETTE[s.colorIndex ?? idx % PALETTE.length]
                return (
                  <div
                    key={s.schedule_id}
                    className="rounded-xl p-4 bg-surface border border-border"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: pal.dot }}
                      />
                      <p className="text-sm font-semibold text-text-primary truncate">{s.name}</p>
                    </div>
                    {s.start_time && s.end_time && (
                      <p className="text-xs mb-2 text-text-muted">
                        {s.start_time} – {s.end_time}
                      </p>
                    )}
                    <div
                      className="text-xs px-2 py-0.5 rounded-full inline-block font-medium"
                      style={
                        s.status === 'active'
                          ? { backgroundColor: 'rgba(52,211,153,0.15)', color: '#34D399' }
                          : s.status === 'paused'
                          ? { backgroundColor: 'rgba(245,166,36,0.15)', color: '#F5A624' }
                          : { backgroundColor: 'rgba(148,163,184,0.15)', color: '#94A3B8' }
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
        <div className="rounded-xl overflow-hidden bg-surface border border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-text-primary">Schedule Overrides</h2>
              <p className="text-xs mt-0.5 text-text-muted">
                Temporary overrides that take priority over regular schedules
              </p>
            </div>
            <button
              onClick={() => setShowOverrideForm(!showOverrideForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary"
            >
              {showOverrideForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showOverrideForm ? 'Cancel' : 'Add Override'}
            </button>
          </div>

          {/* Inline form */}
          {showOverrideForm && (
            <div className="px-5 py-4 border-b border-border bg-primary/5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[11px] text-text-muted block mb-1">Override Name *</label>
                  <input
                    value={overrideData.name}
                    onChange={(e) => setOverrideData({ ...overrideData, name: e.target.value })}
                    placeholder="e.g. Holiday Special"
                    className={OVERRIDE_INPUT_CLASSES}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted block mb-1">Channel *</label>
                  <select
                    value={overrideData.channel_id}
                    onChange={(e) => setOverrideData({ ...overrideData, channel_id: e.target.value })}
                    className={OVERRIDE_INPUT_CLASSES}
                  >
                    <option value="">Select channel…</option>
                    {(channelsData as { channel_id: string; name: string }[]).map((ch) => (
                      <option key={ch.channel_id} value={ch.channel_id}>{ch.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-text-muted block mb-1">Type *</label>
                  <select
                    value={overrideData.type}
                    onChange={(e) => setOverrideData({ ...overrideData, type: e.target.value as 'emergency' | 'special' | 'maintenance' })}
                    className={OVERRIDE_INPUT_CLASSES}
                  >
                    <option value="emergency">Emergency</option>
                    <option value="special">Special</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-text-muted block mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={overrideData.start_datetime}
                    onChange={(e) => setOverrideData({ ...overrideData, start_datetime: e.target.value })}
                    className={OVERRIDE_INPUT_CLASSES}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-text-muted block mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={overrideData.end_datetime}
                    onChange={(e) => setOverrideData({ ...overrideData, end_datetime: e.target.value })}
                    className={OVERRIDE_INPUT_CLASSES}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-[11px] text-text-muted block mb-1">Reason (optional)</label>
                <input
                  value={overrideData.reason}
                  onChange={(e) => setOverrideData({ ...overrideData, reason: e.target.value })}
                  placeholder="e.g. Public holiday, special event..."
                  className={OVERRIDE_INPUT_CLASSES}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowOverrideForm(false)}
                  className="h-9 px-4 rounded-lg bg-surface-alt border-none text-text-secondary text-[13px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOverride}
                  disabled={!overrideData.name || !overrideData.channel_id || !overrideData.start_datetime || !overrideData.end_datetime || createOverrideMutation.isPending}
                  className="h-9 px-5 rounded-lg bg-primary text-on-primary text-[13px] font-bold border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createOverrideMutation.isPending ? 'Creating...' : 'Create Override'}
                </button>
              </div>
            </div>
          )}

          {/* Override list */}
          {overridesLoading ? (
            <div className="py-8 text-center text-sm text-text-muted">Loading overrides…</div>
          ) : (upcomingOverrides as any[]).length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted">
              No upcoming overrides scheduled
            </div>
          ) : (
            <div className="divide-y divide-border">
              {(upcomingOverrides as any[]).map((override: any) => (
                <div key={override.override_id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-primary" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{override.name}</p>
                      <p className="text-xs mt-0.5 text-text-muted">
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
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-[13px] h-[13px]" />
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
