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
    <div className="px-3 py-2 rounded-lg text-xs bg-surface border border-border">
      <p className="mb-1 font-medium text-text-secondary">{label}</p>
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

  // KPI card config — data-driven colors kept as inline style
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

  // Playback summary data-driven colors kept as-is
  const summaryRows = [
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
  ]

  return (
    <div className="min-h-screen">

      <div className="page-container pt-4 sm:pt-5">
        <div
          className="rounded-xl relative overflow-hidden border border-primary/20"
          style={{
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 50%, var(--color-surface-hover) 100%)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 responsive-hero pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <p className="text-xs font-semibold tracking-widest uppercase text-primary">
                Analytics
              </p>

              <div className="flex items-center gap-1 overflow-x-auto scroll-x pb-1 sm:pb-0 flex-wrap sm:flex-nowrap">
                {TIME_PERIODS.map((t) => {
                  const isActive = timePeriod === t
                  return (
                    <button
                      key={t}
                      onClick={() => setTimePeriod(t)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0 touch-target ${
                        isActive
                          ? 'bg-primary text-on-primary'
                          : 'text-text-secondary bg-surface-hover border border-border'
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-text-primary mb-2">Performance Metrics</h1>
            <p className="text-sm mb-4 sm:mb-6 max-w-2xl text-text-muted">
              Track audience engagement, content performance, and device health across your display network.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {KPI_CARDS.map(({ label, value, change, valueColor, iconColor, iconBg, Icon }) => (
                <div
                  key={label}
                  className="rounded-xl p-5 bg-surface border border-border"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconBg }}
                    >
                      <Icon className="h-4 w-4" style={{ color: iconColor }} />
                    </div>
                    <span className="text-sm text-text-muted">{label}</span>
                  </div>
                  <p className="text-3xl font-bold tracking-tight" style={{ color: valueColor }}>
                    {value}
                  </p>
                  <p className="text-xs mt-2 text-text-muted">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-primary text-on-primary'
                  : 'text-text-secondary bg-surface-hover border border-border'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          )
        })}
      </div>

      {analyticsTab === 'overview' && (
        <div className="page-container pt-4 pb-5 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

          <div className="rounded-xl p-5 bg-surface border border-border">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-base font-bold text-text-primary">Playback Trends</h2>
                <p className="text-xs mt-0.5 text-text-muted">
                  Content plays and unique players over time
                </p>
              </div>
              <div className="flex items-center gap-5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: '#F5A624' }} />
                  <span className="text-xs text-text-secondary">Total Plays</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="24" height="2">
                    <line x1="0" y1="1" x2="24" y2="1" stroke="#818CF8" strokeWidth="2" strokeDasharray="5 3" />
                  </svg>
                  <span className="text-xs text-text-secondary">Unique Players</span>
                </div>
              </div>
            </div>

            <div className="mt-4" style={{ height: 280 }}>
              {viewerTrends.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-text-muted">No playback data for this period</p>
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
                    <CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
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

          <div className="rounded-xl p-5 bg-surface border border-border">
            <h2 className="text-base font-bold text-text-primary mb-0.5">Playback Summary</h2>
            <p className="text-xs mb-5 text-text-muted">
              Last {summary.period_days ?? days} days
            </p>

            <div className="space-y-4">
              {summaryRows.map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between p-3 rounded-lg bg-input border border-input-border"
                >
                  <span className="text-sm text-text-secondary">{label}</span>
                  <span className="text-sm font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {analyticsTab === 'audit' && (
        <div className="px-5 pt-4 pb-5">
          <div className="rounded-xl overflow-hidden bg-surface border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-text-primary">Audit Log</h2>
              <p className="text-xs mt-0.5 text-text-muted">
                All actions performed in your workspace
              </p>
            </div>
            {auditLoading ? (
              <div className="py-12 text-center text-sm text-text-muted">Loading…</div>
            ) : auditItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-text-muted">No audit events found</div>
            ) : (
              <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b border-border">
                    {['Actor', 'Action', 'Resource', 'Timestamp'].map((h) => (
                      <th key={h} className="text-left px-5 py-2.5 text-text-muted font-semibold text-[11px] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditItems.map((row, i) => (
                    <tr key={row.log_id ?? i} className="border-b border-border-subtle">
                      <td className="px-5 py-3 text-text-primary">{row.actor_email || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">
                          {row.action || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-text-secondary">
                        {row.resource_type && <span className="text-text-muted mr-1">{row.resource_type} ·</span>}
                        {row.resource_name || row.resource_id || '—'}
                      </td>
                      <td className="px-5 py-3 text-text-muted text-xs">
                        {row.timestamp ? new Date(row.timestamp).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-xs text-text-muted">
                Page {auditPage + 1}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setAuditPage(p => Math.max(0, p - 1))}
                  disabled={auditPage === 0}
                  className={`px-2.5 py-1 rounded-md bg-surface-alt border-none ${auditPage === 0 ? 'text-text-muted/40 cursor-default' : 'text-text-secondary cursor-pointer hover:bg-surface-hover'}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setAuditPage(p => p + 1)}
                  disabled={!hasMoreAudit}
                  className={`px-2.5 py-1 rounded-md bg-surface-alt border-none ${!hasMoreAudit ? 'text-text-muted/40 cursor-default' : 'text-text-secondary cursor-pointer hover:bg-surface-hover'}`}
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
          <div className="rounded-xl overflow-hidden bg-surface border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-text-primary">Playback Log</h2>
              <p className="text-xs mt-0.5 text-text-muted">
                Content playback history across all players
              </p>
            </div>
            {playbackLoading ? (
              <div className="py-12 text-center text-sm text-text-muted">Loading…</div>
            ) : playbackItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-text-muted">No playback records found</div>
            ) : (
              <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b border-border">
                    {['Player ID', 'Channel ID', 'Duration', 'Started At', 'Ended At'].map((h) => (
                      <th key={h} className="text-left px-5 py-2.5 text-text-muted font-semibold text-[11px] uppercase tracking-wide">
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
                      <tr key={row.log_id ?? i} className="border-b border-border-subtle">
                        <td className="px-5 py-3 text-text-primary font-mono text-xs">{row.player_id ?? '—'}</td>
                        <td className="px-5 py-3 text-text-secondary font-mono text-xs">{row.channel_id ?? '—'}</td>
                        <td className="px-5 py-3 text-primary font-semibold">
                          {durMin}m {durSec}s
                        </td>
                        <td className="px-5 py-3 text-text-muted text-xs">
                          {row.started_at ? new Date(row.started_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-5 py-3 text-text-muted text-xs">
                          {row.ended_at ? new Date(row.ended_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-xs text-text-muted">Page {playbackPage + 1}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPlaybackPage(p => Math.max(0, p - 1))}
                  disabled={playbackPage === 0}
                  className={`px-2.5 py-1 rounded-md bg-surface-alt border-none ${playbackPage === 0 ? 'text-text-muted/40 cursor-default' : 'text-text-secondary cursor-pointer hover:bg-surface-hover'}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPlaybackPage(p => p + 1)}
                  disabled={!hasMorePlayback}
                  className={`px-2.5 py-1 rounded-md bg-surface-alt border-none ${!hasMorePlayback ? 'text-text-muted/40 cursor-default' : 'text-text-secondary cursor-pointer hover:bg-surface-hover'}`}
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
