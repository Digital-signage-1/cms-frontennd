const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const TOKEN_KEY = 'signage_access_token'
const REFRESH_TOKEN_KEY = 'signage_refresh_token'
const ID_TOKEN_KEY = 'signage_id_token'

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

function setTokens(accessToken: string, refreshToken: string | null, idToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(ID_TOKEN_KEY, idToken)
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(ID_TOKEN_KEY)
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Refresh failed')
    const data = result.data ?? result
    setTokens(data.access_token, data.refresh_token, data.id_token)
    return true
  } catch {
    clearTokens()
    if (typeof window !== 'undefined') {
      const { useAuthStore } = await import('@/stores/auth-store')
      useAuthStore.getState().signOut()
    }
    return false
  }
}
