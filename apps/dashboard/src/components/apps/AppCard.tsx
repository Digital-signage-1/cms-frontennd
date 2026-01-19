'use client'

import { FileImage, FileVideo, Globe, Code, Clock, Cloud, Layout, Youtube, FileText, MoreHorizontal, Play, Edit, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { App } from '@signage/types'

interface AppCardProps {
  app: App
  onEdit?: (app: App) => void
  onDuplicate?: (app: App) => void
  onDelete?: (app: App) => void
  onPreview?: (app: App) => void
}

const getAppIcon = (templateType: string) => {
  const iconMap: Record<string, any> = {
    'image': FileImage,
    'video': FileVideo,
    'pdf': FileText,
    'web': Globe,
    'html': Code,
    'clock': Clock,
    'weather': Cloud,
    'slideshow': Layout,
    'youtube': Youtube,
  }
  return iconMap[templateType] || Layout
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'active': 'bg-success/10 text-success border-success/20',
    'draft': 'bg-warning/10 text-warning border-warning/20',
    'archived': 'bg-text-muted/10 text-text-muted border-text-muted/20',
  }
  return colors[status] || 'bg-surface text-text-secondary border-border'
}

export function AppCard({ app, onEdit, onDuplicate, onDelete, onPreview }: AppCardProps) {
  const Icon = getAppIcon(app.template_type)

  return (
    <div className="group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all">
      <div className="relative h-48 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
        <Icon className="h-16 w-16 text-primary/40" />
        
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(app.status)}`}>
            {app.status}
          </span>
        </div>

        {onPreview && (
          <button
            onClick={() => onPreview(app)}
            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="flex items-center gap-2 text-white">
              <Play className="h-6 w-6" />
              <span className="font-medium">Preview</span>
            </div>
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
              {app.name}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {app.template_type}
            </p>
          </div>
          
          <div className="relative">
            <button className="p-1 hover:bg-surface-alt rounded text-text-muted hover:text-text-primary">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {app.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {app.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border">
          <span>Updated {formatDate(app.updated_at)}</span>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(app)}
                className="h-7 w-7 text-text-muted hover:text-primary"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDuplicate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDuplicate(app)}
                className="h-7 w-7 text-text-muted hover:text-primary"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(app)}
                className="h-7 w-7 text-text-muted hover:text-error"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
