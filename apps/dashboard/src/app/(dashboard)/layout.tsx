'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, Header } from '@/components/layout'
import { useAuthStore } from '@/stores/auth-store'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'
import { BreadcrumbProvider, useBreadcrumb } from '@/contexts/breadcrumb-context'
import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { useSocket } from '@/hooks/useSocket'

const SIDEBAR_WIDTH_COLLAPSED = 52
const SIDEBAR_WIDTH_EXPANDED = 220

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar()
  const { breadcrumbItems } = useBreadcrumb()
  useSocket()

  const sidebarWidth = isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

  return (
    <div className="min-h-screen bg-background">
      <CommandPalette />
      <Sidebar />
      <div
        className="transition-all duration-300"
        style={{ 
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100% - ${sidebarWidth}px)`
        }}
      >
        <Header breadcrumbItems={breadcrumbItems} />
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <ErrorBoundary>
      <BreadcrumbProvider>
        <SidebarProvider>
          <DashboardContent>{children}</DashboardContent>
        </SidebarProvider>
      </BreadcrumbProvider>
    </ErrorBoundary>
  )
}
