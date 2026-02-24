'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Label, Textarea } from '@/components/ui'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { useAuthStore } from '@/stores/auth-store'
import { useCreateChannel } from '@/hooks/queries/useChannels'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { fadeInUpVariants, staggerChildrenVariants } from '@/lib/animations'

export default function CreateChannelPage() {
  const router = useRouter()
  const { setBreadcrumbItems, clearBreadcrumbs } = useBreadcrumb()
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')

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
          layout_type: 'SINGLE',
          background: { type: 'color', value: '#1a1a2e' },
          slides: [],
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
                Add a channel, then add slides and zones in the studio
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-8">
        <motion.div variants={fadeInUpVariants} className="bg-surface border border-border rounded-xl p-8">
          <div className="space-y-6">
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
                className="resize-none h-24"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
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
