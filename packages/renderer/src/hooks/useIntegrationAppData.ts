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
  let resourceId: string | undefined
  if (rawResourceId && mapping?.appendAppIdWithoutComposite && appIdSuffix) {
    resourceId = `${rawResourceId}/${appIdSuffix}`
  } else if (rawResourceId && compositePrefix) {
    resourceId = `${compositePrefix}/${rawResourceId}${appIdSuffix ? '/' + appIdSuffix : ''}`
  } else {
    resourceId = rawResourceId
  }
  const resourceType = mapping?.resourceType
  let refreshIntervalMs =
    (config.refresh_interval as number | undefined) != null
      ? Number(config.refresh_interval) * 1000
      : mapping?.defaultRefreshMs
  if (templateType === 'canva' && config.refresh_interval != null) {
    refreshIntervalMs = Math.max(60_000, Number(config.refresh_interval) * 60_000)
  }

  useEffect(() => {
    if (!fetcher || !mapping || !integrationId || !resourceId || !resourceType) return

    setLoading(true)
    setError(null)

    fetcher
      .startFetch(integrationId, resourceId, resourceType, refreshIntervalMs, stableOnData)
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
  }, [fetcher, integrationId, resourceId, resourceType, refreshIntervalMs, stableOnData, mapping])

  return { data, loading, error }
}
