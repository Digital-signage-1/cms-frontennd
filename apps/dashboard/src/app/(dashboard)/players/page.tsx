'use client'

import { Button, Input } from '@/components/ui'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState } from '@/components/ui/empty-state'
import { usePlayers } from '@/hooks/queries'
import { PlayerRegistrationModal } from '@/components/players/PlayerRegistrationModal'
import { Monitor, Plus, RefreshCw, Search, Copy, QrCode } from 'lucide-react'
import { useState, Suspense, lazy } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import type { Player } from '@signage/types'
import { motion } from 'framer-motion'
import { fadeInUpVariants, staggerChildrenVariants } from '@/lib/animations'

const PlayerMap = lazy(() => import('@/components/players/PlayerMap').then(m => ({ default: m.PlayerMap })))

export default function PlayersPage() {
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''
  const { data: playersData = [], isLoading: playersLoading } = usePlayers(workspaceId)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)

  const players = Array.isArray(playersData) ? playersData : []
  const filteredPlayers = players.filter((player: Player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onlinePlayers = players.filter((p: Player) => p.status === 'online').length
  const offlinePlayers = players.filter((p: Player) => p.status === 'offline').length

  return (
    <motion.div
      variants={staggerChildrenVariants}
      initial="hidden"
      animate="visible"
      className="h-screen bg-background flex flex-col overflow-hidden"
    >
      <div className="glass-light border-b border-border/50 shrink-0">
        <div className="px-8 py-6">
          <motion.div variants={fadeInUpVariants} className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Control Center</h1>
              <p className="text-sm text-text-secondary mt-1">Monitor and manage your player network</p>
            </div>
            <Button
              onClick={() => setIsRegistrationModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white shadow-lg border-0 gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" /> Register Player
            </Button>
          </motion.div>

          <motion.div variants={fadeInUpVariants} className="flex items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success pulse-ring" />
                <span className="text-sm text-text-secondary">
                  <span className="font-semibold text-success">{onlinePlayers}</span> Online
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-error" />
                <span className="text-sm text-text-secondary">
                  <span className="font-semibold text-error">{offlinePlayers}</span> Offline
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-border/50" />

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-surface/50 border-border/50 focus:border-primary/30 h-10 rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 relative"
        >
          <Suspense fallback={<div className="w-full h-full bg-surface animate-pulse" />}>
            <PlayerMap 
              players={filteredPlayers} 
              onPlayerClick={(player) => setSelectedPlayer(player.player_id)}
            />
          </Suspense>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-96 glass-heavy border-l border-border/50 overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Active Players</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {playersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-surface/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredPlayers.length === 0 ? (
              players.length === 0 ? (
                <EmptyState
                  title="Add your first player"
                  description="Download the player app and use this pairing code"
                  visual={
                    <div className="p-8 bg-surface rounded-lg border border-border shadow-lg">
                      <div className="text-center">
                        <p className="text-xs uppercase tracking-wider text-text-muted mb-3 font-medium">
                          Pairing Code
                        </p>
                        <div className="font-mono text-3xl font-bold text-primary tracking-wider mb-4">
                          ABC-123-XYZ
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-xs text-text-muted">Expires in 14:59</span>
                          <Button size="sm" variant="outline" className="gap-2 h-8">
                            <Copy className="h-3 w-3" /> Copy
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2 h-8">
                            <QrCode className="h-3 w-3" /> QR Code
                          </Button>
                        </div>
                      </div>
                    </div>
                  }
                  action={{
                    label: "Download Player App",
                    onClick: () => window.open('/downloads', '_blank')
                  }}
                />
              ) : (
                <div className="text-center py-12">
                  <Monitor className="h-12 w-12 text-text-muted/30 mx-auto mb-4" />
                  <p className="text-text-secondary text-sm">No players found matching "{searchQuery}"</p>
                </div>
              )
            ) : (
              <div className="space-y-3">
                {filteredPlayers.map((player: Player, index: number) => (
                  <motion.div
                    key={player.player_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedPlayer(player.player_id)}
                  >
                    <GlassCard
                      variant="light"
                      className={`cursor-pointer transition-all ${
                        selectedPlayer === player.player_id 
                          ? 'ring-2 ring-primary' 
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-surface-alt rounded-xl">
                          <Monitor className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-text-primary truncate">
                              {player.name}
                            </h3>
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
                              player.status === 'online' 
                                ? 'bg-success/10 text-success' 
                                : 'bg-error/10 text-error'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                player.status === 'online' ? 'bg-success' : 'bg-error'
                              }`} />
                              <span className="text-xs font-medium">{player.status}</span>
                            </div>
                          </div>
                          <p className="text-xs text-text-muted mb-2 capitalize">
                            {player.device_type}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <span>Last seen: {player.last_seen_at ? new Date(player.last_seen_at).toLocaleString() : 'Never'}</span>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Player Registration Modal */}
      <PlayerRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />
    </motion.div>
  )
}
