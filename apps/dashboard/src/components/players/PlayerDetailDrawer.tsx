'use client'

import { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { usePlayer, useAssignChannel, useUpdatePlayer, useDeletePlayer } from '@/hooks/queries'
import { useChannels } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import {
  Monitor, Wifi, WifiOff, Clock, Tv, Edit3, Trash2, Copy, Info,
  AlertCircle, AlertTriangle,
} from 'lucide-react'
import type { Player } from '@signage/types'

// ── Shared inline styles ──────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: '#0D0D1E',
  border: '1px solid #2A2A40',
  borderRadius: 12,
  padding: '14px 16px',
}

const labelStyle: React.CSSProperties = { fontSize: 12, color: '#6B7280', marginBottom: 6, display: 'block' }
const valueStyle: React.CSSProperties = { fontSize: 13, color: '#FFFFFF' }

interface PlayerDetailDrawerProps {
  playerId: string | null
  onClose: () => void
}

export function PlayerDetailDrawer({ playerId, onClose }: PlayerDetailDrawerProps) {
  const workspace   = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const { data: player, isLoading } = usePlayer(workspaceId, playerId || '')
  const { data: channels = [] }     = useChannels(workspaceId)

  const assignChannelMutation = useAssignChannel()
  const updatePlayerMutation  = useUpdatePlayer()
  const deletePlayerMutation  = useDeletePlayer()

  const [editName, setEditName]           = useState('')
  const [nameChanged, setNameChanged]     = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (player) { setEditName((player as Player).name); setNameChanged(false) }
  }, [player])

  const handleChannelChange = (channelId: string) => {
    if (!playerId) return
    assignChannelMutation.mutate({ workspaceId, playerId, channelId: channelId || null })
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
      { onSuccess: () => { setShowDeleteDialog(false); onClose() } }
    )
  }

  const typedPlayer = player as Player | undefined
  const deviceInfo  = typedPlayer?.device_info

  // Status config
  const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; Icon: any }> = {
    online:  { bg: 'rgba(5,150,105,0.15)',   text: '#34D399', dot: '#059669', Icon: Wifi    },
    offline: { bg: 'rgba(220,38,38,0.15)',   text: '#F87171', dot: '#DC2626', Icon: WifiOff },
    pending: { bg: 'rgba(245,166,36,0.15)',  text: '#F5A624', dot: '#F5A624', Icon: Clock   },
  }
  const statusCfg = STATUS_CFG[typedPlayer?.status || ''] || { bg: 'rgba(107,114,128,0.15)', text: '#9CA3AF', dot: '#6B7280', Icon: Info }

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 80, backgroundColor: '#0D0D1E', borderRadius: 12, opacity: 0.5 }} />
              ))}
            </div>
          </DrawerContent>
        ) : typedPlayer ? (
          <>
            <DrawerContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* ── Status card ── */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(245,166,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Monitor className="h-5 w-5" style={{ color: '#F5A624' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', margin: 0, textTransform: 'capitalize' }}>{typedPlayer.device_type}</p>
                        <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>
                          Last seen: {typedPlayer.last_seen_at ? new Date(typedPlayer.last_seen_at).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    {/* Status badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, backgroundColor: statusCfg.bg }}>
                      <statusCfg.Icon className="h-3.5 w-3.5" style={{ color: statusCfg.text }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: statusCfg.text, textTransform: 'capitalize' }}>{typedPlayer.status}</span>
                    </div>
                  </div>
                </div>

                {/* ── Channel assignment ── */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Tv className="h-4 w-4" style={{ color: '#6B7280' }} />
                    <label style={{ ...labelStyle, marginBottom: 0, fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>Channel</label>
                  </div>
                  <select
                    value={typedPlayer.channel_id || ''}
                    onChange={e => handleChannelChange(e.target.value)}
                    disabled={assignChannelMutation.isPending}
                    style={{ width: '100%', height: 40, backgroundColor: '#13132B', border: '1px solid #2A2A40', borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#FFFFFF', outline: 'none', cursor: 'pointer', colorScheme: 'dark' as any, appearance: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="">No channel</option>
                    {(channels as { channel_id: string; name: string }[]).map(ch => (
                      <option key={ch.channel_id} value={ch.channel_id}>{ch.name}</option>
                    ))}
                  </select>
                  {assignChannelMutation.isPending && (
                    <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Updating channel...</p>
                  )}
                </div>

                {/* ── Display Name ── */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Edit3 className="h-4 w-4" style={{ color: '#6B7280' }} />
                    <label style={{ ...labelStyle, marginBottom: 0, fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>Display Name</label>
                  </div>
                  <input
                    value={editName}
                    onChange={e => { setEditName(e.target.value); setNameChanged(e.target.value !== typedPlayer.name) }}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName() }}
                    placeholder="Player name"
                    style={{ width: '100%', height: 40, backgroundColor: '#13132B', border: '1px solid #2A2A40', borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#F5A624' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#2A2A40' }}
                  />
                </div>

                {/* ── Device Info ── */}
                {deviceInfo && (
                  <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Info className="h-4 w-4" style={{ color: '#6B7280' }} />
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Device Info</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {deviceInfo.os && (
                        <div>
                          <p style={labelStyle}>OS</p>
                          <p style={valueStyle}>{deviceInfo.os} {deviceInfo.os_version || ''}</p>
                        </div>
                      )}
                      {deviceInfo.browser && (
                        <div>
                          <p style={labelStyle}>Browser</p>
                          <p style={valueStyle}>{deviceInfo.browser} {deviceInfo.browser_version || ''}</p>
                        </div>
                      )}
                      {deviceInfo.screen_width && deviceInfo.screen_height && (
                        <div>
                          <p style={labelStyle}>Resolution</p>
                          <p style={valueStyle}>{deviceInfo.screen_width}×{deviceInfo.screen_height}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Pairing Code ── */}
                {typedPlayer.status === 'pending' && typedPlayer.pairing_code && (
                  <div style={cardStyle}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', margin: '0 0 10px' }}>Pairing Code</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <code style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'monospace', color: '#F5A624', backgroundColor: 'rgba(245,166,36,0.12)', padding: '6px 14px', borderRadius: 8 }}>
                        {typedPlayer.pairing_code}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(typedPlayer.pairing_code!)}
                        style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid #2A2A45', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Copy className="h-4 w-4" style={{ color: '#9CA3AF' }} />
                      </button>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 11, color: '#4B5563' }}>
                  Created {new Date(typedPlayer.created_at).toLocaleDateString()}
                </p>
              </div>
            </DrawerContent>

            <DrawerFooter>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 8, backgroundColor: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.20)', color: '#F87171', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  onClick={handleSaveName}
                  disabled={!nameChanged || !editName.trim() || updatePlayerMutation.isPending}
                  style={{ height: 38, padding: '0 20px', borderRadius: 8, backgroundColor: '#F5A624', color: '#000000', fontSize: 13, fontWeight: 700, border: 'none', cursor: (!nameChanged || !editName.trim() || updatePlayerMutation.isPending) ? 'not-allowed' : 'pointer', opacity: (!nameChanged || !editName.trim() || updatePlayerMutation.isPending) ? 0.5 : 1 }}
                >
                  {updatePlayerMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </DrawerFooter>
          </>
        ) : (
          <DrawerContent>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48, gap: 8 }}>
              <AlertCircle className="h-8 w-8" style={{ color: '#4B5563' }} />
              <p style={{ fontSize: 13, color: '#6B7280' }}>Player not found</p>
            </div>
          </DrawerContent>
        )}
      </Drawer>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent hideClose className="!p-0 max-w-sm">
          {/* Header */}
          <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #1E1E38', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle className="h-5 w-5" style={{ color: '#F87171' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Delete Player</h2>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0', lineHeight: 1.4 }}>
                Are you sure you want to delete &ldquo;{typedPlayer?.name}&rdquo;? This action cannot be undone.
              </p>
            </div>
          </div>
          {/* Footer */}
          <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={() => setShowDeleteDialog(false)}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, backgroundColor: '#1A1A30', border: '1px solid #2A2A45', color: '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deletePlayerMutation.isPending}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: 13, fontWeight: 700, border: 'none', cursor: deletePlayerMutation.isPending ? 'not-allowed' : 'pointer', opacity: deletePlayerMutation.isPending ? 0.7 : 1 }}
            >
              {deletePlayerMutation.isPending ? 'Deleting...' : 'Delete Player'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
