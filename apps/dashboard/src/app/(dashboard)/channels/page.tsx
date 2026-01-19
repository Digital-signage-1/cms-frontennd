'use client'

import { Button, Input } from '@/components/ui'
import { GlassCard } from '@/components/ui/glass-card'
import { useChannels } from '@/hooks/queries'
import { Plus, Search, Monitor, Layers, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { fadeInUpVariants, staggerChildrenVariants, hoverLiftVariants } from '@/lib/animations'
import { formatDate } from '@/lib/utils'

const LayoutPreview = ({ layout }: { layout: string }) => {
  const layouts: Record<string, JSX.Element> = {
    'SINGLE': (
      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg" />
    ),
    'SPLIT_HORIZONTAL': (
      <div className="w-full h-full flex gap-1">
        <div className="flex-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg" />
        <div className="flex-1 bg-gradient-to-br from-success/20 to-success/5 rounded-lg" />
      </div>
    ),
    'SPLIT_VERTICAL': (
      <div className="w-full h-full flex flex-col gap-1">
        <div className="flex-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg" />
        <div className="flex-1 bg-gradient-to-br from-warning/20 to-warning/5 rounded-lg" />
      </div>
    ),
    'CUSTOM': (
      <div className="w-full h-full flex gap-1">
        <div className="w-1/2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg" />
        <div className="w-1/2 flex flex-col gap-1">
          <div className="flex-1 bg-gradient-to-br from-success/20 to-success/5 rounded-lg" />
          <div className="flex-1 bg-gradient-to-br from-warning/20 to-warning/5 rounded-lg" />
        </div>
      </div>
    ),
    'GRID_2X2': (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg" />
        <div className="bg-gradient-to-br from-success/20 to-success/5 rounded-lg" />
        <div className="bg-gradient-to-br from-warning/20 to-warning/5 rounded-lg" />
        <div className="bg-gradient-to-br from-info/20 to-info/5 rounded-lg" />
      </div>
    ),
  }

  return layouts[layout] || layouts['SINGLE']
}

export default function ChannelsPage() {
  const router = useRouter()
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''
  const { data: channels = [], isLoading: channelsLoading } = useChannels(workspaceId)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChannels = Array.isArray(channels) 
    ? channels.filter((channel: any) =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <motion.div
      variants={staggerChildrenVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background"
    >
      <div className="glass-light sticky top-0 z-10 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <motion.div variants={fadeInUpVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Layout Studio</h1>
              <p className="text-sm text-text-secondary mt-1">
                Design and manage your screen layouts
              </p>
            </div>
            <Link href="/channels/new">
              <Button className="bg-primary hover:bg-primary-hover text-white shadow-lg border-0 gap-2 rounded-xl">
                <Plus className="h-4 w-4" /> Create Channel
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeInUpVariants} className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-surface/50 border-border/50 focus:border-primary/30 rounded-xl"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {channelsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-96 bg-surface/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredChannels.length === 0 ? (
          channels.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold text-text-primary mb-2">
                Start with a template
              </h3>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Choose a layout template or build your own custom design
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  { id: 'SINGLE', label: 'Single Zone', description: 'Full screen content' },
                  { id: 'SPLIT_HORIZONTAL', label: '2-Zone Split', description: 'Side by side layout' },
                  { id: 'CUSTOM', label: 'L-Shape', description: 'Featured with sidebar' },
                ].map(template => (
                  <button
                    key={template.id}
                    onClick={() => router.push(`/channels/new?template=${template.id}`)}
                    className="p-6 border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all bg-surface group"
                  >
                    <div className="h-32 mb-4 rounded-lg overflow-hidden border border-border">
                      <LayoutPreview layout={template.id} />
                    </div>
                    <p className="text-sm font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                      {template.label}
                    </p>
                    <p className="text-xs text-text-muted">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6"
              >
                <Layers className="h-12 w-12 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-text-primary mb-2">
                No channels found
              </h3>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Try adjusting your search query
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredChannels.map((channel: any, index) => (
              <motion.div
                key={channel.channel_id}
                variants={hoverLiftVariants}
                initial="rest"
                whileHover="hover"
                custom={index}
              >
                <Link href={`/channels/${channel.channel_id}/studio`}>
                  <GlassCard variant="light" className="overflow-hidden h-full">
                    <div className="relative h-64 -mx-6 -mt-6 mb-4 bg-gradient-to-br from-surface-alt to-surface">
                      <div className="absolute inset-0 p-8">
                        <LayoutPreview layout={channel.layout_type} />
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-surface/90 hover:bg-primary text-text-primary hover:text-white shadow-lg backdrop-blur-sm rounded-lg"
                          >
                            Edit Layout
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-surface/90 hover:bg-surface border-border/50 backdrop-blur-sm rounded-lg"
                          >
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-text-primary mb-1">
                          {channel.name}
                        </h3>
                        {channel.description && (
                          <p className="text-sm text-text-secondary line-clamp-2">
                            {channel.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                          <div className="flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5" />
                            <span>{channel.zone_count || 0} zones</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Monitor className="h-3.5 w-3.5" />
                            <span>{channel.player_count || 0} players</span>
                          </div>
                        </div>
                        <span className="text-xs text-text-muted">
                          {formatDate(channel.updated_at)}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
