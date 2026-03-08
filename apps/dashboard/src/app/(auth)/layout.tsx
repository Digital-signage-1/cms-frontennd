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
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F0F9FF' }}>
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{ border: '3px solid #BAE6FD', borderTopColor: '#0891B2' }}
        />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div
      className="relative min-h-screen flex"
      style={{ backgroundColor: '#F0F9FF' }}
    >
      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #7DD3FC 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.4,
        }}
      />

      {/* ── Left Half — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 xl:p-16">
        {/* Gradient wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(8,145,178,0.06) 0%, rgba(2,132,199,0.03) 50%, rgba(8,145,178,0.01) 100%)',
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-12">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0891B2, #0284C7)' }}
            >
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="font-semibold text-xl tracking-tight" style={{ color: '#0C1A2E' }}>
              SignageOS
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-[2.8rem] xl:text-[3.5rem] leading-[1.08] font-light mb-6"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#0C1A2E' }}
          >
            Digital Signage,
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #0891B2, #0284C7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Beautifully
            </span>
            <br />
            Simple
          </h1>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: '#334155' }}>
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
                <div className="text-2xl font-bold" style={{ color: '#0C1A2E' }}>
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: '#94A3B8' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial — glass card */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <p className="text-sm leading-relaxed italic" style={{ color: '#334155' }}>
              &ldquo;SignageOS transformed how we manage 200+ screens. The setup is incredibly intuitive.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0891B2, #0284C7)' }}
              >
                JM
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: '#0C1A2E' }}>James Mitchell</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>Head of Operations, RetailCo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative glow */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Right Half — Form card ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <div
          className="w-full max-w-[420px] rounded-2xl p-8 sm:p-10"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #BAE6FD',
            boxShadow: '0 8px 32px rgba(8,145,178,0.08), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Logo – mobile only */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0891B2, #0284C7)' }}
            >
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ color: '#0C1A2E' }}>
              SignageOS
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
