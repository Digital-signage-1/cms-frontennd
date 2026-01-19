'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { loadUserData } from '@/services/auth'
import { ThemeProvider } from '@/contexts/theme-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    setLoading(false)
    
    if (isAuthenticated) {
      loadUserData().catch((error) => {
        console.error('Failed to load user data:', error)
        setLoading(false)
      })
    }
  }, [isAuthenticated, setLoading])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
