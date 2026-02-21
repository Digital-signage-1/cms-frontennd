'use client'

import { cn } from '@/lib/utils'
import { LayoutGrid, Monitor, Calendar, Settings, BarChart, ChevronLeft, Layers, Upload, Box } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import { useSidebar } from '@/contexts/sidebar-context'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/home', icon: LayoutGrid },
  { label: 'Content', href: '/content', icon: Upload },
  { label: 'Apps', href: '/apps', icon: Box },
  { label: 'Channels', href: '/channels', icon: Layers },
  { label: 'Players', href: '/players', icon: Monitor },
  { label: 'Schedules', href: '/schedules', icon: Calendar },
]

const BOTTOM_NAV_ITEMS = [
  { label: 'Analytics', href: '/analytics', icon: BarChart },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle, isExpanded, setIsExpanded } = useSidebar()
  const [isHovered, setIsHovered] = useState(false)
  
  const actualExpanded = collapsed ? isHovered : true

  return (
    <aside
      onMouseEnter={() => {
        setIsHovered(true)
        if (collapsed) setIsExpanded(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        if (collapsed) setIsExpanded(false)
      }}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-surface border-r border-border transition-all duration-300 ease-in-out',
        actualExpanded ? 'w-[220px]' : 'w-[52px]'
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-4 transition-all">
        <Link href="/home" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-text-primary text-background">
            <span className="text-sm font-bold tracking-tight">S</span>
          </div>
          <AnimatePresence>
            {actualExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-semibold text-text-primary tracking-tight whitespace-nowrap"
              >
                Studio
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 py-6 px-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!actualExpanded ? item.label : undefined}
            >
              <div
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-primary/8 text-primary'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full" />
                )}
                <Icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-text-muted group-hover:text-primary"
                )} />
                <AnimatePresence>
                  {actualExpanded && (
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
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!actualExpanded ? item.label : undefined}
            >
              <div
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface-hover text-text-primary'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                )}
              >
                <Icon className="h-5 w-5 shrink-0 text-text-muted group-hover:text-primary transition-colors" />
                <AnimatePresence>
                  {actualExpanded && (
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

        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="w-full justify-center mt-2 text-text-muted hover:text-text-primary h-9 rounded-md"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.div>
          </Button>
        </div>
      </div>
    </aside>
  )
}
