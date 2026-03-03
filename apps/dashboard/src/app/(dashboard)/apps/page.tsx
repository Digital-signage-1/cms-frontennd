'use client'

import {
  Search, Plus, AlertCircle, ImageIcon, FileVideo, Globe, Code,
  Clock, Cloud, LayoutGrid, Youtube, FileText, Sparkles, Play,
  MessageSquare, Grid2X2, List,
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useApps, useDeleteApp } from '@/hooks/queries/useApps'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { formatDate } from '@/lib/utils'
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
  iconColor: '#C4B5FD',
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
function AppCard({ app, onEdit, onDelete }: { app: SignageApp; onEdit: () => void; onDelete: () => void }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false)
  const cfg = getConfig(app.template_type)
  const { Icon, iconBgColor, iconColor, tags, defaultDesc, category } = cfg
  const description = app.description || defaultDesc
  const version = (app as any).version ? `v${(app as any).version}` : 'v1.0.0'
  const playerCount = (app as any).player_count ?? 0
  const dateStr = formatDate(app.updated_at ?? app.created_at)

  const isActive  = app.status === 'active'
  const isDraft   = app.status === 'draft'

  const thumbUrl = app.thumbnail_url || app.preview_url
  const showThumb = thumbUrl && !thumbnailFailed

  return (
    <div
      className="group rounded-xl overflow-hidden flex flex-col"
      style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
    >
      {/* ── Preview area ── */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 196, backgroundColor: '#111827' }}>
        {showThumb ? (
          <>
            <img
              src={app.thumbnail_url || app.preview_url || ''}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setThumbnailFailed(true)}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 50%, transparent 100%)' }}
            />
          </>
        ) : null}
        {/* Category badge — top left */}
        <div
          className="absolute top-3 left-3 z-10 text-xs px-2.5 py-1 rounded-md font-medium"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {category}
        </div>

        {/* Status badge — top right */}
        <div
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium"
          style={
            isActive
              ? { backgroundColor: 'rgba(5,150,105,0.18)', color: '#34D399', border: '1px solid rgba(5,150,105,0.3)' }
              : isDraft
              ? { backgroundColor: 'rgba(245,166,36,0.18)', color: '#F5A624', border: '1px solid rgba(245,166,36,0.3)' }
              : { backgroundColor: 'rgba(100,116,139,0.18)', color: '#94A3B8', border: '1px solid rgba(100,116,139,0.3)' }
          }
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: isActive ? '#34D399' : isDraft ? '#F5A624' : '#94A3B8',
            }}
          />
          {isActive ? 'Active' : isDraft ? 'Draft' : 'Archived'}
        </div>

        {/* Centered icon (show when no thumbnail or thumbnail failed to load) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-0 ${showThumb ? 'opacity-0' : ''}`}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon className="h-9 w-9" style={{ color: iconColor }} />
          </div>
        </div>

        {/* Hover overlay with action buttons */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#1C1C1C', color: '#FFFFFF', border: '1px solid #3A3A3A' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#2A2A2A')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#1C1C1C')}
          >
            Configure
          </button>
        </div>
      </div>

      {/* ── Info area ── */}
      <div className="p-4 flex flex-col flex-1" style={{ borderTop: '1px solid #2A2A2A' }}>
        {/* Icon + name + version */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon className="h-4 w-4" style={{ color: iconColor }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white leading-tight truncate">{app.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{version}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: '#6B7280' }}>
          {description}
        </p>

        {/* Feature tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" style={{ color: '#6B7280' }} />
            <span className="text-xs" style={{ color: '#6B7280' }}>{playerCount} players</span>
          </div>
          <span className="text-xs" style={{ color: '#6B7280' }}>{dateStr}</span>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AppsPage() {
  const router = useRouter()
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.id ?? 0
  const { data: apps = [], isLoading, error, refetch } = useApps(workspaceId)
  const deleteAppMutation = useDeleteApp()
  const { setBreadcrumbItems } = useBreadcrumb()

  const [statusFilter,   setStatusFilter]   = useState<StatusTab>('all')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [viewMode,       setViewMode]       = useState<'grid' | 'list'>('grid')
  const [listThumbFailed, setListThumbFailed] = useState<Set<string>>(new Set())

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

  const handleDelete = async (app: SignageApp) => {
    if (!confirm(`Delete "${app.name}"?`)) return
    try {
      await deleteAppMutation.mutateAsync({ workspaceId, appId: app.id })
    } catch (err) {
      console.error('Failed to delete app:', err)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0D0D0D' }}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#DC2626' }} />
          <h2 className="text-lg font-semibold text-white mb-2">Failed to load apps</h2>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: '#F5A624', color: '#000000' }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }}>

      {/* ── Hero Banner ── */}
      <div className="px-5 pt-5">
        <div
          className="rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)',
            border: '1px solid #2A3050',
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 px-6 pt-6 pb-5">
            {/* Top row */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{ color: '#F5A624' }}
                >
                  App Gallery
                </p>
                <h1 className="text-4xl font-bold text-white mb-2">Apps</h1>
                <p className="text-sm max-w-xl" style={{ color: '#6B7280' }}>
                  Browse, configure, and deploy apps to your display network. Extend your screens with powerful widgets.
                </p>
              </div>
              <button
                onClick={() => router.push('/apps/create')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm flex-shrink-0 mt-1"
                style={{ backgroundColor: '#F5A624', color: '#000000' }}
              >
                <Plus className="h-4 w-4" />
                New App
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-5 gap-3">
              {/* Total Apps */}
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                >
                  📦
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>Total Apps</p>
                  <p className="text-xl font-bold" style={{ color: '#F5A624' }}>{stats.total}</p>
                </div>
              </div>

              {/* Active */}
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22C55E' }} />
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>Active</p>
                  <p className="text-xl font-bold" style={{ color: '#34D399' }}>{stats.active}</p>
                </div>
              </div>

              {/* Drafts */}
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                >
                  📝
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>Drafts</p>
                  <p className="text-xl font-bold" style={{ color: '#F5A624' }}>{stats.draft}</p>
                </div>
              </div>

              {/* Archived */}
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                >
                  🗂
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>Archived</p>
                  <p className="text-xl font-bold text-white">{stats.archived}</p>
                </div>
              </div>

              {/* Deployments */}
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ backgroundColor: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                >
                  🚀
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>Deployments</p>
                  <p className="text-xl font-bold" style={{ color: '#60A5FA' }}>{stats.deployments}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-5 py-4 flex items-center gap-3 flex-wrap">
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
                    ? { backgroundColor: '#F5A624', color: '#000000' }
                    : { color: '#9CA3AF' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-5 flex-shrink-0" style={{ backgroundColor: '#2A2A2A' }} />

        {/* Category tabs */}
        <div className="flex items-center gap-1">
          {CATEGORIES.map((cat) => {
            const isActive = categoryFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  isActive
                    ? { backgroundColor: '#2A2A2A', color: '#FFFFFF', border: '1px solid #3A3A3A' }
                    : { color: '#6B7280' }
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
              style={{ color: '#6B7280' }}
            />
            <input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none w-48"
              style={{
                backgroundColor: '#1C1C1C',
                border: '1px solid #2A2A2A',
                color: '#FFFFFF',
              }}
            />
          </div>

          <button
            onClick={() => setViewMode('grid')}
            className="p-2 rounded-lg transition-colors"
            style={
              viewMode === 'grid'
                ? { backgroundColor: '#F5A624', color: '#000000' }
                : { backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', color: '#6B7280' }
            }
          >
            <Grid2X2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setViewMode('list')}
            className="p-2 rounded-lg transition-colors"
            style={
              viewMode === 'list'
                ? { backgroundColor: '#F5A624', color: '#000000' }
                : { backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', color: '#6B7280' }
            }
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── App grid ── */}
      <div className="px-5 pb-5">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-xl animate-pulse"
                style={{ height: 360, backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-xl flex flex-col items-center justify-center py-20"
            style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
          >
            <Sparkles className="h-10 w-10 mb-4" style={{ color: '#2A2A2A' }} />
            <p className="text-sm font-medium text-white mb-1">
              {searchQuery ? 'No apps found' : 'No apps yet'}
            </p>
            <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Create your first app to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/apps/create')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: '#F5A624', color: '#000000' }}
              >
                <Plus className="h-4 w-4" /> Create App
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((app) => (
              <AppCard
                key={app.app_id}
                app={app}
                onEdit={() => router.push(`/apps/${app.id}/edit`)}
                onDelete={() => handleDelete(app)}
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
                  style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
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
                    <p className="text-sm font-semibold text-white truncate">{app.name}</p>
                    <p className="text-xs truncate" style={{ color: '#6B7280' }}>{app.template_type}</p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-md font-medium flex-shrink-0"
                    style={
                      isActive
                        ? { backgroundColor: 'rgba(5,150,105,0.18)', color: '#34D399' }
                        : isDraft
                        ? { backgroundColor: 'rgba(245,166,36,0.18)', color: '#F5A624' }
                        : { backgroundColor: 'rgba(100,116,139,0.18)', color: '#94A3B8' }
                    }
                  >
                    {isActive ? 'Active' : isDraft ? 'Draft' : 'Archived'}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: '#6B7280' }}>
                    {playerCount} players
                  </span>
                  <button
                    onClick={() => router.push(`/apps/${app.id}/edit`)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium flex-shrink-0"
                    style={{ backgroundColor: '#2A2A2A', color: '#9CA3AF', border: '1px solid #3A3A3A' }}
                  >
                    Edit
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
