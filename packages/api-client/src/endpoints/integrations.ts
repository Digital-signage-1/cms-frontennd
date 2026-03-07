import type { ApiClient } from '../client'
import type {
  CredentialConnectRequest,
  Integration,
  IntegrationDetail,
  IntegrationResource,
  IntegrationUpdateRequest,
  ListIntegrationsResponse,
  ListProvidersResponse,
  OAuthInitResponse,
} from '@signage/types'

export function createIntegrationsEndpoints(client: ApiClient) {
  return {
    getCatalog: (category?: string) =>
      client.get<ListProvidersResponse>('/api/v1/integration-catalog', {
        params: category ? { category } : undefined,
      }),

    list: (workspaceId: number | string, provider?: string) =>
      client.get<ListIntegrationsResponse>(
        `/api/v1/workspaces/${workspaceId}/integrations`,
        { params: provider ? { provider } : undefined }
      ),

    get: (workspaceId: number | string, integrationId: number | string) =>
      client.get<IntegrationDetail>(
        `/api/v1/workspaces/${workspaceId}/integrations/${integrationId}`
      ),

    update: (workspaceId: number | string, integrationId: number | string, data: IntegrationUpdateRequest) =>
      client.patch<Integration>(
        `/api/v1/workspaces/${workspaceId}/integrations/${integrationId}`,
        data
      ),

    disconnect: (workspaceId: number | string, integrationId: number | string) =>
      client.post<{ success: boolean; message: string }>(
        `/api/v1/workspaces/${workspaceId}/integrations/${integrationId}/disconnect`
      ),

    delete: (workspaceId: number | string, integrationId: number | string) =>
      client.delete<{ success: boolean }>(
        `/api/v1/workspaces/${workspaceId}/integrations/${integrationId}`
      ),

    listResources: (
      workspaceId: number | string,
      integrationId: number | string,
      resourceType?: string,
      sync?: boolean
    ) =>
      client.get<IntegrationResource[]>(
        `/api/v1/workspaces/${workspaceId}/integrations/${integrationId}/resources`,
        {
          params: {
            ...(resourceType ? { resource_type: resourceType } : {}),
            ...(sync ? { sync: true } : {}),
          },
        }
      ),

    initiateOAuth: (workspaceId: number | string, provider: string, redirectUri: string) =>
      client.post<OAuthInitResponse>(
        `/api/v1/workspaces/${workspaceId}/integrations/oauth/init?provider=${encodeURIComponent(provider)}&redirect_uri=${encodeURIComponent(redirectUri)}`
      ),

    handleOAuthCallback: (
      workspaceId: number | string,
      provider: string,
      data: { code: string; state: string; redirect_uri: string }
    ) =>
      client.post<Integration>(
        `/api/v1/workspaces/${workspaceId}/integrations/oauth/callback?provider=${encodeURIComponent(provider)}`,
        data
      ),

    connectWithCredentials: (workspaceId: number | string, data: CredentialConnectRequest) =>
      client.post<Integration>(
        `/api/v1/workspaces/${workspaceId}/integrations/connect`,
        data
      ),
  }
}
