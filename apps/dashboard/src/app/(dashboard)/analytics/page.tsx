'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { DataTable } from '@/components/ui/data-table'
import { StatusDot } from '@/components/ui/status-dot'
import { ArrowDownRight, ArrowUpRight, Calendar, Download, Eye, MousePointerClick, Users as UsersIcon, Activity } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useAnalyticsSummary, usePlayers } from '@/hooks/queries'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { fadeInUpVariants, staggerChildrenVariants } from '@/lib/animations'

const mockViewerTrends = [
  { date: 'Jan 1', views: 4200, unique: 2800 },
  { date: 'Jan 5', views: 4800, unique: 3100 },
  { date: 'Jan 10', views: 5100, unique: 3400 },
  { date: 'Jan 15', views: 5500, unique: 3600 },
  { date: 'Jan 20', views: 5200, unique: 3500 },
  { date: 'Jan 25', views: 5800, unique: 3900 },
  { date: 'Jan 30', views: 6200, unique: 4200 },
]

const mockTopContent = [
  { name: 'Product Showcase', views: 45200, percentage: 45 },
  { name: 'Welcome Video', views: 32100, percentage: 32 },
  { name: 'Menu Display', views: 12800, percentage: 13 },
  { name: 'Weather Widget', views: 8500, percentage: 8 },
  { name: 'News Feed', views: 1400, percentage: 2 },
]

export default function AnalyticsPage() {
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''
  const [dateRange, setDateRange] = useState('30d')

  const { data: summaryData, isLoading: summaryLoading } = useAnalyticsSummary(workspaceId)
  const { data: playersData, isLoading: playersLoading } = usePlayers(workspaceId)

  const players = Array.isArray(playersData) ? playersData : []

  const summary = summaryData || {
    total_impressions: 0,
    total_play_time_seconds: 0,
    active_players: 0,
    total_content_plays: 0,
  }

  const kpiMetrics = [
    {
      label: 'Total Impressions',
      value: summary.total_impressions?.toLocaleString() || '0',
      change: '+12%',
      trend: 'up' as const,
      icon: Eye,
    },
    {
      label: 'Unique Viewers',
      value: (summary as any).unique_viewers?.toLocaleString() || '0',
      change: '+5%',
      trend: 'up' as const,
      icon: UsersIcon,
    },
    {
      label: 'Engagement Rate',
      value: `${(summary as any).engagement_rate || 0}%`,
      change: '-0.5%',
      trend: 'down' as const,
      icon: MousePointerClick,
    },
    {
      label: 'System Uptime',
      value: `${(summary as any).uptime_percentage || 0}%`,
      change: '0%',
      trend: 'neutral' as const,
      icon: Activity,
    },
  ]

  const deviceColumns = [
    {
      key: 'name',
      header: 'Device',
      cell: (player: any) => (
        <div className="flex items-center gap-3">
          <StatusDot
            status={player.status === 'online' ? 'online' : player.status === 'offline' ? 'offline' : 'pending'}
            pulse={player.status === 'online'}
          />
          <span className="font-medium">{player.name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (player: any) => (
        <span className={`text-xs font-medium capitalize ${player.status === 'online' ? 'text-success' :
          player.status === 'offline' ? 'text-error' :
            'text-warning'
          }`}>
          {player.status}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      cell: (player: any) => (
        <span className="text-text-secondary text-sm">{player.location || 'Not set'}</span>
      ),
    },
    {
      key: 'last_heartbeat',
      header: 'Last Seen',
      cell: (player: any) => (
        <span className="text-text-muted text-sm">
          {player.last_heartbeat
            ? new Date(player.last_heartbeat).toLocaleString()
            : 'Never'}
        </span>
      ),
    },
  ]

  return (
    <motion.div
      variants={staggerChildrenVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background"
    >
      <div className="glass-light sticky top-0 z-20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <motion.div variants={fadeInUpVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Analytics</h1>
              <p className="text-sm text-text-secondary mt-1">
                Performance metrics and audience engagement
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-1 rounded-lg bg-surface border border-border">
                {['7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === range
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-alt'
                      }`}
                  >
                    Last {range.replace('d', ' days').replace('90', '90')}
                  </button>
                ))}
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={fadeInUpVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {kpiMetrics.map((metric, i) => (
              <Card key={i} className="border border-border bg-surface">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {metric.label}
                      </p>
                      <h3 className="text-2xl font-bold text-text-primary mt-2">
                        {metric.value}
                      </h3>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <metric.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 mt-3 text-xs font-medium ${metric.trend === 'up'
                      ? 'text-success'
                      : metric.trend === 'down'
                        ? 'text-error'
                        : 'text-text-secondary'
                      }`}
                  >
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : metric.trend === 'down' ? (
                      <ArrowDownRight className="h-3 w-3" />
                    ) : null}
                    <span>{metric.change}</span>
                    <span className="text-text-muted font-normal ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={fadeInUpVariants} className="lg:col-span-2">
            <Card className="border border-border bg-surface">
              <CardHeader className="border-b border-border py-4 px-6">
                <CardTitle className="text-base font-semibold text-text-primary">
                  Viewer Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockViewerTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="date"
                      stroke="var(--text-muted)"
                      fontSize={12}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                      name="Total Views"
                    />
                    <Line
                      type="monotone"
                      dataKey="unique"
                      stroke="var(--success)"
                      strokeWidth={2}
                      dot={false}
                      name="Unique Viewers"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUpVariants}>
            <Card className="border border-border bg-surface">
              <CardHeader className="border-b border-border py-4 px-6">
                <CardTitle className="text-base font-semibold text-text-primary">
                  Top Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {mockTopContent.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-text-primary truncate">
                          {item.name}
                        </span>
                        <span className="text-text-muted text-xs ml-2">
                          {item.views.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={fadeInUpVariants}>
          <Card className="border border-border bg-surface">
            <CardHeader className="border-b border-border py-4 px-6">
              <CardTitle className="text-base font-semibold text-text-primary">
                Device Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {playersLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : players.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No devices connected"
                    description="Connect players to start tracking device analytics"
                  />
                </div>
              ) : (
                <DataTable
                  data={players}
                  columns={deviceColumns}
                  onRowClick={(player) => console.log('Player clicked:', player)}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
