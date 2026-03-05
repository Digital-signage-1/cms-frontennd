'use client'

import { useState, useEffect, useRef, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { StatusDot } from '@/components/ui/status-dot'
import {
  ArrowLeft, Save, Upload, Play, Pause, Settings, Monitor,
  Image, Video, Clock, Cloud, Globe, Code, LayoutGrid, FileText,
  Plus, Layers, ChevronLeft, ChevronRight, X, Trash2
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import {
  useChannel, useChannelManifest, useUpdateChannel, usePublishChannel,
  useAddZoneApp, useCreateZone, useChannelZones, useCreateSlide, useUpdateSlide, useDeleteSlide
} from '@/hooks/queries/useChannels'
import { useApps } from '@/hooks/queries'
import { useContentItem } from '@/hooks/queries/useContent'
import { ChannelRenderer } from '@signage/renderer'
import { ZoneBuilder, ZoneToolbar } from '@/components/channels/ZoneBuilder'
import { ZonePropertiesEditor } from '@/components/channels/ZonePropertiesEditor'
import { getAllLayoutTemplates, type LayoutTemplate } from '@/lib/layout-templates'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const layoutTemplates = getAllLayoutTemplates()

function ContentLibraryCard({
  app,
  workspaceId,
  selectedZone,
  zoneName,
  onAddToZone,
  isAdding,
}: {
  app: any
  workspaceId: number | string
  selectedZone: string | null
  zoneName?: string
  onAddToZone: () => void
  isAdding: boolean
}) {
  const iconMap: Record<string, any> = {
    image: Image, video: Video, web: Globe, html: Code, clock: Clock, weather: Cloud, youtube: Play, pdf: FileText,
  }
  const Icon = iconMap[app.template_type] || LayoutGrid
  const { data: contentItem } = useContentItem(String(workspaceId), app.content_id || '', { enabled: !!app.content_id })
  const previewUrl = app.thumbnail_url || app.preview_url || contentItem?.url

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: app.id,
      app_id: app.app_id,
      name: app.name,
      preview_url: previewUrl || app.preview_url,
    }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="w-full group border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all cursor-grab active:cursor-grabbing"
    >
      <button
        type="button"
        className="w-full text-left disabled:opacity-50"
        onClick={onAddToZone}
        disabled={!selectedZone || isAdding}
      >
        <div className="flex items-center gap-3 p-3">
          <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-surface border border-border">
            {previewUrl ? (
              <img src={previewUrl} alt={app.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary text-sm truncate">{app.name}</p>
            <p className="text-xs text-text-muted capitalize">{app.template_type}</p>
            {selectedZone && zoneName && (
              <p className="text-xs text-primary mt-0.5">Click to add to {zoneName}</p>
            )}
          </div>
        </div>
      </button>
    </div>
  )
}

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
  const workspaceId = Number(workspace?.id ?? 0)

  // State management
  const [channelName, setChannelName] = useState('')
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [sidebarMode, setSidebarMode] = useState<'apps' | 'properties'>('apps')
  const [showAddSlideModal, setShowAddSlideModal] = useState(false)
  const [previewStreamToken, setPreviewStreamToken] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [autoPlayElapsed, setAutoPlayElapsed] = useState(0)
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoPlayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [editingDuration, setEditingDuration] = useState<string>('')
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null)
  const [newSlideDuration, setNewSlideDuration] = useState(10)

  const channelIdNum = parseInt(resolvedParams.id, 10)
  const { data: channelData, isLoading: channelLoading } = useChannel(workspaceId, channelIdNum)
  const channelId = (channelData?.id ?? channelIdNum) as number
  const { data: manifestData } = useChannelManifest(workspaceId, channelIdNum)
  const { data: appsData, isLoading: appsLoading } = useApps(workspaceId)
  const updateChannelMutation = useUpdateChannel()
  const publishChannelMutation = usePublishChannel()
  const addZoneAppMutation = useAddZoneApp()
  const createZoneMutation = useCreateZone()
  const createSlideMutation = useCreateSlide()
  const updateSlideMutation = useUpdateSlide()
  const deleteSlideMutation = useDeleteSlide()

  const availableApps = Array.isArray(appsData) ? appsData : []
  const slides = manifestData?.slides || []
  const zones: Zone[] = slides.length > 0
    ? (slides[selectedSlideIndex]?.zones ?? [])
    : (manifestData?.zones || [])
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

  useEffect(() => {
    if (slides.length > 0 && selectedSlideIndex >= slides.length) {
      setSelectedSlideIndex(0)
    }
  }, [slides, selectedSlideIndex])

  // Auto-play timer for preview
  useEffect(() => {
    if (!isAutoPlaying || !showPreviewModal || !manifestData?.slides?.length) {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current)
      return
    }
    const currentSlide = manifestData.slides[previewSlideIndex]
    const durationMs = (currentSlide?.duration_seconds ?? 10) * 1000

    setAutoPlayElapsed(0)
    autoPlayIntervalRef.current = setInterval(() => {
      setAutoPlayElapsed(prev => Math.min(prev + 100, durationMs))
    }, 100)

    autoPlayTimerRef.current = setTimeout(() => {
      setPreviewSlideIndex(i => {
        const total = manifestData?.slides?.length ?? 1
        return i >= total - 1 ? 0 : i + 1
      })
    }, durationMs)

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current)
    }
  }, [isAutoPlaying, showPreviewModal, previewSlideIndex, manifestData?.slides])

  // Reset auto-play when modal closes
  useEffect(() => {
    if (!showPreviewModal) {
      setIsAutoPlaying(false)
      setAutoPlayElapsed(0)
    }
  }, [showPreviewModal])

  useEffect(() => {
    if (showPreviewModal && typeof window !== 'undefined')
      setPreviewStreamToken(localStorage.getItem('signage_access_token'))
  }, [showPreviewModal])

  const handleSlideDurationSave = useCallback((slideId: number, value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 1 && num <= 300) {
      updateSlideMutation.mutate({ workspaceId, channelId, slideId, data: { duration_seconds: num } })
    }
    setEditingSlideIndex(null)
  }, [workspaceId, channelId, updateSlideMutation])

  // Action handlers
  const handleSave = async () => {
    if (!workspaceId || !channelData) return
    try {
      await updateChannelMutation.mutateAsync({
        workspaceId,
        channelId: channelData.id!,
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
        channelId: channelData.id!,
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
        channelId: channelData.id!,
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
    const appId = app.id ?? app.app_id
    if (appId == null || appId === '') return
    const zone = zones.find((z: any) => z.zone_id === zoneId || (z as any).id === parseInt(zoneId, 10))
    const zoneIdForApi = zone ? (zone as any).zone_id ?? (zone as any).id : zoneId
    if (zoneIdForApi == null || zoneIdForApi === '') return
    try {
      await addZoneAppMutation.mutateAsync({
        workspaceId,
        channelId: channelData.id!,
        zoneId: zoneIdForApi,
        data: {
          app_id: appId,
          duration_seconds: 30,
          order: 0,
        }
      })
    } catch (error) {
      console.error('Failed to add app to zone:', error)
    }
  }

  const handleZoneDrop = (zoneId: string, app: { id?: number; app_id?: string; name?: string; preview_url?: string }) => {
    addAppToZone(zoneId, app)
  }

  const openAddSlideModal = () => setShowAddSlideModal(true)

  const handleCreateSlideWithLayout = async (template: LayoutTemplate) => {
    if (!workspaceId || !channelData) return
    try {
      await createSlideMutation.mutateAsync({
        workspaceId,
        channelId: channelData.id!,
        data: {
          layout_type: template.id,
          duration_seconds: newSlideDuration,
          zones: template.zones.map(z => ({
            name: z.name,
            x: z.x,
            y: z.y,
            width: z.width,
            height: z.height,
            z_index: z.z_index ?? 1,
            background: z.background ?? { type: 'transparent' as const },
          })),
        },
      })
      setShowAddSlideModal(false)
      setNewSlideDuration(10)
    } catch (error) {
      console.error('Failed to add slide:', error)
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
                    {slides.length} slide(s) • {zones.length} zone(s) • {channelData?.layout_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => { setPreviewSlideIndex(0); setIsAutoPlaying(true); setShowPreviewModal(true); }}
                className="gap-2"
                disabled={!manifestData?.slides?.length}
              >
                <Play className="h-4 w-4" />
                Preview
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
                      Drag content onto zones or click to add to selected zone
                    </p>
                  </div>

                  {appsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-surface-alt rounded-lg animate-pulse" />
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
                      {availableApps.map((app: any) => (
                        <ContentLibraryCard
                          key={app.app_id}
                          app={app}
                          workspaceId={workspaceId}
                          selectedZone={selectedZone}
                          zoneName={zones.find(z => z.zone_id === selectedZone)?.name}
                          onAddToZone={() => selectedZone && addAppToZone(selectedZone, app)}
                          isAdding={addZoneAppMutation.isPending}
                        />
                      ))}
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
          <ZoneToolbar
            onAddZone={() => {}}
            onToggleGrid={() => setShowGrid(!showGrid)}
            showGrid={showGrid}
          />

          <div className="px-4 py-2 border-b border-border bg-surface flex items-center gap-2">
            <span className="text-xs font-medium text-text-muted">Slides</span>
            <div className="flex gap-2 flex-wrap items-center">
              {slides.map((slide: any, idx: number) => (
                <div key={slide.slide_id || idx} className="flex items-center gap-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100 disabled:opacity-30"
                    onClick={() => {
                      if (idx <= 0) return
                      const prev = slides[idx - 1]
                      updateSlideMutation.mutate(
                        { workspaceId, channelId, slideId: slide.id, data: { position: idx - 1 } },
                        { onSuccess: () => updateSlideMutation.mutate({ workspaceId, channelId, slideId: prev.id, data: { position: idx } }) }
                      )
                    }}
                    disabled={idx === 0 || updateSlideMutation.isPending}
                    title="Move slide left"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="relative">
                      <button
                        onClick={() => { setSelectedSlideIndex(idx); setSelectedZone(null); }}
                        className={cn(
                          'w-10 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all',
                          selectedSlideIndex === idx
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 text-text-muted'
                        )}
                      >
                        {idx + 1}
                      </button>
                      {selectedSlideIndex === idx && slides.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!confirm(`Delete slide ${idx + 1}?`)) return
                            deleteSlideMutation.mutate(
                              { workspaceId, channelId, slideId: slide.id },
                              { onSuccess: () => setSelectedSlideIndex(Math.max(0, idx - 1)) }
                            )
                          }}
                          disabled={deleteSlideMutation.isPending}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-error text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          title="Delete slide"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {slide.duration_seconds ?? 10}s
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100 disabled:opacity-30"
                    onClick={() => {
                      if (idx >= slides.length - 1) return
                      const next = slides[idx + 1]
                      updateSlideMutation.mutate(
                        { workspaceId, channelId, slideId: slide.id, data: { position: idx + 1 } },
                        { onSuccess: () => updateSlideMutation.mutate({ workspaceId, channelId, slideId: next.id, data: { position: idx } }) }
                      )
                    }}
                    disabled={idx === slides.length - 1 || updateSlideMutation.isPending}
                    title="Move slide right"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={openAddSlideModal}
                disabled={createSlideMutation.isPending}
                title="Add slide"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Slide Duration Editor */}
            {slides.length > 0 && slides[selectedSlideIndex] && (
              <div className="flex items-center gap-3 ml-auto">
                <Clock className="h-3.5 w-3.5 text-text-muted" />
                <span className="text-xs text-text-muted">Duration:</span>
                <div className="flex items-center gap-1">
                  {[5, 10, 15, 30, 60].map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        const slide = slides[selectedSlideIndex]
                        if (slide) {
                          updateSlideMutation.mutate({
                            workspaceId,
                            channelId,
                            slideId: slide.id,
                            data: { duration_seconds: preset },
                          })
                        }
                      }}
                      className={cn(
                        'px-1.5 py-0.5 text-[10px] rounded transition-colors',
                        (slides[selectedSlideIndex]?.duration_seconds ?? 10) === preset
                          ? 'bg-primary text-white'
                          : 'bg-surface-alt text-text-muted hover:text-text-primary hover:bg-border'
                      )}
                    >
                      {preset}s
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={editingSlideIndex === selectedSlideIndex ? editingDuration : (slides[selectedSlideIndex]?.duration_seconds ?? 10)}
                  onFocus={() => {
                    setEditingSlideIndex(selectedSlideIndex)
                    setEditingDuration(String(slides[selectedSlideIndex]?.duration_seconds ?? 10))
                  }}
                  onChange={e => setEditingDuration(e.target.value)}
                  onBlur={() => {
                    handleSlideDurationSave(slides[selectedSlideIndex].id, editingDuration)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleSlideDurationSave(slides[selectedSlideIndex].id, editingDuration)
                      ;(e.target as HTMLInputElement).blur()
                    }
                  }}
                  className="w-14 h-6 text-xs text-center border border-border rounded bg-surface px-1 focus:outline-none focus:border-primary"
                />
                <span className="text-xs text-text-muted">sec</span>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-surface-alt overflow-hidden relative">
            {slides.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                    <Layers className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Add your first slide</h3>
                  <p className="text-sm text-text-muted mb-6">
                    Choose a zone layout for this slide. You can add more slides later and drag content into each zone.
                  </p>
                  <Button onClick={openAddSlideModal} className="gap-2" size="lg" disabled={createSlideMutation.isPending}>
                    <Plus className="h-5 w-5" />
                    Add slide
                  </Button>
                </div>
              </div>
            ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full flex items-center justify-center p-8"
            >
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
                  onZoneDuplicate={(zoneId) => {}}
                  onZoneDrop={handleZoneDrop}
                  showGrid={showGrid}
                />
              </div>
            </motion.div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showAddSlideModal} onOpenChange={setShowAddSlideModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose zone layout</DialogTitle>
            <p className="text-text-secondary text-sm">
              Select how to divide this slide into content zones. You can drag content into each zone after.
            </p>
          </DialogHeader>
          <div className="flex items-center gap-3 py-2 px-1">
            <label className="text-sm font-medium text-text-primary whitespace-nowrap">Slide duration:</label>
            <Input
              type="number"
              min={1}
              max={300}
              value={newSlideDuration}
              onChange={e => setNewSlideDuration(Math.max(1, Math.min(300, parseInt(e.target.value) || 1)))}
              className="w-24 h-8 text-sm"
            />
            <span className="text-xs text-text-muted">seconds (1–300)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {layoutTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleCreateSlideWithLayout(template)}
                disabled={createSlideMutation.isPending}
                className="group p-5 bg-surface border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all text-left disabled:opacity-50"
              >
                <div className="aspect-video mb-3 rounded-lg overflow-hidden border border-border group-hover:border-primary/30 transition-colors">
                  {template.preview}
                </div>
                <h3 className="font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-text-muted mb-2">{template.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{template.zones.length} zones</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg font-semibold">Preview</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowPreviewModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {manifestData?.slides?.length ? (
            <>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-center gap-4 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setPreviewSlideIndex((i) => Math.max(0, i - 1)); setAutoPlayElapsed(0); }}
                    disabled={previewSlideIndex === 0 && !isAutoPlaying}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant={isAutoPlaying ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsAutoPlaying(prev => !prev)}
                    className="gap-1"
                  >
                    {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isAutoPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <span className="text-sm font-medium text-text-muted">
                    Slide {previewSlideIndex + 1} of {manifestData.slides.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setPreviewSlideIndex((i) => Math.min((manifestData?.slides?.length ?? 1) - 1, i + 1)); setAutoPlayElapsed(0); }}
                    disabled={previewSlideIndex >= (manifestData?.slides?.length ?? 1) - 1 && !isAutoPlaying}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {/* Progress bar */}
                {(() => {
                  const currentSlide = manifestData.slides[previewSlideIndex]
                  const durationMs = (currentSlide?.duration_seconds ?? 10) * 1000
                  const progress = isAutoPlaying ? Math.min((autoPlayElapsed / durationMs) * 100, 100) : 0
                  return (
                    <div className="flex items-center gap-2 px-4">
                      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted whitespace-nowrap">
                        {currentSlide?.duration_seconds ?? 10}s
                      </span>
                    </div>
                  )
                })()}
              </div>
              <div className="flex-1 min-h-0 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
                <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                  {(() => {
                    const ch = manifestData.channel
                    const channel = {
                      id: ch?.id ?? channelId,
                      channel_id: ch?.channel_id ?? String(channelId),
                      workspace_id: ch?.workspace_id ?? String(workspaceId),
                      name: ch?.name ?? manifestData.name ?? '',
                      layout_type: (ch?.layout_type ?? 'single') as 'single' | 'split_horizontal' | 'split_vertical' | 'grid' | 'l_shape' | 'custom',
                      layout: ch?.layout ?? { width: 1920, height: 1080, orientation: 'landscape' as const },
                      background: ch?.background ?? { type: 'color' as const, value: '#000000' },
                      transition_type: (ch?.transition_type ?? 'fade') as 'none' | 'fade' | 'slide' | 'zoom',
                      transition_duration: ch?.transition_duration ?? 500,
                      status: (ch?.status ?? 'draft') as 'draft' | 'published' | 'archived',
                      created_at: ch?.created_at ?? '',
                      updated_at: ch?.updated_at ?? '',
                    }
                    const slideZones = manifestData.slides?.[previewSlideIndex]?.zones ?? []
                    const zonesWithAuth = previewStreamToken
                      ? slideZones.map((zone: any) => ({
                          ...zone,
                          apps: zone.apps?.map((za: any) => {
                            const a = za?.app
                            if (a?.template_type === 'pdf' && a?.preview_url) {
                              return {
                                ...za,
                                app: {
                                  ...a,
                                  preview_url: a.preview_url + (a.preview_url.includes('?') ? '&' : '?') + 'access_token=' + encodeURIComponent(previewStreamToken),
                                },
                              }
                            }
                            return za
                          }) ?? zone.apps,
                        }))
                      : slideZones
                    return (
                      <ChannelRenderer
                        manifest={{ channel, zones: zonesWithAuth }}
                        isPreview
                        className="w-full h-full"
                      />
                    )
                  })()}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-text-muted py-8 text-center">No slides to preview.</p>
          )}
        </DialogContent>
      </Dialog>

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