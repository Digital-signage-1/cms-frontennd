'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui'
import { GlassCard } from '@/components/ui/glass-card'
import { Plus, X, AlertCircle, Check, Copy, ExternalLink } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth-store'
import { useChannels } from '@/hooks/queries'
import { motion } from 'framer-motion'
import type { PairingRequest, PairingResponse } from '@signage/types'

const PLAYER_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001')
  : 'http://localhost:3001'

interface PlayerRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PlayerRegistrationModal({ isOpen, onClose }: PlayerRegistrationModalProps) {
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)
  const queryClient = useQueryClient()
  const { data: channels = [] } = useChannels(workspaceId)

  const [pairingChannelId, setPairingChannelId] = useState<string>('')
  const [pairingFormData, setPairingFormData] = useState({
    pairing_code: '',
    name: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pairedResult, setPairedResult] = useState<PairingResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const pairPlayerMutation = useMutation({
    mutationFn: (data: PairingRequest) => api.players.pair(workspaceId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['players', workspaceId] })
      setPairedResult(result as PairingResponse)
    },
    onError: (error: any) => {
      setErrors({ submit: error.message || 'Failed to pair player' })
    },
  })

  const resetForm = () => {
    setPairingChannelId('')
    setPairingFormData({ pairing_code: '', name: '' })
    setErrors({})
    setPairedResult(null)
    setCopied(false)
  }

  const handlePairingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!pairingFormData.pairing_code.trim()) newErrors.pairing_code = 'Pairing code is required'
    if (!pairingChannelId) newErrors.channel_id = 'Please select a channel'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    pairPlayerMutation.mutate({
      code: pairingFormData.pairing_code.trim().toUpperCase(),
      name: pairingFormData.name.trim() || undefined,
      channel_id: pairingChannelId,
      workspace_id: workspaceId,
    })
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

  const playerUrl = pairedResult
    ? `${PLAYER_BASE_URL}/player/${pairedResult.player_id}?token=${encodeURIComponent(pairedResult.device_token)}`
    : null

  const handleCopyUrl = () => {
    if (!playerUrl) return
    navigator.clipboard.writeText(playerUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg mx-4"
      >
        <GlassCard variant="heavy" className="overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-text-primary">
              {pairedResult ? 'Player Paired' : 'Register Player'}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {pairedResult ? (
              /* ── Success state: show player URL ── */
              <>
                <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.25)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(5,150,105,0.2)' }}>
                    <Check className="h-5 w-5" style={{ color: '#34D399' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#34D399' }}>Player paired successfully!</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Use the URL below to open this player in any browser or tab.</p>
                  </div>
                </div>

                <div>
                  <Label>Player URL</Label>
                  <div className="mt-1 flex gap-2">
                    <input
                      readOnly
                      value={playerUrl || ''}
                      className="flex-1 h-10 px-3 rounded-lg text-xs font-mono"
                      style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', color: '#FFFFFF', outline: 'none' }}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="h-10 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold"
                      style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', color: copied ? '#34D399' : '#9CA3AF', cursor: 'pointer' }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={playerUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold"
                    style={{ backgroundColor: '#F5A624', color: '#000000' }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Player
                  </a>
                  <Button variant="ghost" className="flex-1" onClick={handleClose}>
                    Done
                  </Button>
                </div>
              </>
            ) : (
              /* ── Pairing form ── */
              <>
                <p className="text-sm text-text-muted">
                  Enter the code displayed on your player, select the channel to assign, then click Pair. The player will then show that channel&apos;s content.
                </p>

                {workspaceId && (
                  <p className="text-sm text-text-muted">
                    <a
                      href={`${PLAYER_BASE_URL}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open player in a new tab
                    </a>
                  </p>
                )}

                <form onSubmit={handlePairingSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="pairing_code">Code from player</Label>
                    <Input
                      id="pairing_code"
                      type="text"
                      value={pairingFormData.pairing_code}
                      onChange={(e) => setPairingFormData(prev => ({ ...prev, pairing_code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. T8LJK2"
                      className={`mt-1 font-mono ${errors.pairing_code ? 'border-error' : ''}`}
                    />
                    {errors.pairing_code && (
                      <p className="text-sm text-error mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.pairing_code}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Channel</Label>
                    <select
                      value={pairingChannelId}
                      onChange={(e) => setPairingChannelId(e.target.value)}
                      style={{
                        width: '100%',
                        height: 40,
                        marginTop: 4,
                        backgroundColor: '#1C1C1C',
                        border: `1px solid ${errors.channel_id ? '#DC2626' : '#2A2A2A'}`,
                        borderRadius: 8,
                        padding: '0 12px',
                        fontSize: 14,
                        color: '#FFFFFF',
                        outline: 'none',
                        colorScheme: 'dark' as any,
                        cursor: 'pointer',
                        boxSizing: 'border-box' as any,
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#F5A624' }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.channel_id ? '#DC2626' : '#2A2A2A' }}
                    >
                      <option value="">Select a channel</option>
                      {channels.map((ch: { channel_id: string; name: string }) => (
                        <option key={ch.channel_id} value={ch.channel_id}>{ch.name}</option>
                      ))}
                    </select>
                    {errors.channel_id && (
                      <p className="text-sm text-error mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.channel_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="pairing_name">Display name (optional)</Label>
                    <Input
                      id="pairing_name"
                      type="text"
                      value={pairingFormData.name}
                      onChange={(e) => setPairingFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Lobby Screen"
                      className="mt-1"
                    />
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-error/10 border border-error rounded-lg">
                      <p className="text-sm text-error flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {errors.submit}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={pairPlayerMutation.isPending}
                  >
                    <Plus className="h-4 w-4" />
                    {pairPlayerMutation.isPending ? 'Pairing...' : 'Pair Player'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
