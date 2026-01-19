import type { ApiClient } from '../client'
import type { Account, User, Workspace, WorkspaceMember } from '@signage/types'

export interface SignUpRequest {
  email: string
  password: string
  name: string
}

export interface SignUpResponse {
  user_sub: string
  requires_confirmation: boolean
  message: string
}

export interface ConfirmSignUpRequest {
  email: string
  code: string
  password: string
}

export interface ConfirmSignUpResponse {
  access_token: string
  refresh_token: string | null
  id_token: string
  expires_in: number
  token_type: string
  account_id: string
  workspace_id: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string | null
  id_token: string
  expires_in: number
  token_type: string
}

export interface RefreshResponse {
  access_token: string
  refresh_token: string | null
  id_token: string
  expires_in: number
  token_type: string
}

export interface UserResponse {
  sub: string
  email: string
  email_verified: boolean
  name: string
  account_id: string | null
  workspaces: Array<{ workspace_id: string; name: string }>
}

export function createAuthEndpoints(client: ApiClient) {
  return {
    signup: (data: SignUpRequest) =>
      client.postUnauth<SignUpResponse>('/api/v1/auth/signup', data),
    
    confirmSignup: (data: ConfirmSignUpRequest) =>
      client.postUnauth<ConfirmSignUpResponse>('/api/v1/auth/confirm-signup', data),
    
    login: (data: LoginRequest) =>
      client.postUnauth<LoginResponse>('/api/v1/auth/login', data),
    
    refresh: (refreshToken: string) =>
      client.postUnauth<RefreshResponse>('/api/v1/auth/refresh', { refresh_token: refreshToken }),
    
    forgotPassword: (email: string) =>
      client.postUnauth<{ message: string }>('/api/v1/auth/forgot-password', { email }),
    
    confirmForgotPassword: (email: string, code: string, newPassword: string) =>
      client.postUnauth<{ message: string }>('/api/v1/auth/confirm-forgot-password', {
        email,
        code,
        new_password: newPassword,
      }),
    
    resendCode: (email: string) =>
      client.postUnauth<{ message: string }>('/api/v1/auth/resend-code', { email }),
    
    getMe: () => client.get<UserResponse>('/api/v1/auth/me'),

    getAccount: () => client.get<Account>('/api/v1/accounts/me'),
    
    updateAccount: (accountId: string, data: Partial<Account>) =>
      client.patch<Account>(`/api/v1/accounts/${accountId}`, data),
    
    createAccount: (data: { name: string }) =>
      client.post<Account>('/api/v1/accounts', data),
    
    getWorkspaces: () =>
      client.get<Workspace[]>('/api/v1/workspaces'),
    
    getWorkspace: (workspaceId: string) =>
      client.get<Workspace>(`/api/v1/workspaces/${workspaceId}`),
    
    createWorkspace: (data: { name: string; timezone?: string }) =>
      client.post<Workspace>('/api/v1/workspaces', data),
    
    updateWorkspace: (workspaceId: string, data: Partial<Workspace>) =>
      client.patch<Workspace>(`/api/v1/workspaces/${workspaceId}`, data),
    
    deleteWorkspace: (workspaceId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}`),
    
    getMembers: (workspaceId: string) =>
      client.get<WorkspaceMember[]>(`/api/v1/workspaces/${workspaceId}/members`),
    
    inviteMember: (workspaceId: string, data: { email: string; role: string }) =>
      client.post<void>(`/api/v1/workspaces/${workspaceId}/invitations`, data),
    
    updateMemberRole: (workspaceId: string, cognitoSub: string, role: string) =>
      client.patch<void>(`/api/v1/workspaces/${workspaceId}/members/${cognitoSub}`, { role }),
    
    removeMember: (workspaceId: string, cognitoSub: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/members/${cognitoSub}`),
  }
}
