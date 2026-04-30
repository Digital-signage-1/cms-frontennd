'use client'

import { CSSProperties } from 'react'
import { PDFRenderer } from './PDFRenderer'

interface GoogleDocsConfig {
  document_id: string
  auto_scroll?: boolean
  scroll_speed?: 'slow' | 'medium' | 'fast'
  zoom_level?: number
  pdf_url?: string
  sync_status?: 'pending' | 'ready' | 'error'
}

interface GoogleDocsRendererProps {
  config: GoogleDocsConfig
}

export function GoogleDocsRenderer({ config }: GoogleDocsRendererProps) {
  const {
    auto_scroll = false,
    scroll_speed = 'medium',
    zoom_level = 100,
    pdf_url,
    sync_status = 'ready',
  } = config

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  if (sync_status === 'pending') {
    return (
      <div style={containerStyle}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-blue-200/60 text-sm font-medium animate-pulse">Preparing your document...</p>
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
          <h3 className="text-white font-semibold mb-1">Failed to load document</h3>
          <p className="text-red-200/60 text-sm">Please check your Google integration and document ID.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#fff' }}>
      <PDFRenderer
        contentUrl={pdf_url}
        config={{
          auto_scroll,
          scroll_speed,
          zoom_level: zoom_level / 100,
          display_mode: 'fit_all',
          fit_mode: 'width',
        }}
      />
    </div>
  )
}
