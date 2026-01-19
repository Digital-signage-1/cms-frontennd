'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui'
import { Save, Eye, Play, Layout, Layers, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ZoneEditor } from './ZoneEditor'
import { ZoneAppAssignment } from './ZoneAppAssignment'
import type { Channel, ChannelZone, ZoneApp } from '@signage/types'

interface ChannelDesignerProps {
  channel: Channel
  zones: ChannelZone[]
  onChannelUpdate: (updates: Partial<Channel>) => void
  onZonesUpdate: (zones: ChannelZone[]) => void
  onSave: () => void
  onPublish: () => void
  onPreview: () => void
  isSaving?: boolean
  isPublishing?: boolean
}

export function ChannelDesigner({
  channel,
  zones,
  onChannelUpdate,
  onZonesUpdate,
  onSave,
  onPublish,
  onPreview,
  isSaving = false,
  isPublishing = false
}: ChannelDesignerProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [zoneApps, setZoneApps] = useState<Record<string, ZoneApp[]>>({})
  const [activeTab, setActiveTab] = useState('layout')

  const selectedZone = zones.find(z => z.zone_id === selectedZoneId)

  // Update selected zone when zones change
  useEffect(() => {
    if (selectedZoneId && !zones.find(z => z.zone_id === selectedZoneId)) {
      setSelectedZoneId(zones.length > 0 ? zones[0].zone_id : null)
    } else if (!selectedZoneId && zones.length > 0) {
      setSelectedZoneId(zones[0].zone_id)
    }
  }, [zones, selectedZoneId])

  // Handle zone apps update for specific zone
  const handleZoneAppsUpdate = (zoneId: string, apps: ZoneApp[]) => {
    setZoneApps(prev => ({
      ...prev,
      [zoneId]: apps
    }))
  }

  // Get layout preview based on zones
  const getLayoutPreview = () => {
    if (zones.length === 0) {
      return <div className="w-full h-full bg-surface-alt rounded flex items-center justify-center text-text-muted">No zones</div>
    }

    return (
      <div className="relative w-full h-32 bg-background border border-border rounded">
        {zones.map((zone) => (
          <div
            key={zone.zone_id}
            className="absolute border border-primary/30 bg-primary/10 rounded-sm"
            style={{
              left: `${zone.x_percent}%`,
              top: `${zone.y_percent}%`,
              width: `${zone.width_percent}%`,
              height: `${zone.height_percent}%`,
              zIndex: zone.z_index || 1
            }}
          >
            <div className="text-xs p-1 font-medium text-primary truncate">
              {zone.name}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{channel.name}</h1>
            <p className="text-sm text-text-muted">
              {zones.length} zone{zones.length !== 1 ? 's' : ''} • {channel.status}
            </p>
          </div>
          <div className="hidden md:block">
            {getLayoutPreview()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onPreview} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={onSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={onPublish}
            disabled={isPublishing || zones.length === 0}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Channel Settings */}
        <div className="w-80 border-r border-border bg-surface p-4 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="zones">
                <Layers className="h-4 w-4 mr-2" />
                Zones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="channel-name">Channel Name</Label>
                <Input
                  id="channel-name"
                  value={channel.name}
                  onChange={(e) => onChannelUpdate({ name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="channel-description">Description</Label>
                <textarea
                  id="channel-description"
                  value={channel.description || ''}
                  onChange={(e) => onChannelUpdate({ description: e.target.value })}
                  className="w-full px-3 py-2 mt-1 bg-background border border-border rounded-lg focus:outline-none focus:border-primary resize-none h-20"
                  placeholder="Describe this channel..."
                />
              </div>

              <div>
                <Label htmlFor="transition-type">Transition Type</Label>
                <select
                  id="transition-type"
                  value={channel.transition_type || 'fade'}
                  onChange={(e) => onChannelUpdate({ transition_type: e.target.value as any })}
                  className="w-full px-3 py-2 mt-1 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="none">None</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                </select>
              </div>

              <div>
                <Label htmlFor="transition-duration">Transition Duration (ms)</Label>
                <Input
                  id="transition-duration"
                  type="number"
                  min="0"
                  max="5000"
                  step="100"
                  value={channel.transition_duration || 1000}
                  onChange={(e) => onChannelUpdate({ transition_duration: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={channel.background?.value || 'var(--color-background)'}
                    onChange={(e) => onChannelUpdate({
                      background: { type: 'color', value: e.target.value }
                    })}
                    className="w-16 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={channel.background?.value || 'var(--color-background)'}
                    onChange={(e) => onChannelUpdate({
                      background: { type: 'color', value: e.target.value }
                    })}
                    placeholder="var(--color-background)"
                    className="flex-1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="zones" className="mt-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-text-primary">Zone List</div>
                {zones.length === 0 ? (
                  <div className="text-center py-4 text-text-muted text-sm">
                    No zones created yet
                  </div>
                ) : (
                  zones.map((zone) => (
                    <button
                      key={zone.zone_id}
                      onClick={() => setSelectedZoneId(zone.zone_id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedZoneId === zone.zone_id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-text-primary">{zone.name}</div>
                      <div className="text-sm text-text-muted">
                        {Math.round(zone.width_percent)}% × {Math.round(zone.height_percent)}%
                      </div>
                      <div className="text-xs text-text-muted">
                        {zone.app_count} apps
                      </div>
                    </button>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center Panel - Zone Editor */}
        <div className="flex-1 p-4">
          <ZoneEditor
            zones={zones}
            onZonesChange={onZonesUpdate}
            channelId={channel.channel_id}
          />
        </div>

        {/* Right Panel - Zone App Assignment */}
        {selectedZone && (
          <div className="w-96 border-l border-border bg-surface p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary">{selectedZone.name}</h3>
              <p className="text-sm text-text-muted">
                {Math.round(selectedZone.width_percent)}% × {Math.round(selectedZone.height_percent)}%
              </p>
            </div>

            <ZoneAppAssignment
              zoneId={selectedZone.zone_id}
              zoneApps={zoneApps[selectedZone.zone_id] || []}
              onZoneAppsChange={(apps) => handleZoneAppsUpdate(selectedZone.zone_id, apps)}
              onAddApp={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  )
}