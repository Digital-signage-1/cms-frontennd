'use client'

import { lazy, type ComponentType } from 'react'
import { ImageRenderer } from './ImageRenderer'
import { VideoRenderer } from './VideoRenderer'
import { WebRenderer } from './WebRenderer'
import { HtmlRenderer } from './HtmlRenderer'
import { ClockRenderer } from './ClockRenderer'
import { CountdownRenderer } from './CountdownRenderer'
import { WeatherRenderer } from './WeatherRenderer'
import { YouTubeRenderer } from './YouTubeRenderer'
const DocumentRenderer = lazy(() =>
  import('./DocumentRenderer').then(mod => ({ default: mod.DocumentRenderer }))
)
import { SlideshowRenderer } from './SlideshowRenderer'
import { QRCodeRenderer } from './QRCodeRenderer'
import { SocialMediaRenderer } from './SocialMediaRenderer'
import { RSSFeedRenderer } from './RSSFeedRenderer'
import { SheetRenderer } from './SheetRenderer'
import { AudioRenderer } from './AudioRenderer'
import { MapsRenderer } from './MapsRenderer'
import { IframeRenderer } from './IframeRenderer'
import { StockRenderer } from './StockRenderer'
import { GoogleSlidesRenderer } from './GoogleSlidesRenderer'
import { GoogleCalendarRenderer } from './GoogleCalendarRenderer'
import { GoogleDocsRenderer } from './GoogleDocsRenderer'
import { GooglePhotosRenderer } from './GooglePhotosRenderer'
import { GoogleFormsRenderer } from './GoogleFormsRenderer'
import { GoogleMapsRenderer } from './GoogleMapsRenderer'
import { LookerStudioRenderer } from './LookerStudioRenderer'
import { GoogleAlertsRenderer } from './GoogleAlertsRenderer'
import { PowerBIURLRenderer } from './PowerBIURLRenderer'

const PDFRenderer = lazy(() =>
  import('./PDFRenderer').then(mod => ({ default: mod.PDFRenderer }))
)

const PowerBIReportRenderer = lazy(() =>
  import('./PowerBIReportRenderer').then(mod => ({ default: mod.PowerBIReportRenderer }))
)

const PowerBIDashboardRenderer = lazy(() =>
  import('./PowerBIDashboardRenderer').then(mod => ({ default: mod.PowerBIDashboardRenderer }))
)

export interface RendererProps {
  config: Record<string, any>
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
  onEnded?: () => void
}

const registry: Record<string, ComponentType<RendererProps>> = {
  image: ImageRenderer as ComponentType<RendererProps>,
  video: VideoRenderer as ComponentType<RendererProps>,
  web: WebRenderer as ComponentType<RendererProps>,
  html: HtmlRenderer as ComponentType<RendererProps>,
  clock: ClockRenderer as ComponentType<RendererProps>,
  countdown: CountdownRenderer as ComponentType<RendererProps>,
  weather: WeatherRenderer as ComponentType<RendererProps>,
  pdf: PDFRenderer as ComponentType<RendererProps>,
  youtube: YouTubeRenderer as ComponentType<RendererProps>,
  docx: DocumentRenderer as ComponentType<RendererProps>,
  slideshow: SlideshowRenderer as ComponentType<RendererProps>,
  qrcode: QRCodeRenderer as ComponentType<RendererProps>,
  social: SocialMediaRenderer as ComponentType<RendererProps>,
  rss_feed: RSSFeedRenderer as ComponentType<RendererProps>,
  sheets: SheetRenderer as ComponentType<RendererProps>,
  google_sheets: SheetRenderer as ComponentType<RendererProps>,
  audio: AudioRenderer as ComponentType<RendererProps>,
  maps: MapsRenderer as ComponentType<RendererProps>,
  iframe: IframeRenderer as ComponentType<RendererProps>,
  stock: StockRenderer as ComponentType<RendererProps>,
  google_slides: GoogleSlidesRenderer as ComponentType<RendererProps>,
  google_calendar: GoogleCalendarRenderer as ComponentType<RendererProps>,
  google_docs: GoogleDocsRenderer as ComponentType<RendererProps>,
  google_photos: GooglePhotosRenderer as ComponentType<RendererProps>,
  google_forms: GoogleFormsRenderer as ComponentType<RendererProps>,
  google_maps: GoogleMapsRenderer as ComponentType<RendererProps>,
  looker_studio: LookerStudioRenderer as ComponentType<RendererProps>,
  google_alerts: GoogleAlertsRenderer as ComponentType<RendererProps>,
  powerbi_report: PowerBIReportRenderer as unknown as ComponentType<RendererProps>,
  powerbi_dashboard: PowerBIDashboardRenderer as unknown as ComponentType<RendererProps>,
  powerbi_url: PowerBIURLRenderer as ComponentType<RendererProps>,
}

export function getRenderer(type: string): ComponentType<RendererProps> | null {
  return registry[type] || null
}

export function registerRenderer(type: string, component: ComponentType<RendererProps>): void {
  registry[type] = component
}
