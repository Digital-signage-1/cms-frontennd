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
      className="dark relative min-h-screen flex items-center justify-center p-6"
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

      {/* Two-box layout */}
      <div className="relative z-10 w-full max-w-7xl flex items-stretch gap-6">

        {/* Left Box */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-10 rounded-2xl"
          style={{ backgroundColor: '#161616', border: '1px solid #2A2A2A' }}
        >
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 bg-[#F5A624] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">S</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">SignageOS</span>
            </div>

            {/* Heading */}
            <h1
              className="text-[3.2rem] leading-[1.12] font-light text-white mb-5"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Digital Signage,
              <br />
              <span style={{ color: '#F5A624' }}>Beautifully</span> Simple
            </h1>
            <p className="text-[#6B7280] text-base leading-relaxed">
              Manage screens, content, and players from
              <br />
              anywhere. Build displays that captivate.
            </p>

            {/* Stats */}
            <div className="flex gap-12 mt-10 mb-10">
              <div>
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-widest mt-1">Active Screens</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-widest mt-1">Companies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-widest mt-1">Uptime</div>
              </div>
            </div>

            {/* Testimonial Card */}
            <div
              className="rounded-xl p-5 border"
              style={{ backgroundColor: '#1C1C1C', borderColor: '#252525' }}
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
        </div>

        {/* Right Box – Form */}
        <div
          className="flex w-full lg:w-1/2 items-center justify-center p-10 rounded-2xl"
          style={{ backgroundColor: '#141414', border: '1px solid #2A2A2A' }}
        >
          <div className="w-full max-w-[380px]">
            {/* Logo – mobile only */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-9 h-9 bg-[#F5A624] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">S</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">SignageOS</span>
            </div>
            {children}
          </div>
        </div>

      </div>
    </div>
  )
}
