'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Music, BarChart2, Sparkles } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { FormFieldRenderer } from '@/components/apps/FormFieldRenderer'
import { ContentSelector } from '@/components/apps/ContentSelector'
import { useAuthStore } from '@/stores/auth-store'
import { useCreateApp, useAppTypeSchema } from '@/hooks/queries/useApps'
import { useContent, useContentItem } from '@/hooks/queries'
import type { Content } from '@signage/types'
import type { AppType, FormField } from '@/components/apps/create-app-shared'
import { getAppTypeIconPath, CAT_STYLE } from '@/components/apps/create-app-shared'

const ICON_MAP: Record<string, any> = {
  audio: Music,
  stock: BarChart2,
}

export function CreateAppConfigureModal({
  appType,
  onClose,
}: {
  appType: AppType | null
  onClose: () => void
}) {
  const router = useRouter()
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)

  const [formData, setFormData] = useState<Record<string, any>>({ name: '', description: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contentSelectorOpen, setContentSelectorOpen] = useState(false)
  const [contentSelectorField, setContentSelectorField] = useState('')

  const createAppMutation = useCreateApp()
  const { data: contentData } = useContent(workspaceId, {})
  const { data: selectedContentItem } = useContentItem(String(workspaceId), formData.content_id || '', {
    enabled: !!formData.content_id,
  })
  const { data: schemaData, isLoading: isLoadingSchema } = useAppTypeSchema(appType?.type_id || '')

  const schema = schemaData?.schema
  const defaultConfig = schemaData?.default_config || {}

  useEffect(() => {
    if (!appType) {
      setContentSelectorOpen(false)
      setContentSelectorField('')
      return
    }
    setFormData({ name: '', description: '' })
    setErrors({})
    setContentSelectorOpen(false)
    setContentSelectorField('')
  }, [appType])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => {
      const e = { ...prev }
      delete e[field]
      return e
    })
  }

  const handleContentSelect = (content: Content) => {
    if (contentSelectorField) {
      handleChange(contentSelectorField, content.content_id)
      setContentSelectorField('')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name?.trim()) newErrors.name = 'App name is required'
    schema?.fields?.forEach((field: FormField) => {
      if (field.required && !formData[field.name]) newErrors[field.name] = `${field.label} is required`
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appType || !validateForm()) return
    try {
      const config: Record<string, any> = { ...defaultConfig }
      schema?.fields?.forEach((field: FormField) => {
        if (formData[field.name] !== undefined) config[field.name] = formData[field.name]
      })
      const contentId = formData.content_id || config.content_id
      const created = await createAppMutation.mutateAsync({
        workspaceId,
        data: {
          template_type: appType.type_id,
          name: formData.name,
          description: formData.description || undefined,
          content_id: contentId,
          config,
        },
      })
      onClose()
      router.push(`/apps/${created.id}/edit`)
    } catch {
      setErrors({ submit: 'Failed to create app. Please try again.' })
    }
  }

  const requiresContent = appType && schema?.fields?.some((f: FormField) => f.name === 'content_id')
  const contentAcceptedTypes = useMemo(() => {
    const contentField = schema?.fields?.find((f: FormField) => f.name === 'content_id' && f.type === 'file_upload')
    const accept = contentField?.validation?.accept as string[] | undefined
    return accept?.length ? accept : undefined
  }, [schema])
  const contentFilterType = useMemo(() => {
    if (!appType?.type_id) return undefined
    const map: Record<string, 'image' | 'video' | 'pdf' | 'audio' | 'document'> = {
      image: 'image',
      video: 'video',
      pdf: 'pdf',
      slideshow: 'document',
      docx: 'document',
    }
    return map[appType.type_id]
  }, [appType?.type_id])

  const open = !!appType

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        hideClose
        className="flex max-h-[min(92vh,720px)] w-[min(96vw,520px)] max-w-[min(96vw,520px)] flex-col gap-0 overflow-hidden border-[var(--color-border)] bg-[var(--color-background)] p-0 sm:max-w-[min(96vw,520px)]"
      >
        {appType ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'min(92vh,720px)' }}>
            <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
              {(() => {
                const iconPath2 = getAppTypeIconPath(appType.icon, appType.type_id)
                const FallbackIcon2 = ICON_MAP[appType.icon] || ICON_MAP[appType.type_id] || Sparkles
                const catStyle = CAT_STYLE[appType.category] || CAT_STYLE.other
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: iconPath2 ? 'transparent' : catStyle.bg, flexShrink: 0 }}>
                      {iconPath2 ? (
                        <img src={iconPath2} alt={appType.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <FallbackIcon2 className="h-4 w-4" style={{ color: catStyle.color }} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appType.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appType.description}</p>
                    </div>
                  </div>
                )
              })()}
            </div>

            {isLoadingSchema ? (
              <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 200 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 44, backgroundColor: 'var(--color-surface-alt)', borderRadius: 8, opacity: 0.6 }} />
                ))}
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                    App Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Lobby Welcome Screen"
                    style={{ width: '100%', height: 40, backgroundColor: 'var(--color-surface-alt)', border: `1px solid ${errors.name ? '#DC2626' : 'var(--color-border)'}`, borderRadius: 8, padding: '0 12px', fontSize: 13, color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = errors.name ? '#DC2626' : 'var(--color-primary)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? '#DC2626' : 'var(--color-border)' }}
                  />
                  {errors.name && (
                    <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle className="h-3 w-3" style={{ flexShrink: 0 }} />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                    style={{ width: '100%', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--color-text-primary)', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
                  />
                </div>

                {requiresContent && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                      Select Content <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setContentSelectorField('content_id'); setContentSelectorOpen(true) }}
                      style={{ width: '100%', height: 40, backgroundColor: 'var(--color-surface-alt)', border: `1px solid ${errors.content_id ? '#DC2626' : 'var(--color-border)'}`, borderRadius: 8, padding: '0 12px', fontSize: 13, color: formData.content_id ? 'var(--color-text-primary)' : 'var(--color-text-muted)', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box' }}
                    >
                      {formData.content_id
                        ? (selectedContentItem?.name ?? contentData?.items?.find((c: Content) => c.content_id === formData.content_id)?.name ?? formData.content_id)
                        : 'Choose from library...'}
                    </button>
                    {errors.content_id && (
                      <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{errors.content_id}</p>
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
                      onContentSelect={(fieldName) => { setContentSelectorField(fieldName); setContentSelectorOpen(true) }}
                      formData={formData}
                      workspaceId={workspaceId}
                    />
                  )
                })}

                {errors.submit && (
                  <div style={{ padding: 12, backgroundColor: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.20)', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <AlertCircle className="h-4 w-4" style={{ flexShrink: 0 }} />
                      {errors.submit}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 16px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="submit"
                disabled={createAppMutation.isPending}
                style={{ width: '100%', height: 40, background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary))', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: createAppMutation.isPending ? 'not-allowed' : 'pointer', opacity: createAppMutation.isPending ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {createAppMutation.isPending ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Creating...
                  </>
                ) : (
                  'Create App'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={createAppMutation.isPending}
                style={{ width: '100%', height: 36, backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>

            <ContentSelector
              isOpen={contentSelectorOpen}
              onClose={() => { setContentSelectorOpen(false); setContentSelectorField('') }}
              onSelect={handleContentSelect}
              currentContentId={formData.content_id}
              acceptedTypes={contentAcceptedTypes}
              contentType={contentFilterType}
            />
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
