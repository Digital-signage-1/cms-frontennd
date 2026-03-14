'use client'

import { cn } from '@/lib/utils'
import { LayoutGrid, Monitor, Calendar, Settings, BarChart, ChevronLeft, Layers, Upload, Box, HelpCircle, X, Plug } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import { useSidebar } from '@/contexts/sidebar-context'
import { useAuthStore } from '@/stores/auth-store'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useRef } from 'react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/home', icon: LayoutGrid, badge: undefined },
  { label: 'Content', href: '/content', icon: Upload, badge: undefined },
  { label: 'Apps', href: '/apps', icon: Box, badge: undefined },
  { label: 'Integrations', href: '/integrations', icon: Plug, badge: undefined },
  { label: 'Channels', href: '/channels', icon: Layers, badge: undefined },
  { label: 'Players', href: '/players', icon: Monitor, badge: undefined },
  { label: 'Schedules', href: '/schedules', icon: Calendar, badge: undefined },
]

const BOTTOM_NAV_ITEMS = [
  { label: 'Analytics', href: '/analytics', icon: BarChart },
  { label: 'Help & Support', href: '/help', icon: HelpCircle },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle, setIsExpanded, mobileOpen, closeMobile } = useSidebar()
  const { user, account } = useAuthStore()
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const actualExpanded = collapsed ? isHovered : true

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setIsHovered(true)
    if (collapsed) setIsExpanded(true)
  }

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(false)
      if (collapsed) setIsExpanded(false)
    }, 150)
  }

  const userDisplayName = useMemo(() => {
    if (user?.given_name && user?.family_name) return `${user.given_name} ${user.family_name}`
    if (user?.name) return user.name
    if (account?.name) return account.name
    return 'User'
  }, [user, account])

  const userInitials = useMemo(() => {
    if (user?.given_name) {
      return `${user.given_name[0]}${user.family_name?.[0] || ''}`.toUpperCase()
    }
    if (user?.name) {
      const parts = user.name.split(' ')
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
    }
    if (account?.name) {
      const parts = account.name.split(' ')
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
    }
    return 'U'
  }, [user, account])

  const userEmail = useMemo(() => {
    return user?.email || ''
  }, [user])

  const planLabel = useMemo(() => {
    if (!account?.plan) return 'Free Plan'
    return `${account.plan.charAt(0).toUpperCase() + account.plan.slice(1)} Plan`
  }, [account])

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 md:hidden"
            style={{ backgroundColor: 'rgba(12,74,110,0.35)', backdropFilter: 'blur(4px)' }}
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r transition-all duration-300 ease-in-out',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          actualExpanded ? 'w-[240px]' : 'md:w-[56px] w-[240px]'
        )}
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#bae6fd',
          boxShadow: '1px 0 0 0 #bae6fd',
        }}
      >
        {/* Logo */}
        <div
          className="flex h-14 items-center px-4 transition-all"
          style={{ borderBottom: '1px solid #e0f2fe' }}
        >
          <Link href="/home" className="flex items-center gap-3 overflow-hidden flex-1" onClick={closeMobile}>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}
            >
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <AnimatePresence>
              {(actualExpanded || mobileOpen) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-base font-bold leading-none whitespace-nowrap" style={{ color: '#0c4a6e' }}>
                    Studio
                  </p>
                  <p className="text-xs whitespace-nowrap mt-0.5" style={{ color: '#6b7280' }}>
                    {planLabel}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg ml-1 flex-shrink-0 transition-colors"
            style={{ color: '#6b7280' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e0f2fe'; (e.currentTarget as HTMLElement).style.color = '#0284c7' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280' }}
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 space-y-0.5 py-4 px-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!actualExpanded && !mobileOpen ? item.label : undefined}
                onClick={closeMobile}
              >
                <div
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative cursor-pointer',
                  )}
                  style={{
                    backgroundColor: isActive ? 'rgba(14,165,233,0.08)' : 'transparent',
                    color: isActive ? '#0ea5e9' : '#0369a1',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#e0f2fe'
                      ;(e.currentTarget as HTMLElement).style.color = '#0c4a6e'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                      ;(e.currentTarget as HTMLElement).style.color = '#0369a1'
                    }
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full"
                      style={{ background: 'linear-gradient(to bottom, #0ea5e9, #06b6d4)' }}
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0 transition-colors" />
                  <AnimatePresence>
                    {(actualExpanded || mobileOpen) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap flex-1"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {(actualExpanded || mobileOpen) && item.badge !== undefined && (
                    <span
                      className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full leading-none text-white"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', minWidth: '18px', textAlign: 'center' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom nav + user profile */}
        <div className="px-2 pb-2" style={{ borderTop: '1px solid #e0f2fe' }}>
          <div className="space-y-0.5 py-3">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!actualExpanded && !mobileOpen ? item.label : undefined}
                  onClick={closeMobile}
                >
                  <div
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer"
                    style={{
                      backgroundColor: isActive ? 'rgba(14,165,233,0.08)' : 'transparent',
                      color: isActive ? '#0ea5e9' : '#0369a1',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '#e0f2fe'
                        ;(e.currentTarget as HTMLElement).style.color = '#0c4a6e'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                        ;(e.currentTarget as HTMLElement).style.color = '#0369a1'
                      }
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0 transition-colors" />
                    <AnimatePresence>
                      {(actualExpanded || mobileOpen) && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Collapse toggle - desktop only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="hidden md:flex w-full justify-center mb-3 h-8 rounded-lg transition-colors"
            style={{ color: '#6b7280' }}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </Button>

          {/* User profile */}
          <div
            className="flex items-center gap-3 rounded-lg px-2 py-2.5"
            style={{ borderTop: '1px solid #e0f2fe' }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}
            >
              {userInitials}
            </div>
            <AnimatePresence>
              {(actualExpanded || mobileOpen) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden min-w-0 flex-1"
                >
                  <p className="text-sm font-medium whitespace-nowrap truncate leading-none" style={{ color: '#0c4a6e' }}>
                    {userDisplayName}
                  </p>
                  <p className="text-xs whitespace-nowrap truncate mt-0.5" style={{ color: '#6b7280' }}>
                    {userEmail}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </>
  )
}
