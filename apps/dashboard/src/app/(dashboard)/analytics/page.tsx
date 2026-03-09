'use client'

import { useState, useEffect, useMemo } from 'react'
import { Eye, Users, Clock, AlertTriangle, FileText, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useAnalyticsSummary, useAuditLogs, usePlaybackLogs } from '@/hooks/queries'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import type { AuditLogItem, PlaybackLog } from '@signage/api-client'
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const TIME_PERIODS = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom'] as const
type TimePeriod = typeof TIME_PERIODS[number]

function periodToDays(p: TimePeriod): number {
  if (p === 'Last 7 days') return 7
  if (p === 'Last 30 days') return 30
  return 30
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
    >
      <p className="mb-1 font-medium" style={{ color: '#0369a1' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

type AnalyticsTab = 'overview' | 'audit' | 'playback'
const PAGE_SIZE = 20

export default function AnalyticsPage() {
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)
  const { setBreadcrumbItems } = useBreadcrumb()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Last 30 days')
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('overview')
  const [auditPage, setAuditPage] = useState(0)
  const [playbackPage, setPlaybackPage] = useState(0)

  const days = periodToDays(timePeriod)

  const { data: summaryData } = useAnalyticsSummary(workspaceId || undefined)

  const { data: auditData, isLoading: auditLoading } = useAuditLogs(workspaceId || undefined, {
    limit: PAGE_SIZE,
    offset: auditPage * PAGE_SIZE,
  })

  const { data: playbackData, isLoading: playbackLoading } = usePlaybackLogs(workspaceId || undefined, {
    limit: PAGE_SIZE,
    offset: playbackPage * PAGE_SIZE,
    days,
  })

  const { data: trendsLogsData } = usePlaybackLogs(workspaceId || undefined, {
    limit: 500,
    days: Math.min(days, 30),
  })

  useEffect(() => {
    setBreadcrumbItems([{ label: 'Analytics' }])
  }, [setBreadcrumbItems])

  const auditItems = (auditData ?? []) as AuditLogItem[]
  const playbackItems = (playbackData ?? []) as PlaybackLog[]
  const trendsLogs = (trendsLogsData ?? []) as PlaybackLog[]

  const summary = (summaryData as any) ?? {}

  const totalViews = summary.total_content_views
    ? summary.total_content_views.toLocaleString()
    : '—'

  const activePlayers = summary.active_players != null
    ? String(summary.active_players)
    : '—'

  const avgDwellTime = (() => {
    const dur = summary.total_playback_duration_seconds
    const views = summary.total_content_views
    if (!dur || !views) return '—'
    const avgSec = Math.round(dur / views)
    return `${Math.floor(avgSec / 60)}m ${avgSec % 60}s`
  })()

  const totalErrors = summary.total_errors != null
    ? String(summary.total_errors)
    : '—'

  const KPI_CARDS = [
    {
      label: 'Total Content Views',
      value: totalViews,
      change: `Last ${summary.period_days ?? days} days`,
      valueColor: '#0ea5e9',
      iconColor: '#0ea5e9',
      iconBg: 'rgba(14,165,233,0.12)',
      Icon: Eye,
    },
    {
      label: 'Active Players',
      value: activePlayers,
      change: 'Unique players with activity',
      valueColor: '#0ea5e9',
      iconColor: '#0ea5e9',
      iconBg: 'rgba(14,165,233,0.12)',
      Icon: Users,
    },
    {
      label: 'Avg. Dwell Time',
      value: avgDwellTime,
      change: 'Per content view',
      valueColor: '#34D399',
      iconColor: '#34D399',
      iconBg: 'rgba(52,211,153,0.15)',
      Icon: Clock,
    },
    {
      label: 'Total Errors',
      value: totalErrors,
      change: `Last ${summary.period_days ?? days} days`,
      valueColor: '#F87171',
      iconColor: '#F87171',
      iconBg: 'rgba(248,113,113,0.15)',
      Icon: AlertTriangle,
    },
  ]

  const viewerTrends = useMemo(() => {
    if (!trendsLogs.length) return []
    const byDate = new Map<string, { views: number; uniquePlayers: Set<number> }>()
    trendsLogs.forEach((log) => {
      const d = new Date(log.started_at)
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
      if (!byDate.has(key)) byDate.set(key, { views: 0, uniquePlayers: new Set() })
      const entry = byDate.get(key)!
      entry.views++
      if (log.player_id) entry.uniquePlayers.add(log.player_id)
    })
    return Array.from(byDate.entries())
      .map(([date, data]) => ({ date, views: data.views, unique: data.uniquePlayers.size }))
  }, [trendsLogs])

  const hasMoreAudit = auditItems.length >= PAGE_SIZE
  const hasMorePlayback = playbackItems.length >= PAGE_SIZE

  return (
    <div style={{ backgroundColor: '#f0f9ff', minHeight: '100vh' }}>

      <div className="page-container pt-4 sm:pt-5">
        <div
          className="rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
            border: '1px solid #bae6fd',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 responsive-hero pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: '#0ea5e9' }}>
                  Analytics
                </p>
                <h1 className="text-lg sm:text-xl font-bold" style={{ color: '#0c4a6e' }}>Performance Metrics</h1>
                <p className="text-xs mt-0.5 max-w-2xl" style={{ color: '#0369a1' }}>
                  Track audience engagement, content performance, and device health across your display network.
                </p>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scroll-x flex-wrap sm:flex-nowrap flex-shrink-0">
                {TIME_PERIODS.map((t) => {
                  const isActive = timePeriod === t
                  return (
                    <button
                      key={t}
                      onClick={() => setTimePeriod(t)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 touch-target"
                      style={
                        isActive
                          ? { backgroundColor: '#0ea5e9', color: '#FFFFFF' }
                          : {
                              color: '#0369a1',
                              backgroundColor: 'rgba(14,165,233,0.06)',
                              border: '1px solid rgba(14,165,233,0.08)',
                            }
                      }
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {KPI_CARDS.map(({ label, value, change, valueColor, iconColor, iconBg, Icon }) => (
                <div
                  key={label}
                  className="rounded-lg px-3 py-2.5"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.75)',
                    border: '1px solid rgba(14,165,233,0.07)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconBg }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
                    </div>
                    <span className="text-xs" style={{ color: '#0369a1' }}>{label}</span>
                  </div>
                  <p className="text-xl font-bold tracking-tight" style={{ color: valueColor }}>
                    {value}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: '#0369a1' }}>
                    {change}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container pt-4 flex items-center gap-1 overflow-x-auto scroll-x pb-1">
        {([
          { key: 'overview', label: 'Overview',     Icon: Eye },
          { key: 'audit',    label: 'Audit Log',    Icon: FileText },
          { key: 'playback', label: 'Playback Log', Icon: Play },
        ] as { key: AnalyticsTab; label: string; Icon: any }[]).map(({ key, label, Icon }) => {
          const active = analyticsTab === key
          return (
            <button
              key={key}
              onClick={() => setAnalyticsTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                active
                  ? { backgroundColor: '#0ea5e9', color: '#FFFFFF' }
                  : { color: '#0369a1', backgroundColor: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.08)' }
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          )
        })}
      </div>

      {analyticsTab === 'overview' && (
        <div className="page-container pt-4 pb-5 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0c4a6e' }}>Playback Trends</h2>
                <p className="text-xs mt-0.5" style={{ color: '#0369a1' }}>
                  Content plays and unique players over time
                </p>
              </div>
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
                  <span className="text-xs" style={{ color: '#0369a1' }}>Total Plays</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="24" height="2">
                    <line x1="0" y1="1" x2="24" y2="1" stroke="#06B6D4" strokeWidth="2" strokeDasharray="5 3" />
                  </svg>
                  <span className="text-xs" style={{ color: '#0369a1' }}>Unique Players</span>
                </div>
              </div>
            </div>

            <div className="mt-4" style={{ height: 280 }}>
              {viewerTrends.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm" style={{ color: '#0369a1' }}>No playback data for this period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={viewerTrends} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="rgba(14,165,233,1)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="rgba(14,165,233,1)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(14,165,233,0.06)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#0369a1', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#0369a1', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => v >= 1000 ? `${v / 1000}k` : `${v}`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fill="url(#viewsAreaGrad)"
                      dot={{ fill: '#0ea5e9', r: 3.5, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#0ea5e9', strokeWidth: 0 }}
                      name="Total Plays"
                    />
                    <Line
                      type="monotone"
                      dataKey="unique"
                      stroke="#06B6D4"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      activeDot={{ r: 4, fill: '#06B6D4', strokeWidth: 0 }}
                      name="Unique Players"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
          >
            <h2 className="text-base font-bold mb-0.5" style={{ color: '#0c4a6e' }}>Playback Summary</h2>
            <p className="text-xs mb-5" style={{ color: '#0369a1' }}>
              Last {summary.period_days ?? days} days
            </p>

            <div className="space-y-4">
              {[
                {
                  label: 'Total Content Views',
                  value: summary.total_content_views?.toLocaleString() ?? '—',
                  color: '#0ea5e9',
                },
                {
                  label: 'Active Players',
                  value: summary.active_players?.toLocaleString() ?? '—',
                  color: '#0ea5e9',
                },
                {
                  label: 'Total Playback Duration',
                  value: (() => {
                    const s = summary.total_playback_duration_seconds
                    if (!s) return '—'
                    const h = Math.floor(s / 3600)
                    const m = Math.floor((s % 3600) / 60)
                    return h > 0 ? `${h}h ${m}m` : `${m}m`
                  })(),
                  color: '#34D399',
                },
                {
                  label: 'Total Errors',
                  value: summary.total_errors?.toLocaleString() ?? '—',
                  color: '#F87171',
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: '#e0f2fe', border: '1px solid #bae6fd' }}
                >
                  <span className="text-sm" style={{ color: '#0369a1' }}>{label}</span>
                  <span className="text-sm font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {analyticsTab === 'audit' && (
        <div className="px-5 pt-4 pb-5">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#bae6fd' }}>
              <h2 className="text-base font-bold" style={{ color: '#0c4a6e' }}>Audit Log</h2>
              <p className="text-xs mt-0.5" style={{ color: '#0369a1' }}>
                All actions performed in your workspace
              </p>
            </div>
            {auditLoading ? (
              <div className="py-12 text-center text-sm" style={{ color: '#0369a1' }}>Loading…</div>
            ) : auditItems.length === 0 ? (
              <div className="py-12 text-center text-sm" style={{ color: '#0369a1' }}>No audit events found</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #bae6fd' }}>
                    {['Actor', 'Action', 'Resource', 'Timestamp'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 20px', color: '#0369a1', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditItems.map((row, i) => (
                    <tr key={row.log_id ?? i} style={{ borderBottom: '1px solid rgba(14,165,233,0.06)' }}>
                      <td style={{ padding: '12px 20px', color: '#0c4a6e' }}>{row.actor_email || '—'}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, backgroundColor: 'rgba(14,165,233,0.12)', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {row.action || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#0369a1' }}>
                        {row.resource_type && <span style={{ color: '#0369a1', marginRight: 4 }}>{row.resource_type} ·</span>}
                        {row.resource_name || row.resource_id || '—'}
                      </td>
                      <td style={{ padding: '12px 20px', color: '#0369a1', fontSize: 12 }}>
                        {row.timestamp ? new Date(row.timestamp).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #bae6fd' }}>
              <span style={{ fontSize: 12, color: '#0369a1' }}>
                Page {auditPage + 1}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setAuditPage(p => Math.max(0, p - 1))}
                  disabled={auditPage === 0}
                  style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#e0f2fe', border: 'none', color: auditPage === 0 ? '#6b7280' : '#0369a1', cursor: auditPage === 0 ? 'default' : 'pointer' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setAuditPage(p => p + 1)}
                  disabled={!hasMoreAudit}
                  style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#e0f2fe', border: 'none', color: !hasMoreAudit ? '#6b7280' : '#0369a1', cursor: !hasMoreAudit ? 'default' : 'pointer' }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {analyticsTab === 'playback' && (
        <div className="px-5 pt-4 pb-5">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#bae6fd' }}>
              <h2 className="text-base font-bold" style={{ color: '#0c4a6e' }}>Playback Log</h2>
              <p className="text-xs mt-0.5" style={{ color: '#0369a1' }}>
                Content playback history across all players
              </p>
            </div>
            {playbackLoading ? (
              <div className="py-12 text-center text-sm" style={{ color: '#0369a1' }}>Loading…</div>
            ) : playbackItems.length === 0 ? (
              <div className="py-12 text-center text-sm" style={{ color: '#0369a1' }}>No playback records found</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #bae6fd' }}>
                    {['Player ID', 'Channel ID', 'Duration', 'Started At', 'Ended At'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 20px', color: '#0369a1', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {playbackItems.map((row, i) => {
                    const durMin = Math.floor((row.duration_seconds ?? 0) / 60)
                    const durSec = (row.duration_seconds ?? 0) % 60
                    return (
                      <tr key={row.log_id ?? i} style={{ borderBottom: '1px solid rgba(14,165,233,0.06)' }}>
                        <td style={{ padding: '12px 20px', color: '#0c4a6e', fontFamily: 'monospace', fontSize: 12 }}>{row.player_id ?? '—'}</td>
                        <td style={{ padding: '12px 20px', color: '#0369a1', fontFamily: 'monospace', fontSize: 12 }}>{row.channel_id ?? '—'}</td>
                        <td style={{ padding: '12px 20px', color: '#0ea5e9', fontWeight: 600 }}>
                          {durMin}m {durSec}s
                        </td>
                        <td style={{ padding: '12px 20px', color: '#0369a1', fontSize: 12 }}>
                          {row.started_at ? new Date(row.started_at).toLocaleString() : '—'}
                        </td>
                        <td style={{ padding: '12px 20px', color: '#0369a1', fontSize: 12 }}>
                          {row.ended_at ? new Date(row.ended_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #bae6fd' }}>
              <span style={{ fontSize: 12, color: '#0369a1' }}>Page {playbackPage + 1}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPlaybackPage(p => Math.max(0, p - 1))}
                  disabled={playbackPage === 0}
                  style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#e0f2fe', border: 'none', color: playbackPage === 0 ? '#6b7280' : '#0369a1', cursor: playbackPage === 0 ? 'default' : 'pointer' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPlaybackPage(p => p + 1)}
                  disabled={!hasMorePlayback}
                  style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#e0f2fe', border: 'none', color: !hasMorePlayback ? '#6b7280' : '#0369a1', cursor: !hasMorePlayback ? 'default' : 'pointer' }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
