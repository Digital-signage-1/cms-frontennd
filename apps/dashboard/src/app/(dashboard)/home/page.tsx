'use client'

import { MetricsStrip } from '@/components/dashboard/MetricsStrip'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Monitor, Layers, Upload, HardDrive, UploadCloud, Plus, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { usePlayers, useChannels, useContent, useAuditLogs } from '@/hooks/queries'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers'
import type { AuditLogItem } from '@signage/api-client'
import Link from 'next/link'

function mapResourceType(type: string): 'player' | 'channel' | 'schedule' | 'content' {
  if (type === 'player') return 'player'
  if (type === 'channel') return 'channel'
  if (type === 'schedule') return 'schedule'
  return 'content'
}

export default function HomePage() {
  const { user, account, workspace } = useAuthStore()
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)
  const { data: playersData = [], isLoading: playersLoading } = usePlayers(workspaceId)
  const { data: channels = [], isLoading: channelsLoading } = useChannels(workspaceId)
  const { data: contentData } = useContent(workspaceId, {})
  const { data: auditLogsData } = useAuditLogs(workspaceId || undefined, { limit: 5 })

  useRealtimePlayers(workspaceId || undefined)

  const players = Array.isArray(playersData) ? playersData : (playersData as any)?.data || []
  const content = Array.isArray(contentData) ? contentData : (contentData as any)?.items || []
  const auditLogs = (auditLogsData ?? []) as AuditLogItem[]

  const userName = useMemo(() => {
    if (user?.name) return user.name
    if (user?.given_name) return user.given_name
    if (account?.name) return account.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }, [user, account])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const onlinePlayers = players.filter((p: any) => p.status === 'online').length
  const offlinePlayers = players.filter((p: any) => p.status === 'offline').length

  const today = new Date().toDateString()
  const newPlayersToday = players.filter(
    (p: any) => p.created_at && new Date(p.created_at).toDateString() === today
  ).length

  const draftChannels = (Array.isArray(channels) ? channels : []).filter(
    (c: any) => c.status === 'draft'
  ).length

  const storageUsedBytes = (account as any)?.storage_used_bytes ?? 0
  const maxStorageGB = (account as any)?.max_storage_gb ?? 1
  const storageUsedGB = (storageUsedBytes / (1024 * 1024 * 1024)).toFixed(1)
  const storagePercent = Math.min(
    Math.round((storageUsedBytes / (maxStorageGB * 1024 * 1024 * 1024)) * 100),
    100
  )

  const metrics = [
    {
      label: 'Players',
      value: onlinePlayers,
      change: {
        value: newPlayersToday > 0 ? `+${newPlayersToday} today` : 'online now',
        trend: 'up' as const,
      },
      icon: <Monitor className="h-4 w-4" />,
      dotColor: '#0ea5e9',
    },
    {
      label: 'Channels',
      value: Array.isArray(channels) ? channels.length : 0,
      change: {
        value: draftChannels > 0 ? `${draftChannels} draft` : 'all published',
        trend: 'neutral' as const,
      },
      icon: <Layers className="h-4 w-4" />,
      dotColor: '#06B6D4',
    },
    {
      label: 'Content',
      value: content.length,
      change: { value: 'in library', trend: 'neutral' as const },
      icon: <Upload className="h-4 w-4" />,
      dotColor: '#059669',
    },
    {
      label: 'Storage',
      value: `${storageUsedGB} GB`,
      change: { value: `${storagePercent}% of ${maxStorageGB} GB`, trend: 'neutral' as const },
      icon: <HardDrive className="h-4 w-4" />,
      dotColor: storagePercent > 80 ? '#DC2626' : '#6b7280',
      progress: storagePercent,
    },
  ]

  const recentActivity = useMemo(() => {
    if (!auditLogs.length) return []
    return auditLogs.map((log) => ({
      id: log.log_id,
      type: mapResourceType(log.resource_type),
      message: [
        log.action,
        log.resource_type,
        log.resource_name ? `"${log.resource_name}"` : null,
      ]
        .filter(Boolean)
        .join(' '),
      timestamp: new Date(log.timestamp),
    }))
  }, [auditLogs])

  if (playersLoading || channelsLoading) {
    return (
      <div className="page-container space-y-5">
        <div className="h-32 animate-pulse rounded-xl" style={{ backgroundColor: '#e0f2fe' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 animate-pulse rounded-xl" style={{ backgroundColor: '#e0f2fe' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-96 animate-pulse rounded-xl" style={{ backgroundColor: '#e0f2fe' }} />
          <div className="h-96 animate-pulse rounded-xl" style={{ backgroundColor: '#e0f2fe' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container space-y-4 sm:space-y-5" style={{ backgroundColor: '#f0f9ff', minHeight: '100%' }}>

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-xl responsive-hero flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
          border: '1px solid #7dd3fc',
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(14,165,233,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative">
          <p
            className="text-[10px] uppercase tracking-widest font-semibold mb-0.5"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.15em',
            }}
          >
            Dashboard
          </p>
          <h1 className="text-lg sm:text-xl font-bold leading-tight" style={{ color: '#0c4a6e' }}>
            {greeting},{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {userName}
            </span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#0369a1' }}>
            Your signage network is performing well. Here&apos;s what&apos;s happening.
          </p>
        </div>

        <div className="relative sm:text-right flex-shrink-0">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: 'rgba(5,150,105,0.10)',
              border: '1px solid rgba(5,150,105,0.20)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#059669', boxShadow: '0 0 6px rgba(5,150,105,0.5)' }}
            />
            <span className="text-xs font-medium" style={{ color: '#059669' }}>All systems operational</span>
          </div>
          <p className="text-xs mt-2" style={{ color: '#6b7280' }}>Synced 2m ago</p>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <MetricsStrip metrics={metrics} />
      </motion.div>

      {/* Offline alert banner */}
      {offlinePlayers > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.20)' }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" style={{ color: '#DC2626' }} />
            <p className="text-sm font-medium" style={{ color: '#DC2626' }}>
              {offlinePlayers} player{offlinePlayers !== 1 ? 's' : ''} offline — check your network
            </p>
          </div>
          <Link
            href="/players"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
            style={{ backgroundColor: 'rgba(220,38,38,0.12)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.25)' }}
          >
            View Players
          </Link>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="rounded-xl px-5 py-4"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <p className="text-xs font-semibold mb-3" style={{ color: '#0369a1' }}>Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Upload Content', href: '/content', Icon: UploadCloud, color: '#059669', bg: 'rgba(5,150,105,0.10)' },
            { label: 'Create App',     href: '/apps/create', Icon: Plus,        color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
            { label: 'Build Channel',  href: '/channels',    Icon: Layers,      color: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
            { label: 'Add Player',     href: '/players',     Icon: Monitor,     color: '#D97706', bg: 'rgba(217,119,6,0.10)' },
          ].map(({ label, href, Icon, color, bg }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-center transition-all hover:opacity-80"
              style={{ backgroundColor: bg, border: `1px solid ${color}22` }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                <Icon className="h-4.5 w-4.5" style={{ color }} />
              </div>
              <span className="text-xs font-semibold leading-tight" style={{ color }}>{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Player Network + Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5"
      >
        {/* Player Network card */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #bae6fd',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #e0f2fe' }}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold" style={{ color: '#0c4a6e' }}>Player Network</h2>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(5,150,105,0.08)',
                  color: '#059669',
                  border: '1px solid rgba(5,150,105,0.16)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#059669' }} />
                {onlinePlayers}/{players.length} online
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: '#6b7280' }}>Live</span>
          </div>

          <div className="h-72 flex items-center justify-center" style={{ backgroundColor: '#f0f9ff' }}>
            <div className="grid grid-cols-2 gap-4 px-6 w-full max-w-xs">
              {[
                { label: 'Online',  count: players.filter((p: any) => p.status === 'online').length,  color: '#059669' },
                { label: 'Offline', count: players.filter((p: any) => p.status === 'offline').length, color: '#DC2626' },
                { label: 'Pending', count: players.filter((p: any) => p.status === 'pending').length, color: '#D97706' },
                { label: 'Total',   count: players.length,                                             color: '#6b7280' },
              ].map(({ label, count, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center rounded-xl p-4 transition-all duration-200"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #bae6fd',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)'
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  }}
                >
                  <span className="text-2xl font-bold" style={{ color }}>{count}</span>
                  <span className="text-xs mt-1" style={{ color: '#6b7280' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex items-center gap-5 px-5 py-3"
            style={{ borderTop: '1px solid #e0f2fe' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#059669' }} />
              <span className="text-xs" style={{ color: '#0369a1' }}>Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6b7280' }} />
              <span className="text-xs" style={{ color: '#0369a1' }}>Offline</span>
            </div>
          </div>
        </div>

        {/* Recent Activity card */}
        <div
          className="rounded-xl"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #bae6fd',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #e0f2fe' }}
          >
            <h2 className="text-sm font-semibold" style={{ color: '#0c4a6e' }}>Recent Activity</h2>
            <span className="text-xs font-medium" style={{ color: '#6b7280' }}>Last 5 events</span>
          </div>

          <div className="px-5 py-4">
            <ActivityFeed activities={recentActivity} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
