'use client'

import { useState, useMemo } from 'react'
import { Loader2, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIntegrations, useIntegrationResources } from '@/hooks/queries/useIntegrations'

interface PowerBIResourceMultiPickerProps {
  workspaceId: number | string
  integrationId?: number | string
  resourceType?: string
  onSelect: (selectedIds: string[]) => void
  selectedIds?: string[]
  powerbiWorkspaceId?: string
  powerbiReportId?: string
}

export function PowerBIResourceMultiPicker({
  workspaceId,
  integrationId,
  resourceType = 'page',
  onSelect,
  selectedIds = [],
  powerbiWorkspaceId,
  powerbiReportId,
}: PowerBIResourceMultiPickerProps) {
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

  const resolvedId = resolvedIntegration?.integration_id || resolvedIntegration?.id || ''

  const extraParams: Record<string, string> = {}
  if (powerbiWorkspaceId) extraParams.pbi_workspace_id = powerbiWorkspaceId
  if (powerbiReportId) extraParams.pbi_report_id = powerbiReportId

  const { data: resources, isLoading: loadingResources, refetch } = useIntegrationResources(
    workspaceId,
    resolvedId,
    resourceType,
    !!resolvedId && !!powerbiReportId,
    Object.keys(extraParams).length > 0 ? extraParams : undefined
  )

  const filteredResources = useMemo(() => {
    if (!resources?.length) return []
    if (!searchQuery.trim()) return resources
    const query = searchQuery.toLowerCase()
    return resources.filter(
      (r: any) => r.name?.toLowerCase().includes(query)
    )
  }, [resources, searchQuery])

  const handleSync = async () => {
    setSyncing(true)
    await refetch()
    setSyncing(false)
  }

  const allSelected = selectedIds.length === 0

  const togglePage = (pageId: string) => {
    if (selectedIds.includes(pageId)) {
      onSelect(selectedIds.filter((id) => id !== pageId))
    } else {
      onSelect([...selectedIds, pageId])
    }
  }

  const toggleAll = () => {
    // Toggle between "all pages" (empty array) and "all explicitly selected"
    if (allSelected) {
      // Select all explicitly
      const allIds = (resources ?? []).map((r: any) => r.external_id)
      onSelect(allIds)
    } else {
      onSelect([])
    }
  }

  if (loadingIntegrations || loadingResources) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
      </div>
    )
  }

  if (!resources?.length) {
    return (
      <div className="py-4 text-center text-sm text-text-muted">
        No pages found. Select a report first.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted">
          {allSelected
            ? `All pages (${resources.length})`
            : `${selectedIds.length} of ${resources.length} pages selected`}
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

      {resources.length > 5 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
        {/* All Pages toggle */}
        <label className="flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-all border-border hover:border-primary/30 hover:bg-surface-alt/40">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-text-primary">
            All Pages
          </span>
        </label>

        {/* Individual pages */}
        {filteredResources.map((resource: any) => {
          const isChecked = allSelected || selectedIds.includes(resource.external_id)
          return (
            <label
              key={resource.external_id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-all ${
                isChecked && !allSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30 hover:bg-surface-alt/40'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={allSelected}
                onChange={() => togglePage(resource.external_id)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
              />
              <span className="text-sm text-text-primary truncate">
                {resource.name}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
