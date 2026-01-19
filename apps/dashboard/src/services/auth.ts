import { useAuthStore } from '@/stores/auth-store'
import { api } from './api'
import type { User } from '@signage/types'

const TOKEN_KEY = 'signage_access_token'
const REFRESH_TOKEN_KEY = 'signage_refresh_token'
const ID_TOKEN_KEY = 'signage_id_token'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
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

export interface SignUpResult {
  success: boolean
  requiresConfirmation: boolean
  message: string
}

export async function signUp(name: string, email: string, password: string): Promise<SignUpResult> {
  try {
    const response = await api.auth.signup({ email, password, name })
    console.log('[SignUp] Backend response:', response)
    console.log('[SignUp] requires_confirmation:', response.requires_confirmation)
    console.log('[SignUp] requires_confirmation type:', typeof response.requires_confirmation)
    const result = {
      success: true,
      requiresConfirmation: Boolean(response.requires_confirmation),
      message: response.message,
    }
    console.log('[SignUp] Returning result:', result)
    return result
  } catch (error) {
    console.error('[SignUp] Error:', error)
    throw error
  }
}

export async function confirmSignUp(email: string, code: string, password: string): Promise<void> {
  const store = useAuthStore.getState()
  store.setLoading(true)

  try {
    const response = await api.auth.confirmSignup({ email, code, password })

    setTokens(response.access_token, response.refresh_token, response.id_token)

    const user: User = {
      cognito_sub: response.account_id,
      email,
      given_name: '',
      family_name: '',
    }

    store.setUser(user)

    await loadUserData()
  } catch (error) {
    store.setLoading(false)
    throw error
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  const store = useAuthStore.getState()
  store.setLoading(true)

  try {
    const response = await api.auth.login({ email, password })

    setTokens(response.access_token, response.refresh_token, response.id_token)

    const user: User = {
      cognito_sub: 'pending',
      email,
      given_name: '',
      family_name: '',
    }

    store.setUser(user)

    await loadUserData()
  } catch (error) {
    store.setLoading(false)
    throw error
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await api.auth.refresh(refreshToken)
    setTokens(response.access_token, response.refresh_token, response.id_token)
    return true
  } catch (error) {
    console.error('Failed to refresh token:', error)
    clearTokens()
    useAuthStore.getState().signOut()
    return false
  }
}

export async function signOut(): Promise<void> {
  clearTokens()
  useAuthStore.getState().signOut()
}

export async function loadUserData(): Promise<void> {
  const store = useAuthStore.getState()
  const token = getAccessToken()

  if (!token) {
    store.setLoading(false)
    return
  }

  store.setLoading(true)

  try {
    const userInfo = await api.auth.getMe()

    const nameParts = userInfo.name ? userInfo.name.split(' ') : []
    const user: User = {
      cognito_sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      given_name: nameParts[0] || '',
      family_name: nameParts.slice(1).join(' ') || '',
    }

    store.setUser(user)

    if (userInfo.account_id) {
      const account = await api.auth.getAccount()
      store.setAccount(account)
    }

    const workspaces = await api.auth.getWorkspaces()
    store.setWorkspaces(workspaces)

    const currentWorkspace = store.workspace
    if (!currentWorkspace && workspaces.length > 0) {
      store.setWorkspace(workspaces[0])
    }
  } catch (error) {
    console.error('Failed to load user data:', error)
    clearTokens()
    store.signOut()
  } finally {
    store.setLoading(false)
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await api.auth.forgotPassword(email)
}

export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  await api.auth.confirmForgotPassword(email, code, newPassword)
}

export async function resendConfirmationCode(email: string): Promise<void> {
  await api.auth.resendCode(email)
}
