export interface Channel {
  channel_id: string
  workspace_id: string
  name: string
  description?: string
  layout_type: 'single' | 'split_horizontal' | 'split_vertical' | 'grid' | 'l_shape' | 'custom'
  layout: LayoutConfig
  background: BackgroundConfig
  transition_type: 'none' | 'fade' | 'slide' | 'zoom'
  transition_duration: number
  status: 'draft' | 'published' | 'archived'
  preview_url?: string
  created_at: string
  updated_at: string
  published_at?: string
}

export interface LayoutConfig {
  width: number
  height: number
  orientation: 'landscape' | 'portrait'
}

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image' | 'transparent'
  value: string
}

export interface ChannelZone {
  zone_id: string
  channel_id: string
  name: string
  x_percent: number
  y_percent: number
  width_percent: number
  height_percent: number
  z_index: number
  background?: BackgroundConfig
  app_count: number
}

export interface ZoneApp {
  zone_app_id: string
  zone_id: string
  app_id: string
  order: number
  duration_seconds: number
  start_date?: string
  end_date?: string
}

export interface ChannelManifest {
  channel: Channel
  zones: Array<ChannelZone & { apps: ZoneApp[] }>
}
