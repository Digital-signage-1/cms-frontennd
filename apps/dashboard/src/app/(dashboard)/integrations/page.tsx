'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plug, Plus, RefreshCw } from 'lucide-react'
import {
  useIntegrations,
  useDisconnectIntegration,
  useDeleteIntegration,
} from '@/hooks/queries/useIntegrations'
import { useWorkspaces } from '@/hooks/queries/useWorkspaces'
import { IntegrationCard } from '@/components/integrations/IntegrationCard'
import { AddIntegrationModal } from '@/components/integrations/AddIntegrationModal'
import { Button } from '@/components/ui/button'

export default function IntegrationsPage() {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)

  const { data: workspacesData } = useWorkspaces()
  const workspaceId = workspacesData?.[0]?.id || workspacesData?.[0]?.workspace_id || 0

  const { data, isLoading, refetch } = useIntegrations(workspaceId)
  const disconnect = useDisconnectIntegration()
  const remove = useDeleteIntegration()

  const integrations = data?.integrations ?? []

  return (
    <div className="flex flex-col gap-8 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Plug className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Integrations</h1>
          </div>
          <p className="text-sm text-text-muted pl-[52px]">
            Connect external services to display live data on your signage.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-text-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-alt" />
          ))}
        </div>
      ) : integrations.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center rounded-2xl border-2 border-dashed border-border">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-alt">
            <Plug className="h-8 w-8 text-text-muted opacity-50" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">No integrations yet</p>
            <p className="mt-1 text-sm text-text-muted max-w-xs mx-auto">
              Connect Google Sheets, Power BI, Tableau, Slack and more to display live data on your screens.
            </p>
          </div>
          <Button className="gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Add your first integration
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              {integrations.length} integration{integrations.length !== 1 ? 's' : ''} connected
            </p>
          </div>
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.integration_id}
              integration={integration}
              onManage={() => router.push(`/integrations/${integration.integration_id}`)}
              onDisconnect={() =>
                disconnect.mutate({ workspaceId, integrationId: integration.integration_id })
              }
              onDelete={() =>
                remove.mutate({ workspaceId, integrationId: integration.integration_id })
              }
              isDisconnecting={disconnect.isPending}
              isDeleting={remove.isPending}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddIntegrationModal
          workspaceId={workspaceId}
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}
