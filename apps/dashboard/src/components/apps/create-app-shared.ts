export interface AppType {
  type_id: string
  name: string
  description: string
  icon: string
  category: string
  popular?: boolean
  tags?: string[]
}

export interface FormField {
  name: string
  label: string
  type: string
  required?: boolean
  description?: string
  placeholder?: string
  default_value?: any
  validation?: any
}

export const FALLBACK_TEMPLATES: AppType[] = [
  { type_id: 'html', name: 'Custom HTML', description: 'Build anything with raw HTML, CSS and JavaScript', category: 'custom', icon: 'html', popular: true, tags: ['code', 'html', 'custom'] },
  { type_id: 'web', name: 'Web Page', description: 'Embed any website or web application via URL', category: 'embed', icon: 'web', popular: true, tags: ['url', 'iframe', 'web'] },
  { type_id: 'youtube', name: 'YouTube Video', description: 'Stream YouTube videos directly on your display', category: 'embed', icon: 'youtube', popular: false, tags: ['youtube', 'video', 'stream'] },
  { type_id: 'maps', name: 'Google Maps', description: 'Show interactive or static map views', category: 'embed', icon: 'maps', popular: false, tags: ['maps', 'location', 'geo'] },
  { type_id: 'iframe', name: 'iFrame Embed', description: 'Embed any compatible external content via iFrame', category: 'embed', icon: 'iframe', popular: false, tags: ['iframe', 'embed'] },
  { type_id: 'image', name: 'Image Display', description: 'Display high-resolution images from your media library', category: 'media', icon: 'image', popular: false, tags: ['image', 'photo', 'png', 'jpg'] },
  { type_id: 'video', name: 'Video Player', description: 'Play MP4 and other video formats from the library', category: 'media', icon: 'video', popular: false, tags: ['mp4', 'video', 'player'] },
  { type_id: 'slideshow', name: 'Slideshow', description: 'Display PowerPoint presentations as a slideshow', category: 'media', icon: 'slideshow', popular: false, tags: ['powerpoint', 'presentation', 'ppt'] },
  { type_id: 'docx', name: 'Word Document', description: 'Display Word documents (DOCX) with page-by-page viewing', category: 'media', icon: 'docx', popular: false, tags: ['word', 'docx', 'document'] },
  { type_id: 'pdf', name: 'PDF Document', description: 'Display PDF files with auto-scroll and page control', category: 'media', icon: 'pdf', popular: false, tags: ['pdf', 'document'] },
  { type_id: 'audio', name: 'Audio Player', description: 'Play background audio with an ambient visual display', category: 'media', icon: 'audio', popular: false, tags: ['audio', 'mp3', 'music'] },
  { type_id: 'clock', name: 'Clock & Date', description: 'Live digital or analog clock with timezone support', category: 'widgets', icon: 'clock', popular: false, tags: ['clock', 'time', 'timezone'] },
  { type_id: 'weather', name: 'Weather Display', description: 'Real-time weather for any location worldwide', category: 'widgets', icon: 'weather', popular: false, tags: ['weather', 'forecast', 'temperature'] },
  { type_id: 'countdown', name: 'Countdown Timer', description: 'Count down to events, launches, or deadlines', category: 'widgets', icon: 'countdown', popular: false, tags: ['timer', 'countdown', 'event'] },
  { type_id: 'qrcode', name: 'QR Code Display', description: 'Generate and display QR codes for any URL', category: 'widgets', icon: 'qrcode', popular: false, tags: ['qr', 'code', 'url'] },
  { type_id: 'rss_feed', name: 'News / RSS Feed', description: 'Auto-cycling news and content from any RSS feed', category: 'widgets', icon: 'rss_feed', popular: false, tags: ['rss', 'news', 'feed'] },
  { type_id: 'social', name: 'Social Media Embed', description: 'Display a live social media feed on screen', category: 'integrations', icon: 'social', popular: false, tags: ['social', 'twitter', 'feed'] },
  { type_id: 'sheets', name: 'Spreadsheet / Sheet', description: 'Display Google Sheets or CSV/Excel files as tables', category: 'widgets', icon: 'sheets', popular: false, tags: ['excel', 'data', 'table'] },
  { type_id: 'stock', name: 'Stock Ticker', description: 'Live stock prices and market indices ticker tape', category: 'widgets', icon: 'stock', popular: false, tags: ['stocks', 'finance', 'market'] },
  { type_id: 'google_slides', name: 'Google Slides', description: 'Display presentations from Google Slides', category: 'integrations', icon: 'google-slides', popular: false, tags: ['google', 'slides', 'presentation'] },
  { type_id: 'google_calendar', name: 'Google Calendar', description: 'Display meeting room schedules and event calendars', category: 'integrations', icon: 'google-calendar', popular: false, tags: ['google', 'calendar', 'events'] },
  { type_id: 'google_docs', name: 'Google Docs', description: 'Display documents and policies from Google Docs', category: 'integrations', icon: 'google-docs', popular: false, tags: ['google', 'docs', 'document'] },
  { type_id: 'google_photos', name: 'Google Photos', description: 'Display photo albums and galleries as slideshows', category: 'integrations', icon: 'google-photos', popular: false, tags: ['google', 'photos', 'album'] },
  { type_id: 'google_forms', name: 'Google Forms', description: 'Display live poll results and survey visualizations', category: 'integrations', icon: 'google-forms', popular: false, tags: ['google', 'forms', 'survey'] },
  { type_id: 'google_sheets', name: 'Google Sheets', description: 'Display live spreadsheet data from Google Sheets as tables', category: 'integrations', icon: 'google-sheets', popular: false, tags: ['google', 'sheets', 'spreadsheet'] },
  { type_id: 'google_maps', name: 'Google Maps (API)', description: 'Display maps with traffic and custom markers', category: 'integrations', icon: 'google-maps', popular: false, tags: ['google', 'maps', 'location'] },
  { type_id: 'looker_studio', name: 'Looker Studio', description: 'Display business dashboards and analytics reports', category: 'integrations', icon: 'looker-studio', popular: false, tags: ['google', 'looker', 'analytics'] },
  { type_id: 'google_alerts', name: 'Google News / Alerts', description: 'Display trending topics and curated news feeds', category: 'integrations', icon: 'google-alerts', popular: false, tags: ['google', 'news', 'alerts'] },
  { type_id: 'powerbi_report', name: 'Power BI Report', description: 'Display Power BI report pages as auto-refreshed screenshots. Works on all devices including Smart TVs.', category: 'integrations', icon: 'powerbi', popular: false, tags: ['power bi', 'powerbi', 'microsoft', 'report'] },
  { type_id: 'powerbi_realtime_report', name: 'Power BI Realtime Report', description: 'Embed live Power BI reports with interactive visuals. Requires modern browser.', category: 'integrations', icon: 'powerbi', popular: false, tags: ['power bi', 'powerbi', 'realtime'] },
  { type_id: 'powerbi_dashboard', name: 'Power BI Dashboard', description: 'Display Power BI dashboards with live tiles', category: 'integrations', icon: 'powerbi', popular: false, tags: ['power bi', 'powerbi', 'dashboard'] },
  { type_id: 'powerbi_url', name: 'Power BI URL', description: 'Embed any Power BI report or dashboard using a publish-to-web URL', category: 'integrations', icon: 'powerbi', popular: false, tags: ['power bi', 'powerbi', 'url'] },
  { type_id: 'salesforce_dashboard_v2', name: 'Salesforce Dashboard (JWT)', description: 'Display Salesforce Lightning dashboards as auto-refreshed screenshots using JWT bearer authentication.', category: 'integrations', icon: 'salesforce', popular: false, tags: ['salesforce', 'dashboard', 'jwt'] },
  { type_id: 'salesforce_report_v2', name: 'Salesforce Report (JWT)', description: 'Display Salesforce Lightning reports as auto-refreshed screenshots using JWT bearer authentication.', category: 'integrations', icon: 'salesforce', popular: false, tags: ['salesforce', 'report', 'jwt'] },
]

export const CATEGORY_ORDER = ['custom', 'embed', 'media', 'widgets', 'integrations'] as const

export const GOOGLE_HUB_TYPE_ID = '__google_hub__'
export const POWERBI_HUB_TYPE_ID = '__powerbi_hub__'
export const SALESFORCE_HUB_TYPE_ID = '__salesforce_hub__'

export const GOOGLE_OAUTH_APP_TYPE_IDS = [
  'google_slides',
  'google_calendar',
  'google_docs',
  'google_photos',
  'google_forms',
  'google_sheets',
] as const

export const POWERBI_HUB_APP_TYPE_IDS = [
  'powerbi_report',
  'powerbi_realtime_report',
  'powerbi_dashboard',
  'powerbi_url',
] as const

export const SALESFORCE_HUB_APP_TYPE_IDS = [
  'salesforce_dashboard_v2',
  'salesforce_report_v2',
] as const

export type IntegrationHubBrowseKey = 'google' | 'powerbi' | 'salesforce'

export const HUB_TYPE_ID_TO_BROWSE_KEY: Record<string, IntegrationHubBrowseKey> = {
  [GOOGLE_HUB_TYPE_ID]: 'google',
  [POWERBI_HUB_TYPE_ID]: 'powerbi',
  [SALESFORCE_HUB_TYPE_ID]: 'salesforce',
}

export const INTEGRATION_HUB_TYPE_IDS = new Set<string>([
  GOOGLE_HUB_TYPE_ID,
  POWERBI_HUB_TYPE_ID,
  SALESFORCE_HUB_TYPE_ID,
])

export function isIntegrationHubTypeId(typeId: string): boolean {
  return INTEGRATION_HUB_TYPE_IDS.has(typeId)
}

export function isGoogleOauthTypeId(typeId: string): boolean {
  return (GOOGLE_OAUTH_APP_TYPE_IDS as readonly string[]).includes(typeId)
}

export function isPowerbiHubChildTypeId(typeId: string): boolean {
  return (POWERBI_HUB_APP_TYPE_IDS as readonly string[]).includes(typeId)
}

export function isSalesforceHubChildTypeId(typeId: string): boolean {
  return (SALESFORCE_HUB_APP_TYPE_IDS as readonly string[]).includes(typeId)
}

const HUB_DEFINITIONS: Array<{
  hub: AppType
  childTypeIds: readonly string[]
}> = [
  {
    childTypeIds: GOOGLE_OAUTH_APP_TYPE_IDS,
    hub: {
      type_id: GOOGLE_HUB_TYPE_ID,
      name: 'Google',
      description:
        'Slides, Sheets, Calendar, Docs, Photos, and Forms with one Google account connection',
      category: 'integrations',
      icon: 'google',
      popular: false,
      tags: ['google', 'slides', 'sheets', 'calendar', 'docs', 'photos', 'forms'],
    },
  },
  {
    childTypeIds: POWERBI_HUB_APP_TYPE_IDS,
    hub: {
      type_id: POWERBI_HUB_TYPE_ID,
      name: 'Power BI',
      description: 'Reports, dashboards, live embeds, and publish URLs with one Microsoft Power BI connection',
      category: 'integrations',
      icon: 'powerbi',
      popular: false,
      tags: ['power bi', 'powerbi', 'microsoft', 'dashboard', 'report'],
    },
  },
  {
    childTypeIds: SALESFORCE_HUB_APP_TYPE_IDS,
    hub: {
      type_id: SALESFORCE_HUB_TYPE_ID,
      name: 'Salesforce',
      description: 'Dashboards and reports with one Salesforce JWT connection',
      category: 'integrations',
      icon: 'salesforce',
      popular: false,
      tags: ['salesforce', 'dashboard', 'report', 'crm'],
    },
  },
]

export function buildDisplayTemplates(templates: AppType[]): AppType[] {
  const childToHub = new Map<string, AppType>()
  for (const def of HUB_DEFINITIONS) {
    const present = def.childTypeIds.filter((id) => templates.some((t) => t.type_id === id))
    if (present.length === 0) continue
    for (const id of present) {
      childToHub.set(id, def.hub)
    }
  }
  if (childToHub.size === 0) return templates
  const emittedHubIds = new Set<string>()
  const out: AppType[] = []
  for (const t of templates) {
    const hub = childToHub.get(t.type_id)
    if (hub) {
      if (!emittedHubIds.has(hub.type_id)) {
        out.push(hub)
        emittedHubIds.add(hub.type_id)
      }
      continue
    }
    out.push(t)
  }
  return out
}

export function oauthGoogleChildrenOrdered(templates: AppType[]): AppType[] {
  return hubChildrenOrdered(templates, GOOGLE_OAUTH_APP_TYPE_IDS)
}

export function powerbiHubChildrenOrdered(templates: AppType[]): AppType[] {
  return hubChildrenOrdered(templates, POWERBI_HUB_APP_TYPE_IDS)
}

export function salesforceHubChildrenOrdered(templates: AppType[]): AppType[] {
  return hubChildrenOrdered(templates, SALESFORCE_HUB_APP_TYPE_IDS)
}

export function hubChildrenOrdered(
  templates: AppType[],
  childTypeIds: readonly string[]
): AppType[] {
  return childTypeIds.map((id) => templates.find((t) => t.type_id === id)).filter(
    (t): t is AppType => Boolean(t)
  )
}

export function hubMatchesSearch(children: AppType[], q: string, brandTerms: string[]): boolean {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const compact = s.replace(/\s+/g, '')
  for (const term of brandTerms) {
    const low = term.toLowerCase()
    if (low.includes(' ')) {
      if (s.includes(low)) return true
    } else if (compact.includes(low.replace(/\s+/g, '')) || s.includes(low)) {
      return true
    }
  }
  return children.some(
    (t) =>
      t.name.toLowerCase().includes(s) ||
      (t.description?.toLowerCase().includes(s) ?? false) ||
      (t.tags?.some((tag) => tag.toLowerCase().includes(s)) ?? false)
  )
}

export const HUB_SEARCH_BRAND_TERMS: Record<IntegrationHubBrowseKey, string[]> = {
  google: ['google'],
  powerbi: ['power bi', 'powerbi', 'microsoft'],
  salesforce: ['salesforce', 'sfdc'],
}

export function integrationsCategoryDisplayCount(
  templates: AppType[],
  googleChildCount: number,
  powerbiChildCount: number,
  salesforceChildCount: number
): number {
  const raw = templates.filter((t) => t.category === 'integrations').length
  let reduction = 0
  if (googleChildCount > 0) reduction += googleChildCount - 1
  if (powerbiChildCount > 0) reduction += powerbiChildCount - 1
  if (salesforceChildCount > 0) reduction += salesforceChildCount - 1
  return raw - reduction
}

export function getCategoriesFromTemplates(templates: AppType[]): { id: string; label: string }[] {
  const cats = [...new Set(templates.map((t) => t.category).filter(Boolean))]
  const order = CATEGORY_ORDER.filter((id) => cats.includes(id))
  const rest = cats.filter((c) => !CATEGORY_ORDER.includes(c as any)).sort()
  const categoryIds = [...order, ...rest]
  const labels: Record<string, string> = {
    all: 'All Types',
    custom: 'Custom',
    embed: 'Embed',
    media: 'Media',
    widgets: 'Widgets',
    integrations: 'Integrations',
  }
  return [
    { id: 'all', label: 'All Types' },
    ...categoryIds.map((id) => ({ id, label: labels[id] || id.charAt(0).toUpperCase() + id.slice(1) })),
  ]
}

const APP_TYPE_ICONS = new Set([
  'youtube','image','video','pdf','slideshow','docx','web','html',
  'clock','weather','social','countdown','qrcode','rss_feed','sheets',
  'google-slides','google-calendar','google-docs','google-photos',
  'google-forms','google-maps','looker-studio','google-alerts',
])
const ICON_ALIAS: Record<string, string> = {
  react: 'html', 'qr-code': 'qrcode', qr: 'qrcode', spreadsheet: 'sheets',
  slides: 'slideshow', picture_as_pdf: 'pdf', photo: 'image',
  view_carousel: 'slideshow', play_circle: 'video', 'cloud-sun': 'weather',
  rss: 'rss_feed', iframe: 'web', maps: 'web', table: 'sheets',
  'google-sheets': 'sheets',
}

export function getAppTypeIconPath(icon: string, typeId: string): string | null {
  const key = ICON_ALIAS[icon] || icon
  if (APP_TYPE_ICONS.has(key)) return `/icons/app-types/${key}.svg`
  const key2 = ICON_ALIAS[typeId] || typeId
  if (APP_TYPE_ICONS.has(key2)) return `/icons/app-types/${key2}.svg`
  return null
}

export const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  custom:   { bg: 'rgba(251,146,60,0.22)',  color: '#FB923C' },
  document: { bg: 'rgba(245,158,11,0.22)',  color: '#F59E0B' },
  embed:    { bg: 'color-mix(in srgb, var(--color-primary) 22%, transparent)',  color: 'var(--color-primary)' },
  embeds:   { bg: 'color-mix(in srgb, var(--color-primary) 22%, transparent)',  color: 'var(--color-primary)' },
  media:    { bg: 'rgba(59,130,246,0.22)',  color: '#60A5FA' },
  widgets:  { bg: 'rgba(99,102,241,0.22)',  color: '#818CF8' },
  integrations: { bg: 'rgba(16,185,129,0.22)', color: '#34D399' },
  other:    { bg: 'rgba(167,139,250,0.22)', color: 'var(--color-primary)' },
}
