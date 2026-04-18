export type AppTemplateType =
  | 'image'
  | 'video'
  | 'pdf'
  | 'web'
  | 'html'
  | 'youtube'
  | 'clock'
  | 'countdown'
  | 'weather'
  | 'qrcode'
  | 'slideshow'
  | 'social'
  | 'sheets'
  | 'rss_feed'
  | 'google_slides'
  | 'google_calendar'
  | 'google_docs'
  | 'google_photos'
  | 'google_forms'
  | 'google_maps'
  | 'looker_studio'
  | 'google_alerts'
  | 'google_sheets'
  | 'powerbi_report'
  | 'salesforce_dashboard_v2'
  | 'salesforce_report_v2'
  | 'powerbi_realtime_report'
  | 'powerbi_dashboard'
  | 'powerbi_url'
  | 'event_board'
  | 'menu_board'
  | 'room_directory'
  | 'canva'

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

export interface SocialAppConfig extends AppConfig {
  platform: 'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'linkedin'
  embed_url: string
  display_mode?: 'post' | 'profile' | 'feed'
  theme?: 'dark' | 'light'
  show_header?: boolean
  show_footer?: boolean
  auto_refresh?: boolean
  refresh_interval?: number
  background_color?: string
  scale?: 'fit' | 'fill' | 'original'
}

export interface ClockAppConfig extends AppConfig {
  format?: '12h' | '24h'
  show_seconds?: boolean
  show_date?: boolean
  timezone?: string
  date_format?: 'full' | 'long' | 'medium' | 'short' | 'iso'
  theme?: 'light' | 'dark' | 'transparent' | 'custom'
  background_color?: string
  text_color?: string
  font_size?: 'small' | 'medium' | 'large' | 'xlarge'
}

export interface CountdownAppConfig extends AppConfig {
  target_date: string
  target_time?: string
  title?: string
  subtitle?: string
  completed_message?: string
  show_days?: boolean
  show_hours?: boolean
  show_minutes?: boolean
  show_seconds?: boolean
  theme?: 'dark' | 'light' | 'transparent' | 'gradient'
  layout?: 'standard' | 'compact' | 'large' | 'minimal'
  background_color?: string
  text_color?: string
  accent_color?: string
}

export interface WeatherAppConfig extends AppConfig {
  location: string
  units?: 'metric' | 'imperial'
  show_forecast?: boolean
  show_humidity?: boolean
  show_wind?: boolean
  show_feels_like?: boolean
  theme?: 'dark' | 'light' | 'transparent' | 'gradient'
  layout?: 'standard' | 'compact' | 'detailed' | 'large_icon'
  refresh_interval?: number
  background_mode?: 'weather_dynamic' | 'custom_image' | 'solid_color'
  background_image_id?: string
  background_image_url?: string
  background_color?: string
  text_color?: string
}

export interface RSSFeedAppConfig extends AppConfig {
  feed_url: string
  max_items?: number
  display_mode?: 'ticker' | 'cards' | 'list' | 'headlines'
  scroll_speed?: 'slow' | 'medium' | 'fast'
  show_images?: boolean
  show_description?: boolean
  show_date?: boolean
  show_source?: boolean
  refresh_interval?: number
  theme?: 'dark' | 'light' | 'transparent'
  background_color?: string
  text_color?: string
}

export interface QRCodeAppConfig extends AppConfig {
  url: string
  title?: string
  subtitle?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  foreground_color?: string
  background_color?: string
  logo_content_id?: string
  show_url_text?: boolean
  error_correction?: 'L' | 'M' | 'Q' | 'H'
  theme?: 'light' | 'dark' | 'transparent'
  padding?: number
}

export interface SheetAppConfig extends AppConfig {
  source_type?: 'google_sheets' | 'upload'
  sheet_url?: string
  file_content_id?: string
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

export interface GoogleSlidesAppConfig extends AppConfig {
  presentation_id: string
  auto_advance?: boolean
  delay_ms?: number
  loop?: boolean
  start_slide?: number
}

export interface GoogleCalendarAppConfig extends AppConfig {
  calendar_id: string
  display_mode?: 'agenda' | 'day' | 'week' | 'month' | 'meeting_room'
  show_description?: boolean
  show_location?: boolean
  show_attendees?: boolean
  auto_scroll?: boolean
  room_name?: string
  refresh_interval?: number
  theme?: 'dark' | 'light' | 'google'
}

export interface GoogleDocsAppConfig extends AppConfig {
  document_id: string
  auto_scroll?: boolean
  scroll_speed?: 'slow' | 'medium' | 'fast'
  zoom_level?: number
}

export interface GooglePhotosAppConfig extends AppConfig {
  album_id: string
  transition?: 'fade' | 'slide' | 'zoom' | 'none'
  duration_seconds?: number
  shuffle?: boolean
  fit_mode?: 'cover' | 'contain'
  show_caption?: boolean
  refresh_interval?: number
}

export interface GoogleFormsAppConfig extends AppConfig {
  form_id: string
  display_mode?: 'summary_charts' | 'live_responses' | 'single_question'
  chart_type?: 'bar' | 'pie' | 'donut'
  show_question_text?: boolean
  refresh_interval?: number
  theme?: 'dark' | 'light' | 'google'
}

export interface GoogleMapsAppConfig extends AppConfig {
  location: string
  zoom?: number
  map_type?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid'
  show_traffic?: boolean
}

export interface LookerStudioAppConfig extends AppConfig {
  report_url: string
  page_number?: number
  auto_refresh?: boolean
  refresh_interval?: number
}

export interface GoogleAlertsAppConfig extends AppConfig {
  topic: string
  language?: string
  region?: string
  max_items?: number
  display_mode?: 'ticker' | 'cards' | 'list'
  show_source?: boolean
  refresh_interval?: number
  theme?: 'dark' | 'light'
}

export interface PowerBIReportAppConfig extends AppConfig {
  integration_id: string
  workspace_id: string
  report_id: string
  selected_pages?: string[]
  page_duration?: number
  theme?: 'dark' | 'light'
  refresh_interval?: number
  _data?: {
    screenshot_urls: string[]
    captured_at?: string
    page_count?: number
    capture_error?: string
  }
}

export interface SalesforceDashboardV2AppConfig extends AppConfig {
  integration_id: string
  dashboard_id: string
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

export interface SalesforceReportV2AppConfig extends AppConfig {
  integration_id: string
  report_id: string
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

export interface PowerBIRealtimeReportAppConfig extends AppConfig {
  integration_id: string
  workspace_id: string
  report_id: string
  show_filter_pane?: boolean
  show_nav_pane?: boolean
  auto_rotate_pages?: boolean
  page_duration?: number
  theme?: 'dark' | 'light'
  refresh_interval?: number
}

export interface PowerBIDashboardAppConfig extends AppConfig {
  integration_id: string
  workspace_id: string
  dashboard_id: string
  theme?: 'dark' | 'light'
  refresh_interval?: number
}

export interface PowerBIURLAppConfig extends AppConfig {
  embed_url: string
  theme?: 'dark' | 'light'
  refresh_interval?: number
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
  type: 'file_upload' | 'text' | 'textarea' | 'number' | 'select' | 'multi_select' | 'checkbox' | 'color' | 'url' | 'email' | 'date' | 'time' | 'range' | 'integration_selector' | 'resource_picker' | 'resource_multi_picker'
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
