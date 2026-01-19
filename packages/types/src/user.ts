export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface User {
  cognito_sub: string
  email: string
  name?: string
  given_name?: string
  family_name?: string
  picture?: string
}

export interface Account {
  account_id: string
  owner_cognito_sub: string
  name: string
  email: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  max_workspaces: number
  max_storage_gb: number
  max_players: number
  created_at: string
  updated_at?: string
}

export interface Workspace {
  workspace_id: string
  account_id: string
  name: string
  slug: string
  s3_prefix: string
  timezone: string
  storage_used_bytes: number
  is_default: boolean
  settings?: WorkspaceSettings
  branding?: WorkspaceBranding
  created_at: string
}

export interface WorkspaceSettings {
  default_language?: string
  date_format?: string
  time_format?: '12h' | '24h'
}

export interface WorkspaceBranding {
  logo_url?: string
  primary_color?: string
  secondary_color?: string
}

export interface WorkspaceMember {
  workspace_id: string
  cognito_sub: string
  role: UserRole
  status: 'active' | 'pending' | 'removed'
  email?: string
  name?: string
  invited_by?: string
  joined_at?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  id_token: string
  expires_in: number
}

export interface AuthState {
  user: User | null
  account: Account | null
  workspace: Workspace | null
  workspaces: Workspace[]
  isAuthenticated: boolean
  isLoading: boolean
}
