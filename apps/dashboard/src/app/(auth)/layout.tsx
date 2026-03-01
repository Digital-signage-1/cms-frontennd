'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0D0D0D' }}>
        <div className="w-12 h-12 border-4 border-[#333] border-t-[#F5A624] rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div
      className="dark relative min-h-screen overflow-hidden"
      style={{
        backgroundColor: '#0D0D0D',
        '--color-primary': '#F5A624',
        '--color-primary-hover': '#E09410',
        '--color-background': '#141414',
        '--color-surface': '#1C1C1C',
        '--color-surface-alt': '#222222',
        '--color-surface-hover': '#2A2A2A',
        '--color-border': '#2A2A2A',
        '--color-border-subtle': '#222222',
        '--color-text-primary': '#FFFFFF',
        '--color-text-secondary': '#9CA3AF',
        '--color-text-muted': '#6B7280',
      } as React.CSSProperties}
    >
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Logo */}
      <div className="relative z-10 px-8 pt-6 pb-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#F5A624] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">SignageOS</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex min-h-[calc(100vh-120px)]">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-[58%] flex-col px-12 pt-12 pb-10">
          {/* Heading */}
          <div className="flex-1">
            <h1
              className="text-[3.6rem] leading-[1.12] font-light text-white mb-5"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Digital Signage,
              <br />
              <span style={{ color: '#F5A624' }}>Beautifully</span> Simple
            </h1>
            <p className="text-[#6B7280] text-base leading-relaxed max-w-xs">
              Manage screens, content, and players from
              <br />
              anywhere. Build displays that captivate.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-14 mt-10 mb-10">
            <div>
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-[10px] text-[#4B5563] uppercase tracking-widest mt-1">Active Screens</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-[10px] text-[#4B5563] uppercase tracking-widest mt-1">Companies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-[10px] text-[#4B5563] uppercase tracking-widest mt-1">Uptime</div>
            </div>
          </div>

          {/* Testimonial Card */}
          <div
            className="rounded-xl p-5 max-w-sm border"
            style={{ backgroundColor: '#161616', borderColor: '#252525' }}
          >
            <p className="text-[#C9CDD4] text-sm leading-relaxed">
              &ldquo;SignageOS transformed how we manage 200+ screens. The setup is incredibly intuitive.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-[#4C4C8A] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                JM
              </div>
              <div>
                <div className="text-white text-sm font-medium">James Mitchell</div>
                <div className="text-[#6B7280] text-xs">Head of Operations, RetailCo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel – Form */}
        <div className="flex w-full lg:w-[42%] items-center justify-center px-8 py-10">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 inset-x-0 z-20 flex items-center justify-center gap-12 py-4 border-t"
        style={{
          backgroundColor: 'rgba(13,13,13,0.92)',
          backdropFilter: 'blur(8px)',
          borderColor: '#1C1C1C',
        }}
      >
        <Link
          href="/player"
          className="text-sm transition-colors"
          style={{ color: '#6B7280' }}
        >
          Player Code
        </Link>
        <span className="text-sm font-medium border-b pb-0.5" style={{ color: '#F5A624', borderColor: '#F5A624' }}>
          Login
        </span>
        <Link
          href="/home"
          className="text-sm transition-colors"
          style={{ color: '#6B7280' }}
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
