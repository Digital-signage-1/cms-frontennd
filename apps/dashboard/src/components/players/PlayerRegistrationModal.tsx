'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui'
import { GlassCard } from '@/components/ui/glass-card'
import { Plus, X, Monitor, Smartphone, Tv, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth-store'
import { useChannels } from '@/hooks/queries'
import { motion, AnimatePresence } from 'framer-motion'
import type { PairingRequest } from '@signage/types'

interface PlayerRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PairingCodeData {
  code: string
  expires_at: string
}

export function PlayerRegistrationModal({ isOpen, onClose }: PlayerRegistrationModalProps) {
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''
  const queryClient = useQueryClient()
  const { data: channels = [] } = useChannels(workspaceId)

  const [registrationMethod, setRegistrationMethod] = useState<'manual' | 'pairing'>('pairing')
  const [pairingChannelId, setPairingChannelId] = useState<string>('')
  const [manualFormData, setManualFormData] = useState({
    name: '',
    device_type: 'desktop',
    channel_id: ''
  })
  const [pairingFormData, setPairingFormData] = useState({
    pairing_code: '',
    name: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})


  const createPlayerMutation = useMutation({
    mutationFn: (data: { name: string; device_type?: string; channel_id: string }) =>
      api.players.create(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', workspaceId] })
      onClose()
      resetForm()
    },
    onError: (error: any) => {
      setErrors({ submit: error.message || 'Failed to create player' })
    },
  })

  // Pairing mutation
  const pairPlayerMutation = useMutation({
    mutationFn: (data: PairingRequest) => api.players.pair(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', workspaceId] })
      onClose()
      resetForm()
    },
    onError: (error: any) => {
      setErrors({ submit: error.message || 'Failed to pair player' })
    },
  })

  const resetForm = () => {
    setPairingChannelId('')
    setManualFormData({ name: '', device_type: 'desktop', channel_id: '' })
    setPairingFormData({ pairing_code: '', name: '' })
    setErrors({})
    setRegistrationMethod('pairing')
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!manualFormData.name.trim()) newErrors.name = 'Player name is required'
    if (!manualFormData.channel_id) newErrors.channel_id = 'Please select a channel'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    createPlayerMutation.mutate(manualFormData)
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

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

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
            <h2 className="text-xl font-semibold text-text-primary">Register Player</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6">
            {/* Registration Method Tabs */}
            <div className="flex bg-surface-alt rounded-lg p-1 mb-6">
              <button
                onClick={() => setRegistrationMethod('pairing')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${registrationMethod === 'pairing'
                    ? 'bg-background text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                  }`}
              >
                Auto Pairing
              </button>
              <button
                onClick={() => setRegistrationMethod('manual')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${registrationMethod === 'manual'
                    ? 'bg-background text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                  }`}
              >
                Manual Setup
              </button>
            </div>

            <AnimatePresence mode="wait">
              {registrationMethod === 'pairing' ? (
                <motion.div
                  key="pairing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <p className="text-sm text-text-muted">
                    Enter the code displayed on your player, select the channel to assign, then click Pair. The player will then show that channel&apos;s content.
                  </p>

                  {workspaceId && (
                    <p className="text-sm text-text-muted">
                      <a
                        href={`${typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001') : 'http://localhost:3001'}/?workspace=${encodeURIComponent(workspaceId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Open player in a new tab
                      </a>
                      {' '}(opens with your workspace so you don&apos;t need to enter it)
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
                        className={`w-full px-3 py-2 mt-1 bg-background border border-border rounded-lg focus:outline-none focus:border-primary ${errors.channel_id ? 'border-error' : ''}`}
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
                </motion.div>
              ) : (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <p className="text-sm text-text-muted mb-6">
                    Manually create a player registration (you'll need to configure the player app separately)
                  </p>

                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="channel">Channel</Label>
                      <select
                        id="channel"
                        value={manualFormData.channel_id}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, channel_id: e.target.value }))}
                        className={`w-full px-3 py-2 mt-1 bg-background border border-border rounded-lg focus:outline-none focus:border-primary ${errors.channel_id ? 'border-error' : ''}`}
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
                      <Label htmlFor="name">Player Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={manualFormData.name}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Main Lobby Display"
                        className={`mt-1 ${errors.name ? 'border-error' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-error mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="device_type">Device Type</Label>
                      <select
                        id="device_type"
                        value={manualFormData.device_type}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, device_type: e.target.value }))}
                        className="w-full px-3 py-2 mt-1 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                      >
                        <option value="desktop">Desktop</option>
                        <option value="tablet">Tablet</option>
                        <option value="tv">TV Display</option>
                        <option value="mobile">Mobile Device</option>
                      </select>
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
                      disabled={createPlayerMutation.isPending}
                    >
                      <Plus className="h-4 w-4" />
                      {createPlayerMutation.isPending ? 'Creating...' : 'Create Player'}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}