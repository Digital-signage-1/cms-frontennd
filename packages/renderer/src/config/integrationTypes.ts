/**
 * Single source of truth for integration type configuration.
 *
 * Adding a new integration type? Just add an entry here + create a renderer.
 */

export interface IntegrationTypeConfig {
  /** Config key that holds the primary resource ID */
  configKey: string
  /** API resource_type sent to the backend */
  resourceType: string
  /** Optional config key for composite resource ID prefix (e.g. workspace_id) */
  compositeKey?: string
  /** Whether this type needs the app ID appended to the resource ID */
  needsAppId?: boolean
  /** Default refresh interval in milliseconds */
  defaultRefreshMs: number
}

export const INTEGRATION_TYPES: Record<string, IntegrationTypeConfig> = {
  google_calendar: {
    configKey: 'calendar_id',
    resourceType: 'calendar',
    defaultRefreshMs: 5 * 60 * 1000,
  },
  google_photos: {
    configKey: 'album_id',
    resourceType: 'album',
    defaultRefreshMs: 10 * 60 * 1000,
  },
  google_forms: {
    configKey: 'form_id',
    resourceType: 'form',
    defaultRefreshMs: 2 * 60 * 1000,
  },
  google_alerts: {
    configKey: 'topic',
    resourceType: 'news',
    defaultRefreshMs: 5 * 60 * 1000,
  },
  sheets: {
    configKey: 'spreadsheet_id',
    resourceType: 'spreadsheet',
    defaultRefreshMs: 5 * 60 * 1000,
  },
  google_sheets: {
    configKey: 'spreadsheet_id',
    resourceType: 'spreadsheet',
    defaultRefreshMs: 5 * 60 * 1000,
  },
  powerbi_report: {
    configKey: 'report_id',
    resourceType: 'screenshot_report',
    compositeKey: 'workspace_id',
    needsAppId: true,
    defaultRefreshMs: 5 * 60 * 1000,
  },
  powerbi_realtime_report: {
    configKey: 'report_id',
    resourceType: 'report',
    compositeKey: 'workspace_id',
    defaultRefreshMs: 30 * 60 * 1000,
  },
  powerbi_dashboard: {
    configKey: 'dashboard_id',
    resourceType: 'dashboard',
    compositeKey: 'workspace_id',
    defaultRefreshMs: 30 * 60 * 1000,
  },
}

/** Set of all template types that need live integration data fetching. */
export const INTEGRATION_DATA_TYPE_SET = new Set(Object.keys(INTEGRATION_TYPES))
