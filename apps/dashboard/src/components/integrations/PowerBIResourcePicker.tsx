'use client'

import { useState, useMemo } from 'react'
import { Check, Loader2, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MicrosoftOAuthButton } from './MicrosoftOAuthButton'
import { useIntegrations, useIntegrationResources } from '@/hooks/queries/useIntegrations'

interface PowerBIResourcePickerProps {
  workspaceId: number | string
  integrationId?: number | string
  /** 'workspace' | 'report' | 'dashboard' */
  resourceType?: string
  onSelect: (resourceId: string, metadata?: Record<string, unknown>) => void
  selectedId?: string
  /** For report/dashboard pickers — the Power BI workspace to scope into */
  powerbiWorkspaceId?: string
}

export function PowerBIResourcePicker({
  workspaceId,
  integrationId,
  resourceType = 'workspace',
  onSelect,
  selectedId,
  powerbiWorkspaceId,
}: PowerBIResourcePickerProps) {
  const [syncing, setSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: integrations, isLoading: loadingIntegrations } = useIntegrations(
    workspaceId,
    'powerbi'
  )

  const resolvedIntegration = useMemo(() => {
    const list = integrations?.integrations ?? (Array.isArray(integrations) ? integrations : [])
    if (integrationId) {
      return list.find((i: any) =>
        String(i.integration_id || i.id) === String(integrationId)
      ) ?? null
    }
    return list.find((i: any) => i.provider === 'powerbi' && i.status === 'active') ?? null
  }, [integrations, integrationId])

  const isConnected = resolvedIntegration && resolvedIntegration.status === 'active'
  const resolvedId = resolvedIntegration?.integration_id || resolvedIntegration?.id || ''

  // Pass workspace_id as a query param for scoped resource listing
  const { data: resources, isLoading: loadingResources, refetch } = useIntegrationResources(
    workspaceId,
    resolvedId,
    resourceType,
    !!resolvedId,
    powerbiWorkspaceId ? { pbi_workspace_id: powerbiWorkspaceId } : undefined
  )

  const filteredResources = useMemo(() => {
    if (!resources?.length) return []
    if (!searchQuery.trim()) return resources
    const query = searchQuery.toLowerCase()
    return resources.filter(
      (r: any) =>
        r.name?.toLowerCase().includes(query) ||
        r.url?.toLowerCase().includes(query)
    )
  }, [resources, searchQuery])

  const handleSync = async () => {
    setSyncing(true)
    await refetch()
    setSyncing(false)
  }

  if (loadingIntegrations) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-text-muted">
          Connect your Microsoft account to browse Power BI resources
        </p>
        <MicrosoftOAuthButton
          workspaceId={workspaceId}
          provider="powerbi"
          size="sm"
        />
      </div>
    )
  }

  const labelMap: Record<string, string> = {
    workspace: 'workspace',
    report: 'report',
    dashboard: 'dashboard',
  }
  const label = labelMap[resourceType] ?? 'resource'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted">
          Select a {label} ({resources?.length ?? 0} available)
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {(resources?.length ?? 0) > 5 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${label}s...`}
            className="pl-8 h-8 text-sm"
          />
        </div>
      )}

      {loadingResources ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : !resources?.length ? (
        <div className="py-6 text-center text-sm text-text-muted">
          No {label}s found. Try refreshing.
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="py-4 text-center text-sm text-text-muted">
          No {label}s match &quot;{searchQuery}&quot;
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
          {filteredResources.map((resource: any) => (
            <button
              key={resource.external_id}
              type="button"
              onClick={() => onSelect(resource.external_id, resource.metadata)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                selectedId === resource.external_id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30 hover:bg-surface-alt/40'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {resource.name}
                </p>
                {resource.url && (
                  <p className="text-xs text-text-muted truncate mt-0.5">
                    {resource.url}
                  </p>
                )}
              </div>
              {selectedId === resource.external_id && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
