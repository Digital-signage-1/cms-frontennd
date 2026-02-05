'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusDot } from '@/components/ui/status-dot'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  ArrowLeft, Play, Save, Upload, Plus, Trash2, Settings,
  Image, Video, Clock, Cloud, Globe, Code, LayoutGrid, GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useChannel, useChannelManifest, useUpdateChannel, usePublishChannel, useAddZoneApp } from '@/hooks/queries/useChannels'
import { useApps } from '@/hooks/queries'
import { api } from '@/services/api'
import { ChannelPreviewButton } from '@/components/channels/ChannelPreview'

const layoutTemplates = [
  { id: 'SINGLE', name: 'Single Zone', zones: [{ name: 'Main', x: 0, y: 0, width: 100, height: 100 }] },
  { id: 'SPLIT_HORIZONTAL', name: '2-Zone Horizontal', zones: [{ name: 'Top', x: 0, y: 0, width: 100, height: 50 }, { name: 'Bottom', x: 0, y: 50, width: 100, height: 50 }] },
  { id: 'SPLIT_VERTICAL', name: '2-Zone Vertical', zones: [{ name: 'Left', x: 0, y: 0, width: 50, height: 100 }, { name: 'Right', x: 50, y: 0, width: 50, height: 100 }] },
  { id: 'CUSTOM', name: 'L-Shape (3 zones)', zones: [{ name: 'Main', x: 0, y: 0, width: 70, height: 100 }, { name: 'Top Right', x: 70, y: 0, width: 30, height: 50 }, { name: 'Bottom Right', x: 70, y: 50, width: 30, height: 50 }] },
]

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

  const isNew = resolvedParams.id === 'new'
  const [channelName, setChannelName] = useState('')
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [showAppPicker, setShowAppPicker] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const { data: channelData, isLoading: channelLoading } = useChannel(workspaceId, resolvedParams.id)
  const { data: manifestData } = useChannelManifest(workspaceId, resolvedParams.id)
  const { data: appsData, isLoading: appsLoading, error: appsError } = useApps(workspaceId)
  const updateChannelMutation = useUpdateChannel()
  const publishChannelMutation = usePublishChannel()
  const addZoneAppMutation = useAddZoneApp()

  const availableApps = Array.isArray(appsData) ? appsData : []
  const zones: Zone[] = manifestData?.zones || []
  const selectedZoneData = zones.find((z: any) => z.zone_id === selectedZone)

  // Debug logging
  console.log('Apps data:', { appsData, availableApps: availableApps.length, appsLoading, appsError })
  console.log('Manifest data:', { manifestData, zones: zones.length })

  useEffect(() => {
    if (channelData && !isNew) {
      setChannelName(channelData.name)
    }
  }, [channelData, isNew])

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
    if (!workspaceId || !channelData) {
      console.error('Missing workspace ID or channel data')
      return
    }

    console.log('Adding app to zone:', {
      workspaceId,
      channelId: channelData.channel_id,
      zoneId,
      app: app.app_id
    })

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

      console.log('Successfully added app to zone')
      setShowAppPicker(false)

      // Force refresh of manifest data to show new app
      window.location.reload()
    } catch (error) {
      console.error('Failed to add app to zone:', error)
      // Show user-friendly error message
      alert('Failed to add app to zone. Please try again.')
    }
  }

  if (channelLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="w-24 h-24 rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-surface sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Link href="/channels">
                <Button variant="ghost" size="icon">
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
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${channelData?.status === 'published'
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-warning/10 text-warning border border-warning/20'
                    }`}>
                    <StatusDot
                      status={channelData?.status === 'published' ? 'online' : 'pending'}
                      size="sm"
                    />
                    {channelData?.status === 'published' ? 'Published' : 'Draft'}
                  </div>
                  <span className="text-text-secondary text-sm">
                    {zones.length} {zones.length === 1 ? 'zone' : 'zones'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setShowTemplates(true)}>
                <LayoutGrid className="h-4 w-4" />
                Change Layout
              </Button>
              <ChannelPreviewButton
                channelManifest={manifestData}
                disabled={!manifestData}
              />
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

      <div className="flex flex-1 overflow-hidden">
        <div className="w-60 border-r border-border bg-surface overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Zones</h3>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setShowTemplates(true)}
                title="Add Zone"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {zones.map((zone: any, i: number) => (
                <button
                  key={zone.zone_id}
                  onClick={() => setSelectedZone(zone.zone_id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all',
                    selectedZone === zone.zone_id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-surface-alt'
                  )}
                >
                  <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-success' : 'bg-warning'
                    }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary text-sm truncate">{zone.name}</p>
                    <p className="text-xs text-text-muted">
                      {zone.apps?.length || 0} {zone.apps?.length === 1 ? 'app' : 'apps'}
                    </p>
                  </div>
                </button>
              ))}

              {zones.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                  <LayoutGrid className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No zones</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTemplates(true)}
                    className="mt-3 text-xs"
                  >
                    Choose Layout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-auto">
          <div className="flex-1 flex items-center justify-center p-8 bg-surface-alt">
            {zones.length === 0 ? (
              <EmptyState
                title="Choose a Layout Template"
                description="Select a layout to start building your channel"
                action={{
                  label: "View Templates",
                  onClick: () => setShowTemplates(true),
                  icon: <LayoutGrid className="h-4 w-4" />
                }}
              />
            ) : (
              <div className="w-full max-w-5xl">
                <div className="relative w-full aspect-video bg-surface rounded-lg border border-border shadow-lg">
                  {zones.map((zone: any, i: number) => (
                    <button
                      key={zone.zone_id}
                      onClick={() => setSelectedZone(zone.zone_id)}
                      className={cn(
                        'absolute border-2 transition-all flex items-center justify-center',
                        'hover:border-primary/70',
                        selectedZone === zone.zone_id
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-surface-alt/50',
                      )}
                      style={{
                        left: `${zone.x_percent}%`,
                        top: `${zone.y_percent}%`,
                        width: `${zone.width_percent}%`,
                        height: `${zone.height_percent}%`,
                      }}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-sm text-text-primary">{zone.name}</p>
                        {zone.apps && zone.apps.length > 0 ? (
                          <p className="text-xs text-text-secondary mt-1">
                            {zone.apps.length} {zone.apps.length === 1 ? 'app' : 'apps'}
                          </p>
                        ) : (
                          <p className="text-xs text-text-muted mt-1">Empty zone</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-text-muted mt-4">1920 × 1080 • Landscape Display</p>
              </div>
            )}
          </div>

          {selectedZoneData && (
            <div className="border-t border-border bg-surface p-6">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {selectedZoneData.name} Content
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setShowAppPicker(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Content
                  </Button>
                </div>

                <div className="space-y-2">
                  {selectedZoneData.apps?.map((zoneApp: any, i: number) => {
                    const app = zoneApp.app || {}
                    const iconMap: Record<string, any> = {
                      image: Image, video: Video, web: Globe, html: Code, clock: Clock, weather: Cloud,
                    }
                    const Icon = iconMap[app.template_type] || LayoutGrid
                    return (
                      <div
                        key={zoneApp.zone_app_id || i}
                        className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors group"
                      >
                        <GripVertical className="h-4 w-4 text-text-muted cursor-grab" />
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary">{app.name || 'Unknown App'}</p>
                          <p className="text-xs text-text-muted capitalize">{app.template_type || 'unknown'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={zoneApp.duration_seconds || 30}
                            onChange={(e) => {
                              // TODO: Implement duration update
                              console.log('Duration changed:', e.target.value)
                            }}
                            className="w-16 h-8 text-xs text-center"
                            min="1"
                          />
                          <span className="text-xs text-text-muted">sec</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 text-text-muted hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}

                  {(!selectedZoneData.apps || selectedZoneData.apps.length === 0) && (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-surface-alt/30">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Plus className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-text-primary mb-1">No content in this zone</p>
                      <p className="text-xs text-text-muted mb-6">
                        {availableApps.length > 0
                          ? "Click below to add apps from your library"
                          : "Create some apps first to add them here"
                        }
                      </p>
                      {availableApps.length > 0 ? (
                        <Button
                          size="sm"
                          onClick={() => setShowAppPicker(true)}
                          className="gap-2 bg-primary text-white hover:bg-primary-hover"
                        >
                          <Plus className="h-3 w-3" /> Add Content
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push('/apps/create')}
                          className="gap-2"
                        >
                          <Plus className="h-3 w-3" /> Create App
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose Layout Template</DialogTitle>
            <p className="text-text-secondary text-sm">Select a template to organize your screen zones</p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {layoutTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  console.log('Template selected:', template)
                  setShowTemplates(false)
                }}
                className="p-6 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="aspect-video bg-surface-alt rounded-lg mb-3 p-4">
                  <div className="w-full h-full flex gap-2">
                    {template.id === 'SINGLE' && <div className="flex-1 bg-primary/40 rounded" />}
                    {template.id === 'SPLIT_HORIZONTAL' && (
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex-1 bg-primary/40 rounded" />
                        <div className="flex-1 bg-success/40 rounded" />
                      </div>
                    )}
                    {template.id === 'SPLIT_VERTICAL' && (
                      <>
                        <div className="flex-1 bg-primary/40 rounded" />
                        <div className="flex-1 bg-success/40 rounded" />
                      </>
                    )}
                    {template.id === 'CUSTOM' && (
                      <>
                        <div className="flex-[2] bg-primary/40 rounded" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex-1 bg-success/40 rounded" />
                          <div className="flex-1 bg-warning/40 rounded" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <p className="font-semibold text-text-primary mb-1">{template.name}</p>
                <p className="text-xs text-text-muted">{template.zones.length} zones</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAppPicker} onOpenChange={setShowAppPicker}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Content to Zone</DialogTitle>
            <p className="text-text-secondary text-sm">
              {selectedZoneData && `Select content for "${selectedZoneData.name}"`}
            </p>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            {appsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-full h-16 bg-surface-alt rounded-lg animate-pulse" />
                ))}
              </div>
            ) : appsError ? (
              <div className="text-center py-8">
                <p className="text-error text-sm mb-2">Failed to load apps</p>
                <p className="text-text-muted text-xs">{appsError.message}</p>
              </div>
            ) : availableApps.length === 0 ? (
              <EmptyState
                title="No apps available"
                description="Create some apps first to add them to zones"
                action={{
                  label: "Create App",
                  onClick: () => window.location.href = '/apps'
                }}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-muted px-1 mb-3">
                  Found {availableApps.length} {availableApps.length === 1 ? 'app' : 'apps'} in your library:
                </p>
                {availableApps.map((app: any) => {
                  const iconMap: Record<string, any> = {
                    image: Image, video: Video, web: Globe, html: Code, clock: Clock, weather: Cloud,
                  }
                  const Icon = iconMap[app.template_type] || LayoutGrid
                  return (
                    <button
                      key={app.app_id}
                      onClick={() => selectedZone && addAppToZone(selectedZone, app)}
                      disabled={addZoneAppMutation.isPending}
                      className="w-full flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                          {app.name}
                        </p>
                        <p className="text-sm text-text-secondary capitalize">
                          {app.template_type} • {app.status || 'ready'}
                        </p>
                      </div>
                      <div className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to add
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
