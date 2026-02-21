'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A0A0B] items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-[0.15]" />
        <div className="max-w-md text-white relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <span className="text-lg font-bold">S</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Studio</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Digital Signage Made Simple
          </h1>
          <p className="text-base text-white/60">
            Manage your screens, content, and players from anywhere. Create stunning displays that captivate your audience.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold font-mono tabular-nums">10K+</div>
              <div className="text-sm text-white/40">Active Screens</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tabular-nums">500+</div>
              <div className="text-sm text-white/40">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tabular-nums">99.9%</div>
              <div className="text-sm text-white/40">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
