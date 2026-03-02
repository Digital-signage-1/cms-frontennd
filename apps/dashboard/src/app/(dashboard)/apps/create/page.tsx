'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight, Search, ArrowLeft, Code, Globe, FileText, FileImage,
  FileVideo, Clock, Cloud, Sparkles, Play, Music, Map, ExternalLink,
  Rss, Timer, BarChart2, AlertCircle,
} from 'lucide-react'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { FormFieldRenderer } from '@/components/apps/FormFieldRenderer'
import { ContentSelector } from '@/components/apps/ContentSelector'
import { useAuthStore } from '@/stores/auth-store'
import { useCreateApp, useAppTypes, useAppTypeSchema } from '@/hooks/queries/useApps'
import { useContent, useContentItem } from '@/hooks/queries'
import type { Content } from '@signage/types'

// ── Types ─────────────────────────────────────────────────────────────────────
interface AppType {
  type_id: string
  name: string
  description: string
  icon: string
  category: string
  popular?: boolean
  tags?: string[]
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

// ── Static fallback templates ─────────────────────────────────────────────────
const FALLBACK_TEMPLATES: AppType[] = [
  // Custom
  { type_id: 'html', name: 'Custom HTML', description: 'Build anything with raw HTML, CSS and JavaScript', category: 'custom', icon: 'html', popular: true, tags: ['code', 'html', 'custom'] },
  { type_id: 'react', name: 'React Component', description: 'Deploy a React-based component as a signage app', category: 'custom', icon: 'react', popular: false, tags: ['react', 'js', 'component'] },
  // Document
  { type_id: 'pdf', name: 'PDF Document', description: 'Display PDF files with auto-scroll and page control', category: 'document', icon: 'pdf', popular: false, tags: ['pdf', 'document'] },
  { type_id: 'spreadsheet', name: 'Spreadsheet', description: 'Show live data from spreadsheets and tables', category: 'document', icon: 'spreadsheet', popular: false, tags: ['excel', 'data', 'table'] },
  { type_id: 'slides', name: 'Slide Deck', description: 'Present slideshows from Google Slides or PowerPoint', category: 'document', icon: 'slides', popular: false, tags: ['slides', 'presentation'] },
  // Embeds
  { type_id: 'web', name: 'Web Page', description: 'Embed any website or web application via URL', category: 'embeds', icon: 'web', popular: true, tags: ['url', 'iframe', 'web'] },
  { type_id: 'youtube', name: 'YouTube Video', description: 'Stream YouTube videos directly on your display', category: 'embeds', icon: 'youtube', popular: false, tags: ['youtube', 'video', 'stream'] },
  { type_id: 'maps', name: 'Google Maps', description: 'Show interactive or static map views', category: 'embeds', icon: 'maps', popular: false, tags: ['maps', 'location', 'geo'] },
  { type_id: 'iframe', name: 'iFrame Embed', description: 'Embed any compatible external content via iFrame', category: 'embeds', icon: 'iframe', popular: false, tags: ['iframe', 'embed'] },
  // Media
  { type_id: 'image', name: 'Image Viewer', description: 'Display high-resolution images from your media library', category: 'media', icon: 'image', popular: false, tags: ['image', 'photo', 'png', 'jpg'] },
  { type_id: 'video', name: 'Video Player', description: 'Play MP4 and other video formats from the library', category: 'media', icon: 'video', popular: false, tags: ['mp4', 'video', 'player'] },
  { type_id: 'slideshow', name: 'Gallery Carousel', description: 'Cycle through multiple images with transitions', category: 'media', icon: 'slideshow', popular: false, tags: ['gallery', 'slideshow', 'carousel'] },
  { type_id: 'audio', name: 'Audio Player', description: 'Play background audio with an ambient visual display', category: 'media', icon: 'audio', popular: false, tags: ['audio', 'mp3', 'music'] },
  // Widgets
  { type_id: 'clock', name: 'Digital Clock', description: 'Live digital or analog clock with timezone support', category: 'widgets', icon: 'clock', popular: false, tags: ['clock', 'time', 'timezone'] },
  { type_id: 'weather', name: 'Weather Widget', description: 'Real-time weather for any location worldwide', category: 'widgets', icon: 'weather', popular: false, tags: ['weather', 'forecast', 'temperature'] },
  { type_id: 'stock', name: 'Stock Ticker', description: 'Live stock prices and market indices ticker tape', category: 'widgets', icon: 'stock', popular: false, tags: ['stocks', 'finance', 'market'] },
  { type_id: 'rss', name: 'RSS Feed', description: 'Auto-cycling news and content from any RSS feed', category: 'widgets', icon: 'rss', popular: false, tags: ['rss', 'news', 'feed'] },
  { type_id: 'social', name: 'Social Feed', description: 'Display a live social media feed on screen', category: 'widgets', icon: 'social', popular: false, tags: ['social', 'twitter', 'feed'] },
  { type_id: 'qr', name: 'QR Code', description: 'Generate and display QR codes for any URL', category: 'widgets', icon: 'qr', popular: false, tags: ['qr', 'code', 'url'] },
  { type_id: 'countdown', name: 'Countdown Timer', description: 'Count down to events, launches, or deadlines', category: 'widgets', icon: 'countdown', popular: false, tags: ['timer', 'countdown', 'event'] },
]

const CATEGORY_ORDER = ['custom', 'embed', 'embeds', 'media', 'document', 'widgets']

function getCategoriesFromTemplates(templates: AppType[]): { id: string; label: string }[] {
  const cats = [...new Set(templates.map((t) => t.category).filter(Boolean))]
  const order = CATEGORY_ORDER.filter((id) => cats.includes(id))
  const rest = cats.filter((c) => !CATEGORY_ORDER.includes(c)).sort()
  const categoryIds = [...order, ...rest]
  const labels: Record<string, string> = {
    all: 'All Types',
    custom: 'Custom',
    document: 'Document',
    embed: 'Embed',
    embeds: 'Embeds',
    media: 'Media',
    widgets: 'Widgets',
  }
  return [
    { id: 'all', label: 'All Types' },
    ...categoryIds.map((id) => ({ id, label: labels[id] || id.charAt(0).toUpperCase() + id.slice(1) })),
  ]
}

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, any> = {
  html: Code, react: Code, qr: Code,
  pdf: FileText, spreadsheet: FileText, slides: FileText, picture_as_pdf: FileText,
  web: Globe,
  youtube: Play,
  maps: Map,
  iframe: ExternalLink,
  image: FileImage, photo: FileImage, slideshow: FileImage, view_carousel: FileImage,
  video: FileVideo, play_circle: FileVideo,
  audio: Music,
  clock: Clock,
  weather: Cloud, 'cloud-sun': Cloud,
  stock: BarChart2,
  rss: Rss, social: Rss,
  countdown: Timer,
}

// ── Icon bg/color per category ────────────────────────────────────────────────
const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  custom:   { bg: 'rgba(251,146,60,0.22)',  color: '#FB923C' },
  document: { bg: 'rgba(245,158,11,0.22)',  color: '#F59E0B' },
  embed:    { bg: 'rgba(14,165,233,0.22)',  color: '#38BDF8' },
  embeds:   { bg: 'rgba(14,165,233,0.22)',  color: '#38BDF8' },
  media:    { bg: 'rgba(59,130,246,0.22)',  color: '#60A5FA' },
  widgets:  { bg: 'rgba(99,102,241,0.22)',  color: '#818CF8' },
  other:    { bg: 'rgba(167,139,250,0.22)', color: '#C4B5FD' },
}

// ── Stepper labels ────────────────────────────────────────────────────────────
const STEPS = ['Select Type', 'Configure', 'Deploy'] as const

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CreateAppPage() {
  const router = useRouter()
  const { setBreadcrumbItems, clearBreadcrumbs } = useBreadcrumb()
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.id ?? 0

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch]           = useState('')
  const [selectedType, setSelectedType] = useState<AppType | null>(null)
  const [step, setStep]               = useState(0) // 0=select, 1=configure
  const [formData, setFormData]       = useState<Record<string, any>>({ name: '', description: '' })
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [contentSelectorOpen, setContentSelectorOpen] = useState(false)
  const [contentSelectorField, setContentSelectorField] = useState('')

  const createAppMutation = useCreateApp()
  const { data: contentData } = useContent(workspaceId, {})
  const { data: selectedContentItem } = useContentItem(String(workspaceId), formData.content_id || '', { enabled: !!formData.content_id })
  const { data: appTypesData } = useAppTypes()
  const { data: schemaData, isLoading: isLoadingSchema } = useAppTypeSchema(selectedType?.type_id || '')

  useEffect(() => {
    setBreadcrumbItems([{ label: 'Apps', href: '/apps' }, { label: 'Create New App' }])
    return () => clearBreadcrumbs()
  }, [setBreadcrumbItems, clearBreadcrumbs])

  // Merge API templates with static fallback
  const apiTypes: any[] = appTypesData?.app_types || []
  const templates: AppType[] = apiTypes.length > 0
    ? apiTypes.map((t) => ({ ...t, popular: false, tags: [] }))
    : FALLBACK_TEMPLATES

  const schema       = schemaData?.schema
  const defaultConfig = schemaData?.default_config || {}

  const categories = getCategoriesFromTemplates(templates)
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.id === 'all'
      ? templates.length
      : templates.filter((t) => t.category === cat.id).length
    return acc
  }, {} as Record<string, number>)

  // Filter by category + search
  const filtered = templates.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory
    const q = search.toLowerCase()
    const matchesSearch = !q
      || t.name.toLowerCase().includes(q)
      || t.description?.toLowerCase().includes(q)
      || t.tags?.some((tag) => tag.includes(q))
    return matchesCat && matchesSearch
  })

  // Group by category for display
  const grouped: Record<string, AppType[]> = {}
  for (const cat of CATEGORY_ORDER) {
    const items = filtered.filter((t) => t.category === cat)
    if (items.length) grouped[cat] = items
  }
  const otherCats = [...new Set(filtered.map((t) => t.category))].filter((c) => !CATEGORY_ORDER.includes(c))
  for (const cat of otherCats) {
    const items = filtered.filter((t) => t.category === cat)
    if (items.length) grouped[cat] = items
  }

  // ── Form handlers ────────────────────────────────────────────────────────────
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e })
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
    if (!selectedType || !validateForm()) return
    try {
      const config: Record<string, any> = { ...defaultConfig }
      schema?.fields?.forEach((field: FormField) => {
        if (formData[field.name] !== undefined) config[field.name] = formData[field.name]
      })
      const contentId = formData.content_id || config.content_id
      await createAppMutation.mutateAsync({
        workspaceId,
        data: {
          template_type: selectedType.type_id,
          name: formData.name,
          description: formData.description || undefined,
          content_id: contentId,
          config,
        },
      })
      router.push('/apps')
    } catch {
      setErrors({ submit: 'Failed to create app. Please try again.' })
    }
  }

  const handleSelectTemplate = (tpl: AppType) => {
    setSelectedType(tpl)
    setStep(1)
    setFormData({ name: '', description: '' })
    setErrors({})
  }

  const handleCancel = () => {
    setSelectedType(null)
    setStep(0)
    setFormData({ name: '', description: '' })
    setErrors({})
  }

  const requiresContent = selectedType && schema?.fields?.some((f: FormField) => f.name === 'content_id')
  const contentAcceptedTypes = useMemo(() => {
    const contentField = schema?.fields?.find((f: FormField) => f.name === 'content_id' && f.type === 'file_upload')
    const accept = contentField?.validation?.accept as string[] | undefined
    return accept?.length ? accept : undefined
  }, [schema])
  const contentFilterType = useMemo(() => {
    if (!selectedType?.type_id) return undefined
    const map: Record<string, 'image' | 'video' | 'pdf' | 'audio' | 'document'> = {
      image: 'image',
      video: 'video',
      pdf: 'pdf',
      slideshow: 'image',
    }
    return map[selectedType.type_id]
  }, [selectedType?.type_id])

  return (
    <div style={{ backgroundColor: '#0D0D0D', height: 'calc(100vh - 3.5rem)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Sub-header ── */}
      <div style={{ backgroundColor: '#141414', borderBottom: '1px solid #2A2A2A', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        {/* Back */}
        <button
          onClick={() => router.push('/apps')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: 13, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', flexShrink: 0 }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Apps
        </button>

        {/* Title */}
        <h1 style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 15, flex: 1, margin: 0 }}>Create New App</h1>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STEPS.map((label, i) => {
            const isActive = step === i
            const isDone   = step > i
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 8, backgroundColor: isActive ? 'rgba(245,166,36,0.12)' : 'transparent' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, backgroundColor: isActive || isDone ? '#F5A624' : 'rgba(255,255,255,0.08)', color: isActive || isDone ? '#000' : '#6B7280', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#F5A624' : isDone ? '#9CA3AF' : '#6B7280' }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4" style={{ color: '#2A2A2A', margin: '0 2px' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 3-Column Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left Sidebar ── */}
        <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid #2A2A2A', display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F5A624', padding: '16px 16px 8px' }}>
            App Types
          </p>

          <div style={{ flex: 1 }}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id
              const count    = categoryCounts[cat.id] || 0
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', paddingLeft: 14, cursor: 'pointer', border: 'none', textAlign: 'left', backgroundColor: isActive ? 'rgba(245,166,36,0.08)' : 'transparent', borderLeft: isActive ? '2px solid #F5A624' : '2px solid transparent' }}
                >
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#F5A624' : '#9CA3AF' }}>
                    {cat.label}
                  </span>
                  {count > 0 && (
                    <span style={{ fontSize: 11, color: isActive ? '#F5A624' : '#6B7280', backgroundColor: isActive ? 'rgba(245,166,36,0.15)' : 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '1px 7px' }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Templates count */}
          <div style={{ borderTop: '1px solid #2A2A2A', padding: '12px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', margin: '0 0 4px' }}>Templates</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#F5A624', lineHeight: 1, margin: '0 0 2px' }}>{templates.length}</p>
            <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>available</p>
          </div>
        </div>

        {/* ── Middle Panel ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search bar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #2A2A2A', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search className="h-3.5 w-3.5" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', height: 36, backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, paddingLeft: 32, paddingRight: 12, fontSize: 13, color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <span style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{filtered.length} results</span>
          </div>

          {/* Template list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {(categories.filter((c) => c.id !== 'all').map((c) => c.id) as string[]).map((category) => {
              const items = grouped[category]
              if (!items?.length) return null
              return (
              <div key={category}>
                {/* Group header */}
                <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {categories.find((c) => c.id === category)?.label ?? category}
                  </span>
                  <div style={{ flex: 1, height: 1, backgroundColor: '#1C1C1C' }} />
                </div>

                {/* Template rows */}
                {items.map((tpl) => {
                  const isSelected = selectedType?.type_id === tpl.type_id
                  const Icon       = ICON_MAP[tpl.icon] || ICON_MAP[tpl.type_id] || Sparkles
                  const catStyle   = CAT_STYLE[tpl.category] || CAT_STYLE.other
                  return (
                    <button
                      key={tpl.type_id}
                      onClick={() => handleSelectTemplate(tpl)}
                      style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 16px', paddingLeft: 14, cursor: 'pointer', border: 'none', textAlign: 'left', backgroundColor: isSelected ? 'rgba(245,166,36,0.06)' : 'transparent', borderLeft: isSelected ? '2px solid #F5A624' : '2px solid transparent' }}
                    >
                      {/* Icon */}
                      <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: catStyle.bg }}>
                        <Icon className="h-5 w-5" style={{ color: catStyle.color }} />
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#F5A624' : '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tpl.name}
                          </span>
                          {tpl.popular && (
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', backgroundColor: 'rgba(245,166,36,0.18)', color: '#F5A624', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
                              Popular
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 11, color: '#6B7280', margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as any}>
                          {tpl.description}
                        </p>
                        {tpl.tags && tpl.tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                            {tpl.tags.slice(0, 3).map((tag) => (
                              <span key={tag} style={{ fontSize: 10, color: '#6B7280', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '1px 6px' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <ChevronRight className="h-4 w-4" style={{ color: '#F5A624', flexShrink: 0, marginTop: 10 }} />
                      )}
                    </button>
                  )
                })}
              </div>
            ); })}

            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#6B7280' }}>No templates match your search</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ width: 320, flexShrink: 0, borderLeft: '1px solid #2A2A2A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedType ? (
            /* Empty state */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight className="h-5 w-5" style={{ color: '#6B7280' }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', textAlign: 'center', margin: 0 }}>Select a template</p>
              <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                Choose a template from the list to configure and deploy your app
              </p>
            </div>
          ) : (
            /* Configure form */
            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Panel header */}
              <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #2A2A2A', flexShrink: 0 }}>
                {(() => {
                  const Icon     = ICON_MAP[selectedType.icon] || ICON_MAP[selectedType.type_id] || Sparkles
                  const catStyle = CAT_STYLE[selectedType.category] || CAT_STYLE.other
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: catStyle.bg, flexShrink: 0 }}>
                        <Icon className="h-4 w-4" style={{ color: catStyle.color }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedType.name}</p>
                        <p style={{ fontSize: 11, color: '#6B7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedType.description}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Scrollable form area */}
              {isLoadingSchema ? (
                <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: 44, backgroundColor: '#1C1C1C', borderRadius: 8, opacity: 0.6 }} />
                  ))}
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* App Name */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', display: 'block', marginBottom: 6 }}>
                      App Name <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g. Lobby Welcome Screen"
                      style={{ width: '100%', height: 40, backgroundColor: '#111827', border: `1px solid ${errors.name ? '#DC2626' : '#1F2937'}`, borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = errors.name ? '#DC2626' : '#F5A624' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? '#DC2626' : '#1F2937' }}
                    />
                    {errors.name && (
                      <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertCircle className="h-3 w-3" style={{ flexShrink: 0 }} />{errors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', display: 'block', marginBottom: 6 }}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Optional description..."
                      rows={3}
                      style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#FFFFFF', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#F5A624' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#1F2937' }}
                    />
                  </div>

                  {/* Content selector */}
                  {requiresContent && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', display: 'block', marginBottom: 6 }}>
                        Select Content <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setContentSelectorField('content_id'); setContentSelectorOpen(true) }}
                        style={{ width: '100%', height: 40, backgroundColor: '#111827', border: `1px solid ${errors.content_id ? '#DC2626' : '#1F2937'}`, borderRadius: 8, padding: '0 12px', fontSize: 13, color: formData.content_id ? '#FFFFFF' : '#6B7280', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box' }}
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

                  {/* Dynamic schema fields */}
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
                      />
                    )
                  })}

                  {/* Submit error */}
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

              {/* Footer buttons */}
              <div style={{ borderTop: '1px solid #2A2A2A', padding: '12px 16px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="submit"
                  disabled={createAppMutation.isPending}
                  style={{ width: '100%', height: 40, backgroundColor: '#F5A624', color: '#000000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: createAppMutation.isPending ? 'not-allowed' : 'pointer', opacity: createAppMutation.isPending ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {createAppMutation.isPending ? (
                    <>
                      <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Creating...
                    </>
                  ) : 'Create App'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={createAppMutation.isPending}
                  style={{ width: '100%', height: 36, backgroundColor: 'transparent', color: '#9CA3AF', border: '1px solid #2A2A2A', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ContentSelector
        isOpen={contentSelectorOpen}
        onClose={() => { setContentSelectorOpen(false); setContentSelectorField('') }}
        onSelect={handleContentSelect}
        currentContentId={formData.content_id}
        acceptedTypes={contentAcceptedTypes}
        contentType={contentFilterType}
      />
    </div>
  )
}
