'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button, Input, Label, Select, Skeleton } from '@/components/ui'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { FormFieldRenderer } from '@/components/apps/FormFieldRenderer'
import { ContentSelector } from '@/components/apps/ContentSelector'
import { AppPreview } from '@/components/apps/AppPreview'
import { AppPreviewModal } from '@/components/apps/AppPreviewModal'
import {
  FileImage, FileVideo, Globe, Code, Clock, Cloud, Layout, Youtube,
  FileText, Sparkles, AlertCircle, Trash2, Loader2, ArrowLeft,
  Settings2, Eye, Link2, Info, ChevronDown, ChevronUp, Save,
  CalendarDays, RefreshCw
} from 'lucide-react'
import { StatusDot } from '@/components/ui/status-dot'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuthStore } from '@/stores/auth-store'
import { useApp, useUpdateApp, useDeleteApp } from '@/hooks/queries/useApps'
import { useContent, useContentItem } from '@/hooks/queries'
import { api } from '@/services/api'
import type { Content, App } from '@signage/types'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'

interface FormField {
  name: string
  label: string
  type: string
  required?: boolean
  description?: string
  placeholder?: string
  default_value?: any
  validation?: any
}

const getAppIcon = (icon: string) => {
  const iconMap: Record<string, any> = {
    'photo': FileImage,
    'image': FileImage,
    'video': FileVideo,
    'pdf': FileText,
    'web': Globe,
    'html': Code,
    'clock': Clock,
    'weather': Cloud,
    'slideshow': Layout,
    'youtube': Youtube,
  }
  return iconMap[icon] || Sparkles
}

const statusConfig: Record<string, { label: string; dot: 'online' | 'pending' | 'offline'; bg: string; text: string; border: string }> = {
  active: { label: 'Active', dot: 'online', bg: 'bg-[rgba(16,185,129,0.08)]', text: 'text-[#10b981]', border: 'border-[rgba(16,185,129,0.16)]' },
  draft: { label: 'Draft', dot: 'pending', bg: 'bg-[rgba(245,158,11,0.08)]', text: 'text-[#f59e0b]', border: 'border-[rgba(245,158,11,0.16)]' },
  archived: { label: 'Archived', dot: 'offline', bg: 'bg-[rgba(107,114,128,0.08)]', text: 'text-[var(--color-text-muted)]', border: 'border-[rgba(107,114,128,0.16)]' },
}

/* ───────── Section wrapper ───────── */
function Section({ icon: IconComp, title, description, children, defaultOpen = true }: {
  icon: any; title: string; description?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-xl overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-alt/40 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-[color-mix(in srgb, var(--color-primary) 10%, transparent)] flex items-center justify-center flex-shrink-0">
          <IconComp className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {description && <p className="text-xs text-text-muted mt-0.5 truncate">{description}</p>}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-border-subtle">
          {children}
        </div>
      )}
    </motion.div>
  )
}

export default function EditAppPage() {
  const router = useRouter()
  const params = useParams()
  const appId = params?.id as string
  const { setBreadcrumbItems, clearBreadcrumbs } = useBreadcrumb()

  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contentSelectorOpen, setContentSelectorOpen] = useState(false)
  const [contentSelectorField, setContentSelectorField] = useState<string>('')
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedDevice] = useState<'tv-landscape' | 'tv-portrait' | 'tablet' | 'custom'>('tv-landscape')
  const [fullscreenPreview, setFullscreenPreview] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false)

  const { data: app, isLoading: isLoadingApp } = useApp(workspaceId, appId)
  const { data: contentData } = useContent(workspaceId, {})
  const { data: currentContentItem } = useContentItem(workspaceId, formData.content_id || app?.content_id || '')
  const updateAppMutation = useUpdateApp()
  const deleteAppMutation = useDeleteApp()

  useEffect(() => {
    if (app) {
      setBreadcrumbItems([
        { label: 'Apps', href: '/apps' },
        { label: app.name }
      ])
      setFormData({
        name: app.name,
        description: app.description || '',
        status: app.status,
        content_id: app.content_id,
        ...(app.config || {})
      })
    }
    return () => { clearBreadcrumbs() }
  }, [app, setBreadcrumbItems, clearBreadcrumbs])

  const { data: schemaData, isLoading: isLoadingSchema } = useQuery({
    queryKey: ['app-type-schema', app?.template_type],
    queryFn: () => api.apps.getAppTypeSchema(app!.template_type),
    enabled: !!app,
  })

  const schema = schemaData?.schema
  const metadata = schemaData?.metadata
  const Icon = metadata ? getAppIcon(metadata.icon) : Sparkles

  const contentAcceptedTypes = useMemo(() => {
    const contentField = schema?.fields?.find((f: FormField) => f.name === 'content_id' && f.type === 'file_upload')
    const accept = contentField?.validation?.accept as string[] | undefined
    return accept?.length ? accept : undefined
  }, [schema])

  const contentFilterType = useMemo(() => {
    if (!app?.template_type) return undefined
    const map: Record<string, 'image' | 'video' | 'pdf' | 'audio' | 'document'> = {
      image: 'image', video: 'video', pdf: 'pdf', slideshow: 'document', docx: 'document',
    }
    return map[app.template_type]
  }, [app?.template_type])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    }
  }

  const handleContentSelect = (content: Content) => {
    if (contentSelectorField === 'content_id') {
      handleChange('content_id', content.content_id)
    } else {
      handleChange(contentSelectorField, content.content_id)
    }
    setContentSelectorField('')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name?.trim()) newErrors.name = 'App name is required'
    if (schema?.fields) {
      schema.fields.forEach((field: FormField) => {
        if (field.required && !formData[field.name]) {
          newErrors[field.name] = `${field.label} is required`
        }
      })
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    try {
      const config: Record<string, any> = {}
      if (schema?.fields) {
        schema.fields.forEach((field: FormField) => {
          if (formData[field.name] !== undefined && field.name !== 'content_id') {
            config[field.name] = formData[field.name]
          }
        })
      }
      await updateAppMutation.mutateAsync({
        workspaceId, appId,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          status: formData.status,
          content_id: formData.content_id,
          config,
        }
      })
      setHasChanges(false)
      router.push('/apps')
    } catch (error) {
      console.error('Failed to update app:', error)
      setErrors({ submit: 'Failed to update app. Please try again.' })
    }
  }

  const handleDelete = () => setShowDeleteConfirm(true)

  const confirmDelete = async () => {
    try {
      await deleteAppMutation.mutateAsync({ workspaceId, appId })
      router.push('/apps')
    } catch (error) {
      console.error('Failed to delete app:', error)
      setErrors({ submit: 'Failed to delete app. Please try again.' })
    }
  }

  const handleCancel = () => {
    if (hasChanges) { setShowUnsavedConfirm(true); return }
    router.push('/apps')
  }

  const currentContent = currentContentItem || (Array.isArray(contentData) ? contentData : contentData?.items || []).find((c: Content) => c.content_id === formData.content_id)
  const status = statusConfig[app?.status || 'draft'] || statusConfig.draft

  /* ───────── Loading skeleton ───────── */
  if (isLoadingApp || isLoadingSchema) {
    return (
      <div className="min-h-full bg-background">
        <div className="sticky top-0 z-10 bg-surface border-b border-border px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1"><Skeleton className="h-5 w-48" /><Skeleton className="h-3 w-32 mt-1" /></div>
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    )
  }

  /* ───────── Not found ───────── */
  if (!app || !metadata) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">App Not Found</h2>
          <Button onClick={() => router.push('/apps')}>Back to Apps</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background">
      {/* ── Sticky header bar ── */}
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-14">
            {/* Back */}
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Apps</span>
            </button>

            <div className="w-px h-6 bg-border" />

            {/* App identity */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
              <Icon className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-text-primary truncate">{app.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${status.bg} ${status.text} ${status.border}`}>
                  <StatusDot status={status.dot} size="sm" />
                  {status.label}
                </span>
              </div>
              <p className="text-xs text-text-muted truncate">{metadata.name}</p>
            </div>

            {/* Unsaved indicator */}
            {hasChanges && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.16)] rounded-lg">
                <div className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse" />
                <span className="text-xs font-medium text-warning whitespace-nowrap">Unsaved</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={updateAppMutation.isPending}
                className="hidden sm:inline-flex"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateAppMutation.isPending || !hasChanges}
                className="bg-primary text-white hover:bg-primary-hover gap-1.5"
              >
                {updateAppMutation.isPending ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving</>
                ) : (
                  <><Save className="h-3.5 w-3.5" /> Save</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {errors.submit && (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3 bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.16)] rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-error flex-shrink-0" />
            <p className="text-sm text-error">{errors.submit}</p>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ─── Left column: forms ─── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Settings section */}
            <Section icon={Settings2} title="General Settings" description="Name, description, and status">
              <div className="space-y-4 pt-3">
                <div>
                  <Label htmlFor="name" className="text-xs font-medium text-text-primary mb-1.5 block">
                    App Name <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Lobby Welcome Screen"
                    className={errors.name ? 'border-error' : ''}
                  />
                  {errors.name && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-xs font-medium text-text-primary mb-1.5 block">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of this app..."
                    rows={2}
                    className="w-full px-3 py-2.5 text-sm bg-surface-alt border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-surface focus:ring-[3px] focus:ring-[color-mix(in srgb, var(--color-primary) 15%, transparent)] resize-none text-text-primary placeholder:text-text-muted transition-all"
                  />
                </div>

                <div>
                  <Label htmlFor="status" className="text-xs font-medium text-text-primary mb-1.5 block">
                    Status
                  </Label>
                  <Select
                    id="status"
                    value={formData.status || 'draft'}
                    onValueChange={(val) => handleChange('status', val)}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'draft', label: 'Draft' },
                      { value: 'archived', label: 'Archived' },
                    ]}
                  />
                  <p className="text-[11px] text-text-muted mt-1.5">
                    Active apps can be added to channels and played on screens
                  </p>
                </div>
              </div>
            </Section>

            {/* Configuration section */}
            {schema?.fields?.some((f: FormField) => f.name !== 'content_id') && (
              <Section icon={Settings2} title="App Configuration" description={`Configure how ${metadata.name} displays`}>
                <div className="space-y-4 pt-3">
                  {schema.fields.map((field: FormField) => {
                    if (field.name === 'content_id') return null
                    return (
                      <FormFieldRenderer
                        key={field.name}
                        field={field}
                        value={formData[field.name]}
                        onChange={(value) => handleChange(field.name, value)}
                        error={errors[field.name]}
                        onContentSelect={(fieldName) => {
                          setContentSelectorField(fieldName)
                          setContentSelectorOpen(true)
                        }}
                        formData={formData}
                        workspaceId={workspaceId}
                      />
                    )
                  })}
                </div>
              </Section>
            )}

            {/* Content section */}
            <Section icon={Link2} title="Linked Content" description="Media file used by this app">
              <div className="pt-3">
                {currentContent ? (
                  <div className="flex items-center gap-3 p-3 bg-background border border-border-subtle rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-surface-alt flex items-center justify-center flex-shrink-0">
                      {currentContent.mime_type?.startsWith('image/') ? <FileImage className="h-5 w-5 text-primary" /> :
                       currentContent.mime_type?.startsWith('video/') ? <FileVideo className="h-5 w-5 text-primary" /> :
                       <FileText className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{currentContent.name}</p>
                      <p className="text-xs text-text-muted">{currentContent.mime_type}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setContentSelectorField('content_id'); setContentSelectorOpen(true) }}
                      className="text-primary flex-shrink-0"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Change
                    </Button>
                  </div>
                ) : app.content_id ? (
                  <div className="flex items-center gap-3 p-3 bg-background border border-border-subtle rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-surface-alt flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-text-muted" />
                    </div>
                    <p className="text-sm text-text-muted flex-1 truncate">Content ID: {app.content_id}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setContentSelectorField('content_id'); setContentSelectorOpen(true) }}
                      className="text-primary flex-shrink-0"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 rounded-lg bg-surface-alt flex items-center justify-center mx-auto mb-2">
                      <Link2 className="h-5 w-5 text-text-muted" />
                    </div>
                    <p className="text-sm text-text-muted">No content linked</p>
                    <p className="text-xs text-text-muted mt-0.5 mb-3">This app doesn't use uploaded content</p>
                  </div>
                )}
              </div>
            </Section>

          </div>

          {/* ─── Right column: sidebar info ─── */}
          <div className="lg:col-span-3 space-y-5 lg:sticky lg:top-[4.5rem] lg:self-start">

            {/* Preview section */}
            <Section icon={Eye} title="Preview" description="See how your app looks on screen" defaultOpen={true}>
              <div className="pt-3">
                <AppPreview
                  app={app}
                  config={formData}
                  contentUrl={currentContent?.url}
                  deviceType={selectedDevice}
                  onFullscreen={() => setFullscreenPreview(true)}
                />
              </div>
            </Section>

            {/* App info card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5.5 w-5.5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{metadata.name}</h3>
                  <p className="text-xs text-text-muted truncate">{metadata.description}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { icon: Info, label: 'Type', value: app.template_type },
                  { icon: CalendarDays, label: 'Created', value: formatDate(app.created_at) },
                  { icon: RefreshCw, label: 'Updated', value: formatDate(app.updated_at) },
                ].map(({ icon: RowIcon, label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-text-muted">
                      <RowIcon className="h-3 w-3" />{label}
                    </span>
                    <span className="text-text-primary font-medium capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick content preview thumbnail */}
            {currentContent && currentContent.mime_type?.startsWith('image/') && currentContent.url && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border-subtle">
                  <h4 className="text-xs font-semibold text-text-primary">Content Thumbnail</h4>
                </div>
                <div className="p-3">
                  <div className="rounded-lg overflow-hidden bg-background border border-border-subtle">
                    <img
                      src={currentContent.url}
                      alt={currentContent.name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <p className="text-[11px] text-text-muted mt-2 truncate">{currentContent.name}</p>
                </div>
              </motion.div>
            )}

            {/* Danger zone */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Danger Zone</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteAppMutation.isPending}
                className="w-full text-error hover:bg-[rgba(239,68,68,0.06)] hover:border-[rgba(239,68,68,0.16)] gap-1.5 justify-center"
              >
                {deleteAppMutation.isPending ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="h-3.5 w-3.5" /> Delete App</>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky save bar ── */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-20 sm:hidden bg-surface/95 backdrop-blur-md border-t border-border px-4 py-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateAppMutation.isPending}
              className="flex-1 bg-primary text-white hover:bg-primary-hover gap-1.5"
            >
              {updateAppMutation.isPending ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving</>
              ) : (
                <><Save className="h-3.5 w-3.5" /> Save Changes</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete App"
        description={`Are you sure you want to delete "${app?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={deleteAppMutation.isPending}
      />

      <ConfirmDialog
        open={showUnsavedConfirm}
        onOpenChange={setShowUnsavedConfirm}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave?"
        variant="warning"
        confirmText="Leave"
        cancelText="Stay"
        onConfirm={() => router.push('/apps')}
      />

      <ContentSelector
        isOpen={contentSelectorOpen}
        onClose={() => { setContentSelectorOpen(false); setContentSelectorField('') }}
        onSelect={handleContentSelect}
        currentContentId={formData.content_id}
        acceptedTypes={contentAcceptedTypes}
        contentType={contentFilterType}
      />

      <AppPreviewModal
        isOpen={fullscreenPreview}
        onClose={() => setFullscreenPreview(false)}
        app={app}
        config={formData}
        contentUrl={currentContent?.url}
      />
    </div>
  )
}
