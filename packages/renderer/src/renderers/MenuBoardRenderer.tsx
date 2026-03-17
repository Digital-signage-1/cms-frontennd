'use client'

import { useState, useEffect, useRef } from 'react'

interface MenuItem {
  name?: string
  price?: string
  original_price?: string
  description?: string
  category?: string
  available?: boolean
  dietary?: string[]
}

interface MenuBoardConfig {
  title?: string
  layout?: string
  background_color?: string
  text_color?: string
  accent_color?: string
  font_size?: string
  show_category_headers?: boolean
  time_based?: boolean
  breakfast_until?: string
  lunch_until?: string
  items?: MenuItem[]
}

interface RendererProps {
  config: Record<string, any>
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

function parseTimeMinutes(t: string): number {
  var parts = (t || '12:00').split(':')
  return parseInt(parts[0] || '12', 10) * 60 + (parseInt(parts[1] || '0', 10))
}

function getActiveSection(cfg: MenuBoardConfig): string {
  if (!cfg.time_based) return 'all'
  var now = new Date()
  var cur = now.getHours() * 60 + now.getMinutes()
  var bf = parseTimeMinutes(cfg.breakfast_until || '11:00')
  var lu = parseTimeMinutes(cfg.lunch_until || '15:00')
  if (cur < bf) return 'breakfast'
  if (cur < lu) return 'lunch'
  return 'dinner'
}

function filterItems(items: MenuItem[], cfg: MenuBoardConfig): MenuItem[] {
  if (!cfg.time_based) return items
  var section = getActiveSection(cfg)
  if (section === 'all') return items
  return items.filter(function (item) {
    var cat = (item.category || '').toLowerCase()
    var isBf = cat.indexOf('breakfast') >= 0
    var isLu = cat.indexOf('lunch') >= 0
    var isDi = cat.indexOf('dinner') >= 0
    if (!isBf && !isLu && !isDi) return true
    if (section === 'breakfast') return isBf
    if (section === 'lunch') return isLu
    return isDi
  })
}

function groupByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
  var groups: Record<string, MenuItem[]> = {}
  for (var i = 0; i < items.length; i++) {
    var cat = items[i].category || 'Other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(items[i])
  }
  return groups
}

const DIETARY_COLORS: Record<string, string> = {
  vegan: '#22c55e', vegetarian: '#86efac', gluten_free: '#fbbf24',
  spicy: '#ef4444', new: '#3b82f6', popular: '#f97316',
}
const DIETARY_EMOJI: Record<string, string> = {
  vegan: '🌱', vegetarian: '🥦', gluten_free: '🌾',
  spicy: '🌶', new: '🆕', popular: '⭐',
}

function DietaryBadge({ tag }: { tag: string }) {
  var color = DIETARY_COLORS[tag] || '#888'
  var emoji = DIETARY_EMOJI[tag] || tag
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '2px',
      padding: '1px 5px', borderRadius: '9999px',
      backgroundColor: color + '25', border: '1px solid ' + color + '55',
      fontSize: 'clamp(0.55rem,0.8vw,0.9rem)', color: color,
      marginRight: '3px', marginBottom: '2px',
    }}>
      {emoji}
    </span>
  )
}

function getFonts(size: string) {
  if (size === 'large') return {
    h1: 'clamp(1.4rem,2.8vw,3.5rem)', cat: 'clamp(1.1rem,2vw,2.5rem)',
    name: 'clamp(1rem,1.8vw,2.2rem)', price: 'clamp(1.1rem,2.2vw,2.8rem)',
    desc: 'clamp(0.7rem,1.2vw,1.5rem)', badge: 'clamp(0.6rem,0.9vw,1rem)',
  }
  if (size === 'small') return {
    h1: 'clamp(0.9rem,1.6vw,2rem)', cat: 'clamp(0.8rem,1.4vw,1.6rem)',
    name: 'clamp(0.75rem,1.2vw,1.4rem)', price: 'clamp(0.8rem,1.4vw,1.7rem)',
    desc: 'clamp(0.6rem,0.9vw,1.1rem)', badge: 'clamp(0.5rem,0.7vw,0.8rem)',
  }
  return { // medium
    h1: 'clamp(1.1rem,2.2vw,2.8rem)', cat: 'clamp(0.95rem,1.7vw,2rem)',
    name: 'clamp(0.85rem,1.5vw,1.8rem)', price: 'clamp(0.9rem,1.7vw,2.1rem)',
    desc: 'clamp(0.65rem,1vw,1.2rem)', badge: 'clamp(0.55rem,0.8vw,0.9rem)',
  }
}

function SoldOutOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
    }}>
      <span style={{
        color: '#ef4444', fontWeight: 700,
        fontSize: 'clamp(0.65rem,1.2vw,1.5rem)',
        letterSpacing: '0.1em', textTransform: 'uppercase' as const,
        border: '2px solid #ef4444', padding: '3px 8px', borderRadius: '4px',
        transform: 'rotate(-15deg)', display: 'inline-block',
      }}>
        SOLD OUT
      </span>
    </div>
  )
}

function QSRLayout({ items, cfg, fonts }: { items: MenuItem[]; cfg: MenuBoardConfig; fonts: ReturnType<typeof getFonts> }) {
  var bg = cfg.background_color || '#111111'
  var text = cfg.text_color || '#ffffff'
  var accent = cfg.accent_color || '#e63946'
  var groups = groupByCategory(items)
  var cats = Object.keys(groups)
  return (
    <div style={{
      width: '100%', height: '100%', backgroundColor: bg, color: text,
      overflowY: 'auto', overflowX: 'hidden',
      padding: 'clamp(8px,1.5vw,24px)', boxSizing: 'border-box',
    }}>
      {cfg.title && (
        <h1 style={{
          textAlign: 'center', fontSize: fonts.h1, fontWeight: 700,
          letterSpacing: '0.05em', margin: '0 0 clamp(8px,1.5vw,20px)', color: text,
        }}>
          {cfg.title}
        </h1>
      )}
      {cats.map(function (cat) {
        var catItems = groups[cat]
        return (
          <div key={cat} style={{ marginBottom: 'clamp(12px,2vw,28px)' }}>
            {cfg.show_category_headers !== false && (
              <div style={{
                backgroundColor: accent, color: '#fff',
                fontSize: fonts.cat, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                padding: 'clamp(4px,0.7vw,10px) clamp(8px,1.5vw,20px)',
                marginBottom: 'clamp(6px,1vw,12px)',
              }}>
                {cat}
              </div>
            )}
            <div style={{
              display: 'flex', flexWrap: 'wrap' as const,
              gap: 'clamp(6px,1vw,14px)',
            }}>
              {catItems.map(function (item, idx) {
                var avail = item.available !== false
                return (
                  <div key={idx} style={{
                    position: 'relative',
                    width: 'clamp(120px,18vw,240px)',
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    borderRadius: '8px', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    filter: avail ? 'none' : 'grayscale(0.7)',
                    minHeight: '8vh',
                  }}>
                    <div style={{
                      width: '100%', paddingBottom: '55%', position: 'relative',
                      backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'clamp(1.5rem,3vw,4rem)', opacity: 0.25,
                      }}>
                        🍽️
                      </div>
                    </div>
                    {!avail && <SoldOutOverlay />}
                    <div style={{ padding: 'clamp(4px,0.8vw,10px)' }}>
                      <div style={{ fontSize: fonts.name, fontWeight: 600, lineHeight: 1.2, marginBottom: '2px' }}>
                        {avail ? item.name : <s>{item.name}</s>}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: fonts.desc, opacity: 0.6, marginBottom: '4px', lineHeight: 1.3 }}>
                          {item.description}
                        </div>
                      )}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginTop: '4px', flexWrap: 'wrap' as const, gap: '4px',
                      }}>
                        <div>
                          {item.original_price && (
                            <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: fonts.desc, marginRight: '4px' }}>
                              {item.original_price}
                            </span>
                          )}
                          <span style={{ color: accent, fontWeight: 700, fontSize: fonts.price }}>
                            {item.price || ''}
                          </span>
                        </div>
                        {item.dietary && item.dietary.length > 0 && (
                          <div>
                            {item.dietary.map(function (tag) { return <DietaryBadge key={tag} tag={tag} /> })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HeroLayout({ items, cfg, fonts }: { items: MenuItem[]; cfg: MenuBoardConfig; fonts: ReturnType<typeof getFonts> }) {
  var bg = cfg.background_color || '#111111'
  var text = cfg.text_color || '#ffffff'
  var accent = cfg.accent_color || '#e63946'
  var avail = items.filter(function (i) { return i.available !== false })
  var heroPool = avail.length > 0 ? avail : items
  var [heroIdx, setHeroIdx] = useState(0)
  var timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(function () {
    if (heroPool.length <= 1) return
    timerRef.current = setInterval(function () {
      setHeroIdx(function (n) { return (n + 1) % heroPool.length })
    }, 8000)
    return function () { if (timerRef.current) clearInterval(timerRef.current) }
  }, [heroPool.length])

  var hero = heroPool[heroIdx] || heroPool[0]
  if (!hero) return null
  var groups = groupByCategory(items)

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: bg, color: text, display: 'flex', overflow: 'hidden' }}>
      <div style={{
        flex: '0 0 60%', position: 'relative',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 100%)',
        display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-end',
        padding: 'clamp(16px,3vw,40px)',
      }}>
        <div style={{ fontSize: fonts.desc, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: accent, marginBottom: '8px', opacity: 0.9 }}>
          ★ {hero.category || 'Featured'}
        </div>
        <div style={{ fontSize: 'clamp(1.5rem,3.5vw,4.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '8px' }}>
          {hero.name || ''}
        </div>
        {hero.description && (
          <div style={{ fontSize: fonts.name, opacity: 0.8, marginBottom: '12px', maxWidth: '80%' }}>
            {hero.description}
          </div>
        )}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }}>
          <div style={{
            backgroundColor: accent, color: '#fff',
            fontSize: 'clamp(1.1rem,2.2vw,3rem)', fontWeight: 700,
            padding: 'clamp(4px,0.8vw,12px) clamp(10px,2vw,24px)', borderRadius: '8px',
          }}>
            {hero.price || ''}
          </div>
          {hero.dietary && hero.dietary.map(function (tag) { return <DietaryBadge key={tag} tag={tag} /> })}
        </div>
        {heroPool.length > 1 && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '14px' }}>
            {heroPool.map(function (_, i) {
              return (
                <div key={i} style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: i === heroIdx ? accent : 'rgba(255,255,255,0.3)',
                }} />
              )
            })}
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(12px,2vw,28px)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
        {cfg.title && (
          <div style={{ fontSize: fonts.cat, fontWeight: 700, color: accent, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 'clamp(8px,1.5vw,16px)' }}>
            {cfg.title}
          </div>
        )}
        {Object.keys(groups).map(function (cat) {
          return (
            <div key={cat} style={{ marginBottom: 'clamp(10px,2vw,20px)' }}>
              <div style={{ fontSize: fonts.desc, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: accent, opacity: 0.75, marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                {cat}
              </div>
              {groups[cat].map(function (item, idx) {
                return (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 'clamp(4px,0.7vw,8px) 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    opacity: item.available !== false ? 1 : 0.4,
                  }}>
                    <span style={{ fontSize: fonts.name, flex: 1, paddingRight: '8px' }}>
                      {item.available !== false ? item.name : <s>{item.name}</s>}
                    </span>
                    <span style={{ fontSize: fonts.price, fontWeight: 700, color: accent, whiteSpace: 'nowrap' as const }}>
                      {item.price || ''}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BistroLayout({ items, cfg, fonts }: { items: MenuItem[]; cfg: MenuBoardConfig; fonts: ReturnType<typeof getFonts> }) {
  var bg = cfg.background_color || '#f5f0e8'
  var text = cfg.text_color || '#2c2c2c'
  var accent = cfg.accent_color || '#8b5e3c'
  var groups = groupByCategory(items)
  var cats = Object.keys(groups)
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: bg, color: text, display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: '0 0 clamp(80px,18%,180px)', borderRight: '1px solid rgba(0,0,0,0.12)', padding: 'clamp(12px,2vw,24px)', overflowY: 'auto' }}>
        {cfg.title && (
          <div style={{ fontSize: fonts.cat, fontWeight: 700, marginBottom: 'clamp(12px,2vw,24px)', color: accent }}>{cfg.title}</div>
        )}
        {cats.map(function (cat) {
          return (
            <div key={cat} style={{ fontSize: fonts.name, padding: 'clamp(4px,0.8vw,10px) 0', borderBottom: '1px solid rgba(0,0,0,0.08)', opacity: 0.75 }}>
              {cat}
            </div>
          )
        })}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(12px,2vw,32px)' }}>
        {cats.map(function (cat) {
          return (
            <div key={cat} style={{ marginBottom: 'clamp(16px,3vw,40px)' }}>
              {cfg.show_category_headers !== false && (
                <div style={{ fontSize: fonts.cat, fontWeight: 700, color: accent, marginBottom: 'clamp(8px,1.5vw,16px)', borderBottom: '2px solid ' + accent, paddingBottom: '6px' }}>
                  {cat}
                </div>
              )}
              {groups[cat].map(function (item, idx) {
                return (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: 'clamp(6px,1.2vw,14px) 0', borderBottom: '1px solid rgba(0,0,0,0.07)',
                    opacity: item.available !== false ? 1 : 0.4, minHeight: '8vh',
                  }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: fonts.name, fontWeight: 600 }}>
                        {item.available !== false ? item.name : <s>{item.name}</s>}
                        {item.available === false && <span style={{ color: '#ef4444', fontSize: fonts.badge, marginLeft: '8px' }}>(SOLD OUT)</span>}
                      </div>
                      {item.description && <div style={{ fontSize: fonts.desc, opacity: 0.65, marginTop: '2px' }}>{item.description}</div>}
                      {item.dietary && item.dietary.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          {item.dietary.map(function (tag) { return <DietaryBadge key={tag} tag={tag} /> })}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                      {item.original_price && <div style={{ textDecoration: 'line-through', opacity: 0.45, fontSize: fonts.desc }}>{item.original_price}</div>}
                      <div style={{ fontSize: fonts.price, fontWeight: 700, color: accent }}>{item.price || ''}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CafeLayout({ items, cfg, fonts }: { items: MenuItem[]; cfg: MenuBoardConfig; fonts: ReturnType<typeof getFonts> }) {
  var bg = cfg.background_color || '#1a0f08'
  var text = cfg.text_color || '#f5e6d3'
  var accent = cfg.accent_color || '#d4943a'
  var groups = groupByCategory(items)
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: bg, color: text, overflowY: 'auto', padding: 'clamp(8px,1.5vw,24px)', boxSizing: 'border-box' }}>
      {cfg.title && (
        <h1 style={{ textAlign: 'center', fontSize: fonts.h1, fontWeight: 300, letterSpacing: '0.2em', margin: '0 0 clamp(10px,2vw,24px)', color: accent, textTransform: 'uppercase' as const }}>
          {cfg.title}
        </h1>
      )}
      {Object.keys(groups).map(function (cat) {
        return (
          <div key={cat} style={{ marginBottom: 'clamp(14px,2.5vw,32px)' }}>
            {cfg.show_category_headers !== false && (
              <div style={{ fontSize: fonts.cat, color: accent, textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 'clamp(6px,1vw,12px)', opacity: 0.9 }}>
                — {cat} —
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'clamp(6px,1vw,14px)' }}>
              {groups[cat].map(function (item, idx) {
                var avail = item.available !== false
                return (
                  <div key={idx} style={{
                    width: 'clamp(110px,16vw,200px)', padding: 'clamp(6px,1.2vw,14px)',
                    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.08)', opacity: avail ? 1 : 0.45,
                    position: 'relative', minHeight: '8vh',
                  }}>
                    {!avail && (
                      <div style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#ef4444', color: '#fff', fontSize: fonts.badge, padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                        SOLD OUT
                      </div>
                    )}
                    <div style={{ fontSize: fonts.name, fontWeight: 600, marginBottom: '4px' }}>{item.name || ''}</div>
                    <div style={{ fontSize: fonts.price, fontWeight: 700, color: accent }}>{item.price || ''}</div>
                    {item.dietary && item.dietary.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        {item.dietary.map(function (tag) { return <DietaryBadge key={tag} tag={tag} /> })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function MenuBoardRenderer({ config, onLoad }: RendererProps) {
  var cfg = config as unknown as MenuBoardConfig
  var layout = cfg.layout || 'qsr'
  var fonts = getFonts(cfg.font_size || 'medium')
  var allItems: MenuItem[] = Array.isArray(cfg.items) ? cfg.items : []
  var items = filterItems(allItems, cfg)

  useEffect(function () { if (onLoad) onLoad() }, [])

  if (items.length === 0) {
    return (
      <div style={{
        width: '100%', height: '100%', backgroundColor: cfg.background_color || '#111',
        color: cfg.text_color || '#fff', display: 'flex', flexDirection: 'column' as const,
        alignItems: 'center', justifyContent: 'center', gap: '12px',
      }}>
        <div style={{ fontSize: 'clamp(2rem,5vw,6rem)' }}>🍽️</div>
        <div style={{ fontSize: fonts.h1, opacity: 0.7 }}>{cfg.title || 'Menu Board'}</div>
        <div style={{ fontSize: fonts.desc, opacity: 0.4 }}>Add menu items to get started</div>
      </div>
    )
  }

  if (layout === 'hero') return <HeroLayout items={items} cfg={cfg} fonts={fonts} />
  if (layout === 'bistro') return <BistroLayout items={items} cfg={cfg} fonts={fonts} />
  if (layout === 'cafe') return <CafeLayout items={items} cfg={cfg} fonts={fonts} />
  return <QSRLayout items={items} cfg={cfg} fonts={fonts} />
}
