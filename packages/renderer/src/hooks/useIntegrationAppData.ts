import { useState, useEffect, useCallback, useRef } from 'react'
import { useIntegrationDataFetcher } from '../IntegrationDataContext'

/**
 * Maps template_type → { configKey for resource ID, API resource_type }
 * Only types that need live data fetching (not iframe-based types).
 */
const INTEGRATION_TYPE_MAP: Record<string, { configKey: string; resourceType: string; compositeKey?: string }> = {
  google_calendar: { configKey: 'calendar_id', resourceType: 'calendar' },
  google_photos: { configKey: 'album_id', resourceType: 'album' },
  google_forms: { configKey: 'form_id', resourceType: 'form' },
  google_alerts: { configKey: 'topic', resourceType: 'news' },
  sheets: { configKey: 'spreadsheet_id', resourceType: 'spreadsheet' },
  google_sheets: { configKey: 'spreadsheet_id', resourceType: 'spreadsheet' },
  powerbi_report: { configKey: 'report_id', resourceType: 'report', compositeKey: 'workspace_id' },
  powerbi_dashboard: { configKey: 'dashboard_id', resourceType: 'dashboard', compositeKey: 'workspace_id' },
}

/** Default refresh intervals per type (ms) */
const DEFAULT_REFRESH: Record<string, number> = {
  google_calendar: 5 * 60 * 1000,
  google_photos: 10 * 60 * 1000,
  google_forms: 2 * 60 * 1000,
  google_alerts: 5 * 60 * 1000,
  sheets: 5 * 60 * 1000,
  google_sheets: 5 * 60 * 1000,
  powerbi_report: 30 * 60 * 1000,
  powerbi_dashboard: 30 * 60 * 1000,
}

export function useIntegrationAppData(
  templateType: string,
  config: Record<string, unknown>,
): { data: Record<string, unknown> | null; loading: boolean; error: string | null } {
  const fetcher = useIntegrationDataFetcher()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const onDataRef = useRef<((d: Record<string, unknown>) => void) | undefined>(undefined)

  const integrationId = config.integration_id as string | undefined
  const mapping = INTEGRATION_TYPE_MAP[templateType]

  // Stable callback ref to avoid re-subscribing on every render
  onDataRef.current = (d: Record<string, unknown>) => {
    setData(d)
    setLoading(false)
    setError(null)
  }

  const stableOnData = useCallback((d: Record<string, unknown>) => {
    onDataRef.current?.(d)
  }, [])

  // For PowerBI: compose "workspace_id/report_id" so the backend can parse both
  const rawResourceId = mapping ? (config[mapping.configKey] as string) : undefined
  const compositePrefix = mapping?.compositeKey ? (config[mapping.compositeKey] as string) : undefined
  const resourceId =
    rawResourceId && compositePrefix
      ? `${compositePrefix}/${rawResourceId}`
      : rawResourceId
  const resourceType = mapping?.resourceType
  const refreshInterval =
    (config.refresh_interval as number | undefined)
      ? (config.refresh_interval as number) * 1000
      : DEFAULT_REFRESH[templateType]

  useEffect(() => {
    if (!fetcher || !mapping || !integrationId || !resourceId || !resourceType) return

    setLoading(true)
    setError(null)

    fetcher
      .startFetch(integrationId, resourceId, resourceType, refreshInterval, stableOnData)
      .then((initial) => {
        if (initial) {
          setData(initial)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err?.message ?? 'Failed to fetch integration data')
        setLoading(false)
      })

    return () => {
      fetcher.stopFetch(integrationId, resourceId, resourceType, stableOnData)
    }
  }, [fetcher, integrationId, resourceId, resourceType, refreshInterval, stableOnData, mapping])

  return { data, loading, error }
}
