'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { api } from '@/services/api'
import type { AppType } from '@signage/types'

interface AppTypeSelectorProps {
  onSelect: (appType: AppType) => void
}

const getCategoryInfo = (category: string) => {
  const categories: Record<string, { label: string; description: string }> = {
    media: { 
      label: 'Static Content', 
      description: 'Display images, videos, PDFs and slideshows' 
    },
    widget: { 
      label: 'Widgets', 
      description: 'Interactive elements like clocks, weather, and custom HTML' 
    },
    integration: { 
      label: 'Embed & Integrations', 
      description: 'Web pages, YouTube videos, and third-party services' 
    },
    custom: { 
      label: 'Custom', 
      description: 'Advanced custom applications' 
    }
  }
  return categories[category] || { label: category, description: '' }
}

const APP_TYPE_ICONS = new Set([
  'youtube','image','video','pdf','slideshow','docx','web','html',
  'clock','weather','social','countdown','qrcode','rss_feed','sheets',
])
function getAppTypeIconPath(typeId: string): string | null {
  if (APP_TYPE_ICONS.has(typeId)) return `/icons/app-types/${typeId}.svg`
  return null
}

export function AppTypeSelector({ onSelect }: AppTypeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['app-types'],
    queryFn: () => api.apps.listAppTypes(),
  })

  const rawData = data as { app_types?: Array<{ type_id: string; name: string; description: string; icon: string; category: string }>; categories?: string[] } | undefined
  const appTypes: AppType[] = (rawData?.app_types || []).map(m => ({
    type: m.type_id as AppType['type'],
    name: m.name,
    description: m.description,
    icon: m.icon,
    category: (m.category || 'custom') as AppType['category'],
    requires_content: true,
    requires_integration: false,
    config_schema: { fields: [] },
  }))
  const categories: string[] = rawData?.categories || []

  const filteredAppTypes = selectedCategory === 'all' 
    ? appTypes 
    : appTypes.filter(t => t.category === selectedCategory)

  const groupedByCategory = filteredAppTypes.reduce((acc, appType) => {
    const cat = appType.category || 'custom'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(appType)
    return acc
  }, {} as Record<string, AppType[]>)

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-error">Failed to load app types</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'bg-primary text-white' : ''}
        >
          All Apps
        </Button>
        {categories.map(cat => {
          const info = getCategoryInfo(cat)
          return (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'bg-primary text-white' : ''}
            >
              {info.label}
            </Button>
          )
        })}
      </div>

      {selectedCategory === 'all' ? (
        Object.entries(groupedByCategory).map(([category, types]) => {
          const info = getCategoryInfo(category)
          return (
            <div key={category} className="mb-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-text-primary">{info.label}</h3>
                <p className="text-sm text-text-secondary">{info.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {types.map(appType => (
                  <AppTypeCard key={appType.type} appType={appType} onSelect={onSelect} />
                ))}
              </div>
            </div>
          )
        })
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppTypes.map(appType => (
            <AppTypeCard key={appType.type} appType={appType} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

function AppTypeCard({ appType, onSelect }: { appType: AppType; onSelect: (appType: AppType) => void }) {
  const iconPath = getAppTypeIconPath(appType.type)

  return (
    <button
      onClick={() => onSelect(appType)}
      className="group relative p-6 bg-surface border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all text-left flex flex-col h-full"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="rounded-lg group-hover:opacity-90 transition-opacity overflow-hidden" style={{ width: 48, height: 48, flexShrink: 0 }}>
          {iconPath ? (
            <img src={iconPath} alt={appType.name} style={{ width: 48, height: 48, objectFit: 'cover' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">
            {appType.name}
          </h4>
          {appType.requires_content && (
            <span className="text-xs text-text-muted bg-background px-2 py-0.5 rounded">
              Requires content
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-text-secondary line-clamp-2 flex-1">
        {appType.description}
      </p>
      <div className="mt-4 pt-4 border-t border-border">
        <span className="text-xs font-medium text-primary group-hover:underline">
          Create App →
        </span>
      </div>
    </button>
  )
}
