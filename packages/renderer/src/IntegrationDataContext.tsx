'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface IntegrationDataFetcher {
  startFetch(
    integrationId: string,
    resourceId: string,
    resourceType: string,
    refreshIntervalMs?: number,
    onData?: (data: Record<string, unknown>) => void,
  ): Promise<Record<string, unknown> | null>

  stopFetch(
    integrationId: string,
    resourceId: string,
    resourceType: string,
    onData?: (data: Record<string, unknown>) => void,
  ): void
}

const IntegrationDataContext = createContext<IntegrationDataFetcher | null>(null)

export function IntegrationDataProvider({
  value,
  children,
}: {
  value: IntegrationDataFetcher | null
  children: ReactNode
}) {
  return (
    <IntegrationDataContext.Provider value={value}>
      {children}
    </IntegrationDataContext.Provider>
  )
}

export function useIntegrationDataFetcher(): IntegrationDataFetcher | null {
  return useContext(IntegrationDataContext)
}
