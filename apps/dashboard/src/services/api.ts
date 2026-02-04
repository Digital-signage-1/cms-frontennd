import {
  createApiClient,
  createAuthEndpoints,
  createWorkspaceEndpoints,
  createContentEndpoints,
  createAppsEndpoints,
  createChannelsEndpoints,
  createPlayersEndpoints,
  createSchedulesEndpoints,
  createTemplatesEndpoints,
  createAnalyticsEndpoints,
} from '@signage/api-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://5te33orwoc.execute-api.us-east-1.amazonaws.com'
const TOKEN_KEY = 'signage_access_token'

const getToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const apiClient = createApiClient(API_BASE_URL, getToken)

export const api = {
  auth: createAuthEndpoints(apiClient),
  workspaces: createWorkspaceEndpoints(apiClient),
  content: createContentEndpoints(apiClient),
  apps: createAppsEndpoints(apiClient),
  channels: createChannelsEndpoints(apiClient),
  players: createPlayersEndpoints(apiClient),
  schedules: createSchedulesEndpoints(apiClient),
  templates: createTemplatesEndpoints(apiClient),
  analytics: createAnalyticsEndpoints(apiClient),
}
