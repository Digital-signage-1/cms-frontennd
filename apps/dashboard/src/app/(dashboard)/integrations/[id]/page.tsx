'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Trash2,
  Unplug,
  User,
  File,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react'
import {
  useIntegration,
  useIntegrationResources,
  useDisconnectIntegration,
  useDeleteIntegration,
} from '@/hooks/queries/useIntegrations'
import { useWorkspaces } from '@/hooks/queries/useWorkspaces'
import { IntegrationStatusBadge } from '@/components/integrations/IntegrationStatusBadge'
import { Button } from '@/components/ui/button'
import { GoogleOAuthButton } from '@/components/integrations/GoogleOAuthButton'
import type { IntegrationResource } from '@signage/types'

function ResourceRow({ resource }: { resource: IntegrationResource }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 hover:bg-surface-alt/40 transition-colors">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-alt">
        <File className="h-4 w-4 text-text-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{resource.name}</p>
        <p className="text-xs text-text-muted capitalize">{resource.resource_type}</p>
      </div>
      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-text-muted hover:text-primary transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  )
}

export default function IntegrationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const integrationId = params.id

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [resourceType, setResourceType] = useState('file')

  const { data: workspacesData } = useWorkspaces()
  const workspaceId = workspacesData?.[0]?.id || workspacesData?.[0]?.workspace_id || 0

  const { data: integration, isLoading, refetch } = useIntegration(workspaceId, integrationId)
  const { data: resources, isLoading: loadingResources } = useIntegrationResources(
    workspaceId,
    integrationId,
    resourceType,
    !!workspaceId
  )

  const disconnect = useDisconnectIntegration()
  const deleteIntegration = useDeleteIntegration()

  const isGoogle = integration?.provider?.startsWith('google')

  const handleDisconnect = () => {
    disconnect.mutate(
      { workspaceId, integrationId },
      { onSuccess: () => refetch() }
    )
  }

  const handleDelete = () => {
    deleteIntegration.mutate(
      { workspaceId, integrationId },
      { onSuccess: () => router.push('/integrations') }
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-alt" />
        <div className="h-40 animate-pulse rounded-xl bg-surface-alt" />
      </div>
    )
  }

  if (!integration) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <AlertTriangle className="h-10 w-10 text-text-muted opacity-40" />
        <p className="text-text-muted">Integration not found</p>
        <Button variant="outline" onClick={() => router.push('/integrations')}>
          Back to Integrations
        </Button>
      </div>
    )
  }

  const lastSync = integration.last_sync_at
    ? new Date(integration.last_sync_at).toLocaleString()
    : 'Never'

  const createdAt = new Date(integration.created_at).toLocaleDateString()

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/integrations')}
          className="gap-1.5 text-text-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Integrations
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-alt text-2xl">
              {integration.provider === 'google_sheets' ? '📊' : '📁'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                {integration.display_name || integration.provider}
              </h1>
              <p className="text-sm text-text-muted capitalize">
                {integration.provider.replace('_', ' ')}
              </p>
              <div className="mt-2">
                <IntegrationStatusBadge status={integration.status} />
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-text-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {integration.account_info && (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-surface-alt/40 px-4 py-3">
            {integration.account_info.picture ? (
              <img
                src={integration.account_info.picture}
                alt={integration.account_info.name ?? ''}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-text-primary">
                {integration.account_info.name ?? integration.account_info.email}
              </p>
              {integration.account_info.name && (
                <p className="text-xs text-text-muted">{integration.account_info.email}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-text-muted mb-1">Connected</p>
            <p className="font-medium text-text-primary">{createdAt}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Last Sync</p>
            <p className="font-medium text-text-primary">{lastSync}</p>
          </div>
          {integration.scope && (
            <div>
              <p className="text-xs text-text-muted mb-1">Permissions</p>
              <p className="font-medium text-text-primary truncate text-xs">
                {integration.scope.split(' ').length} scopes
              </p>
            </div>
          )}
        </div>

        {integration.error_message && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{integration.error_message}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3 flex-wrap">
          {integration.status !== 'active' && isGoogle && (
            <GoogleOAuthButton
              workspaceId={workspaceId}
              provider={integration.provider}
              label="Reconnect"
              size="sm"
            />
          )}
          {integration.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-amber-400 border-amber-500/20 hover:bg-amber-500/5"
              onClick={handleDisconnect}
              disabled={disconnect.isPending}
            >
              <Unplug className="h-4 w-4" />
              Disconnect
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/5"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-text-muted" />
            <h2 className="font-semibold text-text-primary">Resources</h2>
          </div>
          <div className="flex items-center gap-2">
            {integration.provider === 'google_drive' && (
              <div className="flex gap-1">
                {['file', 'image', 'video', 'folder'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setResourceType(type)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors capitalize ${
                      resourceType === type
                        ? 'bg-primary text-white'
                        : 'bg-surface-alt text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
            {integration.provider === 'google_sheets' && (
              <span className="text-xs text-text-muted">Spreadsheets</span>
            )}
          </div>
        </div>

        {loadingResources ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
            ))}
          </div>
        ) : !resources || resources.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <FolderOpen className="h-8 w-8 text-text-muted opacity-40" />
            <p className="text-sm text-text-muted">
              {integration.status !== 'active'
                ? 'Reconnect to browse resources'
                : 'No resources found'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {resources.map((resource) => (
              <ResourceRow key={resource.resource_id} resource={resource} />
            ))}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-2xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-text-primary">Remove Integration</h3>
            </div>
            <p className="text-sm text-text-muted mb-6">
              This will permanently remove the integration and all associated resources. Any apps
              using this integration may stop working.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
                onClick={handleDelete}
                disabled={deleteIntegration.isPending}
              >
                {deleteIntegration.isPending ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
