'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Monitor, Layers, Tv, FileText,
  LayoutGrid, List, ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useChannels } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { formatDate } from '@/lib/utils'

// ── Zone color palette (light pastel per-zone bg gradients) ────────────────
const ZONE_COLORS = [
  'linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 100%)',  // warm light amber
  'linear-gradient(135deg,#F4F2FF 0%,#E8E6FF 100%)',  // light navy blue
  'linear-gradient(135deg,#F4F2FF 0%,#BFDBFE 100%)',  // light blue
  'linear-gradient(135deg,#F0FDF4 0%,#DCFCE7 100%)',  // light green
  'linear-gradient(135deg,#FAF5FF 0%,#EDE9FE 100%)',  // light purple
  'linear-gradient(135deg,#FFF1F2 0%,#FFE4E6 100%)',  // light red
  'linear-gradient(135deg,#FFFBEB 0%,#FEF3C7 100%)',  // light amber
  'linear-gradient(135deg,#F0FDFA 0%,#CCFBF1 100%)',  // light teal
]

// ── Default zone names per layout type ────────────────────────────────────
function defaultZoneNames(layoutType?: string): string[] {
  switch (layoutType) {
    case 'single':           return ['MAIN']
    case 'split_horizontal': return ['LEFT', 'RIGHT']
    case 'split_vertical':   return ['TOP', 'BOTTOM']
    case 'l_shape':          return ['VIDEO', 'TICKER', 'BANNER']
    case 'grid':             return ['ZONE 1', 'ZONE 2', 'ZONE 3', 'ZONE 4']
    case 'custom':           return ['AGENDA', 'CLOCK']
    default:                 return ['FULL']
  }
}

// ── Zone preview block ─────────────────────────────────────────────────────
function Zone({
  name, colorIndex, style,
}: {
  name: string
  colorIndex: number
  style: React.CSSProperties
}) {
  return (
    <div
      className="flex items-center justify-center rounded-sm overflow-hidden"
      style={{ background: ZONE_COLORS[colorIndex % ZONE_COLORS.length], ...style }}
    >
      <span
        className="text-[7px] font-bold tracking-widest select-none"
        style={{ color: 'color-mix(in srgb, var(--color-primary) 45%, transparent)' }}
      >
        {name}
      </span>
    </div>
  )
}

// ── Layout preview renderer ────────────────────────────────────────────────
function ZoneLayoutPreview({ channel }: { channel: any }) {
  const zones: any[] = channel.zones || []
  const names: string[] =
    zones.length > 0
      ? zones.map((z: any) => (z.name || 'ZONE').toUpperCase())
      : defaultZoneNames(channel.layout_type)

  switch (channel.layout_type) {
    case 'single':
      return <Zone name={names[0]} colorIndex={0} style={{ width: '100%', height: '100%' }} />

    case 'split_horizontal':
      return (
        <div className="flex gap-1 w-full h-full">
          <Zone name={names[0] ?? 'LEFT'}  colorIndex={0} style={{ flex: 1, height: '100%' }} />
          <Zone name={names[1] ?? 'RIGHT'} colorIndex={1} style={{ flex: 1, height: '100%' }} />
        </div>
      )

    case 'split_vertical':
      return (
        <div className="flex flex-col gap-1 w-full h-full">
          <Zone name={names[0] ?? 'TOP'}    colorIndex={0} style={{ width: '100%', flex: 1 }} />
          <Zone name={names[1] ?? 'BOTTOM'} colorIndex={1} style={{ width: '100%', flex: 1 }} />
        </div>
      )

    case 'l_shape':
      return (
        <div className="flex gap-1 w-full h-full">
          <Zone name={names[0] ?? 'VIDEO'} colorIndex={1} style={{ width: '62%', height: '100%' }} />
          <div className="flex flex-col gap-1 flex-1">
            <Zone name={names[1] ?? 'TICKER'} colorIndex={3} style={{ width: '100%', flex: 1 }} />
            <Zone name={names[2] ?? 'BANNER'} colorIndex={6} style={{ width: '100%', flex: 1 }} />
          </div>
        </div>
      )

    case 'grid':
      return (
        <div className="grid grid-cols-2 gap-1 w-full h-full">
          {names.slice(0, 4).map((name, i) => (
            <Zone key={i} name={name} colorIndex={i * 2} style={{}} />
          ))}
        </div>
      )

    case 'custom':
    default: {
      const n = zones.length || names.length
      if (n === 1) return <Zone name={names[0]} colorIndex={0} style={{ width: '100%', height: '100%' }} />
      if (n === 2) return (
        <div className="flex gap-1 w-full h-full">
          <Zone name={names[0]} colorIndex={4} style={{ flex: 1, height: '100%' }} />
          <Zone name={names[1]} colorIndex={5} style={{ flex: 1, height: '100%' }} />
        </div>
      )
      if (n === 3) return (
        <div className="flex gap-1 w-full h-full">
          <Zone name={names[0]} colorIndex={1} style={{ width: '62%', height: '100%' }} />
          <div className="flex flex-col gap-1 flex-1">
            <Zone name={names[1]} colorIndex={3} style={{ width: '100%', flex: 1 }} />
            <Zone name={names[2]} colorIndex={6} style={{ width: '100%', flex: 1 }} />
          </div>
        </div>
      )
      return (
        <div className="grid grid-cols-2 gap-1 w-full h-full">
          {names.slice(0, 4).map((name, i) => (
            <Zone key={i} name={name} colorIndex={i * 2} style={{}} />
          ))}
        </div>
      )
    }
  }
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === 'published') {
    return (
      <span
        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: 'rgba(5,150,105,0.18)', color: '#34D399' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#059669' }} />
        Active
      </span>
    )
  }
  if (status === 'draft') {
    return (
      <span
        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        Draft
      </span>
    )
  }
  return null
}

// ── Channel card ───────────────────────────────────────────────────────────
function ChannelCard({ channel }: { channel: any }) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)

  const zoneCount   = channel.zone_count ?? channel.zones?.length ?? 0
  const playerCount = channel.player_count ?? 0
  const w           = channel.layout?.width  ?? 1920
  const h           = channel.layout?.height ?? 1080
  const orient      = channel.layout?.orientation
    ? channel.layout.orientation.charAt(0).toUpperCase() + channel.layout.orientation.slice(1)
    : 'Landscape'

  return (
    <motion.div
      className="rounded-xl overflow-hidden cursor-pointer"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/channels/${channel.id}/studio`)}
    >
      {/* ── Preview area ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: '196px', backgroundColor: 'var(--color-surface-alt)' }}
      >
        {/* TV icon — top-left */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
          >
            <Tv className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </div>

        {/* Status badge — top-right */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={channel.status} />
        </div>

        {/* Zone layout */}
        <div className="absolute inset-0 p-7">
          <ZoneLayoutPreview channel={channel} />
        </div>

        {/* Hover overlay with action buttons */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: 'rgba(0,0,0,0.45)',
              }}
            >
              <div className="flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/channels/${channel.id}/studio`)
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
                >
                  Edit Layout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Info row ── */}
      <div className="px-4 pt-3 pb-3.5">
        <h3 className="text-sm font-bold mb-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
          {channel.name}
        </h3>
        <p className="text-xs mb-2.5" style={{ color: 'var(--color-text-secondary)' }}>
          {w}×{h} · {orient}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <LayoutGrid className="h-3.5 w-3.5" style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{zoneCount} zones</span>
            </div>
            <div className="flex items-center gap-1">
              <Monitor className="h-3.5 w-3.5" style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{playerCount}</span>
            </div>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {formatDate(channel.updated_at)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Status filter type ─────────────────────────────────────────────────────
type StatusFilter = 'all' | 'published' | 'draft'

// ── Page ───────────────────────────────────────────────────────────────────
export default function ChannelsPage() {
  const router      = useRouter()
  const workspace   = useAuthStore((s) => s.workspace)
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)

  const { data: channelsData = [], isLoading } = useChannels(workspaceId)

  const [searchQuery, setSearchQuery]   = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchFocused, setSearchFocused] = useState(false)
  const [viewMode, setViewMode]         = useState<'grid' | 'list'>('grid')
  const [sortOrder, setSortOrder]       = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc'>('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const { setBreadcrumbItems } = useBreadcrumb()
  useEffect(() => {
    setBreadcrumbItems([{ label: 'Layout Studio' }])
  }, [setBreadcrumbItems])

  const channels = Array.isArray(channelsData) ? channelsData : []

  const filteredChannels = channels
    .filter((c: any) => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus =
        statusFilter === 'all' ||
        c.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a: any, b: any) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
        case 'oldest':
          return new Date(a.updated_at || a.created_at || 0).getTime() - new Date(b.updated_at || b.created_at || 0).getTime()
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '')
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '')
        default:
          return 0
      }
    })

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalChannels  = channels.length
  const activeCount    = channels.filter((c: any) => c.status === 'published').length
  const draftCount     = channels.filter((c: any) => c.status === 'draft').length
  const totalZones     = channels.reduce((sum: number, c: any) => sum + (c.zone_count ?? 0), 0)
  const totalPlayers   = channels.reduce((sum: number, c: any) => sum + (c.player_count ?? 0), 0)

  const STAT_CARDS = [
    { label: 'Total Channels',    value: totalChannels, color: 'var(--color-primary)', iconType: 'tv'      as const },
    { label: 'Active',            value: activeCount,   color: '#059669', iconType: 'dot'     as const },
    { label: 'Drafts',            value: draftCount,    color: 'var(--color-text-muted)', iconType: 'file'    as const },
    { label: 'Total Zones',       value: totalZones,    color: '#818CF8', iconType: 'zones'   as const },
    { label: 'Connected Players', value: totalPlayers,  color: '#60A5FA', iconType: 'monitor' as const },
  ]

  const FILTER_TABS: { label: string; value: StatusFilter }[] = [
    { label: 'All Channels', value: 'all'       },
    { label: 'Active',       value: 'published' },
    { label: 'Draft',        value: 'draft'     },
  ]

  return (
    <div className="page-container flex flex-col h-full" style={{ backgroundColor: '#f0f9ff' }}>

      {/* ── Hero banner ───────────────────────────────────────── */}
      <div className="flex-shrink-0 space-y-4 sm:space-y-5 pb-4 sm:pb-5">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-xl"
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
              'linear-gradient(color-mix(in srgb, var(--color-primary) 6%, transparent) 1px,transparent 1px),' +
              'linear-gradient(90deg,color-mix(in srgb, var(--color-primary) 6%, transparent) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Title row */}
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between responsive-hero pb-2 gap-2">
          <div>
            <p
              className="text-[10px] uppercase font-semibold mb-0.5"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}
            >
              Layout Studio
            </p>
            <h1 className="text-lg sm:text-xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              Channels
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Design and manage your screen layouts. Create zones, assign content, and deploy to players.
            </p>
          </div>

          <Link href="/channels/new">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-90 touch-target self-start sm:self-center"
              style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
            >
              <Plus className="h-4 w-4" />
              Create Channel
            </button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 px-3 sm:px-5 pb-3">
          {STAT_CARDS.map(({ label, value, color, iconType }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(255,255,255,0.75)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 7%, transparent)',
              }}
            >
              {/* Icon */}
              <div
                className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `${color}18` }}
              >
                {iconType === 'dot' ? (
                  <span
                    className="w-3 h-3 rounded-full block"
                    style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
                  />
                ) : iconType === 'tv' ? (
                  <Tv className="h-3.5 w-3.5" style={{ color }} />
                ) : iconType === 'file' ? (
                  <FileText className="h-3.5 w-3.5" style={{ color }} />
                ) : iconType === 'monitor' ? (
                  <Monitor className="h-3.5 w-3.5" style={{ color }} />
                ) : (
                  <Layers className="h-3.5 w-3.5" style={{ color }} />
                )}
              </div>
              {/* Label + value */}
              <div>
                <p className="text-[10px] font-medium leading-tight" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
                <p className="text-sm font-bold leading-tight" style={{ color }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Filter toolbar ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        {/* Status filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scroll-x">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 touch-target"
              style={
                statusFilter === tab.value
                  ? { backgroundColor: '#0ea5e9', color: '#FFFFFF', border: '1px solid #0ea5e9' }
                  : {
                      color: 'var(--color-text-secondary)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-border)',
                    }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: search + view toggle + sort */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="h-9 pl-9 pr-4 text-sm rounded-lg outline-none w-full sm:w-48"
              style={{
                backgroundColor: '#FFFFFF',
                border: `1px solid ${searchFocused ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* View toggle */}
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="p-2 transition-colors"
              style={
                viewMode === 'grid'
                  ? { backgroundColor: '#0ea5e9', color: '#FFFFFF' }
                  : { backgroundColor: '#FFFFFF', color: '#6b7280' }
              }
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 transition-colors"
              style={
                viewMode === 'list'
                  ? { backgroundColor: '#0ea5e9', color: '#FFFFFF' }
                  : { backgroundColor: '#FFFFFF', color: '#6b7280' }
              }
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 h-9 px-3 text-sm rounded-lg"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd', color: '#0369a1' }}
            >
              {sortOrder === 'newest' ? 'Newest First' : sortOrder === 'oldest' ? 'Oldest First' : sortOrder === 'name_asc' ? 'Name A–Z' : 'Name Z–A'}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div
                  className="absolute right-0 top-full mt-1 z-20 rounded-lg py-1 shadow-lg min-w-[150px]"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
                >
                  {([
                    { value: 'newest' as const, label: 'Newest First' },
                    { value: 'oldest' as const, label: 'Oldest First' },
                    { value: 'name_asc' as const, label: 'Name A–Z' },
                    { value: 'name_desc' as const, label: 'Name Z–A' },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortOrder(opt.value); setShowSortMenu(false) }}
                      className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-sky-50"
                      style={{ color: sortOrder === opt.value ? '#0ea5e9' : '#0369a1', fontWeight: sortOrder === opt.value ? 600 : 400 }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
      </div>

      {/* ── Channel grid (scrollable) ─────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-4 sm:pb-5">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-xl animate-pulse"
              style={{ backgroundColor: '#FFFFFF', height: '280px' }}
            />
          ))}
        </div>
      ) : channels.length === 0 ? (
        /* Empty state — no channels yet */
        <div className="py-20 text-center">
          <Layers className="h-10 w-10 mx-auto mb-3 opacity-25" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            No channels yet
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Create your first channel to start designing screen layouts
          </p>
          <Link href="/channels/new">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
            >
              <Plus className="h-4 w-4" />
              Create Channel
            </button>
          </Link>
        </div>
      ) : filteredChannels.length === 0 ? (
        /* No results */
        <div className="py-16 text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No channels match your search
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {filteredChannels.map((channel: any) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </motion.div>
      ) : (
        /* List view */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col gap-2"
        >
          {filteredChannels.map((channel: any) => {
            const zoneCount   = channel.zone_count ?? channel.zones?.length ?? 0
            const playerCount = channel.player_count ?? 0
            const w           = channel.layout?.width  ?? 1920
            const h           = channel.layout?.height ?? 1080
            const orient      = channel.layout?.orientation
              ? channel.layout.orientation.charAt(0).toUpperCase() + channel.layout.orientation.slice(1)
              : 'Landscape'

            return (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-sky-50/50"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
                onClick={() => router.push(`/channels/${channel.id}/studio`)}
              >
                {/* Zone preview thumbnail */}
                <div
                  className="flex-shrink-0 w-12 h-8 sm:w-16 sm:h-10 rounded-lg overflow-hidden p-1"
                  style={{ backgroundColor: '#e0f2fe' }}
                >
                  <ZoneLayoutPreview channel={channel} />
                </div>

                {/* Name + resolution */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate" style={{ color: '#0c4a6e' }}>
                    {channel.name}
                  </h3>
                  <p className="text-xs" style={{ color: '#0369a1' }}>
                    {w}x{h} · {orient}
                  </p>
                </div>

                {/* Status */}
                <StatusBadge status={channel.status} />

                {/* Stats - hidden on mobile */}
                <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <LayoutGrid className="h-3.5 w-3.5" style={{ color: '#0369a1' }} />
                    <span className="text-xs" style={{ color: '#0369a1' }}>{zoneCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Monitor className="h-3.5 w-3.5" style={{ color: '#0369a1' }} />
                    <span className="text-xs" style={{ color: '#0369a1' }}>{playerCount}</span>
                  </div>
                </div>

                {/* Date - hidden on mobile */}
                <span className="hidden md:block text-xs flex-shrink-0" style={{ color: '#0369a1' }}>
                  {formatDate(channel.updated_at)}
                </span>
              </motion.div>
            )
          })}
        </motion.div>
      )}
      </div>
    </div>
  )
}
