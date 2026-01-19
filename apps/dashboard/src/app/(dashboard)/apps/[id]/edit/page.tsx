'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button, Input, Label, Skeleton } from '@/components/ui'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormFieldRenderer } from '@/components/apps/FormFieldRenderer'
import { ContentSelector } from '@/components/apps/ContentSelector'
import { AppPreview } from '@/components/apps/AppPreview'
import { AppPreviewModal } from '@/components/apps/AppPreviewModal'
import { FileImage, FileVideo, Globe, Code, Clock, Cloud, Layout, Youtube, FileText, Sparkles, AlertCircle, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import { StatusDot } from '@/components/ui/status-dot'
import { useAuthStore } from '@/stores/auth-store'
import { useApp, useUpdateApp, useDeleteApp } from '@/hooks/queries/useApps'
import { useContent, useContentItem } from '@/hooks/queries'
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

export default function EditAppPage() {
  const router = useRouter()
  const params = useParams()
  const appId = params?.id as string
  const { setBreadcrumbItems, clearBreadcrumbs } = useBreadcrumb()
  
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const [activeTab, setActiveTab] = useState('configuration')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contentSelectorOpen, setContentSelectorOpen] = useState(false)
  const [contentSelectorField, setContentSelectorField] = useState<string>('')
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<'tv-landscape' | 'tv-portrait' | 'tablet' | 'custom'>('tv-landscape')
  const [fullscreenPreview, setFullscreenPreview] = useState(false)

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
    
    return () => {
      clearBreadcrumbs()
    }
  }, [app, setBreadcrumbItems, clearBreadcrumbs])

  const { data: schemaData, isLoading: isLoadingSchema } = useQuery({
    queryKey: ['app-type-schema', app?.template_type],
    queryFn: async () => {
      if (!app) return null
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/app-types/${app.template_type}/schema`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('signage_access_token')}`
          }
        }
      )
      if (!response.ok) throw new Error('Failed to fetch schema')
      return response.json()
    },
    enabled: !!app
  })

  const schema = schemaData?.schema
  const metadata = schemaData?.metadata

  const Icon = metadata ? getAppIcon(metadata.icon) : Sparkles

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
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

    if (!formData.name?.trim()) {
      newErrors.name = 'App name is required'
    }

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
        workspaceId,
        appId,
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

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${app?.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteAppMutation.mutateAsync({ workspaceId, appId })
      router.push('/apps')
    } catch (error) {
      console.error('Failed to delete app:', error)
      setErrors({ submit: 'Failed to delete app. Please try again.' })
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return
      }
    }
    router.push('/apps')
  }

  if (isLoadingApp || isLoadingSchema) {
    return (
      <div className="min-h-screen bg-background">
        <div className="glass-light sticky top-0 z-20 border-b border-border/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!app || !metadata) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">App Not Found</h2>
          <Button onClick={() => router.push('/apps')}>Back to Apps</Button>
        </div>
      </div>
    )
  }

  const currentContent = currentContentItem || (Array.isArray(contentData) ? contentData : contentData?.items || []).find((c: Content) => c.content_id === formData.content_id)

  return (
    <div className="min-h-screen bg-background">
      <div className="glass-light sticky top-16 z-10 border-b border-border/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{app.name}</h1>
              <p className="text-sm text-text-secondary mt-1">Edit app configuration and settings</p>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                <span className="text-sm font-medium text-warning">Unsaved changes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:sticky lg:top-32 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border rounded-lg p-6"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary mb-1">{metadata.name}</h3>
                  <p className="text-sm text-text-secondary">{metadata.description}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Type</span>
                  <span className="text-text-primary font-medium capitalize">{app.template_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Status</span>
                  <div className="flex items-center gap-2">
                    <StatusDot 
                      status={app.status === 'active' ? 'online' : app.status === 'draft' ? 'pending' : 'offline'} 
                      size="sm"
                    />
                    <span className="text-text-primary font-medium capitalize">{app.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Created</span>
                  <span className="text-text-primary">{formatDate(app.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Last Updated</span>
                  <span className="text-text-primary">{formatDate(app.updated_at)}</span>
                </div>
              </div>
            </motion.div>

            {currentContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface border border-border rounded-lg p-6"
              >
                <h3 className="font-semibold text-text-primary mb-4">Content Preview</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {currentContent.content_type.startsWith('image/') ? <FileImage className="h-5 w-5 text-text-muted" /> :
                     currentContent.content_type.startsWith('video/') ? <FileVideo className="h-5 w-5 text-text-muted" /> :
                     <FileText className="h-5 w-5 text-text-muted" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{currentContent.name}</p>
                      <p className="text-xs text-text-muted">{currentContent.content_type}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleteAppMutation.isPending}
                className="w-full text-error hover:bg-error/10 hover:border-error gap-2"
              >
                {deleteAppMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete App
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="inline-flex h-12 items-center justify-start gap-1 rounded-lg bg-surface p-1 border border-border">
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="configuration" className="space-y-6">
                <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-text-primary mb-4">App Configuration</h3>
                    <p className="text-sm text-text-secondary mb-6">
                      Configure how your {metadata.name} displays and behaves
                    </p>
                  </div>

                  {schema?.fields?.map((field: FormField) => {
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
                      />
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-text-primary mb-4">Linked Content</h3>
                    <p className="text-sm text-text-secondary mb-6">
                      Manage the content displayed by this app
                    </p>
                  </div>

                  {app.content_id ? (
                    <div>
                      <Label className="text-sm font-medium text-text-primary mb-2 block">
                        Current Content
                      </Label>
                      <div className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg mb-4">
                        {currentContent ? (
                          <>
                            {currentContent.content_type.startsWith('image/') ? <FileImage className="h-6 w-6 text-text-muted" /> :
                             currentContent.content_type.startsWith('video/') ? <FileVideo className="h-6 w-6 text-text-muted" /> :
                             <FileText className="h-6 w-6 text-text-muted" />}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text-primary">{currentContent.name}</p>
                              <p className="text-sm text-text-muted">{currentContent.content_type}</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-text-muted">Content ID: {app.content_id}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          setContentSelectorField('content_id')
                          setContentSelectorOpen(true)
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Change Content
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-text-muted mb-4">This app doesn't use uploaded content</p>
                      <p className="text-sm text-text-secondary">
                        Configure it in the Configuration tab
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                <div className="bg-surface border border-border rounded-lg p-6">
                  <div className="mb-6">
                    <h3 className="font-semibold text-text-primary mb-2">App Preview</h3>
                    <p className="text-sm text-text-secondary">
                      See how your app will look when displayed in a channel
                    </p>
                  </div>
                  <AppPreview
                    app={app}
                    config={formData}
                    contentUrl={currentContent?.url}
                    deviceType={selectedDevice}
                    onFullscreen={() => setFullscreenPreview(true)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-text-primary mb-4">App Settings</h3>
                    <p className="text-sm text-text-secondary mb-6">
                      Update basic information and status
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-text-primary mb-2 block">
                      App Name <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g., Lobby Welcome Screen"
                      className={errors.name ? 'border-error' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-error mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-text-primary mb-2 block">
                      Description
                    </Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Optional description for this app"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary resize-none h-20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-text-primary mb-2 block">
                      Status
                    </Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                    <p className="text-xs text-text-muted mt-2">
                      Active apps can be added to channels and played on screens
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {errors.submit && (
              <div className="p-4 bg-error/10 border border-error rounded-lg">
                <p className="text-sm text-error flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="bg-primary text-white hover:bg-primary-hover flex-1"
                disabled={updateAppMutation.isPending || !hasChanges}
              >
                {updateAppMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateAppMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ContentSelector
        isOpen={contentSelectorOpen}
        onClose={() => {
          setContentSelectorOpen(false)
          setContentSelectorField('')
        }}
        onSelect={handleContentSelect}
        currentContentId={formData.content_id}
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
