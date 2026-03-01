'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Input, Label, Textarea } from '@/components/ui'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { useAuthStore } from '@/stores/auth-store'
import { useCreateChannel } from '@/hooks/queries/useChannels'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { fadeInUpVariants, staggerChildrenVariants } from '@/lib/animations'
import { LAYOUT_TEMPLATES } from '@/lib/layout-templates'
import { cn } from '@/lib/utils'

const layoutOptions = Object.values(LAYOUT_TEMPLATES)

export default function CreateChannelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setBreadcrumbItems, clearBreadcrumbs } = useBreadcrumb()
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const templateParam = searchParams.get('template')
  const initialLayout = templateParam && LAYOUT_TEMPLATES[templateParam] ? templateParam : 'SINGLE'

  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')
  const [selectedLayout, setSelectedLayout] = useState(initialLayout)

  const createChannelMutation = useCreateChannel()

  useEffect(() => {
    setBreadcrumbItems([
      { label: 'Channels', href: '/channels' },
      { label: 'Create New Channel' }
    ])
    return () => clearBreadcrumbs()
  }, [setBreadcrumbItems, clearBreadcrumbs])

  const handleCreateChannel = async () => {
    if (!channelName.trim()) return

    try {
      const result = await createChannelMutation.mutateAsync({
        workspaceId,
        data: {
          name: channelName.trim(),
          description: channelDescription.trim() || undefined,
          layout_type: selectedLayout,
          background: { type: 'color', value: '#1a1a2e' },
        }
      })
      router.push(`/channels/${result.channel_id}/studio`)
    } catch (error) {
      console.error('Failed to create channel:', error)
    }
  }

  return (
    <motion.div
      variants={staggerChildrenVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background"
    >
      <div className="glass-light sticky top-0 z-10 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <motion.div variants={fadeInUpVariants} className="flex items-center gap-4">
            <Link href="/channels">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Channels
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
                Create New Channel
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Choose a layout and name your channel
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
        {/* Layout Selection */}
        <motion.div variants={fadeInUpVariants} className="bg-surface border border-border rounded-xl p-6">
          <Label className="text-sm font-medium text-text-primary mb-4 block">
            Choose Layout
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {layoutOptions.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedLayout(template.id)}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-left',
                  selectedLayout === template.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/40 bg-surface'
                )}
              >
                {selectedLayout === template.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface-alt p-1.5">
                  {template.preview}
                </div>
                <div className="w-full">
                  <p className="text-sm font-medium text-text-primary">{template.name}</p>
                  <p className="text-xs text-text-muted">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Channel Details */}
        <motion.div variants={fadeInUpVariants} className="bg-surface border border-border rounded-xl p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-text-primary">
                Channel Name <span className="text-error">*</span>
              </Label>
              <Input
                id="name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g., Lobby Display, Main Entrance"
                className="h-11"
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateChannel() }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-text-primary">
                Description
              </Label>
              <Textarea
                id="description"
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                placeholder="Optional description of this channel's purpose"
                className="resize-none h-20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
            <Link href="/channels" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleCreateChannel}
              disabled={!channelName.trim() || createChannelMutation.isPending}
              className="flex-1 bg-primary text-white hover:bg-primary-hover"
            >
              {createChannelMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Channel'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
