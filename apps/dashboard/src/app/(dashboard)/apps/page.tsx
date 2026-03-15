'use client'

import {
  Search, Plus, AlertCircle, ImageIcon, FileVideo, Globe, Code,
  Clock, Cloud, LayoutGrid, Youtube, FileText, Sparkles, Play,
  Grid2X2, List, Eye,
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useApps, useDeleteApp } from '@/hooks/queries/useApps'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { formatDate } from '@/lib/utils'
import { AppPreviewModal } from '@/components/apps/AppPreviewModal'
import type { App as SignageApp } from '@signage/types'

// ── SVG icon resolver (mirrors create/page.tsx) ────────────────────────────────
const APP_SVG_ICONS = new Set([
  'youtube','image','video','pdf','slideshow','docx','web','html','audio',
  'clock','weather','social','countdown','qrcode','rss_feed','sheets','stock',
  'google-slides','google-calendar','google-docs','google-photos',
  'google-forms','google-maps','looker-studio','google-alerts','iframe',
])
const SVG_ALIAS: Record<string, string> = {
  react: 'html', 'qr-code': 'qrcode', qr: 'qrcode', spreadsheet: 'sheets',
  slides: 'slideshow', picture_as_pdf: 'pdf', photo: 'image',
  view_carousel: 'slideshow', play_circle: 'video', 'cloud-sun': 'weather',
  rss: 'rss_feed', maps: 'web', table: 'sheets',
}
function getAppSvgPath(typeId: string): string | null {
  const key = SVG_ALIAS[typeId] || typeId
  if (APP_SVG_ICONS.has(key)) return `/icons/app-types/${key}.svg`
  return null
}

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
    category: 'Media',
    iconBgColor: 'rgba(59,130,246,0.28)',
    iconColor: '#60A5FA',
    Icon: ImageIcon,
    tags: ['Auto-rotate', 'Ken Burns effect', 'Aspect fit/fill'],
    defaultDesc: 'Display images and photo slideshows on your screens with transitions and timing controls.',
  },
  slideshow: {
    category: 'Media',
    iconBgColor: 'rgba(124,58,237,0.28)',
    iconColor: '#A78BFA',
    Icon: LayoutGrid,
    tags: ['PowerPoint', 'Presentation', 'PPT/PPTX'],
    defaultDesc: 'Display PowerPoint presentations as a slideshow with transitions and timing.',
  },
  video: {
    category: 'Media',
    iconBgColor: 'rgba(5,150,105,0.28)',
    iconColor: '#34D399',
    Icon: Play,
    tags: ['Playlist support', 'Loop modes', 'HD/4K'],
    defaultDesc: 'Stream video content with support for playlists, looping, and scheduled playback.',
  },
  youtube: {
    category: 'Media',
    iconBgColor: 'rgba(239,68,68,0.28)',
    iconColor: '#F87171',
    Icon: Youtube,
    tags: ['Playlist', 'Live stream', 'Auto-play'],
    defaultDesc: 'Stream YouTube videos and playlists directly to your display network.',
  },
  pdf: {
    category: 'Utilities',
    iconBgColor: 'rgba(245,158,11,0.28)',
    iconColor: '#F59E0B',
    Icon: FileText,
    tags: ['Auto-scroll', 'Page control', 'Zoom'],
    defaultDesc: 'Display PDF documents and presentations with smooth page transitions.',
  },
  docx: {
    category: 'Media',
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
    iconColor: '#38BDF8',
    Icon: Cloud,
    tags: ['Real-time', 'Multi-city', '7-day forecast'],
    defaultDesc: 'Display live weather data and forecasts for one or more locations.',
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
const CATEGORIES = ['All', 'Media', 'Social', 'Utilities', 'Data', 'Interactive']
const STATUS_TABS = ['all', 'active', 'draft', 'archived'] as const
type StatusTab = typeof STATUS_TABS[number]

// ── App Card ──────────────────────────────────────────────────────────────────
function AppCard({ app, onEdit, onDelete, onPreview }: { app: SignageApp; onEdit: () => void; onDelete: () => void; onPreview: () => void }) {
  const cfg = getConfig(app.template_type)
  const { Icon, iconBgColor, iconColor } = cfg
  const svgPath = getAppSvgPath(app.template_type)

  const isActive = app.status === 'active'
  const isDraft  = app.status === 'draft'
  const statusColor = isActive ? '#059669' : isDraft ? '#0ea5e9' : '#9ca3af'

  return (
    <div
      className="group rounded-xl overflow-hidden flex flex-col cursor-pointer"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #e0f2fe', transition: 'border-color 0.15s, box-shadow 0.15s' }}
      onClick={onEdit}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#7dd3fc'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(14,165,233,0.10)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#e0f2fe'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      {/* Icon area */}
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ height: 80, backgroundColor: '#f8fbff' }}>
        {svgPath ? (
          <img src={svgPath} alt={app.template_type} className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBgColor }}>
            <Icon className="h-5 w-5" style={{ color: iconColor }} />
          </div>
        )}
        {/* Status dot */}
        <span
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: statusColor }}
          title={isActive ? 'Active' : isDraft ? 'Draft' : 'Archived'}
        />
        {/* Hover: preview button */}
        <button
          onClick={e => { e.stopPropagation(); onPreview() }}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
          style={{ backgroundColor: '#0ea5e9', color: '#FFFFFF' }}
        >
          <Eye className="h-3 w-3" />
          Preview
        </button>
      </div>

      {/* Name */}
      <div className="px-3 py-2" style={{ borderTop: '1px solid #f0f9ff' }}>
        <h3 className="text-xs font-semibold truncate leading-snug" style={{ color: '#0c4a6e' }}>{app.name}</h3>
        <p className="text-[11px] truncate mt-0.5 capitalize" style={{ color: '#94a3b8' }}>{app.template_type.replace(/_/g, ' ')}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AppsPage() {
  const router = useRouter()
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)
  const { data: apps = [], isLoading, error, refetch } = useApps(workspaceId)
  const deleteAppMutation = useDeleteApp()
  const { setBreadcrumbItems } = useBreadcrumb()

  const [statusFilter,   setStatusFilter]   = useState<StatusTab>('all')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [viewMode,       setViewMode]       = useState<'grid' | 'list'>('grid')
  const [listThumbFailed, setListThumbFailed] = useState<Set<string>>(new Set())
  const [previewApp,     setPreviewApp]     = useState<SignageApp | null>(null)
  const [deleteTarget,   setDeleteTarget]   = useState<SignageApp | null>(null)

  useEffect(() => {
    setBreadcrumbItems([{ label: 'Apps' }])
  }, [setBreadcrumbItems])

  const appList: SignageApp[] = Array.isArray(apps) ? apps : []

  // Stats
  const stats = useMemo(() => {
    const active   = appList.filter((a) => a.status === 'active').length
    const draft    = appList.filter((a) => a.status === 'draft').length
    const archived = appList.filter((a) => a.status === 'archived').length
    const deployments = appList.reduce((sum, a) => sum + ((a as any).player_count ?? 0), 0)
    return { total: appList.length, active, draft, archived, deployments }
  }, [appList])

  const filtered = useMemo(() => {
    return appList.filter((a) => {
      const cfg = getConfig(a.template_type)
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus =
        statusFilter === 'all' || a.status === statusFilter
      const matchCategory =
        categoryFilter === 'All' || cfg.category === categoryFilter
      return matchSearch && matchStatus && matchCategory
    })
  }, [appList, statusFilter, categoryFilter, searchQuery])

  const handleDelete = (app: SignageApp) => {
    setDeleteTarget(app)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteAppMutation.mutateAsync({ workspaceId, appId: deleteTarget.id })
    } catch (err) {
      console.error('Failed to delete app:', err)
    }
    setDeleteTarget(null)
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f9ff' }}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#DC2626' }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#0c4a6e' }}>Failed to load apps</h2>
          <p className="text-sm mb-4" style={{ color: '#0369a1' }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: '#0ea5e9', color: '#FFFFFF' }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f0f9ff', minHeight: '100vh' }}>

      {/* ── Sticky Header: Hero + Stats + Toolbar ── */}
      <div className="sticky top-0 z-20" style={{ backgroundColor: '#f0f9ff' }}>

        {/* Hero banner — compact 2-row layout */}
        <div className="page-container pt-3 pb-2">
          <div
            className="rounded-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
              border: '1px solid #bae6fd',
            }}
          >
            {/* Grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative z-10 px-4 sm:px-5 py-4">
              {/* Title row */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#0ea5e9' }}>
                    App Gallery
                  </p>
                  <h1 className="text-xl font-bold" style={{ color: '#0c4a6e' }}>Apps</h1>
                </div>
                <button
                  onClick={() => router.push('/apps/create')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm flex-shrink-0"
                  style={{ backgroundColor: '#0ea5e9', color: '#FFFFFF' }}
                >
                  <Plus className="h-4 w-4" />
                  New App
                </button>
              </div>

              {/* Stat cards row */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { label: 'Total Apps', value: stats.total, color: '#0ea5e9', emoji: '📦' },
                  { label: 'Active', value: stats.active, color: '#34D399', dot: '#22C55E' },
                  { label: 'Drafts', value: stats.draft, color: '#0ea5e9', emoji: '📝' },
                  { label: 'Archived', value: stats.archived, color: '#0c4a6e', emoji: '🗂' },
                  { label: 'Deployments', value: stats.deployments, color: '#0ea5e9', emoji: '🚀' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg p-2.5 flex items-center gap-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.75)', border: '1px solid rgba(14,165,233,0.07)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(14,165,233,0.08)' }}
                    >
                      {s.dot ? (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.dot }} />
                      ) : (
                        <span className="text-xs">{s.emoji}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] leading-tight" style={{ color: '#0369a1' }}>{s.label}</p>
                      <p className="text-sm font-bold leading-tight" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar row */}
        <div className="page-container pb-2 flex flex-col sm:flex-row sm:items-center gap-2.5" style={{ borderBottom: '1px solid #bae6fd' }}>
        {/* Status filter tabs */}
        <div className="flex items-center gap-1">
          {STATUS_TABS.map((s) => {
            const label = s === 'all' ? 'All Apps' : s.charAt(0).toUpperCase() + s.slice(1)
            const isActive = statusFilter === s
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  isActive
                    ? { backgroundColor: '#0ea5e9', color: '#FFFFFF' }
                    : { color: '#0369a1' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-5 flex-shrink-0" style={{ backgroundColor: '#bae6fd' }} />

        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scroll-x flex-shrink-0">
          {CATEGORIES.map((cat) => {
            const isActive = categoryFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  isActive
                    ? { backgroundColor: '#e0f2fe', color: '#0c4a6e', border: '1px solid #bae6fd' }
                    : { color: '#0369a1' }
                }
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Right: search + view toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: '#0369a1' }}
            />
            <input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none w-48"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #bae6fd',
                color: '#0c4a6e',
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
                  ? { backgroundColor: '#0ea5e9', color: '#FFFFFF' }
                  : { backgroundColor: '#FFFFFF', border: '1px solid #bae6fd', color: '#0369a1' }
              }
            >
              <BtnIcon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      </div>{/* end sticky header */}

      {/* ── App grid ── */}
      <div className="page-container pb-5">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-xl animate-pulse"
                style={{ height: 148, backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-xl flex flex-col items-center justify-center py-20"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
          >
            <Sparkles className="h-10 w-10 mb-4" style={{ color: '#bae6fd' }} />
            <p className="text-sm font-medium mb-1" style={{ color: '#0c4a6e' }}>
              {searchQuery ? 'No apps found' : 'No apps yet'}
            </p>
            <p className="text-xs mb-4" style={{ color: '#0369a1' }}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Create your first app to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/apps/create')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: '#0ea5e9', color: '#FFFFFF' }}
              >
                <Plus className="h-4 w-4" /> Create App
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((app) => (
              <AppCard
                key={app.app_id}
                app={app}
                onEdit={() => router.push(`/apps/${app.id}/edit`)}
                onDelete={() => handleDelete(app)}
                onPreview={() => setPreviewApp(app)}
              />
            ))}
          </div>
        ) : (
          /* List view */
          <div className="flex flex-col gap-2">
            {filtered.map((app) => {
              const cfg = getConfig(app.template_type)
              const { Icon, iconBgColor, iconColor } = cfg
              const playerCount = (app as any).player_count ?? 0
              const isActive = app.status === 'active'
              const isDraft  = app.status === 'draft'
              return (
                <div
                  key={app.app_id}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: iconBgColor }}
                  >
                    {(app.thumbnail_url || app.preview_url) && !listThumbFailed.has(app.app_id) ? (
                      <img
                        src={app.thumbnail_url || app.preview_url || ''}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() => setListThumbFailed(prev => new Set(prev).add(app.app_id))}
                      />
                    ) : (
                      <Icon className="h-5 w-5" style={{ color: iconColor }} />
                    )}
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
                        : isDraft
                        ? { backgroundColor: 'rgba(14,165,233,0.12)', color: '#0ea5e9' }
                        : { backgroundColor: 'rgba(100,116,139,0.18)', color: '#6b7280' }
                    }
                  >
                    {isActive ? 'Active' : isDraft ? 'Draft' : 'Archived'}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: '#0369a1' }}>
                    {playerCount} players
                  </span>
                  <button
                    onClick={() => setPreviewApp(app)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium flex-shrink-0 flex items-center gap-1.5"
                    style={{ backgroundColor: 'rgba(14,165,233,0.12)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.3)' }}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                  <button
                    onClick={() => router.push(`/apps/${app.id}/edit`)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium flex-shrink-0"
                    style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}
                  >
                    Edit
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete App"
        description={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={deleteAppMutation.isPending}
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
