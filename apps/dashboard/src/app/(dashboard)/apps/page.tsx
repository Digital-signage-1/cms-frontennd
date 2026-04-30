'use client'

import {
  Search, Plus, AlertCircle, ImageIcon, FileVideo, Globe, Code,
  Clock, Cloud, LayoutGrid, Youtube, FileText, Sparkles, Play,
  MessageSquare, Grid2X2, List, Eye, Music,
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useApps, useDeleteApp, useUpdateApp, useBulkDeleteApps, useBulkMoveApps } from '@/hooks/queries/useApps'
import { useFolders, useCreateFolder, useDeleteFolder, useUpdateFolder } from '@/hooks/queries/useContent'
import { Folder as FolderIcon, ChevronRight, MoreVertical, Archive, Edit2, Trash2, Move, CheckSquare, Square, Check } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { formatDate } from '@/lib/utils'
import { AppPreviewModal } from '@/components/apps/AppPreviewModal'
import { toast } from '@/hooks/use-toast'
import type { App as SignageApp } from '@signage/types'

// ── Template type → visual config ─────────────────────────────────────────────
const TEMPLATE_CONFIG: Record<string, {
  category: string
  iconBgColor: string
  iconColor: string
  Icon: any
  tags: string[]
  defaultDesc: string
}> = {
  image: {
    category: 'Content',
    iconBgColor: 'rgba(59,130,246,0.28)',
    iconColor: '#60A5FA',
    Icon: ImageIcon,
    tags: ['Auto-rotate', 'Ken Burns effect', 'Aspect fit/fill'],
    defaultDesc: 'Display images and photo slideshows on your screens with transitions and timing controls.',
  },
  slideshow: {
    category: 'Content',
    iconBgColor: 'rgba(124,58,237,0.28)',
    iconColor: '#A78BFA',
    Icon: LayoutGrid,
    tags: ['PowerPoint', 'Presentation', 'PPT/PPTX'],
    defaultDesc: 'Display PowerPoint presentations as a slideshow with transitions and timing.',
  },
  video: {
    category: 'Content',
    iconBgColor: 'rgba(5,150,105,0.28)',
    iconColor: '#34D399',
    Icon: Play,
    tags: ['Playlist support', 'Loop modes', 'HD/4K'],
    defaultDesc: 'Stream video content with support for playlists, looping, and scheduled playback.',
  },
  youtube: {
    category: 'Content',
    iconBgColor: 'rgba(239,68,68,0.28)',
    iconColor: '#F87171',
    Icon: Youtube,
    tags: ['Playlist', 'Live stream', 'Auto-play'],
    defaultDesc: 'Stream YouTube videos and playlists directly to your display network.',
  },
  pdf: {
    category: 'Content',
    iconBgColor: 'rgba(245,158,11,0.28)',
    iconColor: '#F59E0B',
    Icon: FileText,
    tags: ['Auto-scroll', 'Page control', 'Zoom'],
    defaultDesc: 'Display PDF documents and presentations with smooth page transitions.',
  },
  docx: {
    category: 'Content',
    iconBgColor: 'rgba(37,99,235,0.28)',
    iconColor: '#60A5FA',
    Icon: FileText,
    tags: ['Word', 'DOCX', 'Document'],
    defaultDesc: 'Display Word documents with page-by-page viewing and transitions.',
  },
  web: {
    category: 'Utilities',
    iconBgColor: 'rgba(14,165,233,0.28)',
    iconColor: '#38BDF8',
    Icon: Globe,
    tags: ['Responsive', 'Live reload', 'Cache control'],
    defaultDesc: 'Display any web page or web application on your screens in real time.',
  },
  html: {
    category: 'Utilities',
    iconBgColor: 'rgba(251,146,60,0.28)',
    iconColor: '#FB923C',
    Icon: Code,
    tags: ['Custom CSS', 'JavaScript', 'Templates'],
    defaultDesc: 'Render custom HTML, CSS, and JavaScript content with full flexibility.',
  },
  clock: {
    category: 'Data',
    iconBgColor: 'rgba(99,102,241,0.28)',
    iconColor: '#818CF8',
    Icon: Clock,
    tags: ['Timezone', 'Custom format', '24h / 12h'],
    defaultDesc: 'Show a live clock with timezone support and fully customizable styling.',
  },
  weather: {
    category: 'Data',
    iconBgColor: 'rgba(56,189,248,0.28)',
    iconColor: 'var(--color-primary)',
    Icon: Cloud,
    tags: ['Real-time', 'Multi-city', '7-day forecast'],
    defaultDesc: 'Display live weather data and forecasts for one or more locations.',
  },
  audio: {
    category: 'Content',
    iconBgColor: 'rgba(124,58,237,0.28)',
    iconColor: '#A78BFA',
    Icon: Music,
    tags: ['Background music', 'Ambient', 'MP3/WAV'],
    defaultDesc: 'Play background audio with an ambient visual display on your screens.',
  },
}

const FALLBACK_CONFIG = {
  category: 'Interactive',
  iconBgColor: 'rgba(167,139,250,0.28)',
  iconColor: '#7dd3fc',
  Icon: Sparkles,
  tags: ['Custom logic', 'Interactive', 'Configurable'],
  defaultDesc: 'A configurable app for your display network.',
}

function getConfig(templateType: string) {
  return TEMPLATE_CONFIG[templateType] ?? FALLBACK_CONFIG
}

// ── Category list ──────────────────────────────────────────────────────────────
const STATUS_TABS = ['all', 'active', 'archived'] as const
type StatusTab = typeof STATUS_TABS[number]

function AppCard({ app, onEdit, onDelete, onPreview, onArchive, isSelected, onSelect }: { 
  app: SignageApp; 
  onEdit: () => void; 
  onDelete: () => void; 
  onPreview: () => void;
  onArchive: () => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}) {
  const cfg = getConfig(app.template_type)
  const { Icon, iconBgColor, iconColor, category } = cfg

  const isActive  = app.status === 'active'
  const isArchived = app.status === 'archived'

  return (
    <div
      className={`group rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all relative ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}
      style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
      onClick={onEdit}
    >
      {/* Checkbox for Selection */}
      <div 
        className={`absolute top-2 left-2 z-10 p-1.5 rounded-lg transition-all duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        onClick={(e) => { e.stopPropagation(); onSelect?.(!isSelected); }}
      >
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
          {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
        </div>
      </div>
      {/* ── Icon area ── */}
      <div className="relative flex-shrink-0 flex items-center justify-center" style={{ height: 100, backgroundColor: 'var(--color-background)' }}>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>

        {/* Status dot — top right */}
        <div
          className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
          style={{ backgroundColor: isActive ? '#34D399' : isArchived ? '#94A3B8' : 'var(--color-primary)' }}
          title={isActive ? 'Active' : isArchived ? 'Archived' : 'Draft'}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onPreview() }}
            className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
            title="Preview"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
            title="Edit"
          >
            <Code className="h-5 w-5" />
          </button>
          {!isArchived && (
            <button
              onClick={(e) => { e.stopPropagation(); onArchive() }}
              className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
              title="Archive"
            >
              <Archive className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Name + type ── */}
      <div className="px-3 py-2.5" style={{ borderTop: '1px solid var(--color-border)' }}>
        <h3 className="text-xs font-semibold leading-tight truncate" style={{ color: 'var(--color-text-primary)' }}>{app.name}</h3>
        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>{category} &middot; {app.template_type}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AppsPage() {
  const router = useRouter()
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)
  const [statusFilter,   setStatusFilter]   = useState<StatusTab>('all')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [viewMode,       setViewMode]       = useState<'grid' | 'list'>('grid')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([])

  const { data: apps = [], isLoading: appsLoading, error, refetch } = useApps(workspaceId, { folder_id: currentFolderId || undefined })
  const { data: folders = [], isLoading: foldersLoading } = useFolders(workspaceId, currentFolderId, 'app')
  
  const updateAppMutation = useUpdateApp()
  const deleteAppMutation = useDeleteApp()
  const bulkDeleteMutation = useBulkDeleteApps()
  const bulkMoveMutation = useBulkMoveApps()
  const createFolderMutation = useCreateFolder()
  const deleteFolderMutation = useDeleteFolder()
  const updateFolderMutation = useUpdateFolder()
  const { setBreadcrumbItems } = useBreadcrumb()

  const [previewApp,     setPreviewApp]     = useState<SignageApp | null>(null)
  const [deleteTarget,   setDeleteTarget]   = useState<SignageApp | null>(null)
  const [newFolderName,  setNewFolderName]  = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [renamingFolder,  setRenamingFolder]  = useState<any>(null)
  const [renameValue,     setRenameValue]     = useState('')
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<any>(null)
  
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([])
  const [isBulkMoving, setIsBulkMoving] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const isLoading = appsLoading || foldersLoading

  useEffect(() => {
    setBreadcrumbItems([{ label: 'Apps' }])
  }, [setBreadcrumbItems])

  const appList: SignageApp[] = Array.isArray(apps) ? apps : []

  // Stats (only for top-level or all apps)
  const stats = useMemo(() => {
    // If we have folders, we might want global stats or folder-specific.
    // Let's stick to global stats for the header.
    const active   = appList.filter((a) => a.status === 'active').length
    const archived = appList.filter((a) => a.status === 'archived').length
    return { total: appList.length, active, archived }
  }, [appList])

  const filteredApps = useMemo(() => {
    return appList.filter((a) => {
      // If we are in a folder, the API already filtered by folder_id.
      // We still apply other filters.
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus =
        statusFilter === 'all' || a.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [appList, statusFilter, searchQuery])

  const filteredFolders = useMemo(() => {
    if (statusFilter !== 'all' && statusFilter !== 'active') return []
    return folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [folders, statusFilter, searchQuery])

  const handleDelete = (app: SignageApp) => {
    setDeleteTarget(app)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteAppMutation.mutateAsync({ workspaceId, appId: deleteTarget.app_id })
    } catch (err) {
      console.error('Failed to delete app:', err)
    }
    setDeleteTarget(null)
  }

  const handleArchive = async (app: SignageApp) => {
    try {
      await updateAppMutation.mutateAsync({
        workspaceId,
        appId: app.app_id,
        data: { status: 'archived' }
      })
    } catch (err) {
      console.error('Failed to archive app:', err)
    }
  }

  const handleSelectApp = (appId: string, selected: boolean) => {
    setSelectedAppIds(prev => 
      selected ? [...prev, appId] : prev.filter(id => id !== appId)
    )
  }

  const handleSelectAllApps = (selected: boolean) => {
    setSelectedAppIds(selected ? filteredApps.map(app => app.app_id) : [])
  }

  const handleBulkDelete = () => {
    if (selectedAppIds.length === 0) return
    setIsBulkDeleting(true)
  }

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate({
      workspaceId,
      appIds: selectedAppIds
    }, {
      onSuccess: () => {
        setSelectedAppIds([])
        setIsBulkDeleting(false)
        toast.success('Apps deleted successfully')
      }
    })
  }

  const handleBulkMove = (folderId: string | null) => {
    if (selectedAppIds.length === 0) return
    bulkMoveMutation.mutate({
      workspaceId,
      appIds: selectedAppIds,
      folderId
    }, {
      onSuccess: () => {
        setSelectedAppIds([])
        setIsBulkMoving(false)
        toast.success('Apps moved successfully')
      }
    })
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    if (!newFolderName.trim()) {
      setIsCreatingFolder(false)
      return
    }
    try {
      await createFolderMutation.mutateAsync({
        workspaceId,
        data: {
          name: newFolderName.trim(),
          parent_id: currentFolderId || undefined,
          folder_type: 'app'
        }
      })
      setNewFolderName('')
      setIsCreatingFolder(false)
      toast.success("Folder created successfully")
    } catch (err: any) {
      console.error('Failed to create folder:', err)
      toast.error(err.response?.data?.message || err.message || "Failed to create folder")
    }
  }

  const handleRenameFolder = async () => {
    if (!renamingFolder || !renameValue.trim()) return
    try {
      await updateFolderMutation.mutateAsync({
        workspaceId,
        folderId: renamingFolder.id,
        data: { name: renameValue.trim() }
      })
      setRenamingFolder(null)
      setRenameValue('')
      toast.success("Folder renamed successfully")
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to rename folder")
    }
  }

  const handleConfirmDeleteFolder = async () => {
    if (!deleteFolderTarget) return
    try {
      await deleteFolderMutation.mutateAsync({
        workspaceId,
        folderId: deleteFolderTarget.id
      })
      setDeleteFolderTarget(null)
      toast.success("Folder deleted successfully")
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete folder")
    }
  }

  const handleFolderClick = (folder: any) => {
    setCurrentFolderId(folder.folder_id)
    setFolderPath([...folderPath, { id: folder.folder_id, name: folder.name }])
  }

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentFolderId(null)
      setFolderPath([])
    } else {
      const newPath = folderPath.slice(0, index + 1)
      setCurrentFolderId(newPath[newPath.length - 1].id)
      setFolderPath(newPath)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#DC2626' }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Failed to load apps</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f0f9ff' }}>

      {/* ── Fixed Header: Hero + Stats + Toolbar ── */}
      <div className="flex-shrink-0" style={{ backgroundColor: '#f0f9ff' }}>

        {/* Hero banner — compact 2-row layout */}
        <div className="page-container pt-3 pb-2">
          <div
            className="rounded-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-surface-alt) 50%, var(--color-border) 100%)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(color-mix(in srgb, var(--color-primary) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 6%, transparent) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative z-10 px-4 sm:px-5 py-4">
              {/* Title row */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--color-primary)' }}>
                    App Gallery
                  </p>
                  <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Apps</h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  >
                    <FolderIcon className="h-4 w-4" />
                    New Folder
                  </button>
                  <button
                    onClick={() => router.push(currentFolderId ? `/apps/create?folder_id=${currentFolderId}` : '/apps/create')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                  >
                    <Plus className="h-4 w-4" />
                    New App
                  </button>
                </div>
              </div>

              {/* Breadcrumbs / Folder path */}
              <div className="flex items-center gap-1.5 mb-3 text-sm">
                <button 
                  onClick={() => navigateToBreadcrumb(-1)}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  style={{ color: currentFolderId ? 'var(--color-text-secondary)' : 'var(--color-primary)', fontWeight: !currentFolderId ? 600 : 400 }}
                >
                  Root
                </button>
                {folderPath.map((folder, i) => (
                  <div key={folder.id} className="flex items-center gap-1.5">
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                    <button 
                      onClick={() => navigateToBreadcrumb(i)}
                      className="hover:text-primary transition-colors"
                      style={{ color: i === folderPath.length - 1 ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: i === folderPath.length - 1 ? 600 : 400 }}
                    >
                      {folder.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Stat cards row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {[
                  { label: 'Total Apps', value: stats.total, color: 'var(--color-primary)', emoji: '📦' },
                  { label: 'Active', value: stats.active, color: '#34D399', dot: '#22C55E' },
                  { label: 'Archived', value: stats.archived, color: 'var(--color-text-primary)', emoji: '🗂' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg p-2.5 flex items-center gap-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.75)', border: '1px solid color-mix(in srgb, var(--color-primary) 7%, transparent)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                      {s.dot ? (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.dot }} />
                      ) : (
                        <span className="text-xs">{s.emoji}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] leading-tight" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</p>
                      <p className="text-sm font-bold leading-tight" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar row */}
        <div className="page-container pb-2 flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {/* Status filter tabs */}
        <div className="flex items-center gap-1">
          {STATUS_TABS.map((s) => {
            const label = s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)
            const isActive = statusFilter === s
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  isActive
                    ? { backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }
                    : { color: 'var(--color-text-secondary)' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>
        {/* Divider */}
        <div className="hidden sm:block w-px h-5 flex-shrink-0" style={{ backgroundColor: '#bae6fd' }} />

        {/* Right: search + view toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none w-full sm:w-48"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {([
            { mode: 'grid' as const, icon: Grid2X2, title: 'Grid view' },
            { mode: 'list' as const, icon: List, title: 'List view' },
          ]).map(({ mode, icon: BtnIcon, title }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="p-2 rounded-lg transition-colors"
              title={title}
              style={
                viewMode === mode
                  ? { backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }
                  : { backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }
              }
            >
              <BtnIcon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      </div>{/* end sticky header */}

        {/* Bulk Action Toolbar */}
        {selectedAppIds.length > 0 && (
          <div className="mx-8 mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleSelectAllApps(selectedAppIds.length < filteredApps.length)}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedAppIds.length === filteredApps.length ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                  {selectedAppIds.length === filteredApps.length && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
                <span className="text-sm font-medium text-blue-900">
                  {selectedAppIds.length} {selectedAppIds.length === 1 ? 'app' : 'apps'} selected
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-900 rounded-lg text-sm font-medium hover:bg-blue-100/50 transition-colors">
                    <Move className="h-4 w-4" />
                    Move to Folder
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleBulkMove(null)}>
                    <FolderIcon className="h-4 w-4 mr-2" />
                    Root (Unfolder)
                  </DropdownMenuItem>
                  {folders.map(folder => (
                    <DropdownMenuItem key={folder.id} onClick={() => handleBulkMove(folder.folder_id)}>
                      <FolderIcon className="h-4 w-4 mr-2" />
                      {folder.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button 
                onClick={() => setSelectedAppIds([])}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Clear Selection"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto page-container pb-5">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-xl animate-pulse"
                style={{ height: 148, backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
              />
            ))}
          </div>
        ) : filteredApps.length === 0 && filteredFolders.length === 0 ? (
          <div
            className="rounded-xl flex flex-col items-center justify-center py-20"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
          >
            <Sparkles className="h-10 w-10 mb-4" style={{ color: 'var(--color-border)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {searchQuery ? 'No results found' : 'No apps yet'}
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Create your first app or folder to get started'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* New Folder Inline Creation */}
            {isCreatingFolder && (
              <div 
                className="rounded-xl p-3 flex flex-col items-center justify-center gap-2"
                style={{ backgroundColor: '#FFFFFF', border: '1px dashed var(--color-primary)' }}
              >
                <FolderIcon className="h-8 w-8 text-primary opacity-50" />
                <input 
                  autoFocus
                  placeholder="Folder name..."
                  className="w-full text-xs px-2 py-1.5 rounded border outline-none focus:border-primary"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder()
                    if (e.key === 'Escape') setIsCreatingFolder(false)
                  }}
                />
                <div className="flex gap-2 w-full">
                  <button onClick={handleCreateFolder} className="flex-1 text-[10px] py-1 bg-primary text-white rounded">Create</button>
                  <button onClick={() => setIsCreatingFolder(false)} className="flex-1 text-[10px] py-1 bg-slate-100 rounded text-slate-600">Cancel</button>
                </div>
              </div>
            )}

            {/* Render Folders */}
            {filteredFolders.map((folder) => {
              const isRenaming = renamingFolder?.id === folder.id
              return (
                <div
                  key={folder.folder_id}
                  onClick={() => !isRenaming && handleFolderClick(folder)}
                  className="group rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all relative"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}
                  >
                    <FolderIcon className="h-8 w-8 text-blue-500" fill="currentColor" fillOpacity={0.2} />
                  </div>
                  
                  {isRenaming ? (
                    <div className="w-full" onClick={(e) => e.stopPropagation()}>
                      <input 
                        autoFocus
                        className="w-full text-xs px-2 py-1 rounded border outline-none focus:border-primary text-center"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameFolder()
                          if (e.key === 'Escape') setRenamingFolder(null)
                        }}
                        onBlur={handleRenameFolder}
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold text-slate-800 text-center truncate w-full">{folder.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">{folder.app_count || 0} apps</p>
                    </>
                  )}
                  
                  {!isRenaming && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setRenamingFolder(folder); 
                            setRenameValue(folder.name); 
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={(e) => { e.stopPropagation(); setDeleteFolderTarget(folder) }}
                        >
                          Delete Folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })}

            {/* Render Apps */}
            {filteredApps.map((app) => (
              <AppCard
                key={app.app_id}
                app={app}
                isSelected={selectedAppIds.includes(app.app_id)}
                onSelect={(selected) => handleSelectApp(app.app_id, selected)}
                onEdit={() => router.push(`/apps/${app.app_id}/edit`)}
                onDelete={() => handleDelete(app)}
                onPreview={() => setPreviewApp(app)}
                onArchive={() => handleArchive(app)}
              />
            ))}
          </div>
        ) : (
          /* List view with folders */
          <div className="flex flex-col gap-2">
             {filteredFolders.map((folder) => {
               const isRenaming = renamingFolder?.id === folder.id
               return (
                 <div
                    key={folder.folder_id}
                    onClick={() => !isRenaming && handleFolderClick(folder)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/50 transition-colors group"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
                 >
                   <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FolderIcon className="h-5 w-5 text-blue-500" />
                   </div>
                   <div className="flex-1 min-w-0">
                      {isRenaming ? (
                        <input 
                          autoFocus
                          className="w-full text-sm px-2 py-1 rounded border outline-none focus:border-primary"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameFolder()
                            if (e.key === 'Escape') setRenamingFolder(null)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={handleRenameFolder}
                        />
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-slate-800 truncate">{folder.name}</p>
                          <p className="text-xs text-slate-400">Folder &middot; {folder.app_count || 0} apps</p>
                        </>
                      )}
                   </div>
                   
                   {!isRenaming && (
                     <div className="flex items-center gap-2">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                           <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100">
                             <MoreVertical className="h-4 w-4 text-slate-400" />
                           </button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setRenamingFolder(folder); 
                                setRenameValue(folder.name); 
                              }}
                           >
                             <Edit2 className="h-4 w-4 mr-2" />
                             Rename
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             className="text-red-600 focus:text-red-600"
                             onClick={(e) => { e.stopPropagation(); setDeleteFolderTarget(folder) }}
                           >
                             Delete Folder
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                       <ChevronRight className="h-5 w-5 text-slate-300" />
                     </div>
                   )}
                 </div>
               )
             })}
            {filteredApps.map((app) => {
              const cfg = getConfig(app.template_type)
              const { Icon, iconBgColor, iconColor } = cfg
              const isActive = app.status === 'active'
              const isArchived = app.status === 'archived'
              const isSelected = selectedAppIds.includes(app.app_id)
              return (
                <div
                  key={app.app_id}
                  className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl group transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
                >
                  <div 
                    className="cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleSelectApp(app.app_id, !isSelected); }}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: iconBgColor }}
                  >
                    <Icon className="h-5 w-5" style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#0c4a6e' }}>{app.name}</p>
                    <p className="text-xs truncate" style={{ color: '#0369a1' }}>{app.template_type}</p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-md font-medium flex-shrink-0"
                    style={
                      isActive
                        ? { backgroundColor: 'rgba(5,150,105,0.18)', color: '#34D399' }
                        : isArchived
                        ? { backgroundColor: 'rgba(148,163,184,0.18)', color: '#64748B' }
                        : { backgroundColor: 'rgba(14,165,233,0.12)', color: '#0ea5e9' }
                    }
                  >
                    {isActive ? 'Active' : isArchived ? 'Archived' : 'Draft'}
                  </span>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreviewApp(app)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4 text-slate-500" />
                    </button>
                    <button
                      onClick={() => router.push(`/apps/${app.app_id}/edit`)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit"
                    >
                      <Code className="h-4 w-4 text-slate-500" />
                    </button>
                    {!isArchived && (
                      <button
                        onClick={() => handleArchive(app)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Archive"
                      >
                        <Archive className="h-4 w-4 text-slate-500" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isBulkDeleting}
        onOpenChange={setIsBulkDeleting}
        title="Delete Selected Apps"
        description={`Are you sure you want to delete ${selectedAppIds.length} selected apps? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={confirmBulkDelete}
        loading={bulkDeleteMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete App"
        description={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={deleteAppMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteFolderTarget}
        onOpenChange={(open) => { if (!open) setDeleteFolderTarget(null) }}
        title="Delete Folder"
        description={`Delete "${deleteFolderTarget?.name}"? This will also delete all apps inside this folder. If you want to keep them, please move them to another folder first.`}
        confirmText="Delete Everything"
        onConfirm={handleConfirmDeleteFolder}
        loading={deleteFolderMutation.isPending}
      />

      {/* Preview Modal */}
      {previewApp && (
        <AppPreviewModal
          isOpen={!!previewApp}
          onClose={() => setPreviewApp(null)}
          app={previewApp}
          config={previewApp.config ?? {}}
          contentUrl={previewApp.preview_url || undefined}
        />
      )}
    </div>
  )
}
