'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIntegrationResources } from '@/hooks/queries/useIntegrations'

interface SalesforceResourcePickerProps {
  workspaceId: number | string
  integrationId?: number | string
  resourceType?: string
  onSelect: (resourceId: string, metadata?: Record<string, unknown>) => void
  selectedId?: string
}

export function SalesforceResourcePicker({
  workspaceId,
  integrationId,
  resourceType = 'dashboard',
  onSelect,
  selectedId,
}: SalesforceResourcePickerProps) {
  const [syncing, setSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const resolvedId = integrationId ? String(integrationId) : ''
  const rt = (resourceType || 'dashboard').toLowerCase()
  const isReport = rt === 'report'
  const nounPlural = isReport ? 'reports' : 'dashboards'
  const noun = isReport ? 'report' : 'dashboard'

  const { data: resources, isLoading: loadingResources, refetch } = useIntegrationResources(
    workspaceId,
    resolvedId,
    resourceType,
    !!resolvedId,
  )

  const filteredResources = useMemo(() => {
    if (!resources?.length) return []
    if (!searchQuery.trim()) return resources
    const query = searchQuery.toLowerCase()
    return resources.filter(
      (r: { name?: string; url?: string }) =>
        r.name?.toLowerCase().includes(query) || r.url?.toLowerCase().includes(query),
    )
  }, [resources, searchQuery])

  const handleSync = async () => {
    setSyncing(true)
    await refetch()
    setSyncing(false)
  }

  if (!resolvedId) {
    return (
      <div className="rounded-lg border border-border bg-surface-alt/30 px-3 py-3">
        <p className="text-sm text-text-muted">Select a Salesforce connection first</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted">
          Select a {noun} ({resources?.length ?? 0} available)
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
            placeholder={`Search ${nounPlural}...`}
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
        <div className="py-6 text-center text-sm text-text-muted space-y-2">
          <p>No {nounPlural} found. Try refreshing or check permissions.</p>
          <Link href="/integrations" className="text-xs text-primary hover:underline inline-block">
            Manage integrations
          </Link>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="py-4 text-center text-sm text-text-muted">
          No {nounPlural} match &quot;{searchQuery}&quot;
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
          {filteredResources.map((resource: { external_id: string; name?: string; url?: string }) => (
            <button
              key={resource.external_id}
              type="button"
              onClick={() => onSelect(resource.external_id)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                selectedId === resource.external_id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30 hover:bg-surface-alt/40'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{resource.name}</p>
                {resource.url && (
                  <p className="text-xs text-text-muted truncate mt-0.5">{resource.url}</p>
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
