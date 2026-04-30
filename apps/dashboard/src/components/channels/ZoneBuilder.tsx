'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui'
import { Plus, Grid, Move, RotateCcw, Trash2, Copy, Image, Video, Globe, Code, Clock, Cloud, Play, FileText, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Zone {
  zone_id: string
  name: string
  x: number      // 0-100 percentage
  y: number      // 0-100 percentage
  width: number  // 0-100 percentage
  height: number // 0-100 percentage
  z_index: number
  background: {
    type: 'transparent' | 'color' | 'gradient'
    value?: string
  }
  apps?: any[]
}

interface ZoneBuilderProps {
  zones: Zone[]
  selectedZone: string | null
  onZoneSelect: (zoneId: string) => void
  onZoneCreate: (zone: Omit<Zone, 'zone_id'>) => void
  onZoneUpdate: (zoneId: string, updates: Partial<Zone>) => void
  onZoneDelete: (zoneId: string) => void
  onZoneDuplicate?: (zoneId: string) => void
  onZoneDrop?: (zoneId: string, app: { id?: number; app_id?: string; name?: string; preview_url?: string }) => void
  showGrid?: boolean
  readonly?: boolean
  isDraggingContent?: boolean
  /** Externally controlled zone creation mode */
  isCreatingZone?: boolean
  onCreatingZoneChange?: (creating: boolean) => void
}

export function ZoneBuilder({
  zones,
  selectedZone,
  onZoneSelect,
  onZoneCreate,
  onZoneUpdate,
  onZoneDelete,
  onZoneDuplicate,
  onZoneDrop,
  showGrid = true,
  readonly = false,
  isDraggingContent = false,
  isCreatingZone: externalIsCreating,
  onCreatingZoneChange,
}: ZoneBuilderProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [internalIsCreating, setInternalIsCreating] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [newZone, setNewZone] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [dragOverZoneId, setDragOverZoneId] = useState<string | null>(null)
  const [recentDropZoneId, setRecentDropZoneId] = useState<string | null>(null)

  // Use external creation state if provided, otherwise internal
  const isCreating = externalIsCreating ?? internalIsCreating
  const setIsCreating = useCallback((value: boolean) => {
    if (onCreatingZoneChange) {
      onCreatingZoneChange(value)
    } else {
      setInternalIsCreating(value)
    }
  }, [onCreatingZoneChange])

  // Sync internal state when external prop changes
  useEffect(() => {
    if (externalIsCreating !== undefined) {
      setInternalIsCreating(externalIsCreating)
    }
  }, [externalIsCreating])

  const getZoneColor = (index: number, isSelected: boolean) => {
    const colors = [
      'border-primary bg-primary/10',
      'border-success bg-success/10',
      'border-warning bg-warning/10',
      'border-info bg-info/10',
      'border-purple-500 bg-purple-500/10',
      'border-pink-500 bg-pink-500/10'
    ]

    if (isSelected) {
      return 'border-primary bg-primary/20 shadow-lg ring-2 ring-primary/30'
    }

    return colors[index % colors.length] + ' hover:bg-opacity-20 hover:border-opacity-80'
  }

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (readonly || !isCreating) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    if (!dragStart) {
      setDragStart({ x, y })
    } else {
      const width = Math.abs(x - dragStart.x)
      const height = Math.abs(y - dragStart.y)
      const finalX = Math.min(x, dragStart.x)
      const finalY = Math.min(y, dragStart.y)

      if (width > 5 && height > 5) { // Minimum zone size
        onZoneCreate({
          name: `Zone ${zones.length + 1}`,
          x: Math.round(finalX),
          y: Math.round(finalY),
          width: Math.round(width),
          height: Math.round(height),
          z_index: zones.length + 1,
          background: { type: 'transparent' }
        })
      }

      setIsCreating(false)
      setDragStart(null)
      setNewZone(null)
    }
  }, [readonly, isCreating, dragStart, zones.length, onZoneCreate, setIsCreating])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isCreating || !dragStart || readonly) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setNewZone({
      x: Math.min(x, dragStart.x),
      y: Math.min(y, dragStart.y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y)
    })
  }, [isCreating, dragStart, readonly])

  const handleZoneDragOver = useCallback((e: React.DragEvent, zoneId: string) => {
    if (!onZoneDrop) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverZoneId(zoneId)
  }, [onZoneDrop])

  const handleZoneDragLeave = useCallback((e: React.DragEvent) => {
    if (!onZoneDrop) return
    const related = e.relatedTarget as HTMLElement | null
    if (related && e.currentTarget.contains(related)) return
    setDragOverZoneId(null)
  }, [onZoneDrop])

  const handleZoneDrop = useCallback((e: React.DragEvent, zoneId: string) => {
    if (!onZoneDrop) return
    e.preventDefault()
    e.stopPropagation()
    setDragOverZoneId(null)
    try {
      const data = e.dataTransfer.getData('application/json')
      if (data) {
        const app = JSON.parse(data) as { id?: number; app_id?: string; name?: string; preview_url?: string }
        onZoneDrop(zoneId, app)
        setRecentDropZoneId(zoneId)
        setTimeout(() => setRecentDropZoneId(null), 1200)
      }
    } catch (_) {}
  }, [onZoneDrop])

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    if (!onZoneDrop) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [onZoneDrop])

  const handleCanvasDragLeave = useCallback(() => {
    setDragOverZoneId(null)
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Grid Overlay */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={cn(
          "relative w-full h-full bg-white rounded-lg border-2 overflow-hidden transition-colors duration-200",
          isCreating ? "cursor-crosshair border-primary/50" : "border-border",
          isDraggingContent && "border-primary/40 bg-primary/[0.02]"
        )}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
      >
        {/* Global drag indicator overlay */}
        {isDraggingContent && zones.length > 0 && !dragOverZoneId && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-end justify-center pb-6">
            <div className="bg-primary/90 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-sm animate-bounce">
              Drop onto a zone below
            </div>
          </div>
        )}

        {/* Creation Preview */}
        {newZone && isCreating && (
          <div
            className="absolute border-2 border-dashed border-primary bg-primary/10"
            style={{
              left: `${newZone.x}%`,
              top: `${newZone.y}%`,
              width: `${newZone.width}%`,
              height: `${newZone.height}%`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-primary font-medium">
                {Math.round(newZone.width)}% × {Math.round(newZone.height)}%
              </span>
            </div>
          </div>
        )}

        {/* Existing Zones */}
        <AnimatePresence>
          {zones.map((zone, index) => {
            const isSelected = selectedZone === zone.zone_id
            const isDragOver = dragOverZoneId === zone.zone_id
            const isRecentDrop = recentDropZoneId === zone.zone_id
            const isDropTarget = isDraggingContent && onZoneDrop

            return (
              <motion.div
                key={zone.zone_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "absolute border-2 transition-all duration-200 group",
                  readonly ? "cursor-default" : "cursor-pointer",
                  getZoneColor(index, isSelected),
                  isDropTarget && !isDragOver && !isRecentDrop &&
                    'border-dashed border-primary/60 animate-pulse',
                  isDragOver &&
                    '!border-solid !border-primary !bg-primary/15 ring-2 ring-primary/40 ring-offset-1 ring-offset-background shadow-[0_0_20px_color-mix(in srgb, var(--color-primary) 25%, transparent)] scale-[1.01]',
                  isRecentDrop &&
                    '!border-success !bg-success/15 ring-2 ring-success/40',
                )}
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                  zIndex: isDragOver ? 50 : zone.z_index,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onZoneSelect(zone.zone_id)
                }}
                onDragOver={(e) => handleZoneDragOver(e, zone.zone_id)}
                onDragLeave={handleZoneDragLeave}
                onDrop={(e) => handleZoneDrop(e, zone.zone_id)}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-2 overflow-hidden relative">
                  {/* Zone name label */}
                  <p className={cn(
                    "font-semibold text-xs text-center mb-1 truncate w-full transition-colors",
                    isDragOver ? "text-primary" : "text-text-primary",
                    isRecentDrop && "text-success",
                  )}>
                    {zone.name}
                  </p>

                  {/* Drop-over overlay content */}
                  {isDragOver ? (
                    <div className="flex-1 w-full flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-primary">Release to add</span>
                    </div>
                  ) : isRecentDrop ? (
                    <div className="flex-1 w-full flex flex-col items-center justify-center gap-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center"
                      >
                        <svg className="h-5 w-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                      <span className="text-xs font-medium text-success">Added!</span>
                    </div>
                  ) : zone.apps && zone.apps.length > 0 ? (
                    <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center gap-1">
                      {zone.apps.slice(0, 2).map((zoneApp: any, appIndex: number) => {
                        const thumbUrl = zoneApp.app?.thumbnail_url || zoneApp.app?.preview_url || zoneApp.app?.content_url
                        const appIconMap: Record<string, any> = {
                          image: Image, video: Video, web: Globe, html: Code,
                          clock: Clock, weather: Cloud, youtube: Play, pdf: FileText,
                        }
                        const AppIcon = appIconMap[zoneApp.app?.template_type] || LayoutGrid
                        return (
                          <div key={appIndex} className="w-full flex-1 min-h-0 rounded overflow-hidden bg-surface/80 border border-border/50 flex items-center justify-center">
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt={zoneApp.app?.name || 'Content'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                  if (fallback) fallback.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div
                              className="flex flex-col items-center justify-center gap-1 px-1"
                              style={{ display: thumbUrl ? 'none' : 'flex' }}
                            >
                              <AppIcon className="h-5 w-5 text-text-muted" />
                              <span className="text-xs text-text-primary truncate max-w-full">
                                {zoneApp.app?.name || 'App'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                      {zone.apps.length > 2 && (
                        <div className="text-xs text-text-muted">+{zone.apps.length - 2}</div>
                      )}
                    </div>
                  ) : (
                    <div className={cn(
                      "flex-1 flex flex-col items-center justify-center text-xs text-center gap-1.5 transition-colors",
                      isDropTarget ? "text-primary" : "text-text-muted"
                    )}>
                      <div className={cn(
                        "w-10 h-10 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors",
                        isDropTarget ? "border-primary/50" : "border-current opacity-40"
                      )}>
                        <Plus className={cn("h-4 w-4", isDropTarget ? "text-primary" : "opacity-60")} />
                      </div>
                      <span className="font-medium">
                        {isDropTarget ? 'Drop here' : 'Drop content here'}
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-text-muted mt-1 opacity-60 shrink-0">
                    {Math.round(zone.width)}% × {Math.round(zone.height)}%
                  </div>
                </div>

                {/* Resize Handles (when selected and not readonly) */}
                {isSelected && !readonly && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full cursor-nw-resize border-2 border-white shadow-sm" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full cursor-ne-resize border-2 border-white shadow-sm" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full cursor-sw-resize border-2 border-white shadow-sm" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full cursor-se-resize border-2 border-white shadow-sm" />
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full cursor-n-resize border-2 border-white shadow-sm" />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full cursor-s-resize border-2 border-white shadow-sm" />
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full cursor-w-resize border-2 border-white shadow-sm" />
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full cursor-e-resize border-2 border-white shadow-sm" />
                  </>
                )}

                {/* Move Handle */}
                {isSelected && !readonly && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-primary/80 rounded cursor-move flex items-center justify-center">
                    <Move className="h-3 w-3 text-white" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Creation Instructions */}
        {isCreating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-surface/90 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-text-primary mb-1">Creating New Zone</p>
              <p className="text-xs text-text-muted">Click to place first corner, then click again to set size</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {zones.length === 0 && !isCreating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Grid className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium text-text-primary mb-2">Start Building Your Layout</p>
              <p className="text-sm text-text-muted mb-6 max-w-sm">
                Create zones by clicking "Add Zone" in the toolbar above and drawing on the canvas, or choose from templates
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>{zones.length} zones</span>
          <span>•</span>
          <span>1920 × 1080</span>
          {showGrid && (
            <>
              <span>•</span>
              <span className="text-primary">Grid ON</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Zone Creation Toolbar Component
interface ZoneToolbarProps {
  onAddZone: () => void
  onToggleGrid: () => void
  showGrid: boolean
  isCreatingZone?: boolean
  selectedZone?: string | null
  onDeleteZone?: () => void
  onDuplicateZone?: () => void
  isDeletingZone?: boolean
}

export function ZoneToolbar({
  onAddZone,
  onToggleGrid,
  showGrid,
  isCreatingZone = false,
  selectedZone,
  onDeleteZone,
  onDuplicateZone,
  isDeletingZone = false,
}: ZoneToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-surface border-b border-border">
      {selectedZone && onDeleteZone && (
        <Button
          size="sm"
          variant="outline"
          onClick={onDeleteZone}
          disabled={isDeletingZone}
          className="gap-1.5 text-error hover:text-error hover:bg-error/5 hover:border-error/30"
          title="Delete zone"
        >
          <Trash2 className="h-3 w-3" />
          {isDeletingZone ? 'Deleting...' : 'Delete'}
        </Button>
      )}
    </div>
  )
}
