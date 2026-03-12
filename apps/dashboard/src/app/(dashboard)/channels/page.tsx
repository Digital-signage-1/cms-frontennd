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
        style={{ color: 'rgba(14,165,233,0.45)' }}
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
        style={{ backgroundColor: 'rgba(14,165,233,0.12)', color: '#0ea5e9' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
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
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/channels/${channel.id}/studio`)}
    >
      {/* ── Preview area ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: '196px', backgroundColor: '#e0f2fe' }}
      >
        {/* TV icon — top-left */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd' }}
          >
            <Tv className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
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
              className="absolute inset-0 flex items-end p-3"
              style={{
                background: 'linear-gradient(to top, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.5) 60%, transparent 100%)',
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/channels/${channel.id}/studio`)
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#0ea5e9', color: '#FFFFFF' }}
                >
                  Edit Layout
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'rgba(14,165,233,0.08)',
                    border: '1px solid rgba(14,165,233,0.18)',
                    color: '#0c4a6e',
                  }}
                >
                  Preview
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'rgba(14,165,233,0.08)',
                    border: '1px solid rgba(14,165,233,0.18)',
                    color: '#0c4a6e',
                  }}
                >
                  Duplicate
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Info row ── */}
      <div className="px-4 pt-3 pb-3.5">
        <h3 className="text-sm font-bold mb-1 truncate" style={{ color: '#0c4a6e' }}>
          {channel.name}
        </h3>
        <p className="text-xs mb-2.5" style={{ color: '#0369a1' }}>
          {w}×{h} · {orient}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <LayoutGrid className="h-3.5 w-3.5" style={{ color: '#0369a1' }} />
              <span className="text-xs" style={{ color: '#0369a1' }}>{zoneCount} zones</span>
            </div>
            <div className="flex items-center gap-1">
              <Monitor className="h-3.5 w-3.5" style={{ color: '#0369a1' }} />
              <span className="text-xs" style={{ color: '#0369a1' }}>{playerCount}</span>
            </div>
          </div>
          <span className="text-xs" style={{ color: '#0369a1' }}>
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

  const { setBreadcrumbItems } = useBreadcrumb()
  useEffect(() => {
    setBreadcrumbItems([{ label: 'Layout Studio' }])
  }, [setBreadcrumbItems])

  const channels = Array.isArray(channelsData) ? channelsData : []

  const filteredChannels = channels.filter((c: any) => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus =
      statusFilter === 'all' ||
      c.status === statusFilter
    return matchSearch && matchStatus
  })

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalChannels  = channels.length
  const activeCount    = channels.filter((c: any) => c.status === 'published').length
  const draftCount     = channels.filter((c: any) => c.status === 'draft').length
  const totalZones     = channels.reduce((sum: number, c: any) => sum + (c.zone_count ?? 0), 0)
  const totalPlayers   = channels.reduce((sum: number, c: any) => sum + (c.player_count ?? 0), 0)

  const STAT_CARDS = [
    { label: 'Total Channels',    value: totalChannels, color: '#0ea5e9', iconType: 'tv'      as const },
    { label: 'Active',            value: activeCount,   color: '#059669', iconType: 'dot'     as const },
    { label: 'Drafts',            value: draftCount,    color: '#6b7280', iconType: 'file'    as const },
    { label: 'Total Zones',       value: totalZones,    color: '#818CF8', iconType: 'zones'   as const },
    { label: 'Connected Players', value: totalPlayers,  color: '#60A5FA', iconType: 'monitor' as const },
  ]

  const FILTER_TABS: { label: string; value: StatusFilter }[] = [
    { label: 'All Channels', value: 'all'       },
    { label: 'Active',       value: 'published' },
    { label: 'Draft',        value: 'draft'     },
  ]

  return (
    <div className="page-container space-y-4 sm:space-y-5" style={{ backgroundColor: '#f0f9ff', minHeight: '100%' }}>

      {/* ── Hero banner ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-xl"
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
              'linear-gradient(rgba(14,165,233,0.06) 1px,transparent 1px),' +
              'linear-gradient(90deg,rgba(14,165,233,0.06) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Title row */}
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between responsive-hero pb-2 gap-2">
          <div>
            <p
              className="text-[10px] uppercase font-semibold mb-0.5"
              style={{ color: '#0ea5e9', letterSpacing: '0.15em' }}
            >
              Layout Studio
            </p>
            <h1 className="text-lg sm:text-xl font-bold leading-tight" style={{ color: '#0c4a6e' }}>
              Channels
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#0369a1' }}>
              Design and manage your screen layouts. Create zones, assign content, and deploy to players.
            </p>
          </div>

          <Link href="/channels/new">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-90 touch-target self-start sm:self-center"
              style={{ backgroundColor: '#0ea5e9', color: '#FFFFFF' }}
            >
              <Plus className="h-4 w-4" />
              Create Channel
            </button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="relative grid grid-cols-2 sm:grid-cols-5 gap-2 px-3 sm:px-5 pb-3">
          {STAT_CARDS.map(({ label, value, color, iconType }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(14,165,233,0.07)',
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
                <p className="text-[10px] font-medium leading-tight" style={{ color: '#0369a1' }}>{label}</p>
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
                  ? { backgroundColor: '#0ea5e9', color: '#FFFFFF' }
                  : {
                      color: '#0369a1',
                      backgroundColor: 'transparent',
                      border: '1px solid #bae6fd',
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
              style={{ color: '#6b7280' }}
            />
            <input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="h-9 pl-9 pr-4 text-sm rounded-lg outline-none w-48"
              style={{
                backgroundColor: '#FFFFFF',
                border: `1px solid ${searchFocused ? '#0ea5e9' : '#bae6fd'}`,
                color: '#0c4a6e',
              }}
            />
          </div>

          {/* View toggle */}
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: '1px solid #bae6fd' }}
          >
            <button
              className="p-2 transition-colors"
              style={{ backgroundColor: '#0ea5e9', color: '#FFFFFF' }}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              className="p-2 transition-colors"
              style={{ backgroundColor: '#FFFFFF', color: '#6b7280' }}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Sort */}
          <button
            className="flex items-center gap-2 h-9 px-3 text-sm rounded-lg"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #bae6fd', color: '#0369a1' }}
          >
            Newest First
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>

      {/* ── Channel grid ──────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <Layers className="h-10 w-10 mx-auto mb-3 opacity-25" style={{ color: '#6b7280' }} />
          <p className="text-sm font-medium mb-1" style={{ color: '#0369a1' }}>
            No channels yet
          </p>
          <p className="text-xs mb-4" style={{ color: '#0369a1' }}>
            Create your first channel to start designing screen layouts
          </p>
          <Link href="/channels/new">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#0ea5e9', color: '#FFFFFF' }}
            >
              <Plus className="h-4 w-4" />
              Create Channel
            </button>
          </Link>
        </div>
      ) : filteredChannels.length === 0 ? (
        /* No results */
        <div className="py-16 text-center">
          <p className="text-sm" style={{ color: '#0369a1' }}>
            No channels match your search
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {filteredChannels.map((channel: any) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
