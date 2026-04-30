'use client'

import { useState, useMemo } from 'react'
import { Loader2, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSheetTabs } from '@/hooks/queries/useIntegrations'

interface GoogleResourceMultiPickerProps {
  workspaceId: number | string
  integrationId?: number | string
  resourceType?: string
  onSelect: (selectedIds: string[]) => void
  selectedIds?: string[]
  spreadsheetId?: string
}

export function GoogleResourceMultiPicker({
  workspaceId,
  integrationId,
  resourceType = 'sheet_tab',
  onSelect,
  selectedIds = [],
  spreadsheetId,
}: GoogleResourceMultiPickerProps) {
  const [syncing, setSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: tabs, isLoading, refetch } = useSheetTabs(
    workspaceId,
    integrationId ?? '',
    spreadsheetId ?? '',
    !!integrationId && !!spreadsheetId && resourceType === 'sheet_tab'
  )

  const filteredTabs = useMemo(() => {
    if (!tabs?.length) return []
    if (!searchQuery.trim()) return tabs
    const query = searchQuery.toLowerCase()
    return tabs.filter(
      (t: any) => t.title?.toLowerCase().includes(query)
    )
  }, [tabs, searchQuery])

  const handleSync = async () => {
    setSyncing(true)
    await refetch()
    setSyncing(false)
  }

  const allSelected = selectedIds.length === 0

  const toggleTab = (tabTitle: string) => {
    if (selectedIds.includes(tabTitle)) {
      onSelect(selectedIds.filter((id) => id !== tabTitle))
    } else {
      onSelect([...selectedIds, tabTitle])
    }
  }

  const toggleAll = () => {
    if (allSelected) {
      const allTitles = (tabs ?? []).map((t: any) => t.title)
      onSelect(allTitles)
    } else {
      onSelect([])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
      </div>
    )
  }

  if (!spreadsheetId) {
    return (
      <div className="py-4 text-center text-sm text-text-muted">
        Select a spreadsheet first.
      </div>
    )
  }

  if (!tabs?.length) {
    return (
      <div className="py-4 text-center text-sm text-text-muted">
        No tabs found in this spreadsheet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted">
          {allSelected
            ? `Showing all tabs (${tabs.length})`
            : `${selectedIds.length} of ${tabs.length} tabs selected`}
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

      {tabs.length > 5 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tabs..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
        <label className="flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-all border-border hover:border-primary/30 hover:bg-surface-alt/40">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-text-primary">
            All Tabs
          </span>
        </label>

        {filteredTabs.map((tab: any) => {
          const isChecked = allSelected || selectedIds.includes(tab.title)
          return (
            <label
              key={tab.title}
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
                onChange={() => toggleTab(tab.title)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
              />
              <span className="text-sm text-text-primary truncate">
                {tab.title}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
