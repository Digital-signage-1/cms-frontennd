'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Input, Label } from '@/components/ui'
import { FormFieldRenderer } from './FormFieldRenderer'
import { ContentSelector } from './ContentSelector'
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import { useCreateApp } from '@/hooks/queries/useApps'
import { useContent } from '@/hooks/queries'
import type { AppType, Content } from '@signage/types'

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

interface AppConfigFormProps {
  appType: AppType
  workspaceId: string
  onBack: () => void
  onSuccess: () => void
  onCancel: () => void
}

export function AppConfigForm({ appType, workspaceId, onBack, onSuccess, onCancel }: AppConfigFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contentSelectorOpen, setContentSelectorOpen] = useState(false)
  const [contentSelectorField, setContentSelectorField] = useState<string>('')

  const createAppMutation = useCreateApp()

  const { data: contentData } = useContent(workspaceId, {})

  const { data: schemaData, isLoading: isLoadingSchema } = useQuery({
    queryKey: ['app-type-schema', appType.type],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/app-types/${appType.type}/schema`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('signage_access_token')}`
          }
        }
      )
      if (!response.ok) throw new Error('Failed to fetch schema')
      return response.json()
    }
  })

  const schema = schemaData?.schema
  const defaultConfig = schemaData?.default_config || {}

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

    if (appType.requires_content && !formData.content_id) {
      newErrors.content_id = 'Content selection is required for this app type'
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

    if (!validateForm()) return

    try {
      const config: Record<string, any> = { ...defaultConfig }

      if (schema?.fields) {
        schema.fields.forEach((field: FormField) => {
          if (formData[field.name] !== undefined) {
            config[field.name] = formData[field.name]
          }
        })
      }

      if (formData.content_id) {
        config.content_id = formData.content_id
      }

      await createAppMutation.mutateAsync({
        workspaceId,
        data: {
          template_type: appType.type,
          name: formData.name,
          description: formData.description || undefined,
          content_id: formData.content_id,
          config,
        }
      })

      onSuccess()
    } catch (error) {
      console.error('Failed to create app:', error)
      setErrors({ submit: 'Failed to create app. Please try again.' })
    }
  }

  if (isLoadingSchema) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const requiresContent = appType.requires_content || schema?.fields?.some((f: FormField) => f.name === 'content_id')
  const currentContent = contentData?.items?.find((c: Content) => c.content_id === formData.content_id)

  return (
    <>
      <form onSubmit={handleSubmit} className="p-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-6 gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to app types
        </Button>

        <div className="space-y-6 max-w-2xl">
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

          {requiresContent && (
            <div>
              <Label htmlFor="content_id" className="text-sm font-medium text-text-primary mb-2 block">
                Select Content <span className="text-error">*</span>
              </Label>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setContentSelectorField('content_id')
                    setContentSelectorOpen(true)
                  }}
                  className={`w-full justify-start ${errors.content_id ? 'border-error' : ''}`}
                >
                  {currentContent ? (
                    <>Selected: {currentContent.name}</>
                  ) : (
                    <>Choose from library...</>
                  )}
                </Button>
                {errors.content_id && (
                  <p className="text-sm text-error flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.content_id}
                  </p>
                )}
              </div>
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
            <div className="p-4 bg-error/10 border border-error rounded-lg">
              <p className="text-sm text-error flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.submit}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary-hover flex-1"
              disabled={createAppMutation.isPending}
            >
              {createAppMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create App'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createAppMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>

      <ContentSelector
        isOpen={contentSelectorOpen}
        onClose={() => {
          setContentSelectorOpen(false)
          setContentSelectorField('')
        }}
        onSelect={handleContentSelect}
        currentContentId={formData.content_id}
      />
    </>
  )
}
