'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  collapsed: boolean
  isExpanded: boolean
  mobileOpen: boolean
  setIsExpanded: (expanded: boolean) => void
  setCollapsed: (collapsed: boolean) => void
  toggle: () => void
  openMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    if (!newCollapsed) {
      setIsExpanded(true)
    } else {
      setIsExpanded(false)
    }
  }

  const openMobile = () => setMobileOpen(true)
  const closeMobile = () => setMobileOpen(false)

  return (
    <SidebarContext.Provider value={{ collapsed, isExpanded, mobileOpen, setIsExpanded, setCollapsed, toggle, openMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}