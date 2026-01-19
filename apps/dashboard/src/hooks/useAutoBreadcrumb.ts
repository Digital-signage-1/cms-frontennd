'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

const routeLabels: Record<string, string> = {
  'home': 'Dashboard',
  'apps': 'App Gallery',
  'create': 'Create App',
  'edit': 'Edit',
  'content': 'Content Library',
  'channels': 'Layout Studio',
  'schedules': 'Schedules',
  'analytics': 'Analytics',
  'players': 'Control Center',
  'settings': 'Settings',
  'profile': 'Profile',
  'workspace': 'Workspace',
  'sign-in': 'Sign In',
  'sign-up': 'Sign Up',
  'new': 'New Channel',
  'builder': 'Channel Builder',
  'templates': 'Templates',
  'zones': 'Zone Editor',
}

export function useAutoBreadcrumb(): BreadcrumbItem[] {
  const pathname = usePathname()

  return useMemo(() => {
    if (!pathname || pathname === '/' || pathname === '/home') {
      return [{ label: 'Dashboard', href: '/home' }]
    }

    const segments = pathname.split('/').filter(Boolean)
    
    if (segments.length === 0) {
      return [{ label: 'Dashboard', href: '/home' }]
    }

    const breadcrumbs: BreadcrumbItem[] = []
    let currentPath = ''

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
      
      if (isUUID) {
        breadcrumbs.push({
          label: 'Details',
          href: undefined
        })
        return
      }

      const isLast = index === segments.length - 1
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      })
    })

    return breadcrumbs
  }, [pathname])
}
