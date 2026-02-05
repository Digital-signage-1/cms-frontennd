'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Input, Label, Textarea } from '@/components/ui'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { useAuthStore } from '@/stores/auth-store'
import { useCreateChannel } from '@/hooks/queries/useChannels'
import { useApps } from '@/hooks/queries'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Grid, Layout, Layers, Plus, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { fadeInUpVariants, staggerChildrenVariants } from '@/lib/animations'
import { LAYOUT_TEMPLATES, getAllLayoutTemplates, type LayoutTemplate } from '@/lib/layout-templates'

// Get layout templates from centralized configuration
const layoutTemplates = getAllLayoutTemplates()

export default function CreateChannelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setBreadcrumbItems, clearBreadcrumbs } = useBreadcrumb()
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate | null>(null)
  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')
  const [currentStep, setCurrentStep] = useState<'template' | 'details' | 'zones'>('template')

  const createChannelMutation = useCreateChannel()
  const { data: appsData } = useApps(workspaceId)

  useEffect(() => {
    setBreadcrumbItems([
      { label: 'Channels', href: '/channels' },
      { label: 'Create New Channel' }
    ])

    // Check if template is pre-selected from URL
    const templateId = searchParams.get('template')
    if (templateId) {
      const template = layoutTemplates.find(t => t.id === templateId)
      if (template) {
        setSelectedTemplate(template)
        setCurrentStep('details')
      }
    }

    return () => clearBreadcrumbs()
  }, [setBreadcrumbItems, clearBreadcrumbs, searchParams])

  const handleTemplateSelect = (template: LayoutTemplate) => {
    setSelectedTemplate(template)
    setCurrentStep('details')
  }

  const handleCreateChannel = async () => {
    if (!selectedTemplate || !channelName.trim()) return

    try {
      const result = await createChannelMutation.mutateAsync({
        workspaceId,
        data: {
          name: channelName.trim(),
          description: channelDescription.trim() || undefined,
          layout_type: selectedTemplate.id,
          background: { type: 'color', value: '#1a1a2e' },
        }
      })

      // Navigate to channel studio
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
                {currentStep === 'template' && 'Choose a layout template to get started'}
                {currentStep === 'details' && 'Enter channel details and settings'}
                {currentStep === 'zones' && 'Configure zones and add content'}
              </p>
            </div>
          </motion.div>

          {/* Progress Steps */}
          <motion.div variants={fadeInUpVariants} className="flex items-center gap-4 mt-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${currentStep === 'template'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-surface text-text-muted border border-border'
              }`}>
              <Layout className="h-4 w-4" />
              Layout Template
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${currentStep === 'details'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-surface text-text-muted border border-border'
              }`}>
              <Sparkles className="h-4 w-4" />
              Channel Details
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          {currentStep === 'template' && (
            <motion.div
              key="template"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  Choose a Layout Template
                </h2>
                <p className="text-text-secondary">
                  Select how you want to divide your screen into content zones
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {layoutTemplates.map((template, index) => (
                  <motion.button
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleTemplateSelect(template)}
                    className="group p-6 bg-surface border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all text-left"
                  >
                    <div className="aspect-video mb-4 rounded-lg overflow-hidden border border-border group-hover:border-primary/30 transition-colors">
                      {template.preview}
                    </div>

                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-text-secondary mb-3">
                      {template.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{template.zones.length} zones</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'details' && selectedTemplate && (
            <motion.div
              key="details"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="max-w-2xl mx-auto"
            >
              <div className="bg-surface border border-border rounded-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    Channel Details
                  </h2>
                  <p className="text-text-secondary">
                    Configure your channel settings for <strong>{selectedTemplate.name}</strong>
                  </p>
                </div>

                {/* Template Preview */}
                <div className="mb-8 p-4 bg-background border border-border rounded-lg">
                  <p className="text-sm text-text-muted mb-3">Selected Layout:</p>
                  <div className="aspect-video w-full max-w-sm mx-auto">
                    {selectedTemplate.preview}
                  </div>
                </div>

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
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('template')}
                    className="flex-1"
                  >
                    Back
                  </Button>
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
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Channel
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}