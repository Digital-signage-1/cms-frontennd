'use client'

import { MoreHorizontal, Unplug, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import type { Integration } from '@signage/types'
import { Button } from '@/components/ui/button'
import { IntegrationStatusBadge } from './IntegrationStatusBadge'
import { useState } from 'react'
import { cn } from '@/lib/utils'

import { ProviderIcon } from './ProviderIcon'

const AUTH_FLOW_LABELS: Record<string, string> = {
  oauth2: 'OAuth',
  api_key: 'API Key',
  bearer_token: 'Token',
  basic_auth: 'Basic Auth',
}

interface IntegrationCardProps {
  integration: Integration
  onManage: () => void
  onDisconnect: () => void
  onDelete: () => void
  isDisconnecting?: boolean
  isDeleting?: boolean
}

export function IntegrationCard({
  integration,
  onManage,
  onDisconnect,
  onDelete,
  isDisconnecting,
  isDeleting,
}: IntegrationCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const accountEmail =
    typeof integration.connection_config?.account_email === 'string'
      ? integration.connection_config.account_email
      : typeof integration.connection_config?.account_info === 'object' &&
        integration.connection_config?.account_info !== null
      ? (integration.connection_config.account_info as Record<string, string>)?.email
      : null

  const lastSync = integration.last_sync_at
    ? new Date(integration.last_sync_at).toLocaleDateString()
    : null

  return (
    <div
      className={cn(
        'relative flex items-start gap-4 rounded-xl border bg-surface p-4 transition-all duration-200',
        integration.status === 'active'
          ? 'border-border hover:border-primary/30'
          : integration.status === 'error'
          ? 'border-red-500/20 bg-red-500/5'
          : 'border-border opacity-70'
      )}
    >
      <ProviderIcon provider={integration.provider} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {integration.display_name || integration.provider}
            </p>
            <p className="text-xs text-text-muted capitalize">
              {integration.provider.replace(/_/g, ' ')}
            </p>
          </div>
          <IntegrationStatusBadge status={integration.status} size="sm" />
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {accountEmail && (
            <span className="text-xs text-text-muted truncate max-w-[180px]">{accountEmail}</span>
          )}
          {lastSync && (
            <span className="text-xs text-text-muted">Synced {lastSync}</span>
          )}
        </div>

        {integration.error_message && (
          <p className="mt-1.5 text-xs text-red-400 line-clamp-1">{integration.error_message}</p>
        )}
      </div>

      <div className="relative shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-muted hover:text-text-primary"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-border bg-background shadow-xl overflow-hidden">
              <button
                onClick={() => { setMenuOpen(false); onManage() }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-alt transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Manage
              </button>
              {integration.status === 'active' && (
                <button
                  onClick={() => { setMenuOpen(false); onDisconnect() }}
                  disabled={isDisconnecting}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-amber-400 hover:bg-amber-500/5 transition-colors"
                >
                  <Unplug className="h-4 w-4" />
                  {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
                </button>
              )}
              <button
                onClick={() => { setMenuOpen(false); onDelete() }}
                disabled={isDeleting}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
