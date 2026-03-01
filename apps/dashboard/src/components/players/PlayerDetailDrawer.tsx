'use client'

import { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { usePlayer, useAssignChannel, useUpdatePlayer, useDeletePlayer } from '@/hooks/queries'
import { useChannels } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import {
  Monitor,
  Wifi,
  WifiOff,
  Clock,
  Tv,
  Edit3,
  Trash2,
  Copy,
  Info,
  AlertCircle,
} from 'lucide-react'
import type { Player } from '@signage/types'

interface PlayerDetailDrawerProps {
  playerId: string | null
  onClose: () => void
}

export function PlayerDetailDrawer({ playerId, onClose }: PlayerDetailDrawerProps) {
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const { data: player, isLoading } = usePlayer(workspaceId, playerId || '')
  const { data: channels = [] } = useChannels(workspaceId)

  const assignChannelMutation = useAssignChannel()
  const updatePlayerMutation = useUpdatePlayer()
  const deletePlayerMutation = useDeletePlayer()

  const [editName, setEditName] = useState('')
  const [nameChanged, setNameChanged] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (player) {
      setEditName(player.name)
      setNameChanged(false)
    }
  }, [player])

  const handleChannelChange = (channelId: string) => {
    if (!playerId) return
    assignChannelMutation.mutate({
      workspaceId,
      playerId,
      channelId: channelId || null,
    })
  }

  const handleSaveName = () => {
    if (!playerId || !nameChanged || !editName.trim()) return
    updatePlayerMutation.mutate(
      { workspaceId, playerId, data: { name: editName.trim() } },
      { onSuccess: () => setNameChanged(false) }
    )
  }

  const handleDelete = () => {
    if (!playerId) return
    deletePlayerMutation.mutate(
      { workspaceId, playerId },
      {
        onSuccess: () => {
          setShowDeleteDialog(false)
          onClose()
        },
      }
    )
  }

  const statusBadge = (status: string) => {
    const config = {
      online: { bg: 'bg-success/10 text-success', dot: 'bg-success', icon: Wifi },
      offline: { bg: 'bg-error/10 text-error', dot: 'bg-error', icon: WifiOff },
      pending: { bg: 'bg-warning/10 text-warning', dot: 'bg-warning', icon: Clock },
    }[status] || { bg: 'bg-text-muted/10 text-text-muted', dot: 'bg-text-muted', icon: Info }

    const Icon = config.icon
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium capitalize">{status}</span>
      </div>
    )
  }

  const typedPlayer = player as Player | undefined
  const deviceInfo = typedPlayer?.device_info

  return (
    <>
      <Drawer
        isOpen={!!playerId}
        onClose={onClose}
        title={isLoading ? 'Loading...' : typedPlayer?.name || 'Player Details'}
        width="md"
      >
        {isLoading ? (
          <DrawerContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-surface/50 rounded-xl animate-pulse" />
              ))}
            </div>
          </DrawerContent>
        ) : typedPlayer ? (
          <>
            <DrawerContent>
              <div className="space-y-6">
                {/* Status */}
                <GlassCard variant="light">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-surface-alt rounded-xl">
                        <Monitor className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary capitalize">{typedPlayer.device_type}</p>
                        <p className="text-xs text-text-muted">
                          Last seen: {typedPlayer.last_seen_at ? new Date(typedPlayer.last_seen_at).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    {statusBadge(typedPlayer.status)}
                  </div>
                </GlassCard>

                {/* Channel Assignment */}
                <GlassCard variant="light">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tv className="h-4 w-4 text-text-muted" />
                      <Label className="text-sm font-medium text-text-primary">Channel</Label>
                    </div>
                    <select
                      value={typedPlayer.channel_id || ''}
                      onChange={(e) => handleChannelChange(e.target.value)}
                      disabled={assignChannelMutation.isPending}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
                    >
                      <option value="">No channel</option>
                      {(channels as { channel_id: string; name: string }[]).map((ch) => (
                        <option key={ch.channel_id} value={ch.channel_id}>
                          {ch.name}
                        </option>
                      ))}
                    </select>
                    {assignChannelMutation.isPending && (
                      <p className="text-xs text-text-muted">Updating channel...</p>
                    )}
                  </div>
                </GlassCard>

                {/* Display Name */}
                <GlassCard variant="light">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-text-muted" />
                      <Label className="text-sm font-medium text-text-primary">Display Name</Label>
                    </div>
                    <Input
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value)
                        setNameChanged(e.target.value !== typedPlayer.name)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName()
                      }}
                      placeholder="Player name"
                      className="text-sm"
                    />
                  </div>
                </GlassCard>

                {/* Device Info */}
                {deviceInfo && (
                  <GlassCard variant="light">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-text-muted" />
                        <p className="text-sm font-medium text-text-primary">Device Info</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {deviceInfo.os && (
                          <div>
                            <p className="text-text-muted text-xs">OS</p>
                            <p className="text-text-secondary">{deviceInfo.os} {deviceInfo.os_version || ''}</p>
                          </div>
                        )}
                        {deviceInfo.browser && (
                          <div>
                            <p className="text-text-muted text-xs">Browser</p>
                            <p className="text-text-secondary">{deviceInfo.browser} {deviceInfo.browser_version || ''}</p>
                          </div>
                        )}
                        {deviceInfo.screen_width && deviceInfo.screen_height && (
                          <div>
                            <p className="text-text-muted text-xs">Resolution</p>
                            <p className="text-text-secondary">{deviceInfo.screen_width}x{deviceInfo.screen_height}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                )}

                {/* Pairing Info */}
                {typedPlayer.status === 'pending' && typedPlayer.pairing_code && (
                  <GlassCard variant="light">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-text-primary">Pairing Code</p>
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono bg-surface-alt px-3 py-1.5 rounded-lg text-primary font-semibold tracking-wider">
                          {typedPlayer.pairing_code}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(typedPlayer.pairing_code!)}
                          className="p-1.5 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                )}

                {/* Created date */}
                <div className="text-xs text-text-muted px-1">
                  Created {new Date(typedPlayer.created_at).toLocaleDateString()}
                </div>
              </div>
            </DrawerContent>

            <DrawerFooter>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-error hover:text-error hover:bg-error/10 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button
                  onClick={handleSaveName}
                  disabled={!nameChanged || !editName.trim() || updatePlayerMutation.isPending}
                >
                  {updatePlayerMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DrawerFooter>
          </>
        ) : (
          <DrawerContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-secondary">Player not found</p>
              </div>
            </div>
          </DrawerContent>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{typedPlayer?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deletePlayerMutation.isPending}
              className="bg-error hover:bg-error/90 text-white border-0"
            >
              {deletePlayerMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
