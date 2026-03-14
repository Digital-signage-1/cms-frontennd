import { useState, useEffect, useCallback, useRef } from 'react'
import { useIntegrationDataFetcher } from '../IntegrationDataContext'
import { INTEGRATION_TYPES } from '../config/integrationTypes'

export function useIntegrationAppData(
  templateType: string,
  config: Record<string, unknown>,
  appId?: string,
): { data: Record<string, unknown> | null; loading: boolean; error: string | null } {
  const fetcher = useIntegrationDataFetcher()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const onDataRef = useRef<((d: Record<string, unknown>) => void) | undefined>(undefined)

  const integrationId = config.integration_id as string | undefined
  const mapping = INTEGRATION_TYPES[templateType]

  // Stable callback ref to avoid re-subscribing on every render
  onDataRef.current = (d: Record<string, unknown>) => {
    setData(d)
    setLoading(false)
    setError(null)
  }

  const stableOnData = useCallback((d: Record<string, unknown>) => {
    onDataRef.current?.(d)
  }, [])

  // Compose resource ID: "workspace_id/report_id/app_id" for providers that need it
  const rawResourceId = mapping ? (config[mapping.configKey] as string) : undefined
  const compositePrefix = mapping?.compositeKey ? (config[mapping.compositeKey] as string) : undefined
  const appIdSuffix = mapping?.needsAppId ? appId : undefined
  const resourceId =
    rawResourceId && compositePrefix
      ? `${compositePrefix}/${rawResourceId}${appIdSuffix ? '/' + appIdSuffix : ''}`
      : rawResourceId
  const resourceType = mapping?.resourceType
  const refreshInterval =
    (config.refresh_interval as number | undefined)
      ? (config.refresh_interval as number) * 1000
      : mapping?.defaultRefreshMs

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
