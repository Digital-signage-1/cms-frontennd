export type IntegrationAuthFlow = 'oauth2' | 'api_key' | 'basic_auth' | 'bearer_token'

export type IntegrationStatus = 'active' | 'expired' | 'error' | 'disconnected'

export interface CredentialField {
  name: string
  label: string
  type: 'text' | 'password' | 'url' | 'email' | 'number'
  required: boolean
  placeholder?: string
  help_text?: string
  secret?: boolean
}

export interface IntegrationProvider {
  provider: string
  display_name: string
  description: string
  icon: string
  category: string
  auth_flow: IntegrationAuthFlow
  scopes: string[]
  credential_fields: CredentialField[]
  is_beta: boolean
  is_active: boolean
  docs_url?: string
}

export interface CredentialConnectRequest {
  provider: string
  display_name?: string
  credentials: Record<string, string>
}

export interface ConnectedAccountInfo {
  email?: string
  name?: string
  picture?: string
  given_name?: string
}

export interface Integration {
  id: number
  integration_id: string
  provider: string
  display_name?: string
  status: IntegrationStatus
  scope?: string
  expires_at?: string
  connection_config: Record<string, unknown>
  last_sync_at?: string
  error_message?: string
  created_at: string
  updated_at?: string
}

export interface IntegrationDetail extends Integration {
  account_info?: ConnectedAccountInfo
}

export interface IntegrationResource {
  resource_id: string
  resource_type: string
  external_id: string
  name: string
  description?: string
  url?: string
  resource_metadata: Record<string, unknown>
  discovered_at: string
}

export interface OAuthInitResponse {
  auth_url: string
  state: string
  provider: string
}

export interface ListIntegrationsResponse {
  integrations: Integration[]
  total: number
}

export interface ListProvidersResponse {
  providers: IntegrationProvider[]
  categories: string[]
  total: number
}

export interface IntegrationUpdateRequest {
  display_name?: string
  connection_config?: Record<string, unknown>
}
