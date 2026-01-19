import React from 'react'
import type { LayoutTemplate } from '@/lib/layout-templates'

interface LayoutPreviewRendererProps {
  template: LayoutTemplate
  className?: string
}

export function LayoutPreviewRenderer({ template, className = "w-full h-full" }: LayoutPreviewRendererProps) {
  const getZoneColor = (index: number) => {
    const colors = [
      'from-primary/20 to-primary/5 border-primary/20',
      'from-success/20 to-success/5 border-success/20',
      'from-warning/20 to-warning/5 border-warning/20',
      'from-info/20 to-info/5 border-info/20',
      'from-purple/20 to-purple/5 border-purple/20',
      'from-pink/20 to-pink/5 border-pink/20'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className={`relative ${className}`}>
      {template.zones.map((zone, index) => (
        <div
          key={index}
          className={`absolute bg-gradient-to-br ${getZoneColor(index)} rounded-lg border flex items-center justify-center`}
          style={{
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            width: `${zone.width}%`,
            height: `${zone.height}%`,
            zIndex: zone.z_index
          }}
        >
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-600 opacity-70">
              {zone.name}
            </p>
            <p className="text-[10px] text-gray-500 opacity-50 mt-0.5">
              {zone.width}% × {zone.height}%
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper function to get preview for any layout template
export function getLayoutPreview(template: LayoutTemplate) {
  return <LayoutPreviewRenderer template={template} />
}