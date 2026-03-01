'use client'

import { useState, useEffect } from 'react'
import { Eye, Users, Clock, Wifi, FileText, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useAnalyticsSummary, useAuditLogs, usePlaybackLogs } from '@/hooks/queries'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

type AuditLogItem = {
  log_id: string
  actor_email?: string
  action?: string
  resource_type?: string
  resource_name?: string
  timestamp?: string
  created_at?: string
}

// ── Static chart data (matches screenshot trend) ─────────────────────────────
const VIEWER_TRENDS = [
  { date: 'Jan 1',  views: 2200, unique: 1600 },
  { date: 'Jan 3',  views: 2500, unique: 1900 },
  { date: 'Jan 5',  views: 2700, unique: 2100 },
  { date: 'Jan 7',  views: 3000, unique: 2300 },
  { date: 'Jan 9',  views: 3500, unique: 2700 },
  { date: 'Jan 11', views: 5000, unique: 3100 },
  { date: 'Jan 13', views: 5300, unique: 3400 },
  { date: 'Jan 15', views: 5200, unique: 3500 },
  { date: 'Jan 17', views: 5600, unique: 3900 },
  { date: 'Jan 19', views: 5800, unique: 4200 },
  { date: 'Jan 21', views: 6300, unique: 4600 },
  { date: 'Jan 23', views: 7000, unique: 5100 },
  { date: 'Jan 25', views: 7600, unique: 5800 },
  { date: 'Jan 27', views: 8000, unique: 6400 },
  { date: 'Jan 29', views: 8700, unique: 7000 },
  { date: 'Jan 31', views: 9200, unique: 7500 },
]

const X_TICKS = ['Jan 1', 'Jan 7', 'Jan 13', 'Jan 19', 'Jan 25', 'Jan 31']

// ── Top content ───────────────────────────────────────────────────────────────
const TOP_CONTENT = [
  { rank: 1, name: 'Product Showcase', change: '+12%', views: 45200, color: '#3B82F6', positive: true },
  { rank: 2, name: 'Welcome Video',    change: '+8%',  views: 32100, color: '#F5A624', positive: true },
  { rank: 3, name: 'Menu Display',     change: '+24%', views: 12800, color: '#22C55E', positive: true },
  { rank: 4, name: 'Weather Widget',   change: '-3%',  views: 8500,  color: '#7C3AED', positive: false },
  { rank: 5, name: 'News Feed',        change: '+5%',  views: 1400,  color: '#EC4899', positive: true },
]
const MAX_VIEWS = TOP_CONTENT[0].views

// ── Time periods ──────────────────────────────────────────────────────────────
const TIME_PERIODS = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom'] as const
type TimePeriod = typeof TIME_PERIODS[number]

// ── Custom tooltip ────────────────────────────────────────────────────────────
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

// ── Page ──────────────────────────────────────────────────────────────────────
type AnalyticsTab = 'overview' | 'audit' | 'playback'
const PAGE_SIZE = 20

export default function AnalyticsPage() {
  const workspace  = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.workspace_id || ''
  const { data: summaryData } = useAnalyticsSummary(workspaceId)
  const { setBreadcrumbItems } = useBreadcrumb()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Last 30 days')
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('overview')
  const [auditPage, setAuditPage]       = useState(0)
  const [playbackPage, setPlaybackPage] = useState(0)

  const { data: auditData, isLoading: auditLoading } = useAuditLogs(workspaceId, {
    limit: PAGE_SIZE,
    offset: auditPage * PAGE_SIZE,
  })
  const { data: playbackData, isLoading: playbackLoading } = usePlaybackLogs(workspaceId, {
    limit: PAGE_SIZE,
    offset: playbackPage * PAGE_SIZE,
  })

  useEffect(() => {
    setBreadcrumbItems([{ label: 'Analytics' }])
  }, [setBreadcrumbItems])

  const auditItems    = ((auditData as any)?.items ?? []) as AuditLogItem[]
  const auditTotal    = (auditData as any)?.total ?? 0
  const playbackItems = ((playbackData as any)?.items ?? []) as any[]
  const playbackTotal = (playbackData as any)?.total ?? 0

  const summary = (summaryData as any) ?? {}

  // KPI values — use API data when available, fall back to screenshot values
  const impressions = summary.total_impressions
    ? summary.total_impressions.toLocaleString()
    : '98,400'
  const uniqueViewers = summary.unique_viewers
    ? summary.unique_viewers.toLocaleString()
    : '42,800'
  const dwellTime = summary.avg_dwell_time_seconds
    ? `${Math.floor(summary.avg_dwell_time_seconds / 60)}m ${summary.avg_dwell_time_seconds % 60}s`
    : '3m 24s'
  const uptime = summary.uptime_percentage
    ? `${summary.uptime_percentage}%`
    : '96.2%'

  const KPI_CARDS = [
    {
      label: 'Total Impressions',
      value: impressions,
      change: '+18% from last period',
      valueColor: '#F5A624',
      iconColor: '#F5A624',
      iconBg: 'rgba(245,166,36,0.15)',
      Icon: Eye,
    },
    {
      label: 'Unique Viewers',
      value: uniqueViewers,
      change: '+12% from last period',
      valueColor: '#60A5FA',
      iconColor: '#60A5FA',
      iconBg: 'rgba(96,165,250,0.15)',
      Icon: Users,
    },
    {
      label: 'Avg. Dwell Time',
      value: dwellTime,
      change: '+0.4s from last period',
      valueColor: '#34D399',
      iconColor: '#34D399',
      iconBg: 'rgba(52,211,153,0.15)',
      Icon: Clock,
    },
    {
      label: 'Avg. Uptime',
      value: uptime,
      change: 'across all devices',
      valueColor: '#60A5FA',
      iconColor: '#60A5FA',
      iconBg: 'rgba(96,165,250,0.15)',
      Icon: Wifi,
    },
  ]

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }}>

      {/* ── Hero Banner ── */}
      <div className="px-5 pt-5">
        <div
          className="rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)',
            border: '1px solid #2A3050',
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 px-6 pt-6 pb-5">
            {/* Top row: label + heading + time tabs */}
            <div className="flex items-start justify-between mb-3">
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: '#F5A624' }}
              >
                Analytics
              </p>

              {/* Time period tabs */}
              <div className="flex items-center gap-1">
                {TIME_PERIODS.map((t) => {
                  const isActive = timePeriod === t
                  return (
                    <button
                      key={t}
                      onClick={() => setTimePeriod(t)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
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

            <h1 className="text-4xl font-bold text-white mb-2">Performance Metrics</h1>
            <p className="text-sm mb-6 max-w-2xl" style={{ color: '#6B7280' }}>
              Track audience engagement, content performance, and device health across your display network.
            </p>

            {/* KPI stat cards */}
            <div className="grid grid-cols-4 gap-3">
              {KPI_CARDS.map(({ label, value, change, valueColor, iconColor, iconBg, Icon }) => (
                <div
                  key={label}
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.28)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {/* Icon + label */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconBg }}
                    >
                      <Icon className="h-4 w-4" style={{ color: iconColor }} />
                    </div>
                    <span className="text-sm" style={{ color: '#6B7280' }}>{label}</span>
                  </div>

                  {/* Big value */}
                  <p className="text-3xl font-bold tracking-tight" style={{ color: valueColor }}>
                    {value}
                  </p>

                  {/* Change label */}
                  <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
                    {change}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Analytics Tab Bar ── */}
      <div className="px-5 pt-4 flex items-center gap-1">
        {([
          { key: 'overview', label: 'Overview',   Icon: Eye },
          { key: 'audit',    label: 'Audit Log',  Icon: FileText },
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

      {/* ── Overview: two-column section ── */}
      {analyticsTab === 'overview' && (
      <div className="px-5 pt-4 pb-5 grid gap-4" style={{ gridTemplateColumns: '1fr 380px' }}>

        {/* ── Viewer Trends chart ── */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          {/* Card header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-base font-bold text-white">Viewer Trends</h2>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                Impressions and unique viewers over time
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: '#F5A624' }} />
                <span className="text-xs" style={{ color: '#9CA3AF' }}>Total Views</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Dashed line indicator */}
                <svg width="24" height="2">
                  <line
                    x1="0" y1="1" x2="24" y2="1"
                    stroke="#818CF8"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                </svg>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>Unique Viewers</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={VIEWER_TRENDS}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F5A624" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F5A624" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="date"
                  ticks={X_TICKS}
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 3000, 5000, 8000, 10000]}
                  tickFormatter={(v: number) => v >= 1000 ? `${v / 1000}k` : `${v}`}
                />
                <Tooltip content={<ChartTooltip />} />

                {/* Amber area (Total Views) */}
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#F5A624"
                  strokeWidth={2}
                  fill="url(#viewsAreaGrad)"
                  dot={{ fill: '#F5A624', r: 3.5, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#F5A624', strokeWidth: 0 }}
                  name="Total Views"
                />

                {/* Blue dashed line (Unique Viewers) */}
                <Line
                  type="monotone"
                  dataKey="unique"
                  stroke="#818CF8"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  activeDot={{ r: 4, fill: '#818CF8', strokeWidth: 0 }}
                  name="Unique Viewers"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Top Content ── */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          <h2 className="text-base font-bold text-white mb-0.5">Top Content</h2>
          <p className="text-xs mb-5" style={{ color: '#6B7280' }}>
            Most viewed content this period
          </p>

          <div className="space-y-5">
            {TOP_CONTENT.map((item) => {
              const barWidth = Math.round((item.views / MAX_VIEWS) * 100)
              return (
                <div key={item.rank}>
                  {/* Row */}
                  <div className="flex items-center gap-3 mb-1.5">
                    {/* Rank badge */}
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        backgroundColor: `${item.color}25`,
                        color: item.color,
                        border: `1px solid ${item.color}40`,
                      }}
                    >
                      {item.rank}
                    </div>

                    {/* Name */}
                    <span className="text-sm font-medium text-white flex-1 truncate">
                      {item.name}
                    </span>

                    {/* Change */}
                    <span
                      className="text-xs font-semibold flex-shrink-0"
                      style={{ color: item.positive ? '#34D399' : '#F87171' }}
                    >
                      {item.change}
                    </span>

                    {/* View count */}
                    <span
                      className="text-sm font-semibold flex-shrink-0 w-14 text-right"
                      style={{ color: '#9CA3AF' }}
                    >
                      {item.views.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      )} {/* end overview */}

      {/* ── Audit Log Tab ── */}
      {analyticsTab === 'audit' && (
        <div className="px-5 pt-4 pb-5">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#2A2A2A' }}>
              <h2 className="text-base font-bold text-white">Audit Log</h2>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                All actions performed in your workspace ({auditTotal.toLocaleString()} total)
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
                        {row.resource_name || '—'}
                      </td>
                      <td style={{ padding: '12px 20px', color: '#6B7280', fontSize: 12 }}>
                        {row.timestamp || row.created_at
                          ? new Date(row.timestamp || row.created_at!).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Pagination */}
            {auditTotal > PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #2A2A2A' }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {auditPage * PAGE_SIZE + 1}–{Math.min((auditPage + 1) * PAGE_SIZE, auditTotal)} of {auditTotal.toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setAuditPage(p => Math.max(0, p - 1))} disabled={auditPage === 0} style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#2A2A2A', border: 'none', color: auditPage === 0 ? '#4B5563' : '#9CA3AF', cursor: auditPage === 0 ? 'default' : 'pointer' }}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setAuditPage(p => p + 1)} disabled={(auditPage + 1) * PAGE_SIZE >= auditTotal} style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#2A2A2A', border: 'none', color: (auditPage + 1) * PAGE_SIZE >= auditTotal ? '#4B5563' : '#9CA3AF', cursor: (auditPage + 1) * PAGE_SIZE >= auditTotal ? 'default' : 'pointer' }}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Playback Log Tab ── */}
      {analyticsTab === 'playback' && (
        <div className="px-5 pt-4 pb-5">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#2A2A2A' }}>
              <h2 className="text-base font-bold text-white">Playback Log</h2>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                Content playback history across all players ({playbackTotal.toLocaleString()} total)
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
                    {['Player', 'Channel', 'Duration', 'Started At', 'Ended At'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 20px', color: '#6B7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {playbackItems.map((row: any, i: number) => {
                    const durMin = Math.floor((row.duration_seconds ?? 0) / 60)
                    const durSec = (row.duration_seconds ?? 0) % 60
                    return (
                      <tr key={row.log_id ?? i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 20px', color: '#E5E7EB', fontFamily: 'monospace', fontSize: 12 }}>{row.player_id?.slice(0, 8) || '—'}</td>
                        <td style={{ padding: '12px 20px', color: '#9CA3AF', fontFamily: 'monospace', fontSize: 12 }}>{row.channel_id?.slice(0, 8) || '—'}</td>
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
            {/* Pagination */}
            {playbackTotal > PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #2A2A2A' }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {playbackPage * PAGE_SIZE + 1}–{Math.min((playbackPage + 1) * PAGE_SIZE, playbackTotal)} of {playbackTotal.toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPlaybackPage(p => Math.max(0, p - 1))} disabled={playbackPage === 0} style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#2A2A2A', border: 'none', color: playbackPage === 0 ? '#4B5563' : '#9CA3AF', cursor: playbackPage === 0 ? 'default' : 'pointer' }}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPlaybackPage(p => p + 1)} disabled={(playbackPage + 1) * PAGE_SIZE >= playbackTotal} style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#2A2A2A', border: 'none', color: (playbackPage + 1) * PAGE_SIZE >= playbackTotal ? '#4B5563' : '#9CA3AF', cursor: (playbackPage + 1) * PAGE_SIZE >= playbackTotal ? 'default' : 'pointer' }}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
