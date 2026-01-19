'use client'

import { Button, Input, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { ContentRenderer } from '@signage/renderer'
import { Search, Plus, AlertCircle, FileImage, FileVideo, Globe, Code, Clock, Cloud, Layout as LayoutIcon, Youtube, FileText, Sparkles, Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useApps, useDeleteApp } from '@/hooks/queries/useApps'
import { useContentItem } from '@/hooks/queries'
import type { App } from '@signage/types'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'

const getAppIcon = (templateType: string) => {
  const iconMap: Record<string, any> = {
    'image': FileImage,
    'video': FileVideo,
    'pdf': FileText,
    'web': Globe,
    'html': Code,
    'clock': Clock,
    'weather': Cloud,
    'slideshow': LayoutIcon,
    'youtube': Youtube,
  }
  return iconMap[templateType] || Sparkles
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'active': 'text-success bg-success/10 border-success/20',
    'draft': 'text-warning bg-warning/10 border-warning/20',
    'archived': 'text-text-muted bg-surface-alt border-border',
  }
  return colors[status] || 'text-text-secondary bg-surface-alt border-border'
}

type ViewMode = 'grid' | 'list'

export default function AppsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)

  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const { data: apps = [], isLoading, error, refetch } = useApps(workspaceId)
  const deleteAppMutation = useDeleteApp()

  const filteredApps = Array.isArray(apps) ? apps.filter((app: App) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus
    return matchesSearch && matchesStatus
  }) : []

  const statusCounts = {
    all: Array.isArray(apps) ? apps.length : 0,
    active: Array.isArray(apps) ? apps.filter((a: App) => a.status === 'active').length : 0,
    draft: Array.isArray(apps) ? apps.filter((a: App) => a.status === 'draft').length : 0,
    archived: Array.isArray(apps) ? apps.filter((a: App) => a.status === 'archived').length : 0,
  }

  const handleDelete = async (app: App) => {
    if (!confirm(`Are you sure you want to delete "${app.name}"?`)) return
    try {
      await deleteAppMutation.mutateAsync({ workspaceId, appId: app.app_id })
    } catch (error) {
      console.error('Failed to delete app:', error)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Failed to load apps</h2>
          <p className="text-text-secondary mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">App Gallery</h1>
              <p className="text-sm text-text-muted mt-1">
                {statusCounts.all} {statusCounts.all === 1 ? 'app' : 'apps'}
              </p>
            </div>
            <Button 
              onClick={() => router.push('/apps/create')}
              className="bg-primary hover:bg-primary-hover text-white gap-2"
            >
              <Plus className="h-4 w-4" /> New App
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-4 text-sm">
              {Object.entries(statusCounts).map(([status, count]) => {
                const isActive = selectedStatus === status
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`transition-colors ${
                      isActive
                        ? 'text-primary font-medium'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              })}
            </div>

            <div className="relative sm:ml-auto w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-surface border-border"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No apps found' : 'No apps yet'}
            description={searchQuery ? 'Try adjusting your search query or filters' : 'Create your first app to display content on your screens'}
            action={!searchQuery ? {
              label: "Create Your First App",
              onClick: () => router.push('/apps/create'),
              icon: <Plus className="h-4 w-4" />
            } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app: App, index) => (
              <AppCard
                key={app.app_id}
                app={app}
                index={index}
                workspaceId={workspaceId}
                isHovered={hoveredApp === app.app_id}
                onHover={setHoveredApp}
                onEdit={() => router.push(`/apps/${app.app_id}/edit`)}
                onDelete={() => handleDelete(app)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface AppCardProps {
  app: App
  index: number
  workspaceId: string
  isHovered: boolean
  onHover: (id: string | null) => void
  onEdit: () => void
  onDelete: () => void
}

function AppCard({ app, index, workspaceId, isHovered, onHover, onEdit, onDelete }: AppCardProps) {
  const Icon = getAppIcon(app.template_type)
  
  const { data: contentItem } = useContentItem(
    workspaceId,
    app.content_id || '',
    { enabled: isHovered && !!app.content_id }
  )

  const appWithUrl = {
    ...app,
    preview_url: contentItem?.url || app.preview_url,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative"
      onMouseEnter={() => onHover(app.app_id)}
      onMouseLeave={() => onHover(null)}
    >
      <div 
        onClick={onEdit}
        className="bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
      >
        <div className="aspect-video bg-background relative overflow-hidden">
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}>
            <Icon className="h-20 w-20 text-text-muted/20" />
          </div>
          
          {isHovered && contentItem?.url && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ContentRenderer
                app={appWithUrl}
                className="w-full h-full"
              />
            </div>
          )}
          
          <div className="absolute top-3 right-3">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(app.status)}`} />
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-text-primary mb-1 truncate">
            {app.name}
          </h3>
          <p className="text-xs text-text-muted">
            {app.template_type} · {formatDate(app.updated_at)}
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 pointer-events-none group-hover:pointer-events-auto">
        <Button 
          size="icon" 
          variant="secondary" 
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="h-8 w-8 shadow-lg bg-surface border-border hover:bg-surface-alt"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="h-8 w-8 shadow-lg bg-surface border-border hover:bg-surface-alt hover:text-error"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
