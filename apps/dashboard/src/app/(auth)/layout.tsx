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
      className="dark relative min-h-screen flex"
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
      {/* Subtle grid pattern — full page */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Left Half — Branding (no card, transparent bg) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 xl:p-16">
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 bg-[#F5A624] rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-black font-bold text-base">S</span>
            </div>
            <span className="text-white font-semibold text-xl tracking-tight">SignageOS</span>
          </div>

          {/* Heading */}
          <h1
            className="text-[2.8rem] xl:text-[3.5rem] leading-[1.08] font-light text-white mb-6"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Digital Signage,
            <br />
            <span style={{ color: '#F5A624' }}>Beautifully</span>
            <br />
            Simple
          </h1>
          <p className="text-[#7A7F88] text-base leading-relaxed max-w-sm">
            Manage screens, content, and players from anywhere. Build displays that captivate.
          </p>

          {/* Stats row */}
          <div className="flex gap-10 mt-12 mb-12">
            {[
              { value: '10K+', label: 'Active Screens' },
              { value: '500+', label: 'Companies' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-[#6B7280] uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[#9CA3AF] text-sm leading-relaxed italic">
              &ldquo;SignageOS transformed how we manage 200+ screens. The setup is incredibly intuitive.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ backgroundColor: '#3B3B6D' }}>
                JM
              </div>
              <div>
                <div className="text-white text-sm font-medium">James Mitchell</div>
                <div className="text-[#6B7280] text-xs">Head of Operations, RetailCo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient glow behind left content */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,36,0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Right Half — Form card ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <div
          className="w-full max-w-[420px] rounded-2xl p-8 sm:p-10"
          style={{ backgroundColor: '#141414', border: '1px solid #1E1E1E' }}
        >
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
  )
}
