'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Monitor, Plus, Search, Copy,
} from 'lucide-react'
import { usePlayers, useChannels } from '@/hooks/queries'
import { PlayerRegistrationModal } from '@/components/players/PlayerRegistrationModal'
import { PlayerDetailDrawer } from '@/components/players/PlayerDetailDrawer'
import { useAuthStore } from '@/stores/auth-store'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import type { Player } from '@signage/types'

// ── Status token map ────────────────────────────────────────────────────────
type StatusKey = 'online' | 'offline' | 'pending'
const STATUS: Record<StatusKey, { dot: string; text: string; bg: string; label: string }> = {
  online:  { dot: '#059669', text: '#34D399', bg: 'rgba(5,150,105,0.15)',   label: 'Online'  },
  offline: { dot: '#DC2626', text: '#F87171', bg: 'rgba(220,38,38,0.15)',   label: 'Offline' },
  pending: { dot: '#F5A624', text: '#F5A624', bg: 'rgba(245,166,36,0.15)', label: 'Pending' },
}

type StatusFilter = 'all' | StatusKey

// ── Player list card ────────────────────────────────────────────────────────
function PlayerCard({
  player,
  isSelected,
  onClick,
}: {
  player: Player
  isSelected: boolean
  onClick: () => void
}) {
  const statusKey = (player.status as StatusKey) in STATUS ? (player.status as StatusKey) : 'offline'
  const s = STATUS[statusKey]
  const code: string = (player as any).pairing_code || ''
  const platform: string = (player as any).device_type || (player as any).platform || ''

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors"
      style={{
        backgroundColor: isSelected ? 'rgba(245,166,36,0.07)' : 'transparent',
        borderBottom: '1px solid #1E1E1E',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#1E1E1E'
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
      }}
    >
      {/* Monitor icon */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${s.dot}18` }}
      >
        <Monitor className="h-5 w-5" style={{ color: s.dot }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-sm font-semibold truncate leading-tight" style={{ color: '#FFFFFF' }}>
            {player.name}
          </p>
          {/* Status badge */}
          <span
            className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: s.bg, color: s.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
            {s.label}
          </span>
        </div>

        {/* Platform */}
        {platform && (
          <p className="text-xs capitalize mb-1" style={{ color: '#6B7280' }}>
            {platform}
          </p>
        )}

        {/* Pairing code */}
        {code && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: '#6B7280' }}>Code:</span>
            <code className="text-xs font-mono font-bold tracking-widest" style={{ color: '#F5A624' }}>
              {code}
            </code>
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(code)
              }}
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <Copy className="h-3 w-3" style={{ color: '#9CA3AF' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function PlayersPage() {
  const workspace   = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const { data: playersData = [], isLoading } = usePlayers(workspaceId)
  const { data: channels = [] }               = useChannels(workspaceId)

  const [searchQuery, setSearchQuery]         = useState('')
  const [statusFilter, setStatusFilter]       = useState<StatusFilter>('all')
  const [selectedPlayer, setSelectedPlayer]   = useState<string | null>(null)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)

  const { setBreadcrumbItems } = useBreadcrumb()
  useEffect(() => {
    setBreadcrumbItems([{ label: 'Players' }])
  }, [setBreadcrumbItems])

  const players       = Array.isArray(playersData) ? playersData : []
  const totalPlayers  = players.length
  const onlineCount   = players.filter((p: Player) => p.status === 'online').length
  const offlineCount  = players.filter((p: Player) => p.status === 'offline').length
  const pendingCount  = players.filter((p: Player) => p.status === 'pending').length

  const filteredPlayers = players.filter((p: Player) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const STAT_CARDS = [
    {
      label: 'Total Players',
      value: totalPlayers,
      color: '#F5A624',
      iconType: 'monitor' as const,
    },
    { label: 'Online',  value: onlineCount,  color: '#059669', iconType: 'dot' as const },
    { label: 'Offline', value: offlineCount, color: '#DC2626', iconType: 'dot' as const },
    { label: 'Pending', value: pendingCount, color: '#F5A624', iconType: 'dot' as const },
  ]

  const FILTER_TABS: { label: string; value: StatusFilter }[] = [
    { label: 'All Players', value: 'all'     },
    { label: 'Online',      value: 'online'  },
    { label: 'Offline',     value: 'offline' },
    { label: 'Pending',     value: 'pending' },
  ]

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        backgroundColor: '#0D0D0D',
        height: 'calc(100vh - 3.5rem)',
      }}
    >
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-0 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-xl"
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
                'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),' +
                'linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Title row */}
          <div className="relative flex items-start justify-between px-7 pt-5 pb-4">
            <div>
              <p
                className="text-xs uppercase font-semibold mb-1.5"
                style={{ color: '#F5A624', letterSpacing: '0.15em' }}
              >
                Control Center
              </p>
              <h1 className="text-3xl font-bold leading-tight mb-1" style={{ color: '#FFFFFF' }}>
                Player Network
              </h1>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Monitor and manage your display network. Track status, deploy content, and configure devices.
              </p>
            </div>

            <button
              onClick={() => setIsRegistrationOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 mt-1 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#F5A624', color: '#000000' }}
            >
              <Plus className="h-4 w-4" />
              Register Player
            </button>
          </div>

          {/* Stat cards */}
          <div className="relative flex items-stretch gap-3 px-7 pb-5">
            {STAT_CARDS.map(({ label, value, color, iconType }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.28)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  {iconType === 'monitor' ? (
                    <Monitor className="h-4 w-4" style={{ color }} />
                  ) : (
                    <span
                      className="w-3.5 h-3.5 rounded-full block"
                      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
                    />
                  )}
                </div>
                {/* Label + value */}
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B7280' }}>{label}</p>
                  <p className="text-2xl font-bold leading-tight" style={{ color }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Main two-column area ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden gap-4 p-5 pt-4">

        {/* Left: Map + filter toolbar + legend */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex-1 flex flex-col overflow-hidden rounded-xl"
          style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          {/* Filter toolbar */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid #242424' }}
          >
            {/* Status filter tabs */}
            <div className="flex items-center gap-1">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={
                    statusFilter === tab.value
                      ? { backgroundColor: '#F5A624', color: '#000000' }
                      : { color: '#9CA3AF' }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search + view toggle */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#6B7280' }}
                />
                <input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 pr-4 text-sm rounded-lg outline-none w-44"
                  style={{
                    backgroundColor: '#141414',
                    border: '1px solid #2A2A2A',
                    color: '#FFFFFF',
                  }}
                />
              </div>

            </div>
          </div>

          {/* Player overview area */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#141414' }}>
            <div className="text-center px-6">
              <Monitor className="h-12 w-12 mx-auto mb-3 opacity-20" style={{ color: '#6B7280' }} />
              <p className="text-sm font-medium mb-1" style={{ color: '#6B7280' }}>
                {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''} {statusFilter !== 'all' ? statusFilter : ''}
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Select a player from the list to view details
              </p>
            </div>
          </div>

          {/* Legend */}
          <div
            className="flex items-center gap-5 px-5 py-3 flex-shrink-0"
            style={{ borderTop: '1px solid #242424' }}
          >
            {[
              { label: 'Online',  color: '#059669' },
              { label: 'Offline', color: '#DC2626' },
              { label: 'Pending', color: '#F5A624' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs" style={{ color: '#6B7280' }}>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Active Players panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="w-80 flex flex-col rounded-xl overflow-hidden flex-shrink-0"
          style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid #242424' }}
          >
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                Active Players
              </h2>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(245,166,36,0.15)', color: '#F5A624' }}
              >
                {totalPlayers}
              </span>
            </div>
          </div>

          {/* Player list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-xl animate-pulse"
                    style={{ backgroundColor: '#242424' }}
                  />
                ))}
              </div>
            ) : players.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Monitor
                  className="h-10 w-10 mx-auto mb-3 opacity-25"
                  style={{ color: '#6B7280' }}
                />
                <p className="text-sm font-medium mb-1" style={{ color: '#9CA3AF' }}>
                  No players yet
                </p>
                <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
                  Open the player app on your display to get a pairing code
                </p>
                <button
                  onClick={() => setIsRegistrationOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: '#F5A624', color: '#000000' }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Register Player
                </button>
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  No players match "{searchQuery}"
                </p>
              </div>
            ) : (
              <div>
                {players.map((player: Player) => (
                  <PlayerCard
                    key={player.player_id}
                    player={player}
                    isSelected={selectedPlayer === player.player_id}
                    onClick={() => setSelectedPlayer(player.player_id)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <PlayerRegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
      <PlayerDetailDrawer
        playerId={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  )
}
