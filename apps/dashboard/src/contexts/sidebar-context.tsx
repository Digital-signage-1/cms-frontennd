'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  collapsed: boolean
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
  setCollapsed: (collapsed: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const toggle = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    if (!newCollapsed) {
      setIsExpanded(true)
    } else {
      setIsExpanded(false)
    }
  }

  return (
    <SidebarContext.Provider value={{ collapsed, isExpanded, setIsExpanded, setCollapsed, toggle }}>
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