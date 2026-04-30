'use client'

import { useMemo, CSSProperties } from 'react'
import { useAutoScroll } from '../hooks/useAutoScroll'

interface QuestionData {
  id: string
  title: string
  type: string
  responses: Record<string, number>
  text_responses?: string[]
}

interface GoogleFormsConfig {
  form_id: string
  display_mode?: 'summary_charts' | 'live_responses' | 'single_question'
  chart_type?: 'bar' | 'pie' | 'donut'
  show_question_text?: boolean
  auto_scroll?: boolean
  scroll_speed?: 'slow' | 'medium' | 'fast'
  refresh_interval?: number
  theme?: 'dark' | 'light' | 'google'
  _data?: {
    form_title: string
    total_responses: number
    questions: QuestionData[]
  }
}

interface GoogleFormsRendererProps {
  config: GoogleFormsConfig
}

const CHART_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF6D01', '#46BDC6', '#7BAAF7', '#E6696E']

function resolveTheme(theme: string) {
  switch (theme) {
    case 'light':
      return { bg: '#ffffff', text: '#111827', subtext: '#6b7280', cardBg: '#f9fafb', border: '#e5e7eb' }
    case 'google':
      return { bg: '#f8f9fa', text: '#202124', subtext: '#5f6368', cardBg: '#ffffff', border: '#dadce0' }
    default:
      return { bg: '#0f172a', text: '#f1f5f9', subtext: '#94a3b8', cardBg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' }
  }
}

function BarChart({ responses, maxVal }: { responses: Record<string, number>; maxVal: number }) {
  const entries = Object.entries(responses)
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {entries.map(([label, count], i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ width: '30%', fontSize: '0.75rem', textAlign: 'right', paddingRight: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </div>
          <div style={{ flex: 1, height: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: maxVal > 0 ? `${(count / maxVal) * 100}%` : '0%',
              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              borderRadius: '0.25rem',
              transition: 'width 0.5s ease',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '0.5rem',
              fontSize: '0.7rem',
              color: '#fff',
              fontWeight: 600,
            }}>
              {count}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function GoogleFormsRenderer({ config }: GoogleFormsRendererProps) {
  const {
    display_mode = 'summary_charts',
    chart_type = 'bar',
    show_question_text = true,
    auto_scroll = false,
    scroll_speed = 'medium',
    theme = 'dark',
    _data,
  } = config

  const scrollRef = useAutoScroll({
    autoScroll: auto_scroll,
    scrollSpeed: scroll_speed,
  })

  const colors = useMemo(() => resolveTheme(theme), [theme])
  const questions = _data?.questions || []
  const formTitle = _data?.form_title || ''
  const totalResponses = _data?.total_responses || 0

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: "'Inter', -apple-system, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '1rem',
  }

  if (!questions.length) {
    return (
      <div style={{ ...containerStyle, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.subtext, fontSize: '1rem' }}>No form data available</div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formTitle}</div>
        <div style={{ fontSize: '0.75rem', color: colors.subtext }}>{totalResponses} responses</div>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {questions.filter(q => Object.keys(q.responses).length > 0).map((q) => {
          const maxVal = Math.max(...Object.values(q.responses), 1)
          return (
            <div key={q.id} style={{
              padding: '0.75rem',
              marginBottom: '0.75rem',
              backgroundColor: colors.cardBg,
              borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`,
            }}>
              {show_question_text && (
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>{q.title}</div>
              )}
              <BarChart responses={q.responses} maxVal={maxVal} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
