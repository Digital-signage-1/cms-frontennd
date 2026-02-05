'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { StatusDot } from '@/components/ui/status-dot'
import {
  ArrowLeft, Save, Upload, Play, Grid, Settings, Monitor,
  Image, Video, Clock, Cloud, Globe, Code, LayoutGrid,
  Plus, Layers, Palette, Move
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import {
  useChannel, useChannelManifest, useUpdateChannel, usePublishChannel,
  useAddZoneApp, useCreateZone, useChannelZones
} from '@/hooks/queries/useChannels'
import { useApps } from '@/hooks/queries'
import { ZoneBuilder, ZoneToolbar } from '@/components/channels/ZoneBuilder'
import { ZonePropertiesEditor } from '@/components/channels/ZonePropertiesEditor'
import { LAYOUT_TEMPLATES, getAllLayoutTemplates } from '@/lib/layout-templates'
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

export default function ChannelStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  // State management
  const [channelName, setChannelName] = useState('')
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'design' | 'preview'>('design')
  const [showGrid, setShowGrid] = useState(true)
  const [sidebarMode, setSidebarMode] = useState<'apps' | 'properties'>('apps')

  // API hooks
  const { data: channelData, isLoading: channelLoading } = useChannel(workspaceId, resolvedParams.id)
  const { data: manifestData } = useChannelManifest(workspaceId, resolvedParams.id)
  const { data: appsData, isLoading: appsLoading } = useApps(workspaceId)
  const updateChannelMutation = useUpdateChannel()
  const publishChannelMutation = usePublishChannel()
  const addZoneAppMutation = useAddZoneApp()
  const createZoneMutation = useCreateZone()

  // Processed data
  const availableApps = Array.isArray(appsData) ? appsData : []
  const zones: Zone[] = manifestData?.zones || []
  const selectedZoneData = zones.find((z: any) => z.zone_id === selectedZone)

  // Initialize state
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

  // Action handlers
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

  const handleZoneCreate = async (zoneConfig: any) => {
    if (!workspaceId || !channelData) return

    try {
      await createZoneMutation.mutateAsync({
        workspaceId,
        channelId: channelData.channel_id,
        data: {
          name: zoneConfig.name,
          x_percent: zoneConfig.x,
          y_percent: zoneConfig.y,
          width_percent: zoneConfig.width,
          height_percent: zoneConfig.height,
          z_index: zoneConfig.z_index,
          background: zoneConfig.background
        }
      })
    } catch (error) {
      console.error('Failed to create zone:', error)
    }
  }

  const handleZoneUpdate = async (zoneId: string, updates: Partial<Zone>) => {
    if (!workspaceId || !channelData) return
    // TODO: Implement zone update API call
    console.log('Zone update:', zoneId, updates)
  }

  const handleZoneDelete = async (zoneId: string) => {
    if (!workspaceId || !channelData) return
    // TODO: Implement zone delete API call
    console.log('Zone delete:', zoneId)
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
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-surface/80 backdrop-blur-sm z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Navigation & Title */}
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
                    {zones.length} zones • {channelData?.layout_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'preview' ? "default" : "outline"}
                onClick={() => setViewMode(viewMode === 'preview' ? 'design' : 'preview')}
                className="gap-2"
              >
                {viewMode === 'preview' ? <Grid className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {viewMode === 'preview' ? 'Design' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={updateChannelMutation.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {updateChannelMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishChannelMutation.isPending}
                className="bg-primary hover:bg-primary-hover text-white gap-2"
              >
                <Upload className="h-4 w-4" />
                {publishChannelMutation.isPending ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Apps Library */}
        <div className="w-80 border-r border-border bg-surface flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setSidebarMode('apps')}
                className={cn(
                  "flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all",
                  sidebarMode === 'apps'
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                )}
              >
                <LayoutGrid className="h-3 w-3 mr-1.5 inline" />
                Apps
              </button>
              <button
                onClick={() => setSidebarMode('properties')}
                className={cn(
                  "flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all",
                  sidebarMode === 'properties'
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                )}
              >
                <Settings className="h-3 w-3 mr-1.5 inline" />
                Properties
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {sidebarMode === 'apps' ? (
                <motion.div
                  key="apps"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full overflow-y-auto p-4"
                >
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-2">Content Library</h3>
                    <p className="text-xs text-text-muted">
                      Click apps to add to selected zone
                    </p>
                  </div>

                  {appsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-surface-alt rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : availableApps.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-text-primary mb-2">No apps yet</p>
                      <p className="text-xs text-text-muted mb-4">Create apps to add content to zones</p>
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
                          <button
                            key={app.app_id}
                            className="w-full group p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left disabled:opacity-50"
                            onClick={() => selectedZone && addAppToZone(selectedZone, app)}
                            disabled={!selectedZone || addZoneAppMutation.isPending}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-text-primary text-sm truncate">
                                  {app.name}
                                </p>
                                <p className="text-xs text-text-muted capitalize">
                                  {app.template_type}
                                </p>
                              </div>
                            </div>
                            {selectedZone && (
                              <div className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Add to {zones.find(z => z.zone_id === selectedZone)?.name}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="properties"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full overflow-y-auto p-4"
                >
                  <ZonePropertiesEditor
                    zone={selectedZoneData ? {
                      zone_id: selectedZoneData.zone_id,
                      name: selectedZoneData.name,
                      x: selectedZoneData.x_percent,
                      y: selectedZoneData.y_percent,
                      width: selectedZoneData.width_percent,
                      height: selectedZoneData.height_percent,
                      z_index: selectedZoneData.z_index,
                      background: selectedZoneData.background,
                      apps: selectedZoneData.apps
                    } : null}
                    onZoneUpdate={handleZoneUpdate}
                    onZoneDelete={handleZoneDelete}
                    onZoneDuplicate={(zoneId) => {
                      // TODO: Implement zone duplication
                      console.log('Duplicate zone:', zoneId)
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <ZoneToolbar
            onAddZone={() => {
              // Start zone creation mode
              console.log('Add zone clicked')
            }}
            onToggleGrid={() => setShowGrid(!showGrid)}
            showGrid={showGrid}
          />

          {/* Canvas Area */}
          <div className="flex-1 bg-surface-alt overflow-hidden relative">
            <AnimatePresence mode="wait">
              {viewMode === 'preview' ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full h-full flex items-center justify-center p-8"
                >
                  {/* Professional Web Player Preview */}
                  <div className="relative">
                    <div className="w-[900px] h-[506px] bg-black rounded-lg shadow-2xl border-4 border-gray-800 overflow-hidden relative">
                      {/* Player Status Bar */}
                      <div className="absolute top-0 left-0 right-0 h-6 bg-gray-900 flex items-center justify-between px-3 text-xs text-green-400 border-b border-gray-700">
                        <span>● LIVE</span>
                        <span>{channelName}</span>
                        <span>1920×1080</span>
                      </div>

                      {/* Zone Rendering */}
                      <div className="relative w-full h-[calc(100%-24px)] mt-6">
                        {zones.map((zone: any) => (
                          <div
                            key={zone.zone_id}
                            className="absolute flex items-center justify-center"
                            style={{
                              left: `${zone.x_percent}%`,
                              top: `${zone.y_percent}%`,
                              width: `${zone.width_percent}%`,
                              height: `${zone.height_percent}%`,
                              background: zone.background?.type === 'color' ? zone.background.value :
                                zone.background?.type === 'gradient' ? zone.background.value :
                                  'rgba(255, 255, 255, 0.05)',
                              zIndex: zone.z_index
                            }}
                          >
                            {zone.apps && zone.apps.length > 0 ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center text-white/90">
                                  <p className="text-lg font-medium">{zone.apps[0].app?.name}</p>
                                  <p className="text-sm opacity-70 capitalize">{zone.apps[0].app?.template_type}</p>
                                  {zone.apps.length > 1 && (
                                    <p className="text-xs opacity-60 mt-1">+{zone.apps.length - 1} more</p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-white/50">
                                <div className="w-8 h-8 border border-dashed border-white/30 rounded mx-auto mb-2" />
                                <p className="text-sm">{zone.name}</p>
                                <p className="text-xs opacity-70">No content</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 mt-6 text-sm text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="h-4 w-4" />
                        Web Player Preview
                      </div>
                      <span>•</span>
                      <span>Live Rendering</span>
                      <span>•</span>
                      <span className="text-success">Connected</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="design"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full h-full flex items-center justify-center p-8"
                >
                  {/* Design Canvas */}
                  <div className="w-full max-w-6xl h-full max-h-[600px]">
                    <ZoneBuilder
                      zones={zones.map(z => ({
                        zone_id: z.zone_id,
                        name: z.name,
                        x: z.x_percent,
                        y: z.y_percent,
                        width: z.width_percent,
                        height: z.height_percent,
                        z_index: z.z_index,
                        background: z.background,
                        apps: z.apps
                      }))}
                      selectedZone={selectedZone}
                      onZoneSelect={setSelectedZone}
                      onZoneCreate={handleZoneCreate}
                      onZoneUpdate={handleZoneUpdate}
                      onZoneDelete={handleZoneDelete}
                      onZoneDuplicate={(zoneId) => {
                        // TODO: Implement duplication
                        console.log('Duplicate zone:', zoneId)
                      }}
                      showGrid={showGrid}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Zone Info Bar */}
      {selectedZoneData && (
        <div className="border-t border-border bg-surface p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-medium text-text-primary">{selectedZoneData.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>{selectedZoneData.x_percent}%, {selectedZoneData.y_percent}%</span>
                  <span>{selectedZoneData.width_percent}% × {selectedZoneData.height_percent}%</span>
                  <span>Z-Index: {selectedZoneData.z_index}</span>
                  <span>{selectedZoneData.apps?.length || 0} apps</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSidebarMode('properties')}
                  className="gap-2 text-xs"
                >
                  <Settings className="h-3 w-3" />
                  Properties
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}