'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Calendar, Clock, X, Plus, ChevronDown } from 'lucide-react'
import { useChannels, useCreateSchedule, useUpdateSchedule } from '@/hooks/queries'

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const PRIORITY_OPTIONS = [
  { id: 'high',   label: 'High',   desc: 'Overrides other schedules',  apiVal: 3 },
  { id: 'medium', label: 'Medium', desc: 'Default priority',           apiVal: 2 },
  { id: 'low',    label: 'Low',    desc: 'Yields to other schedules',  apiVal: 1 },
] as const

type PriorityId = 'high' | 'medium' | 'low'

// ── Helpers ───────────────────────────────────────────────────────────────────
function computeDuration(start: string, end: string, dayCount: number) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const totalMins = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMins <= 0) return { perDay: '—', perWeek: '—' }
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  const perDay  = m ? `${h}h ${m}m` : `${h}h`
  const perWeek = `${(h + Math.ceil(m / 60)) * dayCount}h`
  return { perDay, perWeek }
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  schedule?: any
  workspaceId: number | string
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  backgroundColor: '#e0f2fe',
  border: '1px solid #bae6fd',
  borderRadius: 10,
  padding: '0 12px',
  fontSize: 13,
  color: '#0c4a6e',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#0c4a6e',
  display: 'block',
  marginBottom: 8,
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ScheduleModal({ isOpen, onClose, schedule, workspaceId }: ScheduleModalProps) {
  const [name, setName]             = useState(schedule?.name || '')
  const [startTime, setStartTime]   = useState(schedule?.start_time || '09:00')
  const [endTime, setEndTime]       = useState(schedule?.end_time || '17:00')
  const [selectedDays, setSelectedDays] = useState<number[]>(schedule?.days_of_week || [0, 1, 2, 3, 4])
  const [repeat, setRepeat]         = useState('weekly')
  const [startDate, setStartDate]   = useState('')
  const [endDate, setEndDate]       = useState('')
  const [priority, setPriority]     = useState<PriorityId>('medium')
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(schedule?.channel_ids || [])

  const { data: channelsData }   = useChannels(workspaceId)
  const createScheduleMutation   = useCreateSchedule()
  const updateScheduleMutation   = useUpdateSchedule()

  const channels   = Array.isArray(channelsData) ? channelsData : []
  const isPending  = createScheduleMutation.isPending || updateScheduleMutation.isPending
  const duration   = useMemo(() => computeDuration(startTime, endTime, selectedDays.length), [startTime, endTime, selectedDays.length])
  const priorityApiVal = PRIORITY_OPTIONS.find(p => p.id === priority)?.apiVal ?? 2

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleClose = () => {
    setName(''); setStartTime('09:00'); setEndTime('17:00')
    setSelectedDays([0, 1, 2, 3, 4]); setRepeat('weekly')
    setStartDate(''); setEndDate(''); setPriority('medium')
    setSelectedChannelIds([])
    onClose()
  }

  const toggleDay     = (i: number) => setSelectedDays(p => p.includes(i) ? p.filter(d => d !== i) : [...p, i].sort())
  const toggleChannel = (id: string) => setSelectedChannelIds(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !startTime || !endTime || selectedDays.length === 0) return
    try {
      const data = {
        name, start_time: startTime, end_time: endTime,
        days_of_week: selectedDays, is_active: true,
        channel_id: selectedChannelIds[0] || '',
        type: 'recurring' as const,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        priority: priorityApiVal,
      }
      if (schedule) {
        await updateScheduleMutation.mutateAsync({ workspaceId, scheduleId: schedule.schedule_id, data })
      } else {
        await createScheduleMutation.mutateAsync({ workspaceId, data })
      }
      handleClose()
    } catch { /* toast handled at higher level */ }
  }

  const summaryText = `${selectedDays.length} day${selectedDays.length !== 1 ? 's' : ''} · ${selectedChannelIds.length} channel${selectedChannelIds.length !== 1 ? 's' : ''} · ${PRIORITY_OPTIONS.find(p => p.id === priority)?.label} priority`

  const focusPrimary = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#0ea5e9'
  }
  const blurDefault = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#bae6fd'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        hideClose
        className="!p-0 max-w-[480px] max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* ── Header ── */}
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #bae6fd', display: 'flex', alignItems: 'flex-start', gap: 14, flexShrink: 0 }}>
          {/* Calendar icon badge */}
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Calendar className="h-5 w-5" style={{ color: '#0ea5e9' }} />
          </div>

          {/* Title + subtitle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0c4a6e', margin: 0, lineHeight: 1.2 }}>
              {schedule ? 'Edit Schedule' : 'Create New Schedule'}
            </h2>
            <p style={{ fontSize: 13, color: '#0369a1', margin: '4px 0 0' }}>
              Configure when your content should play
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <X className="h-4 w-4" style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Schedule Name ── */}
            <div>
              <label style={labelStyle}>Schedule Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Business Hours, Weekend Display"
                required
                style={{ ...inputStyle, height: 48, fontSize: 14 }}
                onFocus={focusPrimary}
                onBlur={blurDefault}
              />
            </div>

            {/* ── Start / End Time ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {([['Start Time', startTime, setStartTime], ['End Time', endTime, setEndTime]] as const).map(([label, value, setter]) => (
                <div key={label}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Clock className="h-4 w-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none', zIndex: 1 }} />
                    <input
                      type="time"
                      value={value}
                      onChange={e => setter(e.target.value)}
                      required
                      style={{ ...inputStyle, height: 48, paddingLeft: 36, fontSize: 15, fontWeight: 600 }}
                      onFocus={focusPrimary}
                      onBlur={blurDefault}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Duration row ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: -10 }}>
              <Clock className="h-3.5 w-3.5" style={{ color: '#6b7280', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#0369a1' }}>
                Duration: <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{duration.perDay}</span> per day · {duration.perWeek} / week
              </span>
            </div>

            {/* ── Days of Week ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Days of Week</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    ['Weekdays', () => setSelectedDays([0, 1, 2, 3, 4])],
                    ['Weekends', () => setSelectedDays([5, 6])],
                    ['All',      () => setSelectedDays([0, 1, 2, 3, 4, 5, 6])],
                  ].map(([label, fn]) => (
                    <button
                      key={label as string}
                      type="button"
                      onClick={fn as () => void}
                      style={{ fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {label as string}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {DAYS.map((day, idx) => {
                  const isSelected = selectedDays.includes(idx)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      style={{ height: 44, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: isSelected ? 'linear-gradient(135deg, #0ea5e9, #06b6d4)' : '#e0f2fe', color: isSelected ? '#FFFFFF' : '#0369a1', transition: 'all 0.15s' }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Repeat + Start Date + End Date ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {/* Repeat */}
              <div>
                <label style={labelStyle}>Repeat</label>
                <div style={{ position: 'relative' }}>
                  <Select
                    value={repeat}
                    onValueChange={(val) => setRepeat(val)}
                    options={[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'never', label: 'Never' },
                    ]}
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label style={labelStyle}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{ ...inputStyle, color: startDate ? '#0c4a6e' : '#6b7280' }}
                  onFocus={focusPrimary}
                  onBlur={blurDefault}
                />
              </div>

              {/* End Date */}
              <div>
                <label style={labelStyle}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  style={{ ...inputStyle, color: endDate ? '#0c4a6e' : '#6b7280' }}
                  onFocus={focusPrimary}
                  onBlur={blurDefault}
                />
              </div>
            </div>

            {/* ── Priority ── */}
            <div>
              <label style={labelStyle}>Priority</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {PRIORITY_OPTIONS.map(opt => {
                  const isSelected = priority === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPriority(opt.id)}
                      style={{ padding: '12px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', border: isSelected ? '1px solid rgba(14,165,233,0.50)' : '1px solid #bae6fd', backgroundColor: isSelected ? 'rgba(14,165,233,0.08)' : '#FFFFFF', transition: 'all 0.15s' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isSelected ? '#0ea5e9' : '#6b7280', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#0ea5e9' : '#0369a1' }}>
                          {opt.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.35 }}>{opt.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Channels ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Channels</label>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  {selectedChannelIds.length} of {channels.length} selected
                </span>
              </div>
              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {channels.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>No channels available. Create channels first.</p>
                  </div>
                ) : (
                  channels.map((ch: any) => {
                    const isChSelected = selectedChannelIds.includes(ch.channel_id)
                    const isPublished  = ch.status === 'published' || ch.is_active
                    return (
                      <button
                        key={ch.channel_id}
                        type="button"
                        onClick={() => toggleChannel(ch.channel_id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: 'none', textAlign: 'left', backgroundColor: isChSelected ? 'rgba(14,165,233,0.08)' : '#FFFFFF', outline: isChSelected ? '1px solid rgba(14,165,233,0.30)' : '1px solid #bae6fd', transition: 'all 0.15s' }}
                      >
                        {/* Channel TV icon */}
                        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#e0f2fe', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 14, height: 10, borderRadius: 2, border: '1.5px solid #6b7280' }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#0c4a6e', flex: 1 }}>{ch.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, color: isPublished ? '#059669' : '#6b7280' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isPublished ? '#059669' : '#6b7280', display: 'inline-block', flexShrink: 0 }} />
                          {isPublished ? 'Published' : ch.status || 'Draft'}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

          </div>{/* end scroll area */}

          {/* ── Fixed Footer ── */}
          <div style={{ borderTop: '1px solid #bae6fd', padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: '#6b7280', flex: 1 }}>{summaryText}</span>

            <button
              type="button"
              onClick={handleClose}
              style={{ height: 44, padding: '0 20px', borderRadius: 10, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              style={{ height: 44, padding: '0 20px', borderRadius: 10, background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, border: 'none', whiteSpace: 'nowrap' }}
            >
              {isPending ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {schedule ? 'Update Schedule' : 'Create Schedule'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
