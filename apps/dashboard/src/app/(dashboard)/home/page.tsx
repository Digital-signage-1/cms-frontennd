'use client'

import dynamic from 'next/dynamic'
import { MetricsStrip } from '@/components/dashboard/MetricsStrip'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Monitor, Layers, Upload, HardDrive } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { usePlayers, useChannels, useContent } from '@/hooks/queries'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Suspense } from 'react'

const PlayerMap = dynamic(
  () => import('@/components/players/PlayerMap').then(m => ({ default: m.PlayerMap })),
  { ssr: false }
)

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

  const metrics = [
    {
      label: 'Players',
      value: onlinePlayers,
      change: { value: '+2 today', trend: 'up' as const },
      icon: <Monitor className="h-4 w-4" />,
      dotColor: '#F5A624',
    },
    {
      label: 'Channels',
      value: channels.length,
      change: { value: '3 draft', trend: 'neutral' as const },
      icon: <Layers className="h-4 w-4" />,
      dotColor: '#7C3AED',
    },
    {
      label: 'Content',
      value: content.length,
      change: { value: '+23 today', trend: 'up' as const },
      icon: <Upload className="h-4 w-4" />,
      dotColor: '#059669',
    },
    {
      label: 'Storage',
      value: '45.2 GB',
      change: { value: '45%', trend: 'neutral' as const },
      icon: <HardDrive className="h-4 w-4" />,
      dotColor: '#DC2626',
      progress: 45,
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
    {
      id: '5',
      type: 'channel' as const,
      message: 'New team member invited',
      timestamp: new Date(Date.now() - 3 * 60 * 60000),
    },
  ], [])

  if (playersLoading || channelsLoading) {
    return (
      <div className="p-6 space-y-5">
        <div
          className="h-32 animate-pulse rounded-xl"
          style={{ backgroundColor: '#1C1C1C' }}
        />
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
    <div className="p-5 space-y-5" style={{ backgroundColor: '#0D0D0D', minHeight: '100%' }}>

      {/* ── Hero banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-xl px-7 py-6 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)',
          border: '1px solid #2A3050',
        }}
      >
        {/* Subtle grid overlay */}
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
          <h1 className="text-3xl font-bold leading-tight mb-1.5" style={{ color: '#FFFFFF' }}>
            {greeting},{' '}
            <span style={{ color: '#F5A624' }}>{userName}</span>
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Your signage network is performing well. Here's what's happening.
          </p>
        </div>

        <div className="relative text-right flex-shrink-0 ml-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)' }}>
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#059669', boxShadow: '0 0 6px #059669' }}
            />
            <span className="text-xs font-medium" style={{ color: '#34D399' }}>All systems operational</span>
          </div>
          <p className="text-xs mt-2" style={{ color: '#4B5563' }}>Synced 2m ago</p>
        </div>
      </motion.div>

      {/* ── Metrics row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <MetricsStrip metrics={metrics} />
      </motion.div>

      {/* ── Player Network + Recent Activity ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >

        {/* Player Network */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          {/* Card header */}
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
            <span className="text-xs font-medium" style={{ color: '#4B5563' }}>Live</span>
          </div>

          {/* Map */}
          <div className="h-72" style={{ backgroundColor: '#141414' }}>
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-sm" style={{ color: '#4B5563' }}>Loading map...</span>
              </div>
            }>
              <PlayerMap players={players} onPlayerClick={() => {}} />
            </Suspense>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-5 py-3" style={{ borderTop: '1px solid #242424' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#059669' }} />
              <span className="text-xs" style={{ color: '#6B7280' }}>Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#374151' }} />
              <span className="text-xs" style={{ color: '#6B7280' }}>Offline</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-xl"
          style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #242424' }}>
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            <button
              className="text-xs font-medium transition-opacity hover:opacity-75"
              style={{ color: '#F5A624' }}
            >
              View all
            </button>
          </div>

          {/* Feed */}
          <div className="px-5 py-4">
            <ActivityFeed activities={recentActivity} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
