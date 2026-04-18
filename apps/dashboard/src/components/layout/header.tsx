'use client'

import { Avatar, AvatarFallback, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useAuthStore } from '@/stores/auth-store'
import { HelpCircle, LogOut, Search, Settings, User, Building2, Menu } from 'lucide-react'
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
    <header
      className="z-30 flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-surface px-3 sm:px-6"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <button
          onClick={openMobile}
          className="touch-target flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-x-0 top-0 z-10 flex h-14 items-center border-b border-border bg-surface px-3 sm:hidden"
          >
            <Search
              className="pointer-events-none absolute left-7 h-3.5 w-3.5 text-text-muted"
            />
            <input
              autoFocus
              placeholder="Search..."
              onBlur={() => setMobileSearchOpen(false)}
              className="h-9 w-full rounded-full border border-primary pl-9 pr-4 text-sm text-text-primary outline-none transition-all"
              style={{ backgroundColor: 'var(--color-search-field)' }}
            />
          </motion.div>
        )}

        {breadcrumbItems && breadcrumbItems.length > 0 ? (
          <Breadcrumb items={breadcrumbItems} className="min-w-0" />
        ) : (
          <span className="text-sm font-medium text-text-muted">Dashboard</span>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-3">

        <motion.div
          animate={{ width: searchFocused ? '260px' : '180px' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative hidden sm:block"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: searchFocused ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
          />
          <input
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="h-9 w-full rounded-full border pl-9 pr-10 text-sm text-text-primary outline-none transition-all"
            style={{
              backgroundColor: 'var(--color-search-field)',
              borderColor: searchFocused ? 'var(--color-primary)' : 'var(--color-border)',
              boxShadow: searchFocused ? '0 0 0 3px var(--color-primary-light)' : 'none',
            }}
          />
          <kbd
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs text-text-muted"
            style={{ backgroundColor: 'var(--color-surface-alt)', fontFamily: 'inherit' }}
          >
            ⌘K
          </kbd>
        </motion.div>


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full ring-2 ring-transparent transition-all hover:ring-border focus:outline-none">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 rounded-2xl border border-border bg-surface p-2"
            style={{ boxShadow: 'var(--shadow-elevated)' }}
          >
            <DropdownMenuLabel className="px-3 py-2 font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-sm font-semibold text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{userDisplayName}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{userRole}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 bg-border-subtle" />
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl px-3 py-2 focus:bg-surface-hover">
                <User className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl px-3 py-2 focus:bg-surface-hover">
                <Settings className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Settings</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/workspace">
              <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl px-3 py-2 focus:bg-surface-hover">
                <Building2 className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">{workspaceName}</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="my-2 bg-border-subtle" />
            <Link href="/help">
              <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl px-3 py-2 focus:bg-surface-hover">
                <HelpCircle className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-primary">Help & Support</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="my-2 bg-border-subtle" />
            <DropdownMenuItem
              className="cursor-pointer gap-3 rounded-xl px-3 py-2 focus:bg-[var(--color-error-light)]"
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
