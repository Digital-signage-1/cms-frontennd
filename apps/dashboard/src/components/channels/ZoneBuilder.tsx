'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui'
import { Plus, Grid, Move, RotateCcw, RotateCw, Trash2, Copy, Settings } from 'lucide-react'
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
  showGrid?: boolean
  readonly?: boolean
}

export function ZoneBuilder({
  zones,
  selectedZone,
  onZoneSelect,
  onZoneCreate,
  onZoneUpdate,
  onZoneDelete,
  onZoneDuplicate,
  showGrid = true,
  readonly = false
}: ZoneBuilderProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [newZone, setNewZone] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

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
  }, [readonly, isCreating, dragStart, zones.length, onZoneCreate])

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

  const startZoneCreation = () => {
    setIsCreating(true)
    setDragStart(null)
    setNewZone(null)
  }

  const cancelZoneCreation = () => {
    setIsCreating(false)
    setDragStart(null)
    setNewZone(null)
  }

  return (
    <div className="relative w-full h-full">
      {/* Canvas Tools */}
      {!readonly && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <Button
            size="sm"
            variant={isCreating ? "default" : "outline"}
            onClick={isCreating ? cancelZoneCreation : startZoneCreation}
            className="gap-2 bg-surface/90 backdrop-blur-sm"
          >
            {isCreating ? (
              <>
                <RotateCcw className="h-3 w-3" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                Add Zone
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="gap-2 bg-surface/90 backdrop-blur-sm"
            title="Toggle grid"
          >
            <Grid className="h-3 w-3" />
          </Button>

          {selectedZone && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onZoneDuplicate?.(selectedZone)}
                className="bg-surface/90 backdrop-blur-sm"
                title="Duplicate zone"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onZoneDelete(selectedZone)}
                className="bg-surface/90 backdrop-blur-sm text-error hover:text-error"
                title="Delete zone"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

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
          "relative w-full h-full bg-white rounded-lg border-2 border-border overflow-hidden",
          isCreating ? "cursor-crosshair" : "cursor-default"
        )}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      >
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
          {zones.map((zone, index) => (
            <motion.div
              key={zone.zone_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "absolute border-2 transition-all group cursor-pointer",
                getZoneColor(index, selectedZone === zone.zone_id),
                readonly && "cursor-default"
              )}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
                zIndex: zone.z_index
              }}
              onClick={(e) => {
                e.stopPropagation()
                onZoneSelect(zone.zone_id)
              }}
            >
              {/* Zone Content */}
              <div className="w-full h-full flex flex-col items-center justify-center p-2">
                <p className="font-semibold text-xs text-center text-text-primary mb-1">
                  {zone.name}
                </p>

                {zone.apps && zone.apps.length > 0 ? (
                  <div className="space-y-1 text-center">
                    {zone.apps.slice(0, 3).map((zoneApp: any, appIndex: number) => (
                      <div
                        key={appIndex}
                        className="text-xs bg-surface/80 text-text-primary rounded px-2 py-0.5 border border-border/50"
                      >
                        {zoneApp.app?.name || 'App'}
                      </div>
                    ))}
                    {zone.apps.length > 3 && (
                      <div className="text-xs text-text-muted">
                        +{zone.apps.length - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-text-muted text-center">
                    <div className="w-4 h-4 border border-dashed border-current rounded mx-auto mb-1 opacity-50" />
                    Empty
                  </div>
                )}

                {/* Zone Dimensions */}
                <div className="text-xs text-text-muted mt-1 opacity-60">
                  {Math.round(zone.width)}% × {Math.round(zone.height)}%
                </div>
              </div>

              {/* Resize Handles (when selected and not readonly) */}
              {selectedZone === zone.zone_id && !readonly && (
                <>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full cursor-nw-resize" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full cursor-ne-resize" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full cursor-sw-resize" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full cursor-se-resize" />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full cursor-n-resize" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full cursor-s-resize" />
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full cursor-w-resize" />
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full cursor-e-resize" />
                </>
              )}

              {/* Move Handle */}
              {selectedZone === zone.zone_id && !readonly && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-primary/80 rounded cursor-move flex items-center justify-center">
                  <Move className="h-3 w-3 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Creation Instructions */}
        {isCreating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-surface/90 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-text-primary mb-1">Creating New Zone</p>
              <p className="text-xs text-text-muted">Click and drag to define zone boundaries</p>
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
                Create zones by clicking "Add Zone" and drawing on the canvas, or choose from templates
              </p>
              <div className="flex items-center gap-3 justify-center">
                <Button onClick={startZoneCreation} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Zone
                </Button>
                <Button variant="outline" className="gap-2">
                  <Grid className="h-4 w-4" />
                  Templates
                </Button>
              </div>
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
  onUndo?: () => void
  onRedo?: () => void
  showGrid: boolean
  canUndo?: boolean
  canRedo?: boolean
}

export function ZoneToolbar({
  onAddZone,
  onToggleGrid,
  onUndo,
  onRedo,
  showGrid,
  canUndo = false,
  canRedo = false
}: ZoneToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-surface border-b border-border">
      <div className="flex items-center gap-1">
        <Button size="sm" onClick={onAddZone} className="gap-2">
          <Plus className="h-3 w-3" />
          Add Zone
        </Button>

        <Button
          size="sm"
          variant={showGrid ? "default" : "outline"}
          onClick={onToggleGrid}
          className="gap-2"
        >
          <Grid className="h-3 w-3" />
          Grid
        </Button>
      </div>

      <div className="w-px h-4 bg-border mx-2" />

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <RotateCw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}