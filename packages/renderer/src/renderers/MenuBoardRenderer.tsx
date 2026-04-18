'use client'

import { useMemo, useState, useEffect, type CSSProperties } from 'react'
import type { RendererProps } from './registry'

interface MenuItem {
  name?: string
  price?: string
  original_price?: string
  description?: string
  category?: string
  image_content_id?: string
  image_url?: string
  dietary?: string[] | string
  available?: boolean
}

interface MenuBoardConfig {
  title?: string
  layout?: 'qsr' | 'hero' | 'bistro' | 'cafe'
  background_color?: string
  text_color?: string
  accent_color?: string
  background_image_content_id?: string
  background_image_url?: string
  font_size?: 'small' | 'medium' | 'large'
  show_category_headers?: boolean
  time_based?: boolean
  breakfast_until?: string
  lunch_until?: string
  items?: MenuItem[]
}

function parseMinutes(t: string | undefined): number | null {
  if (!t || typeof t !== 'string') return null
  const m = t.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function mealSlot(
  nm: number,
  breakfastUntil: string,
  lunchUntil: string
): 'breakfast' | 'lunch' | 'dinner' {
  const b = parseMinutes(breakfastUntil) ?? 11 * 60
  const l = parseMinutes(lunchUntil) ?? 15 * 60
  if (nm < b) return 'breakfast'
  if (nm < l) return 'lunch'
  return 'dinner'
}

function itemMatchesMeal(item: MenuItem, meal: 'breakfast' | 'lunch' | 'dinner'): boolean {
  const c = (item.category || '').toLowerCase()
  if (!c.trim()) return true
  const keys: Record<typeof meal, string[]> = {
    breakfast: ['breakfast', 'brunch', 'morning'],
    lunch: ['lunch', 'midday'],
    dinner: ['dinner', 'evening', 'supper'],
  }
  return keys[meal].some((k) => c.includes(k))
}

function fontScale(fs: string | undefined): number {
  if (fs === 'small') return 0.88
  if (fs === 'large') return 1.15
  return 1
}

const DIETARY_LABEL: Record<string, string> = {
  vegan: '🌱',
  vegetarian: '🥦',
  gluten_free: '🌾',
  spicy: '🌶',
  new: '🆕',
  popular: '⭐',
}

export function MenuBoardRenderer({ config, contentUrl }: RendererProps) {
  const c = config as MenuBoardConfig
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 60000)
    return () => clearInterval(id)
  }, [])
  const nm = useMemo(() => nowMinutes(), [tick])

  const bg =
    c.background_image_url ||
    (c.background_image_content_id && contentUrl ? contentUrl : undefined)

  const scale = fontScale(c.font_size)
  const bgCol = c.background_color || '#111111'
  const textCol = c.text_color || '#ffffff'
  const accent = c.accent_color || '#e63946'

  const filteredItems = useMemo(() => {
    const raw = Array.isArray(c.items) ? c.items : []
    if (!c.time_based) return raw
    const meal = mealSlot(nm, c.breakfast_until || '11:00', c.lunch_until || '15:00')
    const matched = raw.filter((it) => itemMatchesMeal(it, meal))
    return matched.length ? matched : raw
  }, [c.items, c.time_based, c.breakfast_until, c.lunch_until, nm])

  const byCategory = useMemo(() => {
    const show = c.show_category_headers !== false
    if (!show) return { '': filteredItems }
    const m = new Map<string, MenuItem[]>()
    for (const it of filteredItems) {
      const cat = (it.category || 'Menu').trim() || 'Menu'
      if (!m.has(cat)) m.set(cat, [])
      m.get(cat)!.push(it)
    }
    return Object.fromEntries(m.entries())
  }, [filteredItems, c.show_category_headers])

  const layout = c.layout || 'qsr'

  const outer: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '100%',
    boxSizing: 'border-box',
    overflow: 'auto',
    fontFamily: 'system-ui, sans-serif',
    fontSize: `clamp(${0.9 * scale}rem, 2vw, ${1.25 * scale}rem)`,
  }

  return (
    <div style={outer}>
      {bg ? (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `${bgCol}cc`,
            }}
          />
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: bgCol }} />
      )}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 'clamp(1rem, 3vw, 2rem)',
          color: textCol,
        }}
      >
        <header style={{ marginBottom: '1.25rem', borderBottom: `3px solid ${accent}`, paddingBottom: '0.5rem' }}>
          <h1 style={{ margin: 0, fontSize: `clamp(${1.4 * scale}rem, 4vw, ${2.5 * scale}rem)`, fontWeight: 800 }}>
            {c.title || 'Our Menu'}
          </h1>
        </header>

        {layout === 'hero' && filteredItems[0] ? (
          <HeroLayout
            featured={filteredItems[0]}
            rest={filteredItems.slice(1)}
            accent={accent}
            scale={scale}
          />
        ) : layout === 'cafe' ? (
          <CafeGrid items={filteredItems} accent={accent} />
        ) : layout === 'bistro' ? (
          <BistroList
            byCategory={byCategory}
            showHeaders={c.show_category_headers !== false}
            accent={accent}
          />
        ) : (
          <QsrLayout
            byCategory={byCategory}
            showHeaders={c.show_category_headers !== false}
            accent={accent}
          />
        )}
      </div>
    </div>
  )
}

function DietaryBadges({ dietary }: { dietary?: string[] | string }) {
  const arr = Array.isArray(dietary)
    ? dietary
    : typeof dietary === 'string'
      ? dietary.split(',').map((s) => s.trim())
      : []
  if (!arr.length) return null
  return (
    <span style={{ marginLeft: 8, fontSize: '0.85em' }}>
      {arr.map((d) => (
        <span key={d} style={{ marginRight: 4, opacity: 0.95 }} title={d}>
          {DIETARY_LABEL[d] || d}
        </span>
      ))}
    </span>
  )
}

function MenuRow({
  item,
  accent,
}: {
  item: MenuItem
  accent: string
}) {
  const off = item.available === false
  const img = item.image_url
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
        padding: '0.65rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        opacity: off ? 0.55 : 1,
      }}
    >
      {img ? (
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 8,
            flexShrink: 0,
            background: `url(${img}) center/cover`,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        />
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, textDecoration: off ? 'line-through' : undefined }}>
            {item.name || 'Item'}
            <DietaryBadges dietary={item.dietary} />
          </span>
          <span style={{ color: accent, fontWeight: 800, whiteSpace: 'nowrap' }}>
            {item.original_price ? (
              <span style={{ textDecoration: 'line-through', opacity: 0.65, marginRight: 8, fontWeight: 500 }}>
                {item.original_price}
              </span>
            ) : null}
            {item.price || ''}
            {off ? <span style={{ marginLeft: 8, fontSize: '0.75em' }}>SOLD OUT</span> : null}
          </span>
        </div>
        {item.description ? (
          <div style={{ marginTop: 4, opacity: 0.85, fontSize: '0.92em' }}>{item.description}</div>
        ) : null}
      </div>
    </div>
  )
}

function QsrLayout({
  byCategory,
  showHeaders,
  accent,
}: {
  byCategory: Record<string, MenuItem[]>
  showHeaders: boolean
  accent: string
}) {
  return (
    <div>
      {Object.entries(byCategory).map(([cat, items]) => (
        <section key={cat} style={{ marginBottom: '1.5rem' }}>
          {showHeaders && cat ? (
            <h2 style={{ color: accent, fontSize: '1.15em', margin: '0 0 0.5rem', letterSpacing: '0.05em' }}>{cat}</h2>
          ) : null}
          {items.map((it, i) => (
            <MenuRow key={i} item={it} accent={accent} />
          ))}
        </section>
      ))}
    </div>
  )
}

function BistroList({
  byCategory,
  showHeaders,
  accent,
}: {
  byCategory: Record<string, MenuItem[]>
  showHeaders: boolean
  accent: string
}) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {Object.entries(byCategory).map(([cat, items]) => (
        <section key={cat} style={{ marginBottom: '2rem' }}>
          {showHeaders && cat ? (
            <h2 style={{ color: accent, fontWeight: 300, fontSize: '1.5rem', margin: '0 0 1rem', textAlign: 'center' }}>
              {cat}
            </h2>
          ) : null}
          {items.map((it, i) => (
            <MenuRow key={i} item={it} accent={accent} />
          ))}
        </section>
      ))}
    </div>
  )
}

function CafeGrid({ items, accent }: { items: MenuItem[]; accent: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
        gap: '1rem',
      }}
    >
      {items.map((it, i) => {
        const off = it.available === false
        const img = it.image_url
        return (
          <div
            key={i}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${accent}44`,
              opacity: off ? 0.55 : 1,
            }}
          >
            {img ? (
              <div style={{ height: 120, background: `url(${img}) center/cover` }} />
            ) : (
              <div style={{ height: 8, background: accent }} />
            )}
            <div style={{ padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, textDecoration: off ? 'line-through' : undefined }}>{it.name}</div>
              <div style={{ color: accent, fontWeight: 800, marginTop: 6 }}>
                {it.original_price ? (
                  <span style={{ textDecoration: 'line-through', opacity: 0.6, marginRight: 6 }}>{it.original_price}</span>
                ) : null}
                {it.price}
              </div>
              {it.description ? <div style={{ marginTop: 6, fontSize: '0.88em', opacity: 0.9 }}>{it.description}</div> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HeroLayout({
  featured,
  rest,
  accent,
  scale,
}: {
  featured: MenuItem
  rest: MenuItem[]
  accent: string
  scale: number
}) {
  const img = featured.image_url
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: img ? '1fr 1fr' : '1fr',
          gap: '1.5rem',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        {img ? <div style={{ minHeight: 220, borderRadius: 16, background: `url(${img}) center/cover` }} /> : null}
        <div>
          <div style={{ fontSize: `clamp(${1.5 * scale}rem, 4vw, 2.5rem)`, fontWeight: 900, color: accent }}>
            {featured.name}
          </div>
          <div style={{ marginTop: 12, fontSize: '1.4em', fontWeight: 800 }}>{featured.price}</div>
          {featured.description ? <p style={{ marginTop: 12, opacity: 0.9 }}>{featured.description}</p> : null}
        </div>
      </div>
      <QsrLayout byCategory={{ '': rest }} showHeaders={false} accent={accent} />
    </div>
  )
}
