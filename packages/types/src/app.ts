export type AppTemplateType =
  | 'image'
  | 'video'
  | 'pdf'
  | 'web'
  | 'html'
  | 'youtube'
  | 'clock'
  | 'weather'
  | 'slideshow'
  | 'social'
  | 'sheets'

export interface App {
  id: number
  app_id: string
  workspace_id: string
  template_type: AppTemplateType
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused' | 'error' | 'archived'
  content_id?: string
  integration_id?: string
  config: AppConfig
  preview_url?: string
  thumbnail_url?: string
  refresh_interval?: number
  cache_duration?: number
  last_rendered_at?: string
  render_error?: string
  created_by: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface AppConfig {
  [key: string]: unknown
}

export interface ImageAppConfig extends AppConfig {
  fit_mode?: 'contain' | 'cover' | 'fill' | 'none'
  fit?: 'contain' | 'cover' | 'fill' | 'none'
  object_position?: string
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  auto_scroll?: boolean
  scroll_speed?: 'slow' | 'medium' | 'fast'
}

export interface PDFAppConfig extends AppConfig {
  url?: string
  display_mode?: 'single' | 'cycle' | 'fit_all'
  page_duration?: number
  start_page?: number
  end_page?: number
  fit_mode?: 'width' | 'height' | 'page'
  zoom_level?: number
  show_page_numbers?: boolean
  background_color?: string
  auto_scroll?: boolean
  scroll_speed?: 'slow' | 'medium' | 'fast'
}

export interface YouTubeAppConfig extends AppConfig {
  video_url?: string
  start_time?: number
  end_time?: number
  muted?: boolean
  loop?: boolean
  autoplay?: boolean
}

export interface VideoAppConfig extends AppConfig {
  autoplay: boolean
  loop: boolean
  muted: boolean
  controls: boolean
}

export interface WebAppConfig extends AppConfig {
  url: string
  refresh_interval?: number
  scroll_enabled: boolean
}

export interface ClockAppConfig extends AppConfig {
  format: '12h' | '24h'
  show_seconds: boolean
  show_date: boolean
  timezone?: string
  theme: 'light' | 'dark' | 'minimal'
}

export interface WeatherAppConfig extends AppConfig {
  location: string
  units: 'celsius' | 'fahrenheit'
  show_forecast: boolean
  forecast_days: number
}

// Backend dynamic app type metadata
export interface AppTypeMetadata {
  type_id: string
  name: string
  description: string
  icon: string
  category: string
  processing_method: 'static' | 'api_fetch' | 'screenshot' | 'iframe'
  requires_integration?: string
  is_beta?: boolean
  requires_pro_plan?: boolean
}

// Backend form field definition
export interface FormField {
  name: string
  label: string
  type: 'file_upload' | 'text' | 'textarea' | 'number' | 'select' | 'multi_select' | 'checkbox' | 'color' | 'url' | 'email' | 'date' | 'time' | 'range'
  required?: boolean
  description?: string
  placeholder?: string
  default_value?: any
  validation?: {
    min?: number
    max?: number
    step?: number
    accept?: string[]
    max_size_mb?: number
    options?: Array<{ value: string; label: string; description?: string }>
  }
}

// Backend form schema
export interface FormSchema {
  fields: FormField[]
  sections?: Array<{
    title: string
    description?: string
    fields: string[]
  }>
  conditional_logic?: Record<string, any>
}

// Legacy app type interface (for compatibility)
export interface AppType {
  type: AppTemplateType
  name: string
  description: string
  icon: string
  category: 'media' | 'widget' | 'integration' | 'custom'
  requires_content: boolean
  requires_integration: boolean
  config_schema: AppConfigSchema
}

export interface AppConfigSchema {
  fields: AppConfigField[]
}

// Legacy config field (keep for compatibility)
export interface AppConfigField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'color' | 'url'
  required: boolean
  default?: unknown
  options?: Array<{ value: string; label: string }>
  min?: number
  max?: number
}

// App type registry response from backend
export interface AppTypesResponse {
  app_types: AppTypeMetadata[]
  categories: string[]
  total: number
}

// App type schema response from backend
export interface AppTypeSchemaResponse {
  type_id: string
  metadata: AppTypeMetadata
  schema: FormSchema
  default_config: Record<string, any>
}
