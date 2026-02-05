'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui'
import { GlassCard } from '@/components/ui/glass-card'
import { Plus, X, Copy, QrCode, RefreshCw, Monitor, Smartphone, Tv, Clock, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth-store'
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

  const [registrationMethod, setRegistrationMethod] = useState<'manual' | 'pairing'>('pairing')
  const [manualFormData, setManualFormData] = useState({
    name: '',
    device_type: 'desktop'
  })
  const [pairingFormData, setPairingFormData] = useState({
    pairing_code: '',
    name: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pairing code query
  const { data: pairingData, isLoading: isLoadingPairingCode, refetch: refetchPairingCode } = useQuery({
    queryKey: ['pairing-code'],
    queryFn: () => api.players.requestPairingCode(),
    enabled: isOpen && registrationMethod === 'pairing',
    refetchInterval: 60000, // Refresh every minute
  })

  // Manual creation mutation
  const createPlayerMutation = useMutation({
    mutationFn: (data: { name: string; device_type?: string }) =>
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
    setManualFormData({ name: '', device_type: 'desktop' })
    setPairingFormData({ pairing_code: '', name: '' })
    setErrors({})
    setRegistrationMethod('pairing')
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!manualFormData.name.trim()) {
      newErrors.name = 'Player name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    createPlayerMutation.mutate(manualFormData)
  }

  const handlePairingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!pairingFormData.pairing_code.trim()) {
      newErrors.pairing_code = 'Pairing code is required'
    }

    if (!pairingFormData.name.trim()) {
      newErrors.name = 'Player name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    pairPlayerMutation.mutate({
      code: pairingFormData.pairing_code,
      name: pairingFormData.name,
    })
  }

  const copyPairingCode = () => {
    if (pairingData?.code) {
      navigator.clipboard.writeText(pairingData.code)
    }
  }

  const getTimeRemaining = () => {
    if (!pairingData?.expires_at) return ''
    const now = new Date()
    const expiry = new Date(pairingData.expires_at)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
                  {/* Pairing Code Display */}
                  <div className="text-center">
                    <p className="text-sm text-text-muted mb-4">
                      Use this code in the player app to automatically register
                    </p>

                    {isLoadingPairingCode ? (
                      <div className="p-8 bg-surface rounded-lg border border-border animate-pulse">
                        <div className="h-8 bg-surface-alt rounded mx-auto w-32"></div>
                      </div>
                    ) : pairingData ? (
                      <div className="p-6 bg-surface rounded-lg border border-border">
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wider text-text-muted mb-2">
                            Pairing Code
                          </p>
                          <div className="font-mono text-2xl font-bold text-primary tracking-wider mb-3">
                            {pairingData.code}
                          </div>
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="flex items-center gap-1 text-xs text-text-muted">
                              <Clock className="h-3 w-3" />
                              <span>Expires in {getTimeRemaining()}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="outline" onClick={copyPairingCode} className="gap-2">
                              <Copy className="h-3 w-3" /> Copy
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => refetchPairingCode()} className="gap-2">
                              <RefreshCw className="h-3 w-3" /> Refresh
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-error/10 border border-error rounded-lg">
                        <p className="text-sm text-error">Failed to load pairing code</p>
                        <Button size="sm" variant="outline" onClick={() => refetchPairingCode()} className="mt-2">
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Manual Pairing Form */}
                  <div className="border-t border-border pt-6">
                    <p className="text-sm text-text-muted mb-4">
                      Or manually enter the pairing code from your device
                    </p>

                    <form onSubmit={handlePairingSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="pairing_code">Pairing Code</Label>
                        <Input
                          id="pairing_code"
                          type="text"
                          value={pairingFormData.pairing_code}
                          onChange={(e) => setPairingFormData(prev => ({ ...prev, pairing_code: e.target.value.toUpperCase() }))}
                          placeholder="XXX-XXX-XXX"
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
                        <Label htmlFor="pairing_name">Display Name</Label>
                        <Input
                          id="pairing_name"
                          type="text"
                          value={pairingFormData.name}
                          onChange={(e) => setPairingFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Lobby Screen"
                          className={`mt-1 ${errors.name ? 'border-error' : ''}`}
                        />
                        {errors.name && (
                          <p className="text-sm text-error mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.name}
                          </p>
                        )}
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
                  </div>
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