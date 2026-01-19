'use client'

import { useState } from 'react'
import { Button, Input, Label } from '@/components/ui'
import { Trash2, Copy, Move, Palette, Clock, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Zone {
  zone_id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  z_index: number
  background: {
    type: 'transparent' | 'color' | 'gradient'
    value?: string
  }
  apps?: any[]
}

interface ZonePropertiesEditorProps {
  zone: Zone | null
  onZoneUpdate: (zoneId: string, updates: Partial<Zone>) => void
  onZoneDelete: (zoneId: string) => void
  onZoneDuplicate?: (zoneId: string) => void
}

const backgroundPresets = [
  { type: 'transparent', label: 'Transparent', value: '' },
  { type: 'color', label: 'Black', value: '#000000' },
  { type: 'color', label: 'Dark Gray', value: '#1a1a2e' },
  { type: 'color', label: 'Primary', value: '#6366f1' },
  { type: 'gradient', label: 'Blue Gradient', value: 'linear-gradient(135deg, #1e3a5f, #0f172a)' },
  { type: 'gradient', label: 'Purple Gradient', value: 'linear-gradient(135deg, #7c3aed, #3730a3)' }
]

export function ZonePropertiesEditor({
  zone,
  onZoneUpdate,
  onZoneDelete,
  onZoneDuplicate
}: ZonePropertiesEditorProps) {
  const [localValues, setLocalValues] = useState({
    name: zone?.name || '',
    x: zone?.x || 0,
    y: zone?.y || 0,
    width: zone?.width || 0,
    height: zone?.height || 0,
    z_index: zone?.z_index || 1
  })

  // Update local values when zone changes
  useState(() => {
    if (zone) {
      setLocalValues({
        name: zone.name,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        z_index: zone.z_index
      })
    }
  }, [zone])

  const handleUpdate = (field: keyof typeof localValues, value: any) => {
    const newValues = { ...localValues, [field]: value }
    setLocalValues(newValues)

    if (zone) {
      onZoneUpdate(zone.zone_id, { [field]: value })
    }
  }

  const handleBackgroundChange = (background: { type: string; value?: string }) => {
    if (zone) {
      onZoneUpdate(zone.zone_id, { background })
    }
  }

  if (!zone) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-alt rounded-lg mb-3">
          <Layers className="h-6 w-6 text-text-muted" />
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">No Zone Selected</p>
        <p className="text-xs text-text-muted">Click a zone on the canvas to edit its properties</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Zone Actions */}
      <div className="flex items-center gap-2">
        {onZoneDuplicate && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onZoneDuplicate(zone.zone_id)}
            className="flex-1 gap-2 text-xs"
          >
            <Copy className="h-3 w-3" />
            Duplicate
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onZoneDelete(zone.zone_id)}
          className="flex-1 gap-2 text-xs text-error hover:text-error"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </Button>
      </div>

      {/* Zone Name */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-text-primary uppercase tracking-wider">
          Zone Name
        </Label>
        <Input
          value={localValues.name}
          onChange={(e) => handleUpdate('name', e.target.value)}
          placeholder="Enter zone name"
          className="h-8 text-sm"
        />
      </div>

      {/* Position & Size */}
      <div className="space-y-4">
        <Label className="text-xs font-medium text-text-primary uppercase tracking-wider">
          Position & Size
        </Label>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-text-muted">X Position (%)</Label>
            <Input
              type="number"
              value={localValues.x}
              onChange={(e) => handleUpdate('x', parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-text-muted">Y Position (%)</Label>
            <Input
              type="number"
              value={localValues.y}
              onChange={(e) => handleUpdate('y', parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-text-muted">Width (%)</Label>
            <Input
              type="number"
              value={localValues.width}
              onChange={(e) => handleUpdate('width', parseInt(e.target.value) || 0)}
              min="1"
              max="100"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-text-muted">Height (%)</Label>
            <Input
              type="number"
              value={localValues.height}
              onChange={(e) => handleUpdate('height', parseInt(e.target.value) || 0)}
              min="1"
              max="100"
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Z-Index */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-text-primary uppercase tracking-wider">
          Layer Order
        </Label>
        <Input
          type="number"
          value={localValues.z_index}
          onChange={(e) => handleUpdate('z_index', parseInt(e.target.value) || 1)}
          min="1"
          max="99"
          className="h-8 text-sm"
          placeholder="Z-index"
        />
        <p className="text-xs text-text-muted">Higher numbers appear on top</p>
      </div>

      {/* Background */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-text-primary uppercase tracking-wider">
          Background
        </Label>

        <div className="grid grid-cols-2 gap-2">
          {backgroundPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleBackgroundChange({
                type: preset.type as any,
                value: preset.value
              })}
              className={cn(
                "p-3 border rounded-lg text-left transition-all hover:border-primary/50",
                zone.background.type === preset.type && zone.background.value === preset.value
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div
                className="w-full h-6 rounded mb-2 border border-border/50"
                style={{
                  background: preset.type === 'transparent'
                    ? 'repeating-conic-gradient(#f1f5f9 0% 25%, transparent 0% 50%)'
                    : preset.value
                }}
              />
              <p className="text-xs font-medium text-text-primary">{preset.label}</p>
              <p className="text-xs text-text-muted capitalize">{preset.type}</p>
            </button>
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="space-y-2">
          <Label className="text-xs text-text-muted">Custom Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={zone.background.type === 'color' ? zone.background.value : '#000000'}
              onChange={(e) => handleBackgroundChange({
                type: 'color',
                value: e.target.value
              })}
              className="w-12 h-8 p-1 rounded"
            />
            <Input
              type="text"
              value={zone.background.type === 'color' ? zone.background.value : ''}
              onChange={(e) => handleBackgroundChange({
                type: 'color',
                value: e.target.value
              })}
              placeholder="#000000"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Zone Stats */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Label className="text-xs font-medium text-text-primary uppercase tracking-wider">
          Zone Statistics
        </Label>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted">Content Apps:</span>
            <span className="text-text-primary">{zone.apps?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Total Duration:</span>
            <span className="text-text-primary">
              {zone.apps?.reduce((total, app) => total + (app.duration_seconds || 0), 0) || 0}s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Screen Coverage:</span>
            <span className="text-text-primary">
              {((localValues.width * localValues.height) / 10000 * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}