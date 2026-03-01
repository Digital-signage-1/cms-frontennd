import type { ApiClient } from '../client'

export function createAccountsEndpoints(client: ApiClient) {
  return {
    getMe: () => client.get<Record<string, unknown>>('/api/v1/accounts/me'),

    get: (accountId: string) =>
      client.get<Record<string, unknown>>(`/api/v1/accounts/${accountId}`),

    update: (accountId: string, data: Record<string, unknown>) =>
      client.patch<Record<string, unknown>>(`/api/v1/accounts/${accountId}`, data),

    delete: (accountId: string) =>
      client.delete<void>(`/api/v1/accounts/${accountId}`),
  }
}
