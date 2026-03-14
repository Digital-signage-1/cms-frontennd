import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { CredentialConnectRequest, IntegrationUpdateRequest, OAuthInitResponse } from '@signage/types'

export function useIntegrationCatalog(category?: string) {
  return useQuery({
    queryKey: ['integration-catalog', category],
    queryFn: () => api.integrations.getCatalog(category),
    staleTime: 10 * 60 * 1000,
  })
}

export function useIntegrations(workspaceId: number | string, provider?: string) {
  return useQuery({
    queryKey: ['integrations', workspaceId, provider],
    queryFn: () => api.integrations.list(workspaceId, provider),
    enabled: !!workspaceId,
  })
}

export function useIntegration(workspaceId: number | string, integrationId: string) {
  return useQuery({
    queryKey: ['integrations', workspaceId, integrationId],
    queryFn: () => api.integrations.get(workspaceId, integrationId),
    enabled: !!workspaceId && !!integrationId,
  })
}

export function useIntegrationResources(
  workspaceId: number | string,
  integrationId: number | string,
  resourceType?: string,
  enabled = true,
  extraParams?: Record<string, string>
) {
  return useQuery({
    queryKey: ['integration-resources', workspaceId, integrationId, resourceType, extraParams],
    queryFn: () =>
      api.integrations.listResources(workspaceId, integrationId, resourceType, false, extraParams),
    enabled: !!workspaceId && !!integrationId && enabled,
  })
}

export function useInitiateOAuth() {
  return useMutation({
    mutationFn: ({
      workspaceId,
      provider,
      redirectUri,
    }: {
      workspaceId: number | string
      provider: string
      redirectUri: string
    }) => api.integrations.initiateOAuth(workspaceId, provider, redirectUri),
    onSuccess: (data: OAuthInitResponse) => {
      window.location.href = data.auth_url
    },
  })
}

export function useOAuthCallback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      provider,
      code,
      state,
      redirectUri,
    }: {
      workspaceId: number | string
      provider: string
      code: string
      state: string
      redirectUri: string
    }) =>
      api.integrations.handleOAuthCallback(workspaceId, provider, {
        code,
        state,
        redirect_uri: redirectUri,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', variables.workspaceId] })
    },
  })
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      integrationId,
    }: {
      workspaceId: number | string
      integrationId: string
    }) => api.integrations.disconnect(workspaceId, integrationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', variables.workspaceId] })
    },
  })
}

export function useConnectWithCredentials() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: number | string
      data: CredentialConnectRequest
    }) => api.integrations.connectWithCredentials(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', variables.workspaceId] })
    },
  })
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      integrationId,
    }: {
      workspaceId: number | string
      integrationId: string
    }) => api.integrations.delete(workspaceId, integrationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', variables.workspaceId] })
    },
  })
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workspaceId,
      integrationId,
      data,
    }: {
      workspaceId: number | string
      integrationId: string
      data: IntegrationUpdateRequest
    }) => api.integrations.update(workspaceId, integrationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', variables.workspaceId] })
      queryClient.invalidateQueries({
        queryKey: ['integrations', variables.workspaceId, variables.integrationId],
      })
    },
  })
}
