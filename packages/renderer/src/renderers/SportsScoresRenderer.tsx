'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ScoreEntry {
  id?: string
  name?: string
  home_team?: string
  home_score?: string
  home_logo?: string
  away_team?: string
  away_score?: string
  away_logo?: string
  status_text?: string
  clock?: string
  period?: number
  is_live?: boolean
}

interface SportsConfig {
  sport?: string
  league?: string
  display_mode?: string
  team_filter?: string
  refresh_interval?: number
  theme?: string
  api_base_url?: string
}

interface RendererProps {
  config: Record<string, any>
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

function getApiBase(config: SportsConfig): string {
  if (config.api_base_url) return config.api_base_url.replace(/\/+$/, '')
  try {
    var viteUrl = (import.meta as any).env && (import.meta as any).env.VITE_API_URL
    if (viteUrl) return (viteUrl as string).replace(/\/api\/v1\/?$/, '')
  } catch (_) { /* not in Vite */ }
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return ((window as any).__API_BASE_URL__ as string).replace(/\/+$/, '')
  }
  return ''
}

const THEMES: Record<string, { bg: string; text: string; accent: string; card: string; live: string }> = {
  dark: { bg: '#111827', text: '#f9fafb', accent: '#f59e0b', card: 'rgba(255,255,255,0.07)', live: '#22c55e' },
  light: { bg: '#f8fafc', text: '#1e293b', accent: '#2563eb', card: 'rgba(0,0,0,0.05)', live: '#16a34a' },
  sport: { bg: '#0a1a0a', text: '#e8f5e9', accent: '#4caf50', card: 'rgba(76,175,80,0.12)', live: '#76ff03' },
}

export function SportsScoresRenderer({ config, onError, onLoad }: RendererProps) {
  var cfg = config as unknown as SportsConfig
  var theme = THEMES[cfg.theme || 'dark'] || THEMES['dark']
  var [scores, setScores] = useState<ScoreEntry[]>([])
  var [loading, setLoading] = useState(true)
  var [error, setError] = useState<string | null>(null)
  var timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  var fetchScores = useCallback(function () {
    var sport = cfg.sport || 'basketball'
    var league = cfg.league || 'nba'
    var base = getApiBase(cfg)
    var url = base + '/api/v1/proxy/sports?sport=' + encodeURIComponent(sport) + '&league=' + encodeURIComponent(league)

    var headers: Record<string, string> = {}
    if (typeof window !== 'undefined') {
      var token = localStorage.getItem('signage_access_token')
      if (token) headers['Authorization'] = 'Bearer ' + token
    }

    fetch(url, { headers: headers })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then(function (json) {
        var data = (json.data && json.data.scores) ? json.data.scores : []
        var filter = (cfg.team_filter || '').toLowerCase().trim()
        if (filter) {
          data = data.filter(function (s: ScoreEntry) {
            var ht = (s.home_team || '').toLowerCase()
            var at = (s.away_team || '').toLowerCase()
            return ht.indexOf(filter) >= 0 || at.indexOf(filter) >= 0
          })
        }
        setScores(data)
        setError(null)
        setLoading(false)
        if (onLoad) onLoad()
      })
      .catch(function (err) {
        var msg = err instanceof Error ? err.message : 'Failed to load scores'
        setError(msg)
        setLoading(false)
        if (onError) onError(err instanceof Error ? err : new Error(msg))
      })
  }, [cfg.sport, cfg.league, cfg.team_filter])

  useEffect(function () {
    fetchScores()
  }, [fetchScores])

  useEffect(function () {
    var ms = (cfg.refresh_interval || 2) * 60 * 1000
    timerRef.current = setInterval(fetchScores, ms)
    return function () { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchScores, cfg.refresh_interval])

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: theme.text, opacity: 0.6, fontSize: 'clamp(0.9rem,1.5vw,1.8rem)' }}>Loading scores...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ fontSize: 'clamp(2rem,4vw,5rem)' }}>🏆</div>
        <div style={{ color: theme.text, opacity: 0.5, fontSize: 'clamp(0.8rem,1.3vw,1.6rem)', textAlign: 'center' as const }}>{error}</div>
        <button onClick={function () { setLoading(true); fetchScores() }} style={{ padding: '8px 20px', backgroundColor: theme.accent, color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: 'clamp(0.75rem,1.2vw,1.4rem)', fontWeight: 600 }}>
          Retry
        </button>
      </div>
    )
  }

  if (scores.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ fontSize: 'clamp(2rem,4vw,5rem)' }}>🏆</div>
        <div style={{ color: theme.text, opacity: 0.5, fontSize: 'clamp(0.9rem,1.5vw,1.9rem)' }}>No games scheduled</div>
        <div style={{ color: theme.text, opacity: 0.3, fontSize: 'clamp(0.7rem,1.1vw,1.4rem)' }}>
          {(cfg.league || 'nba').toUpperCase()} — {cfg.sport || 'basketball'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
      <div style={{ padding: 'clamp(8px,1.5vw,18px) clamp(12px,2vw,24px)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1rem,2vw,2.5rem)', fontWeight: 700, color: theme.accent }}>
          🏆 {(cfg.league || 'NBA').toUpperCase()} Scores
        </h1>
        <span style={{ fontSize: 'clamp(0.6rem,1vw,1.2rem)', opacity: 0.45 }}>Auto-refreshes every {cfg.refresh_interval || 2}m</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(8px,1.5vw,18px) clamp(12px,2vw,24px)', display: 'flex', flexDirection: 'column' as const, gap: 'clamp(6px,1vw,14px)' }}>
        {scores.map(function (game, idx) {
          return (
            <div key={game.id || idx} style={{
              backgroundColor: theme.card, borderRadius: '10px',
              padding: 'clamp(8px,1.5vw,18px) clamp(10px,1.8vw,22px)',
              border: game.is_live ? ('1px solid ' + theme.live) : '1px solid rgba(255,255,255,0.08)',
              minHeight: '8vh',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                {/* Away team */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'clamp(6px,1vw,12px)' }}>
                  {game.away_logo && (
                    <img src={game.away_logo} alt={game.away_team} style={{ width: 'clamp(24px,4vw,48px)', height: 'clamp(24px,4vw,48px)', objectFit: 'contain' as const }} onError={function (e) { (e.target as HTMLImageElement).style.display = 'none' }} />
                  )}
                  <span style={{ fontSize: 'clamp(0.8rem,1.5vw,1.8rem)', fontWeight: 600 }}>{game.away_team || 'Away'}</span>
                </div>
                {/* Scores */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px,1.2vw,16px)', flexShrink: 0 }}>
                  <span style={{ fontSize: 'clamp(1.2rem,2.5vw,3rem)', fontWeight: 700 }}>{game.away_score || '0'}</span>
                  <div style={{ textAlign: 'center' as const }}>
                    {game.is_live ? (
                      <div style={{ color: theme.live, fontSize: 'clamp(0.6rem,1vw,1.2rem)', fontWeight: 700 }}>
                        {game.clock || 'LIVE'}{game.period ? ' Q' + game.period : ''}
                      </div>
                    ) : (
                      <div style={{ color: theme.text, opacity: 0.5, fontSize: 'clamp(0.6rem,1vw,1.2rem)' }}>
                        {game.status_text || 'Final'}
                      </div>
                    )}
                    <div style={{ opacity: 0.3, fontSize: 'clamp(0.55rem,0.8vw,1rem)' }}>vs</div>
                  </div>
                  <span style={{ fontSize: 'clamp(1.2rem,2.5vw,3rem)', fontWeight: 700 }}>{game.home_score || '0'}</span>
                </div>
                {/* Home team */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'clamp(6px,1vw,12px)' }}>
                  <span style={{ fontSize: 'clamp(0.8rem,1.5vw,1.8rem)', fontWeight: 600 }}>{game.home_team || 'Home'}</span>
                  {game.home_logo && (
                    <img src={game.home_logo} alt={game.home_team} style={{ width: 'clamp(24px,4vw,48px)', height: 'clamp(24px,4vw,48px)', objectFit: 'contain' as const }} onError={function (e) { (e.target as HTMLImageElement).style.display = 'none' }} />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
