import { useMemo, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/services/api'
import type { IntegrationDataFetcher } from '@signage/renderer'

/**
 * Dashboard-specific IntegrationDataFetcher.
 * Uses the workspace-scoped `/integrations/{id}/data` endpoint
 * (no polling — one-shot fetch for preview purposes).
 */
export function useDashboardIntegrationFetcher(): IntegrationDataFetcher | null {
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.workspace_id
  const cacheRef = useRef<Map<string, Record<string, unknown>>>(new Map())

  return useMemo<IntegrationDataFetcher | null>(() => {
    if (!workspaceId) return null

    return {
      async startFetch(
        integrationId: string,
        resourceId: string,
        resourceType: string,
        _refreshIntervalMs?: number,
        onData?: (data: Record<string, unknown>) => void,
      ): Promise<Record<string, unknown> | null> {
        const key = `${integrationId}:${resourceId}:${resourceType}`
        const cached = cacheRef.current.get(key)
        if (cached) {
          onData?.(cached)
          return cached
        }

        try {
          console.log('[IntegrationPreview] Fetching:', { workspaceId, integrationId, resourceId, resourceType })
          const data = await api.integrations.getData(
            workspaceId,
            integrationId,
            resourceId,
            resourceType,
          )
          console.log('[IntegrationPreview] Success:', Object.keys(data))
          cacheRef.current.set(key, data)
          onData?.(data)
          return data
        } catch (err) {
          console.error('[IntegrationPreview] Fetch failed:', { workspaceId, integrationId, resourceId, resourceType }, err)
          return null
        }
      },

      stopFetch() {
        // No-op: dashboard preview doesn't use polling intervals
      },
    }
  }, [workspaceId])
}
