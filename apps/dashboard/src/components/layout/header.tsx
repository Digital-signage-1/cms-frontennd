'use client'

import { Avatar, AvatarFallback, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Input } from '@/components/ui'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useAuthStore } from '@/stores/auth-store'
import { useTheme } from '@/contexts/theme-context'
import { Bell, ChevronDown, HelpCircle, LogOut, Search, Settings, User, Moon, Sun, Building2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface HeaderProps {
  breadcrumbItems?: BreadcrumbItem[]
}

export function Header({ breadcrumbItems }: HeaderProps) {
  const { user, account, workspace } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const [searchFocused, setSearchFocused] = useState(false)

  const userDisplayName = useMemo(() => {
    if (user?.given_name && user?.family_name) {
      return `${user.given_name} ${user.family_name}`
    }
    if (user?.name) return user.name
    if (account?.name) return account.name
    return 'User'
  }, [user, account])

  const userInitials = useMemo(() => {
    if (user?.given_name) {
      return `${user.given_name[0]}${user.family_name?.[0] || ''}`
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

  const workspaceName = useMemo(() => {
    return workspace?.name || 'Workspace'
  }, [workspace])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between glass-heavy border-b border-border/50 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {breadcrumbItems && breadcrumbItems.length > 0 ? (
          <Breadcrumb items={breadcrumbItems} className="min-w-0" />
        ) : (
          <motion.div
            animate={{ width: searchFocused ? '100%' : '280px' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative max-w-xl"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search anything..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="pl-10 h-10 bg-surface/50 border-border/50 focus:bg-surface focus:border-primary/30 transition-all rounded-xl"
            />
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
        >
          <Bell className="h-5 w-5" />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-surface"
          />
        </motion.button>

        <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 hover:bg-surface-alt/50 h-auto py-2 rounded-xl focus-visible:ring-0">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-white text-xs sm:text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-text-primary leading-none">{userDisplayName}</p>
                <p className="text-xs text-text-muted mt-1">{userRole}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-text-muted hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 glass-heavy border-border/50 rounded-xl">
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{userDisplayName}</p>
                  <p className="text-xs text-text-muted mt-0.5">{userRole}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50 my-2" />
            <Link href="/profile">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2">
                <User className="h-4 w-4 text-text-muted" />
                <span className="text-sm">Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2">
                <Settings className="h-4 w-4 text-text-muted" />
                <span className="text-sm">Settings</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/workspace">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2">
                <Building2 className="h-4 w-4 text-text-muted" />
                <span className="text-sm">{workspaceName}</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-border/50 my-2" />
            <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2">
              <HelpCircle className="h-4 w-4 text-text-muted" />
              <span className="text-sm">Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50 my-2" />
            <DropdownMenuItem
              className="gap-3 text-error focus:text-error cursor-pointer rounded-lg px-3 py-2"
              onClick={async () => {
                const { signOut } = await import('@/services/auth')
                await signOut()
                window.location.href = '/sign-in'
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
