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
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border transition-all duration-300 ease-in-out',
        'bg-sidebar-bg',
        'md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        actualExpanded ? 'w-[240px]' : 'md:w-[56px] w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4 transition-all border-b border-sidebar-border">
        <Link href="/home" className="flex items-center gap-3 overflow-hidden flex-1" onClick={closeMobile}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
            <span className="text-base font-bold text-white">S</span>
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
                <p className="text-base font-bold text-sidebar-text-active leading-none whitespace-nowrap">Studio</p>
                <p className="text-xs whitespace-nowrap mt-0.5 text-sidebar-text">{planLabel}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={closeMobile}
          className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg ml-1 flex-shrink-0 text-sidebar-text"
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
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative',
                  isActive
                    ? 'bg-sidebar-accent/10 text-sidebar-text-active'
                    : 'text-sidebar-text hover:bg-sidebar-surface hover:text-white'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full bg-sidebar-accent" />
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
                  <span className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full leading-none bg-sidebar-accent text-white min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom nav + user profile */}
      <div className="px-2 pb-2 border-t border-sidebar-border">
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
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-accent/10 text-sidebar-text-active'
                      : 'text-sidebar-text hover:bg-sidebar-surface hover:text-white'
                  )}
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
          className="hidden md:flex w-full justify-center mb-3 h-8 rounded-lg text-sidebar-text"
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </Button>

        {/* User profile */}
        <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 border-t border-sidebar-border">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white bg-sidebar-accent">
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
                <p className="text-sm font-medium text-sidebar-text-active whitespace-nowrap truncate leading-none">
                  {userDisplayName}
                </p>
                <p className="text-xs whitespace-nowrap truncate mt-0.5 text-sidebar-text">
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
