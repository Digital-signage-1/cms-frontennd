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

    list: (workspaceId: number, provider?: string) =>
      client.get<ListIntegrationsResponse>(
        `/api/v1/workspaces/${workspaceId}/integrations`,
        { params: provider ? { provider } : undefined }
      ),

    get: (workspaceId: number, integrationId: number) =>
      client.get<IntegrationDetail>(
        `/api/v1/workspaces/${workspaceId}/integrations/${integrationId}`
      ),

    update: (workspaceId: number, integrationId: number, data: IntegrationUpdateRequest) =>
      client.patch<Integration>(
        `/api/v1/workspaces/${workspaceId}/integrations/${integrationId}`,
        data
      ),

    disconnect: (workspaceId: number, integrationId: number) =>
      client.post<{ success: boolean; message: string }>(
        `/api/v1/workspaces/${workspaceId}/integrations/${integrationId}/disconnect`
      ),

    delete: (workspaceId: number, integrationId: number) =>
      client.delete<{ success: boolean }>(
        `/api/v1/workspaces/${workspaceId}/integrations/${integrationId}`
      ),

    listResources: (
      workspaceId: number,
      integrationId: number,
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

    initiateOAuth: (workspaceId: number, provider: string, redirectUri: string) =>
      client.post<OAuthInitResponse>(
        `/api/v1/workspaces/${workspaceId}/integrations/oauth/init?provider=${encodeURIComponent(provider)}&redirect_uri=${encodeURIComponent(redirectUri)}`
      ),

    handleOAuthCallback: (
      workspaceId: number,
      provider: string,
      data: { code: string; state: string; redirect_uri: string }
    ) =>
      client.post<Integration>(
        `/api/v1/workspaces/${workspaceId}/integrations/oauth/callback?provider=${encodeURIComponent(provider)}`,
        data
      ),

    connectWithCredentials: (workspaceId: number, data: CredentialConnectRequest) =>
      client.post<Integration>(
        `/api/v1/workspaces/${workspaceId}/integrations/connect`,
        data
      ),
  }
}
