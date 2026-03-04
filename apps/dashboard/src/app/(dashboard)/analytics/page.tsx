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
      style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
    >
      <p className="mb-1 font-medium" style={{ color: '#9CA3AF' }}>{label}</p>
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
  const workspaceId = workspace?.id ?? 0
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
      valueColor: '#F5A624',
      iconColor: '#F5A624',
      iconBg: 'rgba(245,166,36,0.15)',
      Icon: Eye,
    },
    {
      label: 'Active Players',
      value: activePlayers,
      change: 'Unique players with activity',
      valueColor: '#60A5FA',
      iconColor: '#60A5FA',
      iconBg: 'rgba(96,165,250,0.15)',
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
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }}>

      <div className="page-container pt-4 sm:pt-5">
        <div
          className="rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)',
            border: '1px solid #2A3050',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 responsive-hero pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#F5A624' }}>
                Analytics
              </p>

              <div className="flex items-center gap-1 overflow-x-auto scroll-x pb-1 sm:pb-0 flex-wrap sm:flex-nowrap">
                {TIME_PERIODS.map((t) => {
                  const isActive = timePeriod === t
                  return (
                    <button
                      key={t}
                      onClick={() => setTimePeriod(t)}
                      className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0 touch-target"
                      style={
                        isActive
                          ? { backgroundColor: '#F5A624', color: '#000000' }
                          : {
                              color: '#9CA3AF',
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }
                      }
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Performance Metrics</h1>
            <p className="text-sm mb-4 sm:mb-6 max-w-2xl" style={{ color: '#6B7280' }}>
              Track audience engagement, content performance, and device health across your display network.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {KPI_CARDS.map(({ label, value, change, valueColor, iconColor, iconBg, Icon }) => (
                <div
                  key={label}
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.28)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconBg }}
                    >
                      <Icon className="h-4 w-4" style={{ color: iconColor }} />
                    </div>
                    <span className="text-sm" style={{ color: '#6B7280' }}>{label}</span>
                  </div>
                  <p className="text-3xl font-bold tracking-tight" style={{ color: valueColor }}>
                    {value}
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
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
                  ? { backgroundColor: '#F5A624', color: '#000000' }
                  : { color: '#9CA3AF', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
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
            style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-base font-bold text-white">Playback Trends</h2>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                  Content plays and unique players over time
                </p>
              </div>
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: '#F5A624' }} />
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>Total Plays</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="24" height="2">
                    <line x1="0" y1="1" x2="24" y2="1" stroke="#818CF8" strokeWidth="2" strokeDasharray="5 3" />
                  </svg>
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>Unique Players</span>
                </div>
              </div>
            </div>

            <div className="mt-4" style={{ height: 280 }}>
              {viewerTrends.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm" style={{ color: '#6B7280' }}>No playback data for this period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={viewerTrends} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#F5A624" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#F5A624" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => v >= 1000 ? `${v / 1000}k` : `${v}`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#F5A624"
                      strokeWidth={2}
                      fill="url(#viewsAreaGrad)"
                      dot={{ fill: '#F5A624', r: 3.5, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#F5A624', strokeWidth: 0 }}
                      name="Total Plays"
                    />
                    <Line
                      type="monotone"
                      dataKey="unique"
                      stroke="#818CF8"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      activeDot={{ r: 4, fill: '#818CF8', strokeWidth: 0 }}
                      name="Unique Players"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
          >
            <h2 className="text-base font-bold text-white mb-0.5">Playback Summary</h2>
            <p className="text-xs mb-5" style={{ color: '#6B7280' }}>
              Last {summary.period_days ?? days} days
            </p>

            <div className="space-y-4">
              {[
                {
                  label: 'Total Content Views',
                  value: summary.total_content_views?.toLocaleString() ?? '—',
                  color: '#F5A624',
                },
                {
                  label: 'Active Players',
                  value: summary.active_players?.toLocaleString() ?? '—',
                  color: '#60A5FA',
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
                  style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}
                >
                  <span className="text-sm" style={{ color: '#9CA3AF' }}>{label}</span>
                  <span className="text-sm font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {analyticsTab === 'audit' && (
        <div className="px-5 pt-4 pb-5">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#2A2A2A' }}>
              <h2 className="text-base font-bold text-white">Audit Log</h2>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                All actions performed in your workspace
              </p>
            </div>
            {auditLoading ? (
              <div className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>Loading…</div>
            ) : auditItems.length === 0 ? (
              <div className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>No audit events found</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                    {['Actor', 'Action', 'Resource', 'Timestamp'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 20px', color: '#6B7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditItems.map((row, i) => (
                    <tr key={row.log_id ?? i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 20px', color: '#E5E7EB' }}>{row.actor_email || '—'}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, backgroundColor: 'rgba(245,166,36,0.12)', color: '#F5A624', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {row.action || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#9CA3AF' }}>
                        {row.resource_type && <span style={{ color: '#6B7280', marginRight: 4 }}>{row.resource_type} ·</span>}
                        {row.resource_name || row.resource_id || '—'}
                      </td>
                      <td style={{ padding: '12px 20px', color: '#6B7280', fontSize: 12 }}>
                        {row.timestamp ? new Date(row.timestamp).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                Page {auditPage + 1}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setAuditPage(p => Math.max(0, p - 1))}
                  disabled={auditPage === 0}
                  style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#2A2A2A', border: 'none', color: auditPage === 0 ? '#4B5563' : '#9CA3AF', cursor: auditPage === 0 ? 'default' : 'pointer' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setAuditPage(p => p + 1)}
                  disabled={!hasMoreAudit}
                  style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#2A2A2A', border: 'none', color: !hasMoreAudit ? '#4B5563' : '#9CA3AF', cursor: !hasMoreAudit ? 'default' : 'pointer' }}
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
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#2A2A2A' }}>
              <h2 className="text-base font-bold text-white">Playback Log</h2>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                Content playback history across all players
              </p>
            </div>
            {playbackLoading ? (
              <div className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>Loading…</div>
            ) : playbackItems.length === 0 ? (
              <div className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>No playback records found</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                    {['Player ID', 'Channel ID', 'Duration', 'Started At', 'Ended At'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 20px', color: '#6B7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                      <tr key={row.log_id ?? i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 20px', color: '#E5E7EB', fontFamily: 'monospace', fontSize: 12 }}>{row.player_id ?? '—'}</td>
                        <td style={{ padding: '12px 20px', color: '#9CA3AF', fontFamily: 'monospace', fontSize: 12 }}>{row.channel_id ?? '—'}</td>
                        <td style={{ padding: '12px 20px', color: '#F5A624', fontWeight: 600 }}>
                          {durMin}m {durSec}s
                        </td>
                        <td style={{ padding: '12px 20px', color: '#6B7280', fontSize: 12 }}>
                          {row.started_at ? new Date(row.started_at).toLocaleString() : '—'}
                        </td>
                        <td style={{ padding: '12px 20px', color: '#6B7280', fontSize: 12 }}>
                          {row.ended_at ? new Date(row.ended_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Page {playbackPage + 1}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPlaybackPage(p => Math.max(0, p - 1))}
                  disabled={playbackPage === 0}
                  style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#2A2A2A', border: 'none', color: playbackPage === 0 ? '#4B5563' : '#9CA3AF', cursor: playbackPage === 0 ? 'default' : 'pointer' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPlaybackPage(p => p + 1)}
                  disabled={!hasMorePlayback}
                  style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#2A2A2A', border: 'none', color: !hasMorePlayback ? '#4B5563' : '#9CA3AF', cursor: !hasMorePlayback ? 'default' : 'pointer' }}
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
