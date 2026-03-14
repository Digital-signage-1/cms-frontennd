'use client'

import { CSSProperties } from 'react'
import { SlideshowRenderer } from './SlideshowRenderer'

interface PowerBIReportConfig {
  integration_id: string
  workspace_id: string
  report_id: string
  selected_pages?: string[]
  page_duration?: number
  theme?: 'dark' | 'light'
  refresh_interval?: number
  _data?: {
    screenshot_urls: string[]
    page_names?: string[]
    captured_at?: string
    page_count?: number
    capture_error?: string
  }
}

interface PowerBIReportRendererProps {
  config: PowerBIReportConfig
  onError?: (error: Error) => void
  onLoad?: () => void
  onEnded?: () => void
}

export function PowerBIReportRenderer({
  config,
  onError,
  onLoad,
  onEnded,
}: PowerBIReportRendererProps) {
  const {
    page_duration = 15,
    theme = 'dark',
    _data,
  } = config

  const bgColor = theme === 'dark' ? '#0f172a' : '#f8f9fa'
  const textColor = theme === 'dark' ? '#94a3b8' : '#666'

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: bgColor,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '8px',
  }

  // Loading / error state — no screenshot URLs yet
  if (!_data?.screenshot_urls || _data.screenshot_urls.length === 0) {
    return (
      <div style={containerStyle}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#F2C811" />
          <rect x="7" y="12" width="3" height="6" rx="0.5" fill="white" />
          <rect x="11" y="8" width="3" height="10" rx="0.5" fill="white" />
          <rect x="15" y="5" width="3" height="13" rx="0.5" fill="white" />
        </svg>
        <span style={{ color: textColor, fontSize: '14px', textAlign: 'center' }}>
          {_data?.capture_error || 'Preparing Power BI screenshots...'}
        </span>
      </div>
    )
  }

  // Filter screenshots by selected_pages if page_names are available
  let displayUrls = _data.screenshot_urls
  const pageNames = _data.page_names || []
  const selectedPages = config.selected_pages || []

  if (selectedPages.length > 0 && pageNames.length > 0) {
    displayUrls = _data.screenshot_urls.filter((_, idx) =>
      selectedPages.includes(pageNames[idx])
    )
    // Fallback: if filtering removed everything, show all
    if (displayUrls.length === 0) {
      displayUrls = _data.screenshot_urls
    }
  }

  // Delegate to SlideshowRenderer — works on Chrome 38+
  return (
    <SlideshowRenderer
      config={{
        image_urls: displayUrls,
        duration_per_slide: page_duration,
        transition: 'fade',
        transition_duration: 500,
        fit_mode: 'contain',
        loop: true,
        show_progress: true,
        progress_style: 'numbers',
        background_color: bgColor,
      }}
      onError={onError}
      onLoad={onLoad}
      onEnded={onEnded}
    />
  )
}
