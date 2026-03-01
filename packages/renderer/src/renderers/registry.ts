'use client'

import { lazy, type ComponentType } from 'react'
import { ImageRenderer } from './ImageRenderer'
import { VideoRenderer } from './VideoRenderer'
import { WebRenderer } from './WebRenderer'
import { HtmlRenderer } from './HtmlRenderer'
import { ClockRenderer } from './ClockRenderer'
import { WeatherRenderer } from './WeatherRenderer'
import { YouTubeRenderer } from './YouTubeRenderer'

const PDFRenderer = lazy(() =>
  import('./PDFRenderer').then(mod => ({ default: mod.PDFRenderer }))
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
  weather: WeatherRenderer as ComponentType<RendererProps>,
  pdf: PDFRenderer as ComponentType<RendererProps>,
  youtube: YouTubeRenderer as ComponentType<RendererProps>,
}

export function getRenderer(type: string): ComponentType<RendererProps> | null {
  return registry[type] || null
}

export function registerRenderer(type: string, component: ComponentType<RendererProps>): void {
  registry[type] = component
}
