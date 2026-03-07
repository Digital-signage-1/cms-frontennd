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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="relative min-h-screen flex bg-background">
      {/* Subtle grid pattern — full page */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Left Half — Branding (kept dark, decorative) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 xl:p-16 bg-slate-900">
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-on-primary font-bold text-base">S</span>
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
            <span className="text-primary">Beautifully</span>
            <br />
            Simple
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
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
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-xl p-5 bg-white/[0.03] border border-white/[0.06]">
            <p className="text-slate-400 text-sm leading-relaxed italic">
              &ldquo;SignageOS transformed how we manage 200+ screens. The setup is incredibly intuitive.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 bg-indigo-800">
                JM
              </div>
              <div>
                <div className="text-white text-sm font-medium">James Mitchell</div>
                <div className="text-slate-500 text-xs">Head of Operations, RetailCo</div>
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
            background: 'radial-gradient(circle, rgba(245,166,36,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Right Half — Form card ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10 bg-surface">
        <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-8 sm:p-10">
          {/* Logo – mobile only */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-on-primary font-bold text-sm">S</span>
            </div>
            <span className="text-text-primary font-semibold text-lg tracking-tight">SignageOS</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
