'use client'

import { Avatar, AvatarFallback, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useAuthStore } from '@/stores/auth-store'
import { Bell, HelpCircle, LogOut, Search, Settings, User, Building2 } from 'lucide-react'
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
  const [searchFocused, setSearchFocused] = useState(false)

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
      className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 sm:px-6"
      style={{ backgroundColor: '#0D0D0D', borderBottom: '1px solid #1C1C1C' }}
    >
      {/* Left: page title or breadcrumb */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {breadcrumbItems && breadcrumbItems.length > 0 ? (
          <Breadcrumb items={breadcrumbItems} className="min-w-0" />
        ) : (
          <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Dashboard</span>
        )}
      </div>

      {/* Right: search + bell + avatar */}
      <div className="flex items-center gap-3">

        {/* Search */}
        <motion.div
          animate={{ width: searchFocused ? '260px' : '180px' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative hidden sm:block"
        >
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none"
            style={{ color: '#6B7280' }}
          />
          <input
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-9 pl-9 pr-10 text-sm rounded-lg outline-none"
            style={{
              backgroundColor: '#1C1C1C',
              border: `1px solid ${searchFocused ? '#F5A624' : '#2A2A2A'}`,
              color: '#FFFFFF',
            }}
          />
          <kbd
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded"
            style={{ color: '#6B7280', backgroundColor: '#2A2A2A', fontFamily: 'inherit' }}
          >
            ⌘K
          </kbd>
        </motion.div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1C1C1C'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280' }}
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2"
            style={{ backgroundColor: '#F5A624', borderColor: '#0D0D0D' }}
          />
        </button>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none rounded-full">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback
                  className="text-xs font-semibold text-white"
                  style={{ backgroundColor: '#4C4C8A' }}
                >
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 p-2 rounded-xl"
            style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
          >
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback
                    className="text-sm font-semibold text-white"
                    style={{ backgroundColor: '#4C4C8A' }}
                  >
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-white">{userDisplayName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{userRole}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ backgroundColor: '#2A2A2A' }} className="my-2" />
            <Link href="/profile">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2 focus:bg-surface-hover">
                <User className="h-4 w-4" style={{ color: '#6B7280' }} />
                <span className="text-sm text-white">Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2 focus:bg-surface-hover">
                <Settings className="h-4 w-4" style={{ color: '#6B7280' }} />
                <span className="text-sm text-white">Settings</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/workspace">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2 focus:bg-surface-hover">
                <Building2 className="h-4 w-4" style={{ color: '#6B7280' }} />
                <span className="text-sm text-white">{workspaceName}</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator style={{ backgroundColor: '#2A2A2A' }} className="my-2" />
            <Link href="/help">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg px-3 py-2 focus:bg-surface-hover">
                <HelpCircle className="h-4 w-4" style={{ color: '#6B7280' }} />
                <span className="text-sm text-white">Help & Support</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator style={{ backgroundColor: '#2A2A2A' }} className="my-2" />
            <DropdownMenuItem
              className="gap-3 cursor-pointer rounded-lg px-3 py-2 focus:bg-surface-hover"
              onClick={async () => {
                const { signOut } = await import('@/services/auth')
                await signOut()
                window.location.href = '/sign-in'
              }}
            >
              <LogOut className="h-4 w-4" style={{ color: '#DC2626' }} />
              <span className="text-sm font-medium" style={{ color: '#DC2626' }}>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
