'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useIntegrationDataFetcher } from '../IntegrationDataContext'

interface SheetRendererProps {
  config: {
    source_type?: 'google_sheets' | 'upload'
    sheet_url?: string
    file_content_url?: string
    sheet_name?: string
    header_row?: boolean
    show_row_numbers?: boolean
    show_gridlines?: boolean
    auto_scroll?: boolean
    scroll_speed?: 'slow' | 'medium' | 'fast'
    refresh_interval?: number
    theme?: 'dark' | 'light' | 'excel' | 'minimal'
    font_size?: 'small' | 'medium' | 'large'
    highlight_alternate_rows?: boolean
    header_color?: string
    background_color?: string
    text_color?: string
  }
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

type CellValue = string | number | boolean | null
type Row = CellValue[]

/** Convert Google Sheets URL to a CSV export URL */
function toGoogleCsvUrl(url: string, sheetName?: string): string | null {
  // Match /spreadsheets/d/SPREADSHEET_ID
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  if (!match) return null
  const id = match[1]
  let csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`
  if (sheetName) csvUrl += `&sheet=${encodeURIComponent(sheetName)}`
  return csvUrl
}

/** Minimal CSV parser — handles quoted fields, newlines inside quotes, etc. */
function parseCSV(text: string): Row[] {
  const rows: Row[] = []
  let i = 0
  const len = text.length

  while (i < len) {
    const row: CellValue[] = []
    while (i < len) {
      let value = ''

      if (text[i] === '"') {
        // Quoted field
        i++ // skip opening quote
        while (i < len) {
          if (text[i] === '"') {
            if (i + 1 < len && text[i + 1] === '"') {
              value += '"'
              i += 2
            } else {
              i++ // skip closing quote
              break
            }
          } else {
            value += text[i]
            i++
          }
        }
      } else {
        // Unquoted field
        while (i < len && text[i] !== ',' && text[i] !== '\r' && text[i] !== '\n') {
          value += text[i]
          i++
        }
      }

      row.push(value)

      if (i < len && text[i] === ',') {
        i++ // skip comma
      } else {
        break // end of row
      }
    }

    // Skip newline(s)
    while (i < len && (text[i] === '\r' || text[i] === '\n')) i++
    if (row.length > 0 && !(row.length === 1 && row[0] === '')) {
      rows.push(row)
    }
  }

  return rows
}

/** Detect if value looks numeric */
function formatCell(val: CellValue): string {
  if (val === null || val === undefined) return ''
  return String(val)
}

// ── Theme configurations ──────────────────────────────────────────────────────
interface ThemeConfig {
  bg: string
  headerBg: string
  headerText: string
  cellBg: string
  cellAltBg: string
  cellText: string
  border: string
  rowNumBg: string
  rowNumText: string
  scrollbarTrack: string
  scrollbarThumb: string
}

function getTheme(
  themeName: string,
  headerColor?: string,
  bgColor?: string,
  textColor?: string,
): ThemeConfig {
  switch (themeName) {
    case 'light':
      return {
        bg: bgColor || '#ffffff',
        headerBg: headerColor || '#f1f5f9',
        headerText: '#0f172a',
        cellBg: '#ffffff',
        cellAltBg: '#f8fafc',
        cellText: textColor || '#1e293b',
        border: '#e2e8f0',
        rowNumBg: '#f1f5f9',
        rowNumText: '#94a3b8',
        scrollbarTrack: '#f1f5f9',
        scrollbarThumb: '#cbd5e1',
      }
    case 'excel':
      return {
        bg: bgColor || '#ffffff',
        headerBg: headerColor || '#4472C4',
        headerText: '#ffffff',
        cellBg: '#ffffff',
        cellAltBg: '#D9E2F3',
        cellText: textColor || '#000000',
        border: '#8EA9DB',
        rowNumBg: '#E2EFDA',
        rowNumText: '#375623',
        scrollbarTrack: '#f0f0f0',
        scrollbarThumb: '#4472C4',
      }
    case 'minimal':
      return {
        bg: bgColor || '#fafafa',
        headerBg: headerColor || 'transparent',
        headerText: textColor || '#374151',
        cellBg: 'transparent',
        cellAltBg: 'transparent',
        cellText: textColor || '#4b5563',
        border: '#e5e7eb',
        rowNumBg: 'transparent',
        rowNumText: '#9ca3af',
        scrollbarTrack: '#f3f4f6',
        scrollbarThumb: '#d1d5db',
      }
    case 'dark':
    default:
      return {
        bg: bgColor || '#0f172a',
        headerBg: headerColor || '#1e40af',
        headerText: '#ffffff',
        cellBg: '#1e293b',
        cellAltBg: '#0f172a',
        cellText: textColor || '#e2e8f0',
        border: '#334155',
        rowNumBg: '#1e293b',
        rowNumText: '#64748b',
        scrollbarTrack: '#1e293b',
        scrollbarThumb: '#475569',
      }
  }
}

const FONT_SIZES: Record<string, { cell: number; header: number }> = {
  small: { cell: 12, header: 12 },
  medium: { cell: 14, header: 14 },
  large: { cell: 16, header: 16 },
}

// ── Main Component ────────────────────────────────────────────────────────────
export function SheetRenderer({ config, contentUrl, onError, onLoad }: SheetRendererProps) {
  const {
    source_type = 'google_sheets',
    sheet_url = '',
    file_content_url,
    sheet_name, // fallback/legacy
    integration_id,
    spreadsheet_id,
    selected_tabs = [],
    tab_duration = 10,
    header_row = true,
    show_row_numbers = true,
    show_gridlines = true,
    auto_scroll = false,
    scroll_speed = 'medium',
    refresh_interval = 5,
    theme: themeName = 'dark',
    font_size = 'medium',
    highlight_alternate_rows = true,
    header_color,
    background_color,
    text_color,
  } = config

  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [activeTabName, setActiveTabName] = useState<string | null>(null)

  const fetcher = useIntegrationDataFetcher()

  const tableRef = useRef<HTMLDivElement>(null)
  const scrollAnimRef = useRef<number | null>(null)

  const t = useMemo(
    () => getTheme(themeName, header_color, background_color, text_color),
    [themeName, header_color, background_color, text_color],
  )
  const fs = FONT_SIZES[font_size] || FONT_SIZES.medium

  // ── Fetch & parse data ────────────────────────────────────────────────────
  const fetchData = useCallback(async (tabName?: string) => {
    try {
      setLoading(true)
      setError(null)

      let csvText: string | null = null
      let rowsData: any[][] | null = null

      // Priority 1: Integration-based Google Sheets (new flow)
      if (source_type === 'google_sheets' && integration_id && spreadsheet_id) {
        if (!fetcher) {
          setError('Integration fetcher not available')
          setLoading(false)
          return
        }

        const effectiveTab = tabName || (selected_tabs.length > 0 ? selected_tabs[currentTabIndex] : sheet_name)
        setActiveTabName(effectiveTab || 'Sheet1')

        const data = await fetcher.startFetch(
          integration_id,
          spreadsheet_id,
          'spreadsheet',
          refresh_interval * 60 * 1000,
          undefined,
          { sheet_name: effectiveTab }
        )

        if (data && data.values) {
          rowsData = data.values as any[][]
        } else {
          throw new Error('Failed to fetch spreadsheet data')
        }
      } 
      // Priority 2: Public Google Sheets URL
      else if (source_type === 'google_sheets' && sheet_url) {
        const csvUrl = toGoogleCsvUrl(sheet_url, tabName || sheet_name)
        if (!csvUrl) {
          setError('Invalid Google Sheets URL. Use the full sharing link.')
          setLoading(false)
          return
        }
        const res = await fetch(csvUrl)
        if (!res.ok) throw new Error(`Failed to fetch sheet (${res.status})`)
        csvText = await res.text()
      } 
      // Priority 3: Uploaded File
      else if (source_type === 'upload') {
        // Use the content URL provided by the manifest or config
        const url = file_content_url || contentUrl
        if (!url) {
          setError('No file uploaded. Select a CSV or Excel file from your content library.')
          setLoading(false)
          return
        }
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`)
        csvText = await res.text()
      } else {
        setError('No spreadsheet source configured')
        setLoading(false)
        return
      }

      if (!rowsData && csvText) {
        if (csvText.trim().length === 0) {
          setError('Spreadsheet is empty')
          setLoading(false)
          return
        }
        rowsData = parseCSV(csvText)
      }

      if (!rowsData || rowsData.length === 0) {
        setError('No data found in spreadsheet')
        setLoading(false)
        return
      }

      if (header_row && rowsData.length > 0) {
        setHeaders(rowsData[0].map(v => formatCell(v)))
        setRows(rowsData.slice(1))
      } else {
        setHeaders([])
        setRows(rowsData)
      }

      setLoading(false)
      onLoad?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load spreadsheet'
      setError(msg)
      setLoading(false)
      onError?.(err instanceof Error ? err : new Error(msg))
    }
  }, [
    source_type,
    sheet_url,
    sheet_name,
    integration_id,
    spreadsheet_id,
    selected_tabs,
    currentTabIndex,
    fetcher,
    file_content_url,
    contentUrl,
    header_row,
    refresh_interval,
    onLoad,
    onError,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Tab Cycling Logic ─────────────────────────────────────────────────────
  useEffect(() => {
    if (selected_tabs.length <= 1 || tab_duration <= 0) return

    const timer = setInterval(() => {
      setCurrentTabIndex(prev => (prev + 1) % selected_tabs.length)
    }, tab_duration * 1000)

    return () => clearInterval(timer)
  }, [selected_tabs, tab_duration])

  // Auto-refresh for Google Sheets
  useEffect(() => {
    if (source_type !== 'google_sheets' || refresh_interval <= 0 || integration_id) return
    const interval = setInterval(() => fetchData(), refresh_interval * 60 * 1000)
    return () => clearInterval(interval)
  }, [source_type, integration_id, refresh_interval, fetchData])

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!auto_scroll || loading || error) return
    const el = tableRef.current
    if (!el) return

    const speeds: Record<string, number> = { slow: 0.3, medium: 0.7, fast: 1.5 }
    const px = speeds[scroll_speed] || 0.7
    let scrollY = 0

    const step = () => {
      scrollY += px
      if (scrollY >= el.scrollHeight - el.clientHeight) {
        // Pause at bottom, then reset
        setTimeout(() => {
          scrollY = 0
          el.scrollTop = 0
          scrollAnimRef.current = requestAnimationFrame(step)
        }, 3000)
        return
      }
      el.scrollTop = scrollY
      scrollAnimRef.current = requestAnimationFrame(step)
    }

    scrollAnimRef.current = requestAnimationFrame(step)
    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current)
    }
  }, [auto_scroll, scroll_speed, loading, error])

  // ── Column count ─────────────────────────────────────────────────────────
  const colCount = useMemo(() => {
    if (headers.length > 0) return headers.length
    return rows.reduce((max, r) => Math.max(max, r.length), 0)
  }, [headers, rows])

  // Generate column letters (A, B, C, ... AA, AB, ...)
  const colLetters = useMemo(() => {
    const letters: string[] = []
    for (let i = 0; i < colCount; i++) {
      let letter = ''
      let n = i
      while (n >= 0) {
        letter = String.fromCharCode(65 + (n % 26)) + letter
        n = Math.floor(n / 26) - 1
      }
      letters.push(letter)
    }
    return letters
  }, [colCount])

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: t.bg, gap: 12,
        }}
      >
        <div
          style={{
            width: 32, height: 32, border: '3px solid', borderColor: t.border,
            borderTopColor: t.headerBg, borderRadius: '50%',
            animation: 'sheet-spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes sheet-spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13, color: t.cellText, opacity: 0.7 }}>Loading spreadsheet...</span>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: t.bg, gap: 8,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#f87171' }}>Sheet Error</span>
        <span style={{ fontSize: 12, color: t.cellText, opacity: 0.6, maxWidth: '80%', textAlign: 'center' }}>
          {error}
        </span>
      </div>
    )
  }

  // ── Spreadsheet table ──────────────────────────────────────────────────
  const borderStyle = show_gridlines ? `1px solid ${t.border}` : 'none'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: t.bg,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace",
      }}
    >
      {/* Formula bar / info bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 8px',
          background: t.rowNumBg,
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
          minHeight: 28,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: t.rowNumText,
            padding: '2px 8px',
            background: t.bg,
            borderRadius: 3,
            border: `1px solid ${t.border}`,
          }}
        >
          {rows.length} rows × {colCount} cols
        </span>
        {sheet_name && (
          <span style={{ fontSize: 11, color: t.rowNumText }}>
            Sheet: {sheet_name}
          </span>
        )}
      </div>

      {/* Scrollable table area */}
      <div
        ref={tableRef}
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'auto',
            fontSize: fs.cell,
          }}
        >
          {/* Column headers (letters) */}
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            {/* Column letter row (A, B, C...) */}
            <tr>
              {show_row_numbers && (
                <th
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                    width: 44,
                    minWidth: 44,
                    background: t.rowNumBg,
                    border: borderStyle,
                    padding: '3px 4px',
                    fontSize: 10,
                    color: t.rowNumText,
                    textAlign: 'center',
                    fontWeight: 500,
                  }}
                />
              )}
              {colLetters.map((letter, ci) => (
                <th
                  key={ci}
                  style={{
                    background: t.rowNumBg,
                    border: borderStyle,
                    padding: '3px 8px',
                    fontSize: 10,
                    color: t.rowNumText,
                    textAlign: 'center',
                    fontWeight: 500,
                    minWidth: 60,
                  }}
                >
                  {letter}
                </th>
              ))}
            </tr>

            {/* Header row (from data) */}
            {header_row && headers.length > 0 && (
              <tr>
                {show_row_numbers && (
                  <th
                    style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      width: 44,
                      minWidth: 44,
                      background: t.headerBg,
                      border: borderStyle,
                      padding: '6px 4px',
                      fontSize: fs.header,
                      color: t.headerText,
                      textAlign: 'center',
                      fontWeight: 700,
                    }}
                  >
                    #
                  </th>
                )}
                {headers.map((h, ci) => (
                  <th
                    key={ci}
                    style={{
                      background: t.headerBg,
                      border: borderStyle,
                      padding: '6px 10px',
                      fontSize: fs.header,
                      color: t.headerText,
                      textAlign: 'left',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
                {/* Fill empty header cells if row has fewer cols */}
                {Array.from({ length: Math.max(0, colCount - headers.length) }).map((_, i) => (
                  <th
                    key={`empty-h-${i}`}
                    style={{
                      background: t.headerBg,
                      border: borderStyle,
                      padding: '6px 10px',
                    }}
                  />
                ))}
              </tr>
            )}
          </thead>

          <tbody>
            {rows.map((row, ri) => {
              const isAlt = highlight_alternate_rows && ri % 2 === 1
              const cellBg = isAlt ? t.cellAltBg : t.cellBg
              return (
                <tr key={ri}>
                  {show_row_numbers && (
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                        width: 44,
                        minWidth: 44,
                        background: t.rowNumBg,
                        border: borderStyle,
                        padding: '4px 4px',
                        fontSize: 11,
                        color: t.rowNumText,
                        textAlign: 'center',
                        fontWeight: 500,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {ri + 1}
                    </td>
                  )}
                  {Array.from({ length: colCount }).map((_, ci) => (
                    <td
                      key={ci}
                      style={{
                        background: cellBg,
                        border: borderStyle,
                        padding: '4px 10px',
                        color: t.cellText,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 300,
                      }}
                    >
                      {ci < row.length ? formatCell(row[ci]) : ''}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Custom scrollbar styling */}
      <style>{`
        div::-webkit-scrollbar { width: 8px; height: 8px; }
        div::-webkit-scrollbar-track { background: ${t.scrollbarTrack}; }
        div::-webkit-scrollbar-thumb { background: ${t.scrollbarThumb}; border-radius: 4px; }
        div::-webkit-scrollbar-thumb:hover { opacity: 0.8; }
      `}</style>
      {/* Tab Indicators */}
      {selected_tabs.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10,
          padding: '0.5rem',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          {selected_tabs.map((tab, idx) => (
            <div
              key={tab}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: idx === currentTabIndex ? t.accent : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}

      {/* Active Tab Name (Subtle Toast) */}
      {selected_tabs.length > 1 && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: t.text,
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          {activeTabName}
        </div>
      )}
    </div>
  )
}
