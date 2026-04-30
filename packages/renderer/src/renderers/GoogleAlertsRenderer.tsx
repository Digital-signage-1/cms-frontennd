'use client'

import { useState, useEffect, useRef, useMemo, CSSProperties } from 'react'
import { useAutoScroll } from '../hooks/useAutoScroll'

interface NewsArticle {
  title: string
  link: string
  source: string
  published: string
  description?: string
}

interface GoogleAlertsConfig {
  topic: string
  language?: string
  region?: string
  max_items?: number
  display_mode?: 'ticker' | 'cards' | 'list'
  show_source?: boolean
  auto_scroll?: boolean
  scroll_speed?: 'slow' | 'medium' | 'fast'
  refresh_interval?: number
  theme?: 'dark' | 'light'
  _data?: { articles: NewsArticle[] }
}

interface GoogleAlertsRendererProps {
  config: GoogleAlertsConfig
}

function resolveTheme(theme: string) {
  return theme === 'light'
    ? { bg: '#ffffff', text: '#111827', subtext: '#6b7280', cardBg: '#f9fafb', border: '#e5e7eb', accent: '#4285F4' }
    : { bg: '#0f172a', text: '#f1f5f9', subtext: '#94a3b8', cardBg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', accent: '#60a5fa' }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  } catch {
    return ''
  }
}

function TickerMode({ articles, colors }: { articles: NewsArticle[]; colors: ReturnType<typeof resolveTheme> }) {
  const tickerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const el = tickerRef.current
    if (!el) return
    const speed = 1
    let animFrame: number
    const animate = () => {
      setOffset((prev) => {
        const newOffset = prev - speed
        if (el.scrollWidth > 0 && Math.abs(newOffset) >= el.scrollWidth / 2) {
          return 0
        }
        return newOffset
      })
      animFrame = requestAnimationFrame(animate)
    }
    animFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame)
  }, [articles])

  const text = articles.map(a => `${a.title}${a.source ? ` — ${a.source}` : ''}`).join('     \u2022     ')

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', overflow: 'hidden', backgroundColor: colors.bg }}>
      <div
        ref={tickerRef}
        style={{
          whiteSpace: 'nowrap',
          fontSize: '1.5rem',
          fontWeight: 500,
          color: colors.text,
          transform: `translateX(${offset}px)`,
        }}
      >
        {text}
        {'     \u2022     '}
        {text}
      </div>
    </div>
  )
}

function CardsMode({ articles, colors, showSource, autoScroll, scrollSpeed }: { articles: NewsArticle[]; colors: ReturnType<typeof resolveTheme>; showSource: boolean; autoScroll?: boolean; scrollSpeed?: 'slow' | 'medium' | 'fast' }) {
  const scrollRef = useAutoScroll({
    autoScroll,
    scrollSpeed,
  })

  return (
    <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '1rem' }}>
      {articles.map((article, i) => (
        <div key={i} style={{
          padding: '1rem',
          marginBottom: '0.75rem',
          backgroundColor: colors.cardBg,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: colors.text, marginBottom: '0.5rem', lineHeight: 1.3 }}>
            {article.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: colors.subtext }}>
            {showSource && article.source && (
              <span style={{ marginRight: '0.75rem', fontWeight: 500, color: colors.accent }}>{article.source}</span>
            )}
            {article.published && <span>{formatRelativeTime(article.published)}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function ListMode({ articles, colors, showSource, autoScroll, scrollSpeed }: { articles: NewsArticle[]; colors: ReturnType<typeof resolveTheme>; showSource: boolean; autoScroll?: boolean; scrollSpeed?: 'slow' | 'medium' | 'fast' }) {
  const scrollRef = useAutoScroll({
    autoScroll,
    scrollSpeed,
  })

  return (
    <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '0.5rem 1rem' }}>
      {articles.map((article, i) => (
        <div key={i} style={{
          padding: '0.75rem 0',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: colors.text, flex: 1, marginRight: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {article.title}
          </span>
          <span style={{ fontSize: '0.7rem', color: colors.subtext, whiteSpace: 'nowrap' }}>
            {showSource && article.source ? `${article.source} · ` : ''}
            {article.published ? formatRelativeTime(article.published) : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

export function GoogleAlertsRenderer({ config }: GoogleAlertsRendererProps) {
  const {
    display_mode = 'cards',
    show_source = true,
    auto_scroll = false,
    scroll_speed = 'medium',
    theme = 'dark',
    _data,
  } = config

  const colors = useMemo(() => resolveTheme(theme), [theme])
  const articles = _data?.articles || []

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: "'Inter', -apple-system, sans-serif",
    overflow: 'hidden',
  }

  if (!articles.length) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.subtext }}>
        No news articles available
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {display_mode === 'ticker' ? (
        <TickerMode articles={articles} colors={colors} />
      ) : display_mode === 'list' ? (
        <ListMode articles={articles} colors={colors} showSource={show_source} autoScroll={auto_scroll} scrollSpeed={scroll_speed} />
      ) : (
        <CardsMode articles={articles} colors={colors} showSource={show_source} autoScroll={auto_scroll} scrollSpeed={scroll_speed} />
      )}
    </div>
  )
}
