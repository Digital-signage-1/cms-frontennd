'use client'

import { CSSProperties } from 'react'
import { SlideshowRenderer } from './SlideshowRenderer'

interface SalesforceDashboardV2Config {
  integration_id: string
  dashboard_id?: string
  report_id?: string
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

interface SalesforceDashboardV2RendererProps {
  config: SalesforceDashboardV2Config
  onError?: (error: Error) => void
  onLoad?: () => void
  onEnded?: () => void
}

export function SalesforceDashboardV2Renderer({
  config,
  onError,
  onLoad,
  onEnded,
}: SalesforceDashboardV2RendererProps) {
  const { page_duration = 15, theme = 'dark', _data, report_id } = config
  const isReport = Boolean(report_id)

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

  if (!_data?.screenshot_urls || _data.screenshot_urls.length === 0) {
    return (
      <div style={containerStyle}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#00A1E0" />
          <path
            d="M8 16c0-2 1.5-3.5 3.5-3.5S15 14 15 16"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="10" cy="10" r="1.2" fill="white" />
          <circle cx="14" cy="10" r="1.2" fill="white" />
        </svg>
        <span style={{ color: textColor, fontSize: '14px', textAlign: 'center' }}>
          {_data?.capture_error ||
            (isReport
              ? 'Preparing Salesforce report screenshot...'
              : 'Preparing Salesforce dashboard screenshot...')}
        </span>
      </div>
    )
  }

  return (
    <SlideshowRenderer
      config={{
        image_urls: _data.screenshot_urls,
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
