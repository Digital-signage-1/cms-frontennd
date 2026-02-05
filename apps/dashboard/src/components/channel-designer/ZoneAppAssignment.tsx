'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui'
import { Plus, Trash2, GripVertical, Clock, Settings } from 'lucide-react'
import { motion, Reorder } from 'framer-motion'
import type { ZoneApp, App } from '@signage/types'
import { useApps } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'

interface ZoneAppAssignmentProps {
  zoneId: string
  zoneApps: ZoneApp[]
  onZoneAppsChange: (zoneApps: ZoneApp[]) => void
  onAddApp: () => void
}

interface AppSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectApp: (app: App) => void
  excludeAppIds: string[]
}

function AppSelectorModal({ isOpen, onClose, onSelectApp, excludeAppIds }: AppSelectorModalProps) {
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''
  const { data: apps = [] } = useApps(workspaceId)
  const [searchQuery, setSearchQuery] = useState('')

  const availableApps = Array.isArray(apps)
    ? apps.filter((app: App) =>
      !excludeAppIds.includes(app.app_id) &&
      app.status === 'active' &&
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Select App</h3>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {availableApps.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <p>No available apps found</p>
              <p className="text-sm mt-2">Create some apps first or check if they are active</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableApps.map((app: App) => (
                <button
                  key={app.app_id}
                  onClick={() => {
                    onSelectApp(app)
                    onClose()
                  }}
                  className="p-3 text-left border border-border rounded-lg hover:border-primary transition-colors bg-surface hover:bg-surface-alt"
                >
                  <h4 className="font-medium text-text-primary">{app.name}</h4>
                  <p className="text-sm text-text-muted capitalize">{app.template_type}</p>
                  {app.description && (
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{app.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ZoneAppAssignment({
  zoneId,
  zoneApps,
  onZoneAppsChange,
  onAddApp
}: ZoneAppAssignmentProps) {
  const [isAppSelectorOpen, setIsAppSelectorOpen] = useState(false)
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''
  const { data: apps = [] } = useApps(workspaceId)

  // Generate a new zone app ID
  const generateZoneAppId = () => `zone_app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Get app details by ID
  const getAppDetails = (appId: string) => {
    return Array.isArray(apps) ? apps.find((app: App) => app.app_id === appId) : null
  }

  // Add app to zone
  const addAppToZone = (app: App) => {
    const newZoneApp: ZoneApp = {
      zone_app_id: generateZoneAppId(),
      zone_id: zoneId,
      app_id: app.app_id,
      order: zoneApps.length,
      duration_seconds: 10,
    }
    onZoneAppsChange([...zoneApps, newZoneApp])
  }

  // Remove app from zone
  const removeAppFromZone = (zoneAppId: string) => {
    onZoneAppsChange(zoneApps.filter(za => za.zone_app_id !== zoneAppId))
  }

  // Update zone app
  const updateZoneApp = (zoneAppId: string, updates: Partial<ZoneApp>) => {
    onZoneAppsChange(zoneApps.map(za =>
      za.zone_app_id === zoneAppId ? { ...za, ...updates } : za
    ))
  }

  // Reorder zone apps
  const handleReorder = (newZoneApps: ZoneApp[]) => {
    const reorderedApps = newZoneApps.map((app, index) => ({
      ...app,
      order: index
    }))
    onZoneAppsChange(reorderedApps)
  }

  const excludeAppIds = zoneApps.map(za => za.app_id)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Zone Playlist</h3>
        <Button onClick={() => setIsAppSelectorOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add App
        </Button>
      </div>

      {zoneApps.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg text-text-muted">
          <div className="space-y-2">
            <Settings className="h-12 w-12 mx-auto opacity-50" />
            <p>No apps assigned to this zone</p>
            <p className="text-sm">Click "Add App" to get started</p>
          </div>
        </div>
      ) : (
        <Reorder.Group
          values={zoneApps}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {zoneApps.map((zoneApp) => {
            const app = getAppDetails(zoneApp.app_id)

            return (
              <Reorder.Item
                key={zoneApp.zone_app_id}
                value={zoneApp}
                className="bg-surface border border-border rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <GripVertical className="h-5 w-5 text-text-muted cursor-grab" />

                  {/* App Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary">
                      {app?.name || 'Unknown App'}
                    </h4>
                    <p className="text-sm text-text-muted capitalize">
                      {app?.template_type || 'Unknown Type'}
                    </p>
                  </div>

                  {/* Duration Input */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-text-muted" />
                    <Input
                      type="number"
                      min="1"
                      max="3600"
                      value={zoneApp.duration_seconds}
                      onChange={(e) => updateZoneApp(zoneApp.zone_app_id, {
                        duration_seconds: Number(e.target.value)
                      })}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-text-muted">sec</span>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAppFromZone(zoneApp.zone_app_id)}
                    className="text-error hover:text-error hover:bg-error/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Duration Range */}
                {(zoneApp.start_date || zoneApp.end_date) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-text-muted">
                      {zoneApp.start_date && (
                        <span>Start: {new Date(zoneApp.start_date).toLocaleDateString()}</span>
                      )}
                      {zoneApp.start_date && zoneApp.end_date && <span className="mx-2">•</span>}
                      {zoneApp.end_date && (
                        <span>End: {new Date(zoneApp.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                )}
              </Reorder.Item>
            )
          })}
        </Reorder.Group>
      )}

      {/* App Selector Modal */}
      <AppSelectorModal
        isOpen={isAppSelectorOpen}
        onClose={() => setIsAppSelectorOpen(false)}
        onSelectApp={addAppToZone}
        excludeAppIds={excludeAppIds}
      />
    </div>
  )
}