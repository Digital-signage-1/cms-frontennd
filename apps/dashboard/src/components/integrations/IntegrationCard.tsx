'use client'

import { MoreHorizontal, Unplug, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import type { Integration } from '@signage/types'
import { Button } from '@/components/ui/button'
import { IntegrationStatusBadge } from './IntegrationStatusBadge'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  google_sheets: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <rect width="24" height="24" rx="4" fill="#0F9D58" />
      <path d="M7 8h10M7 12h10M7 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  google_drive: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <rect width="24" height="24" rx="4" fill="#4285F4" />
      <path d="M12 5l7 12H5L12 5z" fill="white" fillOpacity="0.9" />
      <path d="M5 17h14l-3-5H8L5 17z" fill="white" fillOpacity="0.5" />
    </svg>
  ),
  powerbi: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <rect width="24" height="24" rx="4" fill="#F2C811" />
      <rect x="7" y="12" width="3" height="6" rx="0.5" fill="white" />
      <rect x="11" y="8" width="3" height="10" rx="0.5" fill="white" />
      <rect x="15" y="5" width="3" height="13" rx="0.5" fill="white" />
    </svg>
  ),
  tableau: (
    <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white font-bold text-[9px]">TAB</div>
  ),
  slack: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <rect width="24" height="24" rx="4" fill="#4A154B" />
      <path d="M9 8.5a1.5 1.5 0 1 1-3 0v-1a1.5 1.5 0 0 1 3 0M14 8.5V7a1.5 1.5 0 0 1 3 0v1.5M14 15.5a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1-3 0M9 15.5v1a1.5 1.5 0 0 1-3 0v-1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

function ProviderIcon({ provider }: { provider: string }) {
  if (PROVIDER_ICONS[provider]) return <>{PROVIDER_ICONS[provider]}</>
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded bg-surface-alt text-xs font-bold text-text-muted uppercase">
      {provider.slice(0, 2)}
    </div>
  )
}

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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-alt">
        <ProviderIcon provider={integration.provider} />
      </div>

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
