import { createContext, useContext } from 'react'
import type { DeviceManager } from './core/DeviceManager'

export const DeviceManagerContext = createContext<DeviceManager | null>(null)

export function useDeviceManager(): DeviceManager {
  const ctx = useContext(DeviceManagerContext)
  if (!ctx) throw new Error('useDeviceManager must be used within DeviceManagerContext')
  return ctx
}
