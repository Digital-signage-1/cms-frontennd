'use client'

import { CSSProperties } from 'react'
import { PDFRenderer } from './PDFRenderer'

interface GoogleSlidesConfig {
  presentation_id: string
  auto_advance?: boolean
  delay_ms?: number
  loop?: boolean
  start_slide?: number
  auto_scroll?: boolean
  scroll_speed?: 'slow' | 'medium' | 'fast'
  pdf_url?: string
  sync_status?: 'pending' | 'ready' | 'error'
}

interface GoogleSlidesRendererProps {
  config: GoogleSlidesConfig
}

export function GoogleSlidesRenderer({ config }: GoogleSlidesRendererProps) {
  const {
    auto_advance = true,
    delay_ms = 5000,
    start_slide = 1,
    auto_scroll = false,
    scroll_speed = 'medium',
    pdf_url,
    sync_status = 'ready',
  } = config

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  if (sync_status === 'pending') {
    return (
      <div style={containerStyle}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-yellow-200/60 text-sm font-medium animate-pulse">Exporting presentation...</p>
        </div>
      </div>
    )
  }

  if (sync_status === 'error' || (!pdf_url && sync_status === 'ready')) {
    return (
      <div style={containerStyle}>
        <div className="text-center px-6">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-1">Failed to load presentation</h3>
          <p className="text-red-200/60 text-sm">Please check your Google integration and presentation ID.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
      <PDFRenderer
        contentUrl={pdf_url}
        config={{
          display_mode: auto_advance ? 'cycle' : 'single',
          page_duration: delay_ms / 1000,
           start_page: start_slide,
          fit_mode: 'page',
          auto_scroll: auto_scroll,
          scroll_speed: scroll_speed,
          show_page_numbers: false,
        }}
      />
    </div>
  )
}
