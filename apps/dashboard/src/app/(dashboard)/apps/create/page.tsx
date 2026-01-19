'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Label, Skeleton } from '@/components/ui'
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { FormFieldRenderer } from '@/components/apps/FormFieldRenderer'
import { ContentSelector } from '@/components/apps/ContentSelector'
import { FileImage, FileVideo, Globe, Code, Clock, Cloud, Layout, FileText, Sparkles, AlertCircle, Play } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useCreateApp, useAppTypes, useAppTypeSchema } from '@/hooks/queries/useApps'
import { useContent } from '@/hooks/queries'
import type { Content } from '@signage/types'
import { motion, AnimatePresence } from 'framer-motion'

interface AppType {
  type_id: string
  name: string
  description: string
  icon: string
  category: string
  processing_method: string
  requires_integration?: string
  is_beta?: boolean
  requires_pro_plan?: boolean
}

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
    'youtube': Play,
  }
  return iconMap[icon] || Sparkles
}

const getCategoryInfo = (category: string) => {
  const categories: Record<string, { label: string; color: string }> = {
    media: { label: 'Media', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    widgets: { label: 'Widgets', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    embed: { label: 'Embeds', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  }
  return categories[category] || { label: category, color: 'bg-surface-alt text-text-muted border-border' }
}

export default function CreateAppPage() {
  const router = useRouter()
  const { setBreadcrumbItems, clearBreadcrumbs } = useBreadcrumb()
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<AppType | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contentSelectorOpen, setContentSelectorOpen] = useState(false)
  const [contentSelectorField, setContentSelectorField] = useState<string>('')

  const createAppMutation = useCreateApp()
  const { data: contentData } = useContent(workspaceId, {})
  const { data: appTypesData, isLoading: isLoadingTypes } = useAppTypes()
  const { data: schemaData, isLoading: isLoadingSchema } = useAppTypeSchema(selectedType?.type_id || '')

  useEffect(() => {
    setBreadcrumbItems([
      { label: 'Apps', href: '/apps' },
      { label: 'Create New App' }
    ])
    
    return () => {
      clearBreadcrumbs()
    }
  }, [setBreadcrumbItems, clearBreadcrumbs])

  const appTypes: AppType[] = appTypesData?.app_types || []
  const categories: string[] = appTypesData?.categories || []
  const schema = schemaData?.schema
  const defaultConfig = schemaData?.default_config || {}

  const filteredAppTypes = selectedCategory === 'all'
    ? appTypes
    : appTypes.filter(t => t.category === selectedCategory)

  const groupedByCategory = filteredAppTypes.reduce((acc, appType) => {
    const cat = appType.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(appType)
    return acc
  }, {} as Record<string, AppType[]>)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleContentSelect = (content: Content) => {
    if (contentSelectorField) {
      handleChange(contentSelectorField, content.content_id)
      setContentSelectorField('')
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedType || !validateForm()) return

    try {
      const config: Record<string, any> = { ...defaultConfig }

      if (schema?.fields) {
        schema.fields.forEach((field: FormField) => {
          if (formData[field.name] !== undefined) {
            config[field.name] = formData[field.name]
          }
        })
      }

      const contentId = formData.content_id || config.content_id

      await createAppMutation.mutateAsync({
        workspaceId,
        data: {
          template_type: selectedType.type_id,
          name: formData.name,
          description: formData.description || undefined,
          content_id: contentId,
          config,
        }
      })

      handleCloseDrawer()
      router.push('/apps')
    } catch (error) {
      console.error('Failed to create app:', error)
      setErrors({ submit: 'Failed to create app. Please try again.' })
    }
  }

  const handleCancel = () => {
    setSelectedType(null)
    setFormData({ name: '', description: '' })
    setErrors({})
  }

  const handleCloseDrawer = () => {
    setSelectedType(null)
    setFormData({ name: '', description: '' })
    setErrors({})
  }

  const requiresContent = selectedType && schema?.fields?.some((f: FormField) => f.name === 'content_id')

  return (
    <div className="h-[calc(100vh-4rem)] bg-background flex flex-col overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-3 flex-shrink-0 z-20 bg-background">
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">App Types</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-alt border border-border text-text-secondary hover:bg-surface-hover hover:border-primary/30'
              }`}
            >
              All
            </button>
            {categories.map(cat => {
              const info = getCategoryInfo(cat)
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-alt border border-border text-text-secondary hover:bg-surface-hover hover:border-primary/30'
                  }`}
                >
                  {info.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8">
            {isLoadingTypes ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 pb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-5 pb-4">
                {selectedCategory === 'all' ? (
                  Object.entries(groupedByCategory).map(([category, types]) => {
                    const info = getCategoryInfo(category)
                    return (
                      <div key={category} className="space-y-2">
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1 mb-2">
                          {info.label}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
                          {types.map((appType: AppType) => (
                            <AppTypeCard
                              key={appType.type_id}
                              appType={appType}
                              isSelected={selectedType?.type_id === appType.type_id}
                              onClick={() => setSelectedType(appType)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
                    {filteredAppTypes.map((appType: AppType) => (
                      <AppTypeCard
                        key={appType.type_id}
                        appType={appType}
                        isSelected={selectedType?.type_id === appType.type_id}
                        onClick={() => setSelectedType(appType)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
      </div>

      <Drawer
        isOpen={!!selectedType}
        onClose={handleCloseDrawer}
        title={selectedType?.name}
        description={selectedType?.description}
        width="md"
      >
          {isLoadingSchema ? (
            <DrawerContent>
              <div className="space-y-6">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            </DrawerContent>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <DrawerContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-text-primary">
                    App Name <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Lobby Welcome Screen"
                    className={`h-11 ${errors.name ? 'border-error focus:border-error' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-error mt-1.5 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-text-primary">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Optional description for this app"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-24 text-sm"
                  />
                </div>

                {requiresContent && (
                  <div className="space-y-2">
                    <Label htmlFor="content_id" className="text-sm font-medium text-text-primary">
                      Select Content <span className="text-error">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setContentSelectorField('content_id')
                        setContentSelectorOpen(true)
                      }}
                      className={`w-full justify-start h-11 ${errors.content_id ? 'border-error' : ''}`}
                    >
                      {formData.content_id ? (
                        <span className="truncate">
                          Selected: {contentData?.items?.find((c: Content) => c.content_id === formData.content_id)?.name || formData.content_id}
                        </span>
                      ) : (
                        'Choose from library...'
                      )}
                    </Button>
                    {errors.content_id && (
                      <p className="text-xs text-error mt-1.5 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.content_id}
                      </p>
                    )}
                  </div>
                )}

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

                {errors.submit && (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                    <p className="text-sm text-error flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.submit}
                    </p>
                  </div>
                )}
              </DrawerContent>

              <DrawerFooter>
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    className="bg-primary text-white hover:bg-primary-hover flex-1 h-11 font-medium"
                    disabled={createAppMutation.isPending}
                  >
                    {createAppMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Create App'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={createAppMutation.isPending}
                    className="h-11"
                  >
                    Cancel
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          )}
        </Drawer>

      <ContentSelector
        isOpen={contentSelectorOpen}
        onClose={() => {
          setContentSelectorOpen(false)
          setContentSelectorField('')
        }}
        onSelect={handleContentSelect}
        currentContentId={formData.content_id}
      />
    </div>
  )
}

function AppTypeCard({ appType, isSelected, onClick }: { appType: AppType; isSelected: boolean; onClick: () => void }) {
  const Icon = getAppIcon(appType.icon)

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`aspect-square p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden group ${
        isSelected
          ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
          : 'bg-surface border-border hover:border-primary/50 hover:bg-surface-alt'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
        isSelected ? 'bg-primary/20 shadow-sm' : 'bg-surface-alt group-hover:bg-primary/10'
      }`}>
        <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-text-muted group-hover:text-primary transition-colors'}`} />
      </div>
      <div className="flex flex-col items-center text-center w-full">
        <h4 className={`font-semibold text-xs leading-tight ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
          {appType.name}
        </h4>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
      )}
    </motion.button>
  )
}
