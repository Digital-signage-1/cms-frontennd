'use client'

import { MetricsStrip } from '@/components/dashboard/MetricsStrip'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Monitor, Layers, Upload, HardDrive } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { usePlayers, useChannels, useContent, useAuditLogs } from '@/hooks/queries'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers'
import type { AuditLogItem } from '@signage/api-client'

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
      dotColor: '#F5A624',
    },
    {
      label: 'Channels',
      value: Array.isArray(channels) ? channels.length : 0,
      change: {
        value: draftChannels > 0 ? `${draftChannels} draft` : 'all published',
        trend: 'neutral' as const,
      },
      icon: <Layers className="h-4 w-4" />,
      dotColor: '#7C3AED',
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
      dotColor: storagePercent > 80 ? '#DC2626' : '#6B7280',
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
        <div className="h-32 animate-pulse rounded-xl" style={{ backgroundColor: '#1C1C1C' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 animate-pulse rounded-xl" style={{ backgroundColor: '#1C1C1C' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-96 animate-pulse rounded-xl" style={{ backgroundColor: '#1C1C1C' }} />
          <div className="h-96 animate-pulse rounded-xl" style={{ backgroundColor: '#1C1C1C' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container space-y-4 sm:space-y-5" style={{ backgroundColor: '#0D0D0D', minHeight: '100%' }}>

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-xl responsive-hero flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
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

        <div className="relative">
          <p
            className="text-xs uppercase tracking-widest font-semibold mb-2"
            style={{ color: '#F5A624', letterSpacing: '0.15em' }}
          >
            Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-1.5" style={{ color: '#FFFFFF' }}>
            {greeting},{' '}
            <span style={{ color: '#F5A624' }}>{userName}</span>
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Your signage network is performing well. Here's what's happening.
          </p>
        </div>

        <div className="relative sm:text-right flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)' }}>
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#059669', boxShadow: '0 0 6px #059669' }}
            />
            <span className="text-xs font-medium" style={{ color: '#34D399' }}>All systems operational</span>
          </div>
          <p className="text-xs mt-2" style={{ color: '#6B7280' }}>Synced 2m ago</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <MetricsStrip metrics={metrics} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5"
      >
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #242424' }}>
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-white">Player Network</h2>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(5,150,105,0.12)', color: '#34D399', border: '1px solid rgba(5,150,105,0.2)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#059669' }} />
                {onlinePlayers}/{players.length} online
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Live</span>
          </div>

          <div className="h-72 flex items-center justify-center" style={{ backgroundColor: '#141414' }}>
            <div className="grid grid-cols-2 gap-4 px-6 w-full max-w-xs">
              {[
                { label: 'Online',  count: players.filter((p: any) => p.status === 'online').length,  color: '#059669' },
                { label: 'Offline', count: players.filter((p: any) => p.status === 'offline').length, color: '#DC2626' },
                { label: 'Pending', count: players.filter((p: any) => p.status === 'pending').length, color: '#F5A624' },
                { label: 'Total',   count: players.length,                                             color: '#6B7280' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex flex-col items-center justify-center rounded-xl p-4" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}>
                  <span className="text-2xl font-bold" style={{ color }}>{count}</span>
                  <span className="text-xs mt-1" style={{ color: '#6B7280' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5 px-5 py-3" style={{ borderTop: '1px solid #242424' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#059669' }} />
              <span className="text-xs" style={{ color: '#6B7280' }}>Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6B7280' }} />
              <span className="text-xs" style={{ color: '#6B7280' }}>Offline</span>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl"
          style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #242424' }}>
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Last 5 events</span>
          </div>

          <div className="px-5 py-4">
            <ActivityFeed activities={recentActivity} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
