'use client'

import { useState } from 'react'
import { Button, Input, Label, Textarea } from '@/components/ui'
import { Save, Star, Globe, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Zone {
  zone_id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  z_index: number
  background: any
}

interface LayoutTemplateSaverProps {
  zones: Zone[]
  channelName: string
  onSave: (templateData: {
    name: string
    description: string
    category: string
    is_public: boolean
    zones: Omit<Zone, 'zone_id'>[]
  }) => void
  onCancel: () => void
}

export function LayoutTemplateSaver({
  zones,
  channelName,
  onSave,
  onCancel
}: LayoutTemplateSaverProps) {
  const [templateName, setTemplateName] = useState(`${channelName} Template`)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('custom')
  const [isPublic, setIsPublic] = useState(false)

  const handleSave = () => {
    const templateData = {
      name: templateName,
      description,
      category,
      is_public: isPublic,
      zones: zones.map(zone => ({
        name: zone.name,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        z_index: zone.z_index,
        background: zone.background
      }))
    }

    onSave(templateData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Save as Template</h3>
        <p className="text-sm text-text-secondary">
          Save this layout configuration for future use
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="templateName">Template Name</Label>
          <Input
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="My Custom Layout"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe when to use this layout..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex gap-2">
            {['basic', 'advanced', 'custom'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                  category === cat
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm",
              isPublic
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-text-secondary hover:text-text-primary"
            )}
          >
            {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {isPublic ? 'Public Template' : 'Private Template'}
          </button>
        </div>

        {/* Template Preview */}
        <div className="space-y-2">
          <Label>Template Preview</Label>
          <div className="p-4 bg-surface border border-border rounded-lg">
            <div className="text-xs text-text-muted mb-2">
              {zones.length} zones • {((zones.reduce((total, z) => total + (z.width * z.height), 0)) / 10000 * 100).toFixed(1)}% coverage
            </div>
            <div className="aspect-video bg-white border border-border rounded relative overflow-hidden">
              {zones.map((zone, index) => (
                <div
                  key={zone.zone_id}
                  className={`absolute border flex items-center justify-center ${
                    index === 0 ? 'border-primary/50 bg-primary/10' :
                    index === 1 ? 'border-success/50 bg-success/10' :
                    index === 2 ? 'border-warning/50 bg-warning/10' :
                    'border-info/50 bg-info/10'
                  }`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                  }}
                >
                  <span className="text-xs font-medium text-center">
                    {zone.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={!templateName.trim()}
          className="flex-1 gap-2"
        >
          <Save className="h-4 w-4" />
          Save Template
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}