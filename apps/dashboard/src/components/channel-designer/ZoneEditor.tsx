'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui'
import { Plus, Trash2, Move, Resize } from 'lucide-react'
import type { ChannelZone } from '@signage/types'

interface ZoneEditorProps {
  zones: ChannelZone[]
  onZonesChange: (zones: ChannelZone[]) => void
  channelId: string
  canvasWidth?: number
  canvasHeight?: number
}

interface DragState {
  isDragging: boolean
  isResizing: boolean
  draggedZoneId: string | null
  dragStart: { x: number; y: number }
  resizeHandle: string | null
}

export function ZoneEditor({
  zones,
  onZonesChange,
  channelId,
  canvasWidth = 1920,
  canvasHeight = 1080
}: ZoneEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    draggedZoneId: null,
    dragStart: { x: 0, y: 0 },
    resizeHandle: null
  })

  const selectedZone = zones.find(z => z.zone_id === selectedZoneId)

  // Generate a new zone ID
  const generateZoneId = () => `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Add a new zone
  const addZone = useCallback(() => {
    const newZone: ChannelZone = {
      zone_id: generateZoneId(),
      channel_id: channelId,
      name: `Zone ${zones.length + 1}`,
      x_percent: 10,
      y_percent: 10,
      width_percent: 30,
      height_percent: 30,
      z_index: zones.length + 1,
      app_count: 0
    }
    onZonesChange([...zones, newZone])
    setSelectedZoneId(newZone.zone_id)
  }, [zones, channelId, onZonesChange])

  // Delete a zone
  const deleteZone = useCallback((zoneId: string) => {
    onZonesChange(zones.filter(z => z.zone_id !== zoneId))
    if (selectedZoneId === zoneId) {
      setSelectedZoneId(null)
    }
  }, [zones, selectedZoneId, onZonesChange])

  // Update zone properties
  const updateZone = useCallback((zoneId: string, updates: Partial<ChannelZone>) => {
    onZonesChange(zones.map(zone =>
      zone.zone_id === zoneId ? { ...zone, ...updates } : zone
    ))
  }, [zones, onZonesChange])

  // Convert canvas coordinates to percentages
  const coordsToPercent = useCallback((x: number, y: number, width: number, height: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0, width: 100, height: 100 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = 100 / rect.width
    const scaleY = 100 / rect.height

    return {
      x: Math.max(0, Math.min(100, x * scaleX)),
      y: Math.max(0, Math.min(100, y * scaleY)),
      width: Math.max(5, Math.min(100, width * scaleX)),
      height: Math.max(5, Math.min(100, height * scaleY))
    }
  }, [])

  // Handle mouse events for dragging and resizing
  const handleMouseDown = useCallback((e: React.MouseEvent, zoneId: string, action: 'move' | 'resize', handle?: string) => {
    e.preventDefault()
    e.stopPropagation()

    setSelectedZoneId(zoneId)
    setDragState({
      isDragging: action === 'move',
      isResizing: action === 'resize',
      draggedZoneId: zoneId,
      dragStart: { x: e.clientX, y: e.clientY },
      resizeHandle: handle || null
    })
  }, [])

  // Handle mouse move for dragging and resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging && !dragState.isResizing) return
    if (!dragState.draggedZoneId) return

    const zone = zones.find(z => z.zone_id === dragState.draggedZoneId)
    if (!zone) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const deltaX = e.clientX - dragState.dragStart.x
    const deltaY = e.clientY - dragState.dragStart.y
    const deltaXPercent = (deltaX / rect.width) * 100
    const deltaYPercent = (deltaY / rect.height) * 100

    if (dragState.isDragging) {
      // Move zone
      const newX = Math.max(0, Math.min(100 - zone.width_percent, zone.x_percent + deltaXPercent))
      const newY = Math.max(0, Math.min(100 - zone.height_percent, zone.y_percent + deltaYPercent))

      updateZone(zone.zone_id, { x_percent: newX, y_percent: newY })
      setDragState(prev => ({ ...prev, dragStart: { x: e.clientX, y: e.clientY } }))
    } else if (dragState.isResizing) {
      // Resize zone
      let newWidth = zone.width_percent
      let newHeight = zone.height_percent
      let newX = zone.x_percent
      let newY = zone.y_percent

      switch (dragState.resizeHandle) {
        case 'se':
          newWidth = Math.max(5, Math.min(100 - zone.x_percent, zone.width_percent + deltaXPercent))
          newHeight = Math.max(5, Math.min(100 - zone.y_percent, zone.height_percent + deltaYPercent))
          break
        case 'sw':
          newWidth = Math.max(5, zone.width_percent - deltaXPercent)
          newHeight = Math.max(5, Math.min(100 - zone.y_percent, zone.height_percent + deltaYPercent))
          newX = Math.max(0, zone.x_percent + deltaXPercent)
          break
        case 'ne':
          newWidth = Math.max(5, Math.min(100 - zone.x_percent, zone.width_percent + deltaXPercent))
          newHeight = Math.max(5, zone.height_percent - deltaYPercent)
          newY = Math.max(0, zone.y_percent + deltaYPercent)
          break
        case 'nw':
          newWidth = Math.max(5, zone.width_percent - deltaXPercent)
          newHeight = Math.max(5, zone.height_percent - deltaYPercent)
          newX = Math.max(0, zone.x_percent + deltaXPercent)
          newY = Math.max(0, zone.y_percent + deltaYPercent)
          break
      }

      updateZone(zone.zone_id, {
        x_percent: newX,
        y_percent: newY,
        width_percent: newWidth,
        height_percent: newHeight
      })
      setDragState(prev => ({ ...prev, dragStart: { x: e.clientX, y: e.clientY } }))
    }
  }, [dragState, zones, updateZone])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      isResizing: false,
      draggedZoneId: null,
      dragStart: { x: 0, y: 0 },
      resizeHandle: null
    })
  }, [])

  // Add global event listeners
  React.useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp])

  return (
    <div className="flex gap-6 h-full">
      {/* Canvas Area */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Layout Canvas</h3>
          <Button onClick={addZone} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Zone
          </Button>
        </div>

        <div
          ref={canvasRef}
          className="relative w-full bg-surface border border-border rounded-lg overflow-hidden"
          style={{ aspectRatio: `${canvasWidth}/${canvasHeight}` }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedZoneId(null)
            }
          }}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" className="text-border">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Zones */}
          {zones.map((zone) => {
            const isSelected = selectedZoneId === zone.zone_id
            const isDragging = dragState.draggedZoneId === zone.zone_id

            return (
              <div
                key={zone.zone_id}
                className={`absolute border-2 cursor-move transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-border bg-surface-alt/30 hover:border-primary/50'
                } ${isDragging ? 'opacity-75' : ''}`}
                style={{
                  left: `${zone.x_percent}%`,
                  top: `${zone.y_percent}%`,
                  width: `${zone.width_percent}%`,
                  height: `${zone.height_percent}%`,
                  zIndex: zone.z_index || 1
                }}
                onMouseDown={(e) => handleMouseDown(e, zone.zone_id, 'move')}
              >
                {/* Zone Label */}
                <div className="absolute top-1 left-1 px-2 py-1 bg-surface border border-border rounded text-xs font-medium text-text-primary">
                  {zone.name}
                </div>

                {/* Zone Content Info */}
                <div className="absolute bottom-1 right-1 px-2 py-1 bg-surface border border-border rounded text-xs text-text-muted">
                  {zone.app_count} apps
                </div>

                {/* Resize handles */}
                {isSelected && (
                  <>
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-se-resize"
                      onMouseDown={(e) => handleMouseDown(e, zone.zone_id, 'resize', 'se')}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-sw-resize"
                      onMouseDown={(e) => handleMouseDown(e, zone.zone_id, 'resize', 'sw')}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-ne-resize"
                      onMouseDown={(e) => handleMouseDown(e, zone.zone_id, 'resize', 'ne')}
                    />
                    <div
                      className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nw-resize"
                      onMouseDown={(e) => handleMouseDown(e, zone.zone_id, 'resize', 'nw')}
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-surface border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Zone Properties</h3>

        {selectedZone ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="zone-name">Zone Name</Label>
              <Input
                id="zone-name"
                value={selectedZone.name}
                onChange={(e) => updateZone(selectedZone.zone_id, { name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="zone-x">X Position (%)</Label>
                <Input
                  id="zone-x"
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(selectedZone.x_percent)}
                  onChange={(e) => updateZone(selectedZone.zone_id, { x_percent: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zone-y">Y Position (%)</Label>
                <Input
                  id="zone-y"
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(selectedZone.y_percent)}
                  onChange={(e) => updateZone(selectedZone.zone_id, { y_percent: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="zone-width">Width (%)</Label>
                <Input
                  id="zone-width"
                  type="number"
                  min="5"
                  max="100"
                  value={Math.round(selectedZone.width_percent)}
                  onChange={(e) => updateZone(selectedZone.zone_id, { width_percent: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zone-height">Height (%)</Label>
                <Input
                  id="zone-height"
                  type="number"
                  min="5"
                  max="100"
                  value={Math.round(selectedZone.height_percent)}
                  onChange={(e) => updateZone(selectedZone.zone_id, { height_percent: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="zone-z-index">Layer Order</Label>
              <Input
                id="zone-z-index"
                type="number"
                min="1"
                value={selectedZone.z_index || 1}
                onChange={(e) => updateZone(selectedZone.zone_id, { z_index: Number(e.target.value) })}
                className="mt-1"
              />
            </div>

            <Button
              variant="destructive"
              onClick={() => deleteZone(selectedZone.zone_id)}
              className="w-full gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Zone
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted">
            <Move className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a zone to edit its properties</p>
            <p className="text-sm mt-2">Click on a zone or click "Add Zone" to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}