'use client'

import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, ChevronRight, Search, Sparkles, Music, BarChart2, Grid2X2, List } from 'lucide-react'
import { useAppTypes } from '@/hooks/queries/useApps'
import type { AppType } from '@/components/apps/create-app-shared'
import {
  FALLBACK_TEMPLATES,
  GOOGLE_HUB_TYPE_ID,
  POWERBI_HUB_TYPE_ID,
  SALESFORCE_HUB_TYPE_ID,
  buildDisplayTemplates,
  oauthGoogleChildrenOrdered,
  powerbiHubChildrenOrdered,
  salesforceHubChildrenOrdered,
  hubMatchesSearch,
  getCategoriesFromTemplates,
  getAppTypeIconPath,
  CAT_STYLE,
  CATEGORY_ORDER,
  isIntegrationHubTypeId,
  HUB_TYPE_ID_TO_BROWSE_KEY,
  HUB_SEARCH_BRAND_TERMS,
  integrationsCategoryDisplayCount,
  type IntegrationHubBrowseKey,
} from '@/components/apps/create-app-shared'

const ICON_MAP: Record<string, any> = {
  audio: Music, stock: BarChart2,
}

function GoogleGMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function PowerBIMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <rect x="3" y="12" width="5" height="9" rx="1" fill="#E8B00C" />
      <rect x="9.5" y="7" width="5" height="14" rx="1" fill="#F2C811" />
      <rect x="16" y="3" width="5" height="18" rx="1" fill="#E8B00C" />
    </svg>
  )
}

function SalesforceMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d="M16.2 4.5c-1.35 0-2.55.7-3.25 1.76A4.45 4.45 0 0 0 8.5 8.45 3.85 3.85 0 0 0 4.8 12.2 3.8 3.8 0 0 0 6.6 19.5h10.35a3.95 3.95 0 0 0 3.95-3.95c0-1.65-1-3.05-2.45-3.65.05-.25.08-.5.08-.75 0-2.35-1.9-4.25-4.25-4.25-.45 0-.9.08-1.3.2-.55-1.45-1.95-2.45-3.6-2.45z"
        fill="#00A1E0"
      />
    </svg>
  )
}

const HUB_BROWSE_TITLES: Record<IntegrationHubBrowseKey, string> = {
  google: 'Choose a Google product',
  powerbi: 'Choose a Power BI app',
  salesforce: 'Choose a Salesforce app',
}

function HubTileIcon({ typeId, size }: { typeId: string; size: number }) {
  if (typeId === GOOGLE_HUB_TYPE_ID) return <GoogleGMark size={size} />
  if (typeId === POWERBI_HUB_TYPE_ID) return <PowerBIMark size={size} />
  if (typeId === SALESFORCE_HUB_TYPE_ID) return <SalesforceMark size={size} />
  return <Sparkles style={{ width: size * 0.5, height: size * 0.5, color: 'var(--color-text-muted)' }} />
}

export function CreateAppTemplatePicker({
  highlightTypeId,
  onChooseType,
}: {
  highlightTypeId: string | null
  onChooseType: (tpl: AppType) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [templateViewMode, setTemplateViewMode] = useState<'grid' | 'list'>('grid')
  const [hubBrowse, setHubBrowse] = useState<IntegrationHubBrowseKey | null>(null)

  const { data: appTypesData } = useAppTypes()

  useEffect(() => {
    setHubBrowse(null)
  }, [selectedCategory])

  const apiTypes: any[] = appTypesData?.app_types || []
  const templates: AppType[] = useMemo(() => {
    if (apiTypes.length === 0) return FALLBACK_TEMPLATES
    return apiTypes.map((t) => {
      const fallback = FALLBACK_TEMPLATES.find((f) => f.type_id === t.type_id)
      return {
        ...t,
        popular: fallback?.popular ?? false,
        tags: fallback?.tags ?? [],
        category: t.category || fallback?.category || 'other',
        icon: t.icon || fallback?.icon || t.type_id,
      }
    })
  }, [apiTypes])

  const googleOauthChildren = useMemo(() => oauthGoogleChildrenOrdered(templates), [templates])
  const powerbiHubChildren = useMemo(() => powerbiHubChildrenOrdered(templates), [templates])
  const salesforceHubChildren = useMemo(() => salesforceHubChildrenOrdered(templates), [templates])
  const displayTemplates = useMemo(() => buildDisplayTemplates(templates), [templates])

  const categories = getCategoriesFromTemplates(templates)
  const displayTemplateCount = displayTemplates.length

  const categoryCounts = useMemo(() => {
    return categories.reduce((acc, cat) => {
      if (cat.id === 'all') {
        acc[cat.id] = displayTemplateCount
        return acc
      }
      if (cat.id === 'integrations') {
        acc[cat.id] = integrationsCategoryDisplayCount(
          templates,
          googleOauthChildren.length,
          powerbiHubChildren.length,
          salesforceHubChildren.length
        )
        return acc
      }
      acc[cat.id] = templates.filter((t) => t.category === cat.id).length
      return acc
    }, {} as Record<string, number>)
  }, [categories, displayTemplateCount, templates, googleOauthChildren.length, powerbiHubChildren.length, salesforceHubChildren.length])

  const filtered = useMemo(() => {
    return displayTemplates.filter((t) => {
      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory
      if (!matchesCat) return false
      const q = search.toLowerCase()
      if (!q) return true
      if (t.type_id === GOOGLE_HUB_TYPE_ID) {
        return hubMatchesSearch(googleOauthChildren, q, HUB_SEARCH_BRAND_TERMS.google)
      }
      if (t.type_id === POWERBI_HUB_TYPE_ID) {
        return hubMatchesSearch(powerbiHubChildren, q, HUB_SEARCH_BRAND_TERMS.powerbi)
      }
      if (t.type_id === SALESFORCE_HUB_TYPE_ID) {
        return hubMatchesSearch(salesforceHubChildren, q, HUB_SEARCH_BRAND_TERMS.salesforce)
      }
      return (
        t.name.toLowerCase().includes(q)
        || t.description?.toLowerCase().includes(q)
        || (t.tags?.some((tag) => tag.includes(q)) ?? false)
      )
    })
  }, [displayTemplates, selectedCategory, search, googleOauthChildren, powerbiHubChildren, salesforceHubChildren])

  const hubBrowseSource = useMemo(() => {
    if (hubBrowse === 'google') return googleOauthChildren
    if (hubBrowse === 'powerbi') return powerbiHubChildren
    if (hubBrowse === 'salesforce') return salesforceHubChildren
    return []
  }, [hubBrowse, googleOauthChildren, powerbiHubChildren, salesforceHubChildren])

  const hubPickerFiltered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return hubBrowseSource.filter((t) => {
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q)
        || t.description?.toLowerCase().includes(q)
        || (t.tags?.some((tag) => tag.includes(q)) ?? false)
      )
    })
  }, [hubBrowseSource, search])

  const grouped = useMemo(() => {
    const g: Record<string, AppType[]> = {}
    for (const cat of CATEGORY_ORDER) {
      const items = filtered.filter((t) => t.category === cat)
      if (items.length) g[cat] = items
    }
    const orderIds = CATEGORY_ORDER as readonly string[]
    const otherCats = [...new Set(filtered.map((t) => t.category))].filter((c) => !orderIds.includes(c))
    for (const cat of otherCats) {
      const items = filtered.filter((t) => t.category === cat)
      if (items.length) g[cat] = items
    }
    return g
  }, [filtered])

  const pickType = (tpl: AppType) => {
    setHubBrowse(null)
    onChooseType(tpl)
  }

  const openHubBrowse = (typeId: string) => {
    const key = HUB_TYPE_ID_TO_BROWSE_KEY[typeId]
    if (key) setHubBrowse(key)
  }

  return (
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left Sidebar ── */}
        <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', padding: '16px 16px 8px' }}>
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
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', paddingLeft: 14, cursor: 'pointer', border: 'none', textAlign: 'left', backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent', borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                >
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                    {cat.label}
                  </span>
                  {count > 0 && (
                    <span style={{ fontSize: 11, color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)', backgroundColor: isActive ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'var(--color-surface-alt)', borderRadius: 10, padding: '1px 7px' }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Templates count */}
          <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '0 0 4px' }}>Templates</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1, margin: '0 0 2px' }}>{displayTemplateCount}</p>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>available</p>
          </div>
        </div>

        {/* ── Middle Panel ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
          {/* Search bar + view toggle */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search className="h-3.5 w-3.5" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', height: 36, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8, paddingLeft: 32, paddingRight: 12, fontSize: 13, color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              {(hubBrowse ? hubPickerFiltered.length : filtered.length)} results
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {([
                { mode: 'grid' as const, Icon: Grid2X2 },
                { mode: 'list' as const, Icon: List },
              ]).map(({ mode, Icon: BtnIcon }) => (
                <button
                  key={mode}
                  onClick={() => setTemplateViewMode(mode)}
                  style={{
                    width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
                    background: templateViewMode === mode ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary))' : 'var(--color-surface-alt)',
                    color: templateViewMode === mode ? '#FFFFFF' : 'var(--color-text-muted)',
                    ...(templateViewMode !== mode ? { border: '1px solid var(--color-border)' } : {}),
                  }}
                >
                  <BtnIcon style={{ width: 15, height: 15 }} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: templateViewMode === 'grid' ? 12 : '8px 0' }}>
            {hubBrowse ? (
              <>
                <div style={{ padding: '0 12px 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setHubBrowse(null)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: 13, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    All templates
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {HUB_BROWSE_TITLES[hubBrowse]}
                  </span>
                </div>
                {templateViewMode === 'grid' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {hubPickerFiltered.map((tpl) => {
                      const isSelected = highlightTypeId === tpl.type_id
                      const iconPath = getAppTypeIconPath(tpl.icon, tpl.type_id)
                      const FallbackIcon = ICON_MAP[tpl.icon] || ICON_MAP[tpl.type_id] || Sparkles
                      const catStyle = CAT_STYLE[tpl.category] || CAT_STYLE.other
                      return (
                        <button
                          key={tpl.type_id}
                          type="button"
                          onClick={() => pickType(tpl)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                            padding: '14px 8px 12px', borderRadius: 10, cursor: 'pointer', border: 'none', textAlign: 'center',
                            backgroundColor: isSelected ? 'var(--color-primary-light)' : '#FFFFFF',
                            outline: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            outlineOffset: isSelected ? -2 : -1,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)' }}
                          onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF' }}
                        >
                          <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: iconPath ? 'transparent' : catStyle.bg, flexShrink: 0 }}>
                            {iconPath ? (
                              <img src={iconPath} alt={tpl.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 10 }} />
                            ) : (
                              <FallbackIcon style={{ width: 22, height: 22, color: catStyle.color }} />
                            )}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                            {tpl.name}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxWidth: '100%' } as any}>
                            {tpl.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div>
                    {hubPickerFiltered.map((tpl) => {
                      const isSelected = highlightTypeId === tpl.type_id
                      const iconPath = getAppTypeIconPath(tpl.icon, tpl.type_id)
                      const FallbackIcon = ICON_MAP[tpl.icon] || ICON_MAP[tpl.type_id] || Sparkles
                      const catStyle = CAT_STYLE[tpl.category] || CAT_STYLE.other
                      return (
                        <button
                          key={tpl.type_id}
                          type="button"
                          onClick={() => pickType(tpl)}
                          style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 16px', paddingLeft: 14, cursor: 'pointer', border: 'none', textAlign: 'left', backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'transparent', borderLeft: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: iconPath ? 'transparent' : catStyle.bg }}>
                            {iconPath ? (
                              <img src={iconPath} alt={tpl.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                            ) : (
                              <FallbackIcon className="h-5 w-5" style={{ color: catStyle.color }} />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {tpl.name}
                              </span>
                              {tpl.popular && (
                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
                                  Popular
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as any}>
                              {tpl.description}
                            </p>
                          </div>
                          {isSelected && (
                            <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 10 }} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
                {hubPickerFiltered.length === 0 && (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No templates match your search</p>
                  </div>
                )}
              </>
            ) : templateViewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {filtered.map((tpl) => {
                  const isHub = isIntegrationHubTypeId(tpl.type_id)
                  const browseKey = HUB_TYPE_ID_TO_BROWSE_KEY[tpl.type_id]
                  const isSelected = isHub && browseKey
                    ? hubBrowse === browseKey
                    : highlightTypeId === tpl.type_id
                  const iconPath = isHub ? null : getAppTypeIconPath(tpl.icon, tpl.type_id)
                  const FallbackIcon = ICON_MAP[tpl.icon] || ICON_MAP[tpl.type_id] || Sparkles
                  const catStyle = CAT_STYLE[tpl.category] || CAT_STYLE.other
                  return (
                    <button
                      key={tpl.type_id}
                      type="button"
                      onClick={() => (isHub ? openHubBrowse(tpl.type_id) : pickType(tpl))}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        padding: '14px 8px 12px', borderRadius: 10, cursor: 'pointer', border: 'none', textAlign: 'center',
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : '#FFFFFF',
                        outline: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        outlineOffset: isSelected ? -2 : -1,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)' }}
                      onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF' }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: isHub || !iconPath ? catStyle.bg : 'transparent', flexShrink: 0 }}>
                        {isHub ? (
                          <HubTileIcon typeId={tpl.type_id} size={44} />
                        ) : iconPath ? (
                          <img src={iconPath} alt={tpl.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 10 }} />
                        ) : (
                          <FallbackIcon style={{ width: 22, height: 22, color: catStyle.color }} />
                        )}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        {tpl.name}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxWidth: '100%' } as any}>
                        {tpl.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <>
                {(categories.filter((c) => c.id !== 'all').map((c) => c.id) as string[]).map((category) => {
                  const items = grouped[category]
                  if (!items?.length) return null
                  return (
                    <div key={category}>
                      <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                          {categories.find((c) => c.id === category)?.label ?? category}
                        </span>
                        <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-surface-alt)' }} />
                      </div>
                      {items.map((tpl) => {
                        const isHub = isIntegrationHubTypeId(tpl.type_id)
                        const browseKey = HUB_TYPE_ID_TO_BROWSE_KEY[tpl.type_id]
                        const isSelected = isHub && browseKey
                          ? hubBrowse === browseKey
                          : highlightTypeId === tpl.type_id
                        const iconPath = isHub ? null : getAppTypeIconPath(tpl.icon, tpl.type_id)
                        const FallbackIcon = ICON_MAP[tpl.icon] || ICON_MAP[tpl.type_id] || Sparkles
                        const catStyle = CAT_STYLE[tpl.category] || CAT_STYLE.other
                        return (
                          <button
                            key={tpl.type_id}
                            type="button"
                            onClick={() => (isHub ? openHubBrowse(tpl.type_id) : pickType(tpl))}
                            style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 16px', paddingLeft: 14, cursor: 'pointer', border: 'none', textAlign: 'left', backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'transparent', borderLeft: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                          >
                            <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: isHub || !iconPath ? catStyle.bg : 'transparent' }}>
                              {isHub ? (
                                <HubTileIcon typeId={tpl.type_id} size={40} />
                              ) : iconPath ? (
                                <img src={iconPath} alt={tpl.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                              ) : (
                                <FallbackIcon className="h-5 w-5" style={{ color: catStyle.color }} />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {tpl.name}
                                </span>
                                {tpl.popular && (
                                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as any}>
                                {tpl.description}
                              </p>
                            </div>
                            {isSelected && (
                              <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 10 }} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </>
            )}

            {!hubBrowse && filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No templates match your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
