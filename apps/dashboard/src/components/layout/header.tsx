'use client'

import { Avatar, AvatarFallback, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { Bell, HelpCircle, LogOut, Search, Settings, User, Building2, Menu } from 'lucide-react'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSidebar } from '@/contexts/sidebar-context'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface HeaderProps {
  breadcrumbItems?: BreadcrumbItem[]
}

export function Header({ breadcrumbItems }: HeaderProps) {
  const { user, account, workspace } = useAuthStore()
  const { openMobile } = useSidebar()
  const [searchFocused, setSearchFocused] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

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

  const userRole = useMemo(() => {
    if (!account?.plan) return 'Free Plan'
    return `${account.plan.charAt(0).toUpperCase() + account.plan.slice(1)} Plan`
  }, [account])

  const workspaceName = useMemo(() => workspace?.name || 'Workspace', [workspace])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-3 sm:px-6 bg-background border-b border-border">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Hamburger – mobile only */}
        <button
          onClick={openMobile}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0 touch-target text-text-secondary"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile search expand overlay */}
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-x-0 top-0 h-14 flex items-center px-3 z-10 sm:hidden bg-background border-b border-border"
          >
            <Search className="absolute left-7 h-3.5 w-3.5 pointer-events-none text-text-muted" />
            <input
              autoFocus
              placeholder="Search..."
              onBlur={() => setMobileSearchOpen(false)}
              className="w-full h-9 pl-9 pr-4 text-sm rounded-lg outline-none bg-input border border-primary text-text-primary"
            />
          </motion.div>
        )}

        {breadcrumbItems && breadcrumbItems.length > 0 ? (
          <Breadcrumb items={breadcrumbItems} className="min-w-0" />
        ) : (
          <span className="text-sm font-medium text-text-secondary">Dashboard</span>
        )}
      </div>

      {/* Right: search + bell + avatar */}
      <div className="flex items-center gap-1 sm:gap-3">

        {/* Search – desktop */}
        <motion.div
          animate={{ width: searchFocused ? '260px' : '180px' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative hidden sm:block"
        >
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-text-muted" />
          <input
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              'w-full h-9 pl-9 pr-10 text-sm rounded-lg outline-none bg-input border text-text-primary',
              searchFocused ? 'border-primary' : 'border-input-border'
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded text-text-muted bg-kbd font-[inherit]">
            ⌘K
          </kbd>
        </motion.div>

        {/* Search icon – mobile only */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden relative p-2 rounded-lg touch-target text-text-muted"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-colors touch-target text-text-muted hover:bg-surface-hover hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 bg-primary border-background" />
        </button>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none rounded-full">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="text-xs font-semibold text-white bg-[#4C4C8A]">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 p-2 rounded-xl bg-surface border border-border"
          >
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-semibold text-white bg-[#4C4C8A]">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{userDisplayName}</p>
                  <p className="text-xs mt-0.5 text-text-muted">{userRole}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 bg-border" />
            <Link href="/profile">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2 focus:bg-surface-hover">
                <User className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2 focus:bg-surface-hover">
                <Settings className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Settings</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/workspace">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2 focus:bg-surface-hover">
                <Building2 className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">{workspaceName}</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="my-2 bg-border" />
            <Link href="/help">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2 focus:bg-surface-hover">
                <HelpCircle className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Help & Support</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="my-2 bg-border" />
            <DropdownMenuItem
              className="gap-3 cursor-pointer rounded-lg px-3 py-2 focus:bg-surface-hover"
              onClick={async () => {
                const { signOut } = await import('@/services/auth')
                await signOut()
                window.location.href = '/sign-in'
              }}
            >
              <LogOut className="h-4 w-4 text-error" />
              <span className="text-sm font-medium text-error">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
