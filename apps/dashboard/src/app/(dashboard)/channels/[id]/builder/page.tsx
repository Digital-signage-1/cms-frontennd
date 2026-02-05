'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { StatusDot } from '@/components/ui/status-dot'
import {
  ArrowLeft, Save, Upload, Plus, Settings, Play, Grid,
  Image, Video, Clock, Cloud, Globe, Code, LayoutGrid, Trash2,
  Move, RotateCw, Monitor
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useChannel, useChannelManifest, useUpdateChannel, usePublishChannel, useAddZoneApp } from '@/hooks/queries/useChannels'
import { useApps } from '@/hooks/queries'
import { LAYOUT_TEMPLATES } from '@/lib/layout-templates'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Zone {
  zone_id: string
  name: string
  x_percent: number
  y_percent: number
  width_percent: number
  height_percent: number
  z_index: number
  background?: any
  apps?: any[]
}

export default function ChannelBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const [channelName, setChannelName] = useState('')
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const { data: channelData, isLoading: channelLoading } = useChannel(workspaceId, resolvedParams.id)
  const { data: manifestData } = useChannelManifest(workspaceId, resolvedParams.id)
  const { data: appsData, isLoading: appsLoading } = useApps(workspaceId)
  const updateChannelMutation = useUpdateChannel()
  const publishChannelMutation = usePublishChannel()
  const addZoneAppMutation = useAddZoneApp()

  const availableApps = Array.isArray(appsData) ? appsData : []
  const zones: Zone[] = manifestData?.zones || []
  const selectedZoneData = zones.find((z: any) => z.zone_id === selectedZone)

  useEffect(() => {
    if (channelData) {
      setChannelName(channelData.name)
    }
  }, [channelData])

  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      setSelectedZone(zones[0].zone_id)
    }
  }, [zones, selectedZone])

  const handleSave = async () => {
    if (!workspaceId || !channelData) return
    try {
      await updateChannelMutation.mutateAsync({
        workspaceId,
        channelId: channelData.channel_id,
        data: { name: channelName },
      })
    } catch (error) {
      console.error('Failed to save channel:', error)
    }
  }

  const handlePublish = async () => {
    if (!workspaceId || !channelData) return
    try {
      await publishChannelMutation.mutateAsync({
        workspaceId,
        channelId: channelData.channel_id,
      })
    } catch (error) {
      console.error('Failed to publish channel:', error)
    }
  }

  const addAppToZone = async (zoneId: string, app: any) => {
    if (!workspaceId || !channelData) return

    try {
      await addZoneAppMutation.mutateAsync({
        workspaceId,
        channelId: channelData.channel_id,
        zoneId,
        data: {
          app_id: app.app_id,
          duration_seconds: 30,
          order: 0,
        }
      })
    } catch (error) {
      console.error('Failed to add app to zone:', error)
    }
  }

  if (channelLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Link href="/channels">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>

              <div className="flex-1 min-w-0">
                <Input
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Channel name"
                  className="text-xl font-semibold border-0 bg-transparent focus-visible:ring-0 px-0 h-auto"
                />
                <div className="flex items-center gap-3 mt-1">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
                    channelData?.status === 'published'
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-warning/10 text-warning border border-warning/20'
                  )}>
                    <StatusDot
                      status={channelData?.status === 'published' ? 'online' : 'pending'}
                      size="sm"
                    />
                    {channelData?.status === 'published' ? 'Published' : 'Draft'}
                  </div>
                  <span className="text-text-secondary text-sm">
                    {zones.length} {zones.length === 1 ? 'zone' : 'zones'}
                  </span>
                  <span className="text-text-secondary text-sm">
                    {channelData?.layout_type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={previewMode ? "default" : "outline"}
                onClick={() => setPreviewMode(!previewMode)}
                className="gap-2"
              >
                {previewMode ? <Grid className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={updateChannelMutation.isPending || !channelName}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {updateChannelMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishChannelMutation.isPending || !channelData}
                className="bg-primary hover:bg-primary-hover text-white gap-2"
              >
                <Upload className="h-4 w-4" />
                {publishChannelMutation.isPending ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Apps Library */}
        <div className="w-80 border-r border-border bg-surface flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
              Content Library
            </h3>
            <div className="text-xs text-text-muted">
              Drag apps to zones or click to assign
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {appsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-surface-alt rounded-lg animate-pulse" />
                ))}
              </div>
            ) : availableApps.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-text-primary mb-2">No apps yet</p>
                <p className="text-xs text-text-muted mb-4">Create apps to add them to zones</p>
                <Button
                  size="sm"
                  onClick={() => router.push('/apps/create')}
                  className="gap-2"
                >
                  <Plus className="h-3 w-3" />
                  Create App
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {availableApps.map((app: any) => {
                  const iconMap: Record<string, any> = {
                    image: Image, video: Video, web: Globe, html: Code, clock: Clock, weather: Cloud,
                  }
                  const Icon = iconMap[app.template_type] || LayoutGrid

                  return (
                    <div
                      key={app.app_id}
                      className="group p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                      onClick={() => selectedZone && addAppToZone(selectedZone, app)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary text-sm group-hover:text-primary transition-colors truncate">
                            {app.name}
                          </p>
                          <p className="text-xs text-text-muted capitalize">
                            {app.template_type}
                          </p>
                        </div>
                        <div className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Add to {selectedZoneData?.name || 'zone'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 bg-surface-alt overflow-hidden relative">
            <AnimatePresence mode="wait">
              {previewMode ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-center p-8"
                >
                  {/* Web Player Preview */}
                  <div className="relative">
                    <div className="w-[900px] h-[506px] bg-black rounded-lg shadow-2xl border-4 border-gray-800 overflow-hidden">
                      <div className="relative w-full h-full">
                        {zones.map((zone: any, index: number) => (
                          <div
                            key={zone.zone_id}
                            className="absolute border border-white/20 bg-gray-900/50 flex items-center justify-center"
                            style={{
                              left: `${zone.x_percent}%`,
                              top: `${zone.y_percent}%`,
                              width: `${zone.width_percent}%`,
                              height: `${zone.height_percent}%`,
                            }}
                          >
                            {zone.apps && zone.apps.length > 0 ? (
                              <div className="text-center text-white/80">
                                <p className="text-sm font-medium">{zone.apps[0].app?.name}</p>
                                <p className="text-xs opacity-70">{zone.apps[0].app?.template_type}</p>
                              </div>
                            ) : (
                              <div className="text-center text-white/60">
                                <p className="text-xs">{zone.name}</p>
                                <p className="text-xs opacity-70">Empty</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-text-muted">
                      <Monitor className="h-4 w-4" />
                      1920 × 1080 • Landscape Display
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-center p-8"
                >
                  {/* Design Canvas */}
                  <div className="w-full max-w-6xl">
                    <div className="relative w-full aspect-video bg-white rounded-lg border border-border shadow-lg">
                      {zones.map((zone: any, index: number) => (
                        <button
                          key={zone.zone_id}
                          onClick={() => setSelectedZone(zone.zone_id)}
                          className={cn(
                            'absolute border-2 transition-all group hover:border-primary/70 flex flex-col items-center justify-center p-2',
                            selectedZone === zone.zone_id
                              ? 'border-primary bg-primary/10 shadow-lg'
                              : 'border-border/50 bg-surface/80 hover:bg-surface',
                          )}
                          style={{
                            left: `${zone.x_percent}%`,
                            top: `${zone.y_percent}%`,
                            width: `${zone.width_percent}%`,
                            height: `${zone.height_percent}%`,
                          }}
                        >
                          <div className="text-center">
                            <p className="font-semibold text-xs text-text-primary mb-1 group-hover:text-primary transition-colors">
                              {zone.name}
                            </p>
                            {zone.apps && zone.apps.length > 0 ? (
                              <div className="space-y-1">
                                {zone.apps.slice(0, 2).map((zoneApp: any, appIndex: number) => (
                                  <div
                                    key={appIndex}
                                    className="text-xs bg-primary/10 text-primary rounded px-2 py-0.5 border border-primary/20"
                                  >
                                    {zoneApp.app?.name || 'Unknown'}
                                  </div>
                                ))}
                                {zone.apps.length > 2 && (
                                  <div className="text-xs text-text-muted">
                                    +{zone.apps.length - 2} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-text-muted opacity-70">
                                Empty zone
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-text-muted">
                      <Monitor className="h-4 w-4" />
                      1920 × 1080 • Design Canvas
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar - Zone Properties */}
        <div className="w-80 border-l border-border bg-surface flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
              Zone Properties
            </h3>
            {selectedZoneData ? (
              <div className="text-xs text-text-muted">
                Editing: {selectedZoneData.name}
              </div>
            ) : (
              <div className="text-xs text-text-muted">
                Select a zone to edit properties
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedZoneData ? (
              <div className="p-4 space-y-6">
                {/* Zone Info */}
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3">Zone Info</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Position:</span>
                      <span className="text-text-primary">{selectedZoneData.x_percent}%, {selectedZoneData.y_percent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Size:</span>
                      <span className="text-text-primary">{selectedZoneData.width_percent}% × {selectedZoneData.height_percent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Z-Index:</span>
                      <span className="text-text-primary">{selectedZoneData.z_index}</span>
                    </div>
                  </div>
                </div>

                {/* Zone Content */}
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-3">Content Playlist</h4>
                  {selectedZoneData.apps && selectedZoneData.apps.length > 0 ? (
                    <div className="space-y-2">
                      {selectedZoneData.apps.map((zoneApp: any, index: number) => {
                        const app = zoneApp.app || {}
                        const iconMap: Record<string, any> = {
                          image: Image, video: Video, web: Globe, html: Code, clock: Clock, weather: Cloud,
                        }
                        const Icon = iconMap[app.template_type] || LayoutGrid

                        return (
                          <div
                            key={zoneApp.zone_app_id || index}
                            className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg group"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text-primary text-sm truncate">
                                {app.name || 'Unknown App'}
                              </p>
                              <p className="text-xs text-text-muted">
                                {zoneApp.duration_seconds || 30}s duration
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-text-muted hover:text-error"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-border rounded-lg bg-surface-alt/50">
                      <Plus className="h-6 w-6 text-text-muted mx-auto mb-2" />
                      <p className="text-xs text-text-muted mb-2">No content</p>
                      <p className="text-xs text-text-muted">
                        Click apps from the library
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center py-12">
                <Settings className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
                <p className="text-sm text-text-muted">Select a zone to view properties</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}