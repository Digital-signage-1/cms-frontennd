import {
  createApiClient,
  createAccountsEndpoints,
  createAuthEndpoints,
  createWorkspaceEndpoints,
  createContentEndpoints,
  createAppsEndpoints,
  createChannelsEndpoints,
  createPlayersEndpoints,
  createSchedulesEndpoints,
  createTemplatesEndpoints,
  createInvitationsEndpoints,
  createAnalyticsEndpoints,
  createIntegrationsEndpoints,
} from '@signage/api-client'
import { refreshAccessToken } from './token-refresh'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const TOKEN_KEY = 'signage_access_token'

const getToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const apiClient = createApiClient(API_BASE_URL, getToken, refreshAccessToken)

export const api = {
  accounts: createAccountsEndpoints(apiClient),
  auth: createAuthEndpoints(apiClient),
  workspaces: createWorkspaceEndpoints(apiClient),
  content: createContentEndpoints(apiClient),
  apps: createAppsEndpoints(apiClient),
  channels: createChannelsEndpoints(apiClient),
  players: createPlayersEndpoints(apiClient),
  schedules: createSchedulesEndpoints(apiClient),
  templates: createTemplatesEndpoints(apiClient),
  invitations: createInvitationsEndpoints(apiClient),
  analytics: createAnalyticsEndpoints(apiClient),
  integrations: createIntegrationsEndpoints(apiClient),
}
