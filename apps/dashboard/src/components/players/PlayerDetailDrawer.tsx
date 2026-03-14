'use client'

import { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer'
import { Select } from '@/components/ui/select'
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

// ── Shared inline styles ──────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #bae6fd',
  borderRadius: 12,
  padding: '14px 16px',
}
const labelStyle: React.CSSProperties = { fontSize: 12, color: '#6b7280', marginBottom: 6, display: 'block' }
const valueStyle: React.CSSProperties = { fontSize: 13, color: '#0c4a6e' }

type DrawerTab = 'info' | 'commands' | 'screenshots' | 'metrics'
const TABS: { key: DrawerTab; label: string; Icon: any }[] = [
  { key: 'info',        label: 'Info',        Icon: Info      },
  { key: 'commands',    label: 'Commands',    Icon: Terminal  },
  { key: 'screenshots', label: 'Screenshots', Icon: Camera    },
  { key: 'metrics',     label: 'Metrics',     Icon: BarChart2 },
]

// Status badge config
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; Icon: any }> = {
  online:  { bg: 'rgba(5,150,105,0.15)',   text: '#059669', dot: '#059669', Icon: Wifi    },
  offline: { bg: 'rgba(220,38,38,0.15)',   text: '#DC2626', dot: '#DC2626', Icon: WifiOff },
  pending: { bg: 'rgba(14,165,233,0.12)',  text: '#0ea5e9', dot: '#0ea5e9', Icon: Clock   },
}

// Command status colors
const CMD_STATUS_COLOR: Record<string, string> = {
  completed:    '#059669',
  failed:       '#DC2626',
  acknowledged: '#60A5FA',
  sent:         '#A78BFA',
  pending:      '#0ea5e9',
  expired:      '#6b7280',
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
    bg: 'rgba(107,114,128,0.15)', text: '#6b7280', dot: '#6b7280', Icon: Info,
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
                <div key={i} style={{ height: 80, backgroundColor: '#e0f2fe', borderRadius: 12, opacity: 0.5 }} />
              ))}
            </div>
          </DrawerContent>
        ) : typedPlayer ? (
          <>
            {/* ── Tab Bar ── */}
            <div style={{ display: 'flex', gap: 4, padding: '0 16px 12px', borderBottom: '1px solid #bae6fd' }}>
              {TABS.map(({ key, label, Icon }) => {
                const active = activeTab === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      border: active ? 'none' : '1px solid #bae6fd',
                      background: active ? 'linear-gradient(135deg, #0ea5e9, #06b6d4)' : 'transparent',
                      color: active ? '#FFFFFF' : '#0369a1',
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
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(14,165,233,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Monitor className="h-5 w-5" style={{ color: '#0ea5e9' }} />
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', margin: 0, textTransform: 'capitalize' }}>{typedPlayer.device_type}</p>
                            <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>
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
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Tv className="h-4 w-4" style={{ color: '#6b7280' }} />
                        <label style={{ ...labelStyle, marginBottom: 0, fontSize: 13, fontWeight: 600, color: '#0c4a6e' }}>Channel</label>
                      </div>
                      <Select
                        value={typedPlayer.channel_id || undefined}
                        onValueChange={(val) => handleChannelChange(val)}
                        disabled={assignChannelMutation.isPending}
                        placeholder="No channel"
                        options={[
                          { value: '', label: 'No channel' },
                          ...(channels as { channel_id: string; name: string }[]).map(ch => ({
                            value: ch.channel_id, label: ch.name,
                          })),
                        ]}
                      />
                      {assignChannelMutation.isPending && (
                        <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Updating channel...</p>
                      )}
                    </div>

                    {/* Display Name */}
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Edit3 className="h-4 w-4" style={{ color: '#6b7280' }} />
                        <label style={{ ...labelStyle, marginBottom: 0, fontSize: 13, fontWeight: 600, color: '#0c4a6e' }}>Display Name</label>
                      </div>
                      <input
                        value={editName}
                        onChange={e => { setEditName(e.target.value); setNameChanged(e.target.value !== typedPlayer.name) }}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName() }}
                        placeholder="Player name"
                        style={{ width: '100%', height: 40, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#0c4a6e', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#0ea5e9' }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#bae6fd' }}
                      />
                    </div>

                    {/* Device Info */}
                    {deviceInfo && (
                      <div style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <Info className="h-4 w-4" style={{ color: '#6b7280' }} />
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', margin: 0 }}>Device Info</p>
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

                    {/* Player URL (for paired players) */}
                    {playerUrl && typedPlayer.status !== 'pending' && (
                      <div style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <Link className="h-4 w-4" style={{ color: '#6b7280' }} />
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', margin: 0 }}>Player URL</p>
                        </div>
                        <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                          Open this URL in any browser to display this player.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            readOnly
                            value={playerUrl}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            style={{ flex: 1, height: 34, padding: '0 10px', fontSize: 11, fontFamily: 'monospace', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 8, color: '#0c4a6e', outline: 'none', boxSizing: 'border-box' }}
                          />
                          <button
                            onClick={handleCopyUrl}
                            style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Copy URL"
                          >
                            <Copy className="h-4 w-4" style={{ color: urlCopied ? '#059669' : '#6b7280' }} />
                          </button>
                          <a
                            href={playerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                            title="Open player"
                          >
                            <ExternalLink className="h-4 w-4" style={{ color: '#0ea5e9' }} />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Pairing Code */}
                    {typedPlayer.status === 'pending' && typedPlayer.pairing_code && (
                      <div style={cardStyle}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', margin: '0 0 10px' }}>Pairing Code</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <code style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'monospace', color: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.08)', padding: '6px 14px', borderRadius: 8 }}>
                            {typedPlayer.pairing_code}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(typedPlayer.pairing_code!)}
                            style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Copy className="h-4 w-4" style={{ color: '#6b7280' }} />
                          </button>
                        </div>
                      </div>
                    )}

                    <p style={{ fontSize: 11, color: '#6b7280' }}>
                      Created {new Date(typedPlayer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </DrawerContent>

                <DrawerFooter>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 8, backgroundColor: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.20)', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                    <button
                      onClick={handleSaveName}
                      disabled={!nameChanged || !editName.trim() || updatePlayerMutation.isPending}
                      style={{ height: 38, padding: '0 20px', borderRadius: 8, background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', color: '#FFFFFF', fontSize: 13, fontWeight: 700, border: 'none', cursor: (!nameChanged || !editName.trim() || updatePlayerMutation.isPending) ? 'not-allowed' : 'pointer', opacity: (!nameChanged || !editName.trim() || updatePlayerMutation.isPending) ? 0.5 : 1 }}
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
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280', fontSize: 13 }}>Loading commands…</div>
                ) : commands.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280', fontSize: 13 }}>No commands sent yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {commands.map((cmd) => (
                      <div key={cmd.command_id} style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'rgba(14,165,233,0.08)', padding: '3px 8px', borderRadius: 6, color: '#0ea5e9' }}>
                            {cmd.type}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: CMD_STATUS_COLOR[cmd.status] ?? '#6b7280', textTransform: 'capitalize' }}>
                            {cmd.status}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <div>
                            <p style={labelStyle}>Sent</p>
                            <p style={{ ...valueStyle, fontSize: 11 }}>{new Date(cmd.sent_at).toLocaleString()}</p>
                          </div>
                          {cmd.completed_at && (
                            <div>
                              <p style={labelStyle}>Completed</p>
                              <p style={{ ...valueStyle, fontSize: 11 }}>{new Date(cmd.completed_at).toLocaleString()}</p>
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
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280', fontSize: 13 }}>Loading screenshots…</div>
                  ) : screenshots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280', fontSize: 13 }}>
                      No screenshots yet. Request one below.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {screenshots.map((shot: any, i: number) => (
                        <div key={shot.screenshot_id ?? i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #bae6fd', backgroundColor: '#FFFFFF' }}>
                          {shot.thumbnail_url || shot.url ? (
                            <img
                              src={shot.thumbnail_url || shot.url}
                              alt={`Screenshot ${i + 1}`}
                              style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                              <Camera style={{ width: 24, height: 24 }} />
                            </div>
                          )}
                          {shot.captured_at && (
                            <p style={{ fontSize: 10, color: '#6b7280', padding: '6px 8px', margin: 0 }}>
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
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 40, borderRadius: 8, background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', color: '#FFFFFF', fontSize: 13, fontWeight: 700, border: 'none', cursor: requestScreenshotMutation.isPending ? 'not-allowed' : 'pointer', opacity: requestScreenshotMutation.isPending ? 0.6 : 1 }}
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
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280', fontSize: 13 }}>Loading metrics…</div>
                ) : Object.keys(metrics).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280', fontSize: 13 }}>No metrics available</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {metrics.cpu_usage !== undefined && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>CPU Usage</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <p style={{ ...valueStyle, fontSize: 22, fontWeight: 700, color: '#0ea5e9' }}>
                            {Number(metrics.cpu_usage).toFixed(1)}%
                          </p>
                          <div style={{ flex: 1, height: 6, backgroundColor: '#e0f2fe', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(Number(metrics.cpu_usage), 100)}%`, backgroundColor: '#0ea5e9', borderRadius: 3 }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {metrics.memory_usage !== undefined && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Memory Usage</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <p style={{ ...valueStyle, fontSize: 22, fontWeight: 700, color: '#60A5FA' }}>
                            {Number(metrics.memory_usage).toFixed(1)}%
                          </p>
                          <div style={{ flex: 1, height: 6, backgroundColor: '#e0f2fe', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(Number(metrics.memory_usage), 100)}%`, backgroundColor: '#60A5FA', borderRadius: 3 }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {metrics.uptime_seconds !== undefined && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Uptime</p>
                        <p style={{ ...valueStyle, fontSize: 18, fontWeight: 700, color: '#059669' }}>
                          {Math.floor(Number(metrics.uptime_seconds) / 3600)}h {Math.floor((Number(metrics.uptime_seconds) % 3600) / 60)}m
                        </p>
                      </div>
                    )}
                    {metrics.storage_usage !== undefined && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Storage Usage</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <p style={{ ...valueStyle, fontSize: 22, fontWeight: 700, color: '#A78BFA' }}>
                            {Number(metrics.storage_usage).toFixed(1)}%
                          </p>
                          <div style={{ flex: 1, height: 6, backgroundColor: '#e0f2fe', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(Number(metrics.storage_usage), 100)}%`, backgroundColor: '#A78BFA', borderRadius: 3 }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {!!metrics.timestamp && (
                      <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
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
              <AlertCircle className="h-8 w-8" style={{ color: '#6b7280' }} />
              <p style={{ fontSize: 13, color: '#6b7280' }}>Player not found</p>
            </div>
          </DrawerContent>
        )}
      </Drawer>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent hideClose className="!p-0 max-w-sm">
          <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #bae6fd', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle className="h-5 w-5" style={{ color: '#DC2626' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0c4a6e', margin: 0 }}>Delete Player</h2>
              <p style={{ fontSize: 13, color: '#0369a1', margin: '4px 0 0', lineHeight: 1.4 }}>
                Are you sure you want to delete &ldquo;{typedPlayer?.name}&rdquo;? This action cannot be undone.
              </p>
            </div>
          </div>
          <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={() => setShowDeleteDialog(false)}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
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
