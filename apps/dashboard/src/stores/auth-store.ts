import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Account, Workspace, AuthState } from '@signage/types'

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void
  setAccount: (account: Account | null) => void
  setWorkspace: (workspace: Workspace | null) => void
  setWorkspaces: (workspaces: Workspace[]) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      const initialState = {
        user: null,
        account: null,
        workspace: null,
        workspaces: [],
        isAuthenticated: false,
        isLoading: true, // true until persist rehydration completes
      }

      return {
        ...initialState,

        setUser: (user) =>
          set({ user, isAuthenticated: !!user }),

        setAccount: (account) =>
          set({ account }),

        setWorkspace: (workspace) =>
          set({ workspace }),

        setWorkspaces: (workspaces) =>
          set({ workspaces }),

        setLoading: (isLoading) =>
          set({ isLoading }),

        signOut: () =>
          set({
            user: null,
            account: null,
            workspace: null,
            workspaces: [],
            isAuthenticated: false,
            isLoading: false,
          }),
      }
    },
    {
      name: 'signage-auth',
      version: 2,
      migrate: (persisted: unknown) => {
        return persisted
      },
      partialize: (state) => ({
        user: state.user,
        account: state.account,
        workspace: state.workspace,
        workspaces: state.workspaces,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoading = false
      },
    }
  )
)
