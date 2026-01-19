// Complete layout template definitions for channel creation
// These match the database enum values and define exact zone configurations

import React from 'react'

export interface ZoneConfig {
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
}

export interface LayoutTemplate {
  id: string // Database enum value
  name: string
  description: string
  category: 'basic' | 'advanced' | 'custom'
  zones: ZoneConfig[]
  preview: React.ReactNode
}

// Layout templates that match your Plan.md specifications
export const LAYOUT_TEMPLATES: Record<string, LayoutTemplate> = {
  SINGLE: {
    id: 'SINGLE',
    name: 'Single Zone',
    description: 'Full screen content display',
    category: 'basic',
    zones: [
      {
        name: 'Main Content',
        x: 0, y: 0, width: 100, height: 100, z_index: 1,
        background: { type: 'transparent' }
      }
    ],
    preview: React.createElement('div', { className: 'w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/20' })
  },

  SPLIT_HORIZONTAL: {
    id: 'SPLIT_HORIZONTAL',
    name: 'Split Horizontal',
    description: 'Two zones side by side',
    category: 'basic',
    zones: [
      {
        name: 'Left Zone',
        x: 0, y: 0, width: 50, height: 100, z_index: 1,
        background: { type: 'transparent' }
      },
      {
        name: 'Right Zone',
        x: 50, y: 0, width: 50, height: 100, z_index: 1,
        background: { type: 'transparent' }
      }
    ],
    preview: React.createElement('div', { className: 'w-full h-full flex gap-1' }, [
      React.createElement('div', { key: 1, className: 'flex-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/20' }),
      React.createElement('div', { key: 2, className: 'flex-1 bg-gradient-to-br from-success/20 to-success/5 rounded-lg border border-success/20' })
    ])
  },

  SPLIT_VERTICAL: {
    id: 'SPLIT_VERTICAL',
    name: 'Split Vertical',
    description: 'Two zones stacked vertically',
    category: 'basic',
    zones: [
      {
        name: 'Top Zone',
        x: 0, y: 0, width: 100, height: 50, z_index: 1,
        background: { type: 'transparent' }
      },
      {
        name: 'Bottom Zone',
        x: 0, y: 50, width: 100, height: 50, z_index: 1,
        background: { type: 'transparent' }
      }
    ],
    preview: React.createElement('div', { className: 'w-full h-full flex flex-col gap-1' }, [
      React.createElement('div', { key: 1, className: 'flex-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/20' }),
      React.createElement('div', { key: 2, className: 'flex-1 bg-gradient-to-br from-warning/20 to-warning/5 rounded-lg border border-warning/20' })
    ])
  },

  GRID_2X2: {
    id: 'GRID_2X2',
    name: 'Grid 2×2',
    description: 'Four equal zones in grid',
    category: 'advanced',
    zones: [
      {
        name: 'Top Left',
        x: 0, y: 0, width: 50, height: 50, z_index: 1,
        background: { type: 'transparent' }
      },
      {
        name: 'Top Right',
        x: 50, y: 0, width: 50, height: 50, z_index: 1,
        background: { type: 'transparent' }
      },
      {
        name: 'Bottom Left',
        x: 0, y: 50, width: 50, height: 50, z_index: 1,
        background: { type: 'transparent' }
      },
      {
        name: 'Bottom Right',
        x: 50, y: 50, width: 50, height: 50, z_index: 1,
        background: { type: 'transparent' }
      }
    ],
    preview: React.createElement('div', { className: 'w-full h-full grid grid-cols-2 grid-rows-2 gap-1' }, [
      React.createElement('div', { key: 1, className: 'bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/20' }),
      React.createElement('div', { key: 2, className: 'bg-gradient-to-br from-success/20 to-success/5 rounded-lg border border-success/20' }),
      React.createElement('div', { key: 3, className: 'bg-gradient-to-br from-warning/20 to-warning/5 rounded-lg border border-warning/20' }),
      React.createElement('div', { key: 4, className: 'bg-gradient-to-br from-info/20 to-info/5 rounded-lg border border-info/20' })
    ])
  },

  CUSTOM: {
    id: 'CUSTOM',
    name: 'L-Shape Layout',
    description: 'Main content with sidebar zones',
    category: 'advanced',
    zones: [
      {
        name: '🎬 Main Content',
        x: 0, y: 0, width: 70, height: 100, z_index: 1,
        background: { type: 'transparent' }
      },
      {
        name: '📰 News Feed',
        x: 70, y: 0, width: 30, height: 60, z_index: 1,
        background: { type: 'color', value: '#0f172a' }
      },
      {
        name: '🌤️ Weather Widget',
        x: 70, y: 60, width: 30, height: 40, z_index: 1,
        background: { type: 'gradient', value: 'linear-gradient(135deg, #1e3a5f, #0f172a)' }
      }
    ],
    preview: React.createElement('div', { className: 'w-full h-full flex gap-1' }, [
      React.createElement('div', { key: 1, className: 'w-[70%] bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/20' }),
      React.createElement('div', { key: 2, className: 'w-[30%] flex flex-col gap-1' }, [
        React.createElement('div', { key: '2a', className: 'flex-1 bg-gradient-to-br from-success/20 to-success/5 rounded-lg border border-success/20' }),
        React.createElement('div', { key: '2b', className: 'flex-1 bg-gradient-to-br from-warning/20 to-warning/5 rounded-lg border border-warning/20' })
      ])
    ])
  }
}

// Helper function to get zone configs for a layout
export function getZoneConfigsForLayout(layoutType: string): ZoneConfig[] {
  return LAYOUT_TEMPLATES[layoutType]?.zones || []
}

// Helper function to get all available layout templates
export function getAllLayoutTemplates(): LayoutTemplate[] {
  return Object.values(LAYOUT_TEMPLATES)
}

// Helper function to get templates by category
export function getLayoutTemplatesByCategory(category: 'basic' | 'advanced' | 'custom'): LayoutTemplate[] {
  return Object.values(LAYOUT_TEMPLATES).filter(template => template.category === category)
}