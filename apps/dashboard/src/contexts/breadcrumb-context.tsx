'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react'
import { useAutoBreadcrumb } from '@/hooks/useAutoBreadcrumb'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbContextType {
  breadcrumbItems: BreadcrumbItem[]
  setBreadcrumbItems: (items: BreadcrumbItem[]) => void
  clearBreadcrumbs: () => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [manualBreadcrumbs, setManualBreadcrumbs] = useState<BreadcrumbItem[] | null>(null)
  const autoBreadcrumbs = useAutoBreadcrumb()

  const breadcrumbItems = useMemo(() => {
    return manualBreadcrumbs ?? autoBreadcrumbs
  }, [manualBreadcrumbs, autoBreadcrumbs])

  const setBreadcrumbItems = useCallback((items: BreadcrumbItem[]) => {
    setManualBreadcrumbs(items)
  }, [])

  const clearBreadcrumbs = useCallback(() => {
    setManualBreadcrumbs(null)
  }, [])

  useEffect(() => {
    return () => {
      setManualBreadcrumbs(null)
    }
  }, [])

  const value = useMemo(() => ({
    breadcrumbItems,
    setBreadcrumbItems,
    clearBreadcrumbs
  }), [breadcrumbItems, setBreadcrumbItems, clearBreadcrumbs])

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext)
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}
