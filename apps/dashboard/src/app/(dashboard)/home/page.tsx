'use client'

import { Button } from '@/components/ui'
import { MetricsStrip } from '@/components/dashboard/MetricsStrip'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { StatusDot } from '@/components/ui/status-dot'
import { Monitor, Layers, Upload, HardDrive, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { usePlayers, useChannels, useContent } from '@/hooks/queries'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Suspense, lazy } from 'react'

const PlayerMap = lazy(() => import('@/components/players/PlayerMap').then(m => ({ default: m.PlayerMap })))

export default function HomePage() {
  const { user, account, workspace } = useAuthStore()
  const workspaceId = workspace?.workspace_id || ''
  const { data: playersData = [], isLoading: playersLoading } = usePlayers(workspaceId)
  const { data: channels = [], isLoading: channelsLoading } = useChannels(workspaceId)
  const { data: contentData } = useContent(workspaceId, {})

  const players = Array.isArray(playersData) ? playersData : (playersData as any)?.data || []
  const content = Array.isArray(contentData) ? contentData : (contentData as any)?.items || []

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
  const networkHealth = players.length > 0 ? Math.round((onlinePlayers / players.length) * 100) : 100

  const metrics = [
    {
      label: 'Players',
      value: onlinePlayers,
      change: { value: '+2 today', trend: 'up' as const },
      icon: <Monitor className="h-4 w-4" />,
    },
    {
      label: 'Channels',
      value: channels.length,
      change: { value: '3 draft', trend: 'up' as const },
      icon: <Layers className="h-4 w-4" />,
    },
    {
      label: 'Content',
      value: content.length,
      change: { value: '+23 today', trend: 'up' as const },
      icon: <Upload className="h-4 w-4" />,
    },
    {
      label: 'Storage',
      value: '45.2 GB',
      change: { value: '45% used', trend: 'up' as const },
      icon: <HardDrive className="h-4 w-4" />,
    },
  ]

  const recentActivity = useMemo(() => [
    {
      id: '1',
      type: 'player' as const,
      message: 'Player "Lobby Display" came online',
      timestamp: new Date(Date.now() - 2 * 60000),
    },
    {
      id: '2',
      type: 'channel' as const,
      message: 'Channel "Morning News" updated',
      timestamp: new Date(Date.now() - 15 * 60000),
    },
    {
      id: '3',
      type: 'schedule' as const,
      message: 'Schedule "Weekend Specials" activated',
      timestamp: new Date(Date.now() - 60 * 60000),
    },
    {
      id: '4',
      type: 'content' as const,
      message: 'New content uploaded to Media Library',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
    },
  ], [])

  if (playersLoading || channelsLoading) {
    return (
      <div className="p-8">
        <div className="h-32 bg-surface-alt animate-pulse rounded-lg mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-surface-alt animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-surface-alt animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Your signage network is performing well. Here's what's happening.
          </p>
        </motion.div>
      </div>

      <div className="flex items-center justify-between px-8 py-4 bg-surface border-b border-border">
        <div className="flex items-center gap-3">
          <StatusDot status="online" pulse />
          <span className="text-sm font-medium text-text-primary">
            All systems operational
          </span>
        </div>
        <span className="text-xs text-text-muted">
          Last sync: 2 minutes ago
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <MetricsStrip metrics={metrics} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Player Network</h2>
                <div className="text-sm text-text-muted">
                  {onlinePlayers} / {players.length} online
                </div>
              </div>
              <div className="h-96 bg-surface-alt rounded-lg overflow-hidden">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-sm text-text-muted">Loading map...</div>
                  </div>
                }>
                  <PlayerMap players={players} onPlayerClick={() => {}} />
                </Suspense>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
                <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary-hover">
                  View all
                </Button>
              </div>
              <ActivityFeed activities={recentActivity} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
