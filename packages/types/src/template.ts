export type Orientation = 'landscape' | 'portrait' | 'square'

export type LayoutCategory = 'basic' | 'business' | 'retail' | 'restaurant' | 'education' | 'healthcare' | 'custom'

export interface LayoutTemplate {
  template_id: string
  workspace_id?: string
  name: string
  orientation: Orientation
  category: LayoutCategory
  zones_config: ZoneConfig[]
  thumbnail_url?: string
  is_system: boolean
  is_public: boolean
}

export interface ScreenTemplate {
  template_id: string
  workspace_id?: string
  layout_template_id: string
  name: string
  industry?: string
  use_case?: string
  zones_snapshot: ZoneConfig[]
  theme?: Record<string, any>
  thumbnail_url?: string
  is_system: boolean
  is_public: boolean
}

export interface ZoneConfig {
  zone_id: string
  name: string
  x: number // 0-100
  y: number // 0-100
  width: number // 0-100
  height: number // 0-100
  z_index?: number
  background?: {
    type: 'color' | 'gradient' | 'image' | 'transparent'
    value?: string
  }
  style?: Record<string, any>
}

export interface TemplateCreateRequest {
  name: string
  orientation: Orientation
  category: LayoutCategory
  zones_config: ZoneConfig[]
  is_public?: boolean
}

export interface TemplateUsage {
  template_id: string
  name: string
  usage_count: number
  channels: Array<{
    channel_id: string
    name: string
  }>
}