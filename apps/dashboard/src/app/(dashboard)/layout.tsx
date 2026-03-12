'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, Header } from '@/components/layout'
import { useAuthStore } from '@/stores/auth-store'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'
import { BreadcrumbProvider, useBreadcrumb } from '@/contexts/breadcrumb-context'
import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { loadUserData } from '@/services/auth'

const SIDEBAR_WIDTH_COLLAPSED = 56
const SIDEBAR_WIDTH_EXPANDED = 240

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar()
  const { breadcrumbItems } = useBreadcrumb()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const sidebarWidth = isMobile ? 0 : (isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED)

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <CommandPalette />
      <Sidebar />
      <div
        className="flex flex-col flex-1 min-h-0 transition-all duration-300"
        style={{
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100% - ${sidebarWidth}px)`
        }}
      >
        <Header breadcrumbItems={breadcrumbItems} />
        <main className="flex-1 overflow-y-auto">
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
  const workspace = useAuthStore((state) => state.workspace)
  const workspaces = useAuthStore((state) => state.workspaces)
  const workspaceId = workspace?.id || (workspace as any)?.workspace_id || workspaces?.[0]?.id || (workspaces?.[0] as any)?.workspace_id || 0
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated && !workspaceId && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadUserData()
    }
    if (workspaceId) {
      hasLoadedRef.current = false
    }
  }, [isLoading, isAuthenticated, workspaceId])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#bae6fd] border-t-primary rounded-full animate-spin" />
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
