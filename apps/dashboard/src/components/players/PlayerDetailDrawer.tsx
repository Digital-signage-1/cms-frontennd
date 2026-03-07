'use client'

import { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  usePlayer, useAssignChannel, useUpdatePlayer, useDeletePlayer,
  usePlayerCommands, usePlayerScreenshots, usePlayerMetrics, useRequestScreenshot,
} from '@/hooks/queries'
import { useChannels } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import {
  Monitor, Wifi, WifiOff, Clock, Tv, Edit3, Trash2, Copy, Info,
  AlertCircle, AlertTriangle, Terminal, Camera, BarChart2, RefreshCw,
  ExternalLink, Link,
} from 'lucide-react'
import type { Player, PlayerCommand } from '@signage/types'

// ── Shared Tailwind class strings ────────────────────────────────────────────
const cardClasses = 'bg-surface border border-border rounded-xl p-[14px_16px]'
const labelClasses = 'text-xs text-text-muted mb-1.5 block'
const valueClasses = 'text-[13px] text-text-primary'

type DrawerTab = 'info' | 'commands' | 'screenshots' | 'metrics'
const TABS: { key: DrawerTab; label: string; Icon: any }[] = [
  { key: 'info',        label: 'Info',        Icon: Info      },
  { key: 'commands',    label: 'Commands',    Icon: Terminal  },
  { key: 'screenshots', label: 'Screenshots', Icon: Camera    },
  { key: 'metrics',     label: 'Metrics',     Icon: BarChart2 },
]

// Status badge config — data-driven, keep as-is
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; Icon: any }> = {
  online:  { bg: 'rgba(5,150,105,0.15)',   text: '#34D399', dot: '#059669', Icon: Wifi    },
  offline: { bg: 'rgba(220,38,38,0.15)',   text: '#F87171', dot: '#DC2626', Icon: WifiOff },
  pending: { bg: 'rgba(245,166,36,0.15)',  text: '#F5A624', dot: '#F5A624', Icon: Clock   },
}

// Command status colors — data-driven, keep as-is
const CMD_STATUS_COLOR: Record<string, string> = {
  completed:    '#34D399',
  failed:       '#F87171',
  acknowledged: '#60A5FA',
  sent:         '#A78BFA',
  pending:      '#F5A624',
  expired:      '#6B7280',
}

interface PlayerDetailDrawerProps {
  playerId: string | null
  onClose: () => void
}

export function PlayerDetailDrawer({ playerId, onClose }: PlayerDetailDrawerProps) {
  const workspace   = useAuthStore((state) => state.workspace)
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)

  const { data: player, isLoading } = usePlayer(workspaceId, playerId || '')
  const { data: channels = [] }     = useChannels(workspaceId)

  const assignChannelMutation     = useAssignChannel()
  const updatePlayerMutation      = useUpdatePlayer()
  const deletePlayerMutation      = useDeletePlayer()
  const requestScreenshotMutation = useRequestScreenshot()

  const [activeTab, setActiveTab]               = useState<DrawerTab>('info')
  const [editName, setEditName]                 = useState('')
  const [nameChanged, setNameChanged]           = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Reset tab when drawer closes/re-opens
  useEffect(() => {
    if (!playerId) { setActiveTab('info') }
  }, [playerId])

  useEffect(() => {
    if (player) { setEditName((player as Player).name); setNameChanged(false) }
  }, [player])

  const { data: commandsData,    isLoading: commandsLoading    } = usePlayerCommands(workspaceId, playerId || '')
  const { data: screenshotsData, isLoading: screenshotsLoading } = usePlayerScreenshots(workspaceId, playerId || '')
  const { data: metricsData,     isLoading: metricsLoading     } = usePlayerMetrics(workspaceId, playerId || '')

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

  const [urlCopied, setUrlCopied] = useState(false)

  const typedPlayer = player as Player | undefined
  const deviceInfo  = typedPlayer?.device_info
  const statusCfg   = STATUS_CFG[typedPlayer?.status || ''] || {
    bg: 'rgba(107,114,128,0.15)', text: '#9CA3AF', dot: '#6B7280', Icon: Info,
  }

  const PLAYER_BASE_URL = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001')
    : 'http://localhost:3001'
  const playerUrl = typedPlayer?.device_token
    ? `${PLAYER_BASE_URL}/player/${typedPlayer.player_id}?token=${encodeURIComponent(typedPlayer.device_token)}`
    : null

  const handleCopyUrl = () => {
    if (!playerUrl) return
    navigator.clipboard.writeText(playerUrl)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const commands    = (commandsData    as PlayerCommand[])        ?? []
  const screenshots = (screenshotsData as any[])                  ?? []
  const metrics     = (metricsData     as Record<string, unknown>) ?? {}

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
                <div key={i} className="bg-surface rounded-xl" style={{ height: 80, opacity: 0.5 }} />
              ))}
            </div>
          </DrawerContent>
        ) : typedPlayer ? (
          <>
            {/* ── Tab Bar ── */}
            <div className="border-b border-border" style={{ display: 'flex', gap: 4, padding: '0 16px 12px' }}>
              {TABS.map(({ key, label, Icon }) => {
                const active = activeTab === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={active ? 'bg-primary text-on-primary' : 'border border-border text-text-muted hover:bg-surface-hover hover:text-text-primary'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon style={{ width: 13, height: 13 }} />
                    {label}
                  </button>
                )
              })}
            </div>

            {/* ── Info Tab ── */}
            {activeTab === 'info' && (
              <>
                <DrawerContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Status card */}
                    <div className={cardClasses}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="bg-primary/10" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Monitor className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-text-primary" style={{ fontSize: 13, fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{typedPlayer.device_type}</p>
                            <p className="text-text-muted" style={{ fontSize: 11, margin: '2px 0 0' }}>
                              Last seen: {typedPlayer.last_seen_at ? new Date(typedPlayer.last_seen_at).toLocaleString() : 'Never'}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, backgroundColor: statusCfg.bg }}>
                          <statusCfg.Icon className="h-3.5 w-3.5" style={{ color: statusCfg.text }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: statusCfg.text, textTransform: 'capitalize' }}>{typedPlayer.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Channel assignment */}
                    <div className={cardClasses}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Tv className="h-4 w-4 text-text-muted" />
                        <label className="text-[13px] font-semibold text-text-primary">Channel</label>
                      </div>
                      <select
                        value={typedPlayer.channel_id || ''}
                        onChange={e => handleChannelChange(e.target.value)}
                        disabled={assignChannelMutation.isPending}
                        className="w-full bg-input border border-input-border text-text-primary focus:border-primary"
                        style={{ height: 40, borderRadius: 8, padding: '0 12px', fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none', boxSizing: 'border-box' }}
                      >
                        <option value="">No channel</option>
                        {(channels as { channel_id: string; name: string }[]).map(ch => (
                          <option key={ch.channel_id} value={ch.channel_id}>{ch.name}</option>
                        ))}
                      </select>
                      {assignChannelMutation.isPending && (
                        <p className="text-text-muted" style={{ fontSize: 11, marginTop: 4 }}>Updating channel...</p>
                      )}
                    </div>

                    {/* Display Name */}
                    <div className={cardClasses}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Edit3 className="h-4 w-4 text-text-muted" />
                        <label className="text-[13px] font-semibold text-text-primary">Display Name</label>
                      </div>
                      <input
                        value={editName}
                        onChange={e => { setEditName(e.target.value); setNameChanged(e.target.value !== typedPlayer.name) }}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName() }}
                        placeholder="Player name"
                        className="w-full bg-input border border-input-border text-text-primary focus:border-primary"
                        style={{ height: 40, borderRadius: 8, padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Device Info */}
                    {deviceInfo && (
                      <div className={cardClasses}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <Info className="h-4 w-4 text-text-muted" />
                          <p className="text-[13px] font-semibold text-text-primary" style={{ margin: 0 }}>Device Info</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          {deviceInfo.os && (
                            <div>
                              <p className={labelClasses}>OS</p>
                              <p className={valueClasses}>{deviceInfo.os} {deviceInfo.os_version || ''}</p>
                            </div>
                          )}
                          {deviceInfo.browser && (
                            <div>
                              <p className={labelClasses}>Browser</p>
                              <p className={valueClasses}>{deviceInfo.browser} {deviceInfo.browser_version || ''}</p>
                            </div>
                          )}
                          {deviceInfo.screen_width && deviceInfo.screen_height && (
                            <div>
                              <p className={labelClasses}>Resolution</p>
                              <p className={valueClasses}>{deviceInfo.screen_width}x{deviceInfo.screen_height}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Player URL (for paired players) */}
                    {playerUrl && typedPlayer.status !== 'pending' && (
                      <div className={cardClasses}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <Link className="h-4 w-4 text-text-muted" />
                          <p className="text-[13px] font-semibold text-text-primary" style={{ margin: 0 }}>Player URL</p>
                        </div>
                        <p className="text-text-muted" style={{ fontSize: 11, marginBottom: 8 }}>
                          Open this URL in any browser to display this player.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            readOnly
                            value={playerUrl}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            className="bg-input border border-input-border text-text-primary"
                            style={{ flex: 1, height: 34, padding: '0 10px', fontSize: 11, fontFamily: 'monospace', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
                          />
                          <button
                            onClick={handleCopyUrl}
                            className="bg-surface-hover border border-border"
                            style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Copy URL"
                          >
                            <Copy className={`h-4 w-4 ${urlCopied ? '' : 'text-text-secondary'}`} style={urlCopied ? { color: '#34D399' } : undefined} />
                          </button>
                          <a
                            href={playerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary/10 border border-primary/25"
                            style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                            title="Open player"
                          >
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Pairing Code */}
                    {typedPlayer.status === 'pending' && typedPlayer.pairing_code && (
                      <div className={cardClasses}>
                        <p className="text-[13px] font-semibold text-text-primary" style={{ margin: '0 0 10px' }}>Pairing Code</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <code className="text-primary bg-primary/10" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'monospace', padding: '6px 14px', borderRadius: 8 }}>
                            {typedPlayer.pairing_code}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(typedPlayer.pairing_code!)}
                            className="bg-surface-hover border border-border"
                            style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Copy className="h-4 w-4 text-text-secondary" />
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="text-text-muted" style={{ fontSize: 11 }}>
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
                      className="bg-primary text-on-primary"
                      style={{ height: 38, padding: '0 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: (!nameChanged || !editName.trim() || updatePlayerMutation.isPending) ? 'not-allowed' : 'pointer', opacity: (!nameChanged || !editName.trim() || updatePlayerMutation.isPending) ? 0.5 : 1 }}
                    >
                      {updatePlayerMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </DrawerFooter>
              </>
            )}

            {/* ── Commands Tab ── */}
            {activeTab === 'commands' && (
              <DrawerContent>
                {commandsLoading ? (
                  <div className="text-text-muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: 13 }}>Loading commands...</div>
                ) : commands.length === 0 ? (
                  <div className="text-text-muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: 13 }}>No commands sent yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {commands.map((cmd) => (
                      <div key={cmd.command_id} className={cardClasses}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span className="bg-primary/10 text-primary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 6 }}>
                            {cmd.type}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: CMD_STATUS_COLOR[cmd.status] ?? '#6B7280', textTransform: 'capitalize' }}>
                            {cmd.status}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <div>
                            <p className={labelClasses}>Sent</p>
                            <p className={`${valueClasses} text-[11px]`}>{new Date(cmd.sent_at).toLocaleString()}</p>
                          </div>
                          {cmd.completed_at && (
                            <div>
                              <p className={labelClasses}>Completed</p>
                              <p className={`${valueClasses} text-[11px]`}>{new Date(cmd.completed_at).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DrawerContent>
            )}

            {/* ── Screenshots Tab ── */}
            {activeTab === 'screenshots' && (
              <>
                <DrawerContent>
                  {screenshotsLoading ? (
                    <div className="text-text-muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: 13 }}>Loading screenshots...</div>
                  ) : screenshots.length === 0 ? (
                    <div className="text-text-muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: 13 }}>
                      No screenshots yet. Request one below.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {screenshots.map((shot: any, i: number) => (
                        <div key={shot.screenshot_id ?? i} className="border border-border bg-surface" style={{ borderRadius: 10, overflow: 'hidden' }}>
                          {shot.thumbnail_url || shot.url ? (
                            <img
                              src={shot.thumbnail_url || shot.url}
                              alt={`Screenshot ${i + 1}`}
                              style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <div className="text-text-muted" style={{ width: '100%', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Camera style={{ width: 24, height: 24 }} />
                            </div>
                          )}
                          {shot.captured_at && (
                            <p className="text-text-muted" style={{ fontSize: 10, padding: '6px 8px', margin: 0 }}>
                              {new Date(shot.captured_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </DrawerContent>
                <DrawerFooter>
                  <button
                    onClick={() => requestScreenshotMutation.mutate({ workspaceId, playerId: playerId! })}
                    disabled={requestScreenshotMutation.isPending}
                    className="bg-primary text-on-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 40, borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: requestScreenshotMutation.isPending ? 'not-allowed' : 'pointer', opacity: requestScreenshotMutation.isPending ? 0.6 : 1 }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {requestScreenshotMutation.isPending ? 'Requesting...' : 'Request Screenshot'}
                  </button>
                </DrawerFooter>
              </>
            )}

            {/* ── Metrics Tab ── */}
            {activeTab === 'metrics' && (
              <DrawerContent>
                {metricsLoading ? (
                  <div className="text-text-muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: 13 }}>Loading metrics...</div>
                ) : Object.keys(metrics).length === 0 ? (
                  <div className="text-text-muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: 13 }}>No metrics available</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {metrics.cpu_usage !== undefined && (
                      <div className={cardClasses}>
                        <p className={labelClasses}>CPU Usage</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <p className="text-primary" style={{ fontSize: 22, fontWeight: 700 }}>
                            {Number(metrics.cpu_usage).toFixed(1)}%
                          </p>
                          <div className="bg-surface-alt" style={{ flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                            <div className="bg-primary" style={{ height: '100%', width: `${Math.min(Number(metrics.cpu_usage), 100)}%`, borderRadius: 3 }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {metrics.memory_usage !== undefined && (
                      <div className={cardClasses}>
                        <p className={labelClasses}>Memory Usage</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <p style={{ fontSize: 22, fontWeight: 700, color: '#60A5FA' }}>
                            {Number(metrics.memory_usage).toFixed(1)}%
                          </p>
                          <div className="bg-surface-alt" style={{ flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(Number(metrics.memory_usage), 100)}%`, backgroundColor: '#60A5FA', borderRadius: 3 }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {metrics.uptime_seconds !== undefined && (
                      <div className={cardClasses}>
                        <p className={labelClasses}>Uptime</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#34D399' }}>
                          {Math.floor(Number(metrics.uptime_seconds) / 3600)}h {Math.floor((Number(metrics.uptime_seconds) % 3600) / 60)}m
                        </p>
                      </div>
                    )}
                    {metrics.storage_usage !== undefined && (
                      <div className={cardClasses}>
                        <p className={labelClasses}>Storage Usage</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <p style={{ fontSize: 22, fontWeight: 700, color: '#A78BFA' }}>
                            {Number(metrics.storage_usage).toFixed(1)}%
                          </p>
                          <div className="bg-surface-alt" style={{ flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(Number(metrics.storage_usage), 100)}%`, backgroundColor: '#A78BFA', borderRadius: 3 }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {!!metrics.timestamp && (
                      <p className="text-text-muted" style={{ fontSize: 11, marginTop: 4 }}>
                        Last updated: {new Date(metrics.timestamp as string).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </DrawerContent>
            )}
          </>
        ) : (
          <DrawerContent>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48, gap: 8 }}>
              <AlertCircle className="h-8 w-8 text-text-muted" />
              <p className="text-text-muted" style={{ fontSize: 13 }}>Player not found</p>
            </div>
          </DrawerContent>
        )}
      </Drawer>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent hideClose className="!p-0 max-w-sm">
          <div className="border-b border-border" style={{ padding: '20px 22px 16px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle className="h-5 w-5" style={{ color: '#F87171' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="text-text-primary" style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Delete Player</h2>
              <p className="text-text-muted" style={{ fontSize: 13, margin: '4px 0 0', lineHeight: 1.4 }}>
                Are you sure you want to delete &ldquo;{typedPlayer?.name}&rdquo;? This action cannot be undone.
              </p>
            </div>
          </div>
          <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="bg-surface-elevated border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              style={{ height: 40, padding: '0 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
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
