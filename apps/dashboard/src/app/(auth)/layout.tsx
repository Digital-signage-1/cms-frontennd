'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'

const expo: [number, number, number, number] = [0.16, 1, 0.3, 1]

const screens = [
  { hasLines: true },
  { hasLines: true },
  { hasLines: false },
  { hasLines: false },
  { hasLines: true },
  { hasLines: false },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
      <div className="auth-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(192,124,16,0.2)',
          borderTopColor: '#C07C10',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  if (isAuthenticated) return null

  return (
    <div className="auth-root" style={{
      fontFamily: 'var(--font-plus-jakarta, "Plus Jakarta Sans", sans-serif)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Film grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, opacity: 0.032,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '256px 256px',
      }} />

      {/* Vertical divider */}
      <div style={{
        position: 'fixed', top: 0, bottom: 0,
        left: 'calc(100vw - 480px)', width: '1px',
        background: 'rgba(0,0,0,0.15)', zIndex: 10,
      }} />

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', height: '100vh' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          padding: '32px 44px',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          overflow: 'hidden',
        }}>

          {/* Nav */}
          <motion.nav
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.65, ease: expo, delay: 0.04 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#0B0B0D', fontWeight: 700, fontSize: 14 }}>S</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--w1)', letterSpacing: '-0.01em' }}>
                SignageOS
              </span>
            </div>
            <a
              href="mailto:support@signageos.io"
              style={{ fontSize: 12, color: 'var(--w2)', textDecoration: 'none', transition: 'color 200ms' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--w1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--w2)' }}
            >
              Need help? Contact us
            </a>
          </motion.nav>

          {/* Hero */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 16, paddingBottom: 16 }}>

            {/* Eyebrow */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.65, ease: expo, delay: 0.16 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                Digital Signage Platform
              </span>
            </motion.div>

            {/* Headline lines */}
            <div style={{ marginBottom: 20 }}>
              {[
                { text: 'Manage every screen', delay: 0.26 },
                { text: 'from one place.', delay: 0.32, goldFrom: 10 },
                { text: 'At any scale.', delay: 0.38 },
              ].map(({ text, delay, goldFrom }, i) => (
                <div key={i} style={{ overflow: 'hidden' }}>
                  <motion.div
                    initial={{ y: '108%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.72, ease: expo, delay }}
                    style={{
                      fontSize: 'clamp(26px, 3.2vw, 44px)',
                      fontWeight: 300,
                      lineHeight: 1.12,
                      letterSpacing: '-0.03em',
                      color: 'var(--w1)',
                    }}
                  >
                    {goldFrom != null ? (
                      <>
                        {text.slice(0, goldFrom)}
                        <span style={{ color: 'var(--gold)' }}>{text.slice(goldFrom)}</span>
                      </>
                    ) : text}
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Subtext */}
            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.65, ease: expo, delay: 0.50 }}
              style={{ fontSize: 14, color: 'var(--w2)', maxWidth: 380, lineHeight: 1.6, marginBottom: 28 }}
            >
              Build, schedule, and push content to any display — from a single screen to thousands. Real-time sync, zero complexity.
            </motion.p>

            {/* Screen grid */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.65, ease: expo, delay: 0.60 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 540 }}>
                {screens.map((screen, i) => (
                  <div key={i} style={{
                    aspectRatio: '16/10', background: '#0D0D10',
                    border: '1px solid var(--line)', borderRadius: 6,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {screen.hasLines && (
                      <>
                        <div style={{ position: 'absolute', top: '28%', left: '10%', right: '30%', height: 2, background: 'linear-gradient(90deg, var(--gold), transparent)', opacity: 0.55 }} />
                        <div style={{ position: 'absolute', top: '52%', left: '10%', right: '50%', height: 1, background: 'linear-gradient(90deg, var(--gold), transparent)', opacity: 0.35 }} />
                      </>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />
                <span style={{ fontSize: 11, color: 'var(--w3)' }}>6 screens live · Last sync 2s ago</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom: stats + quote + status */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.65, ease: expo, delay: 0.70 }}
          >
            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginBottom: 20 }}>
              {[
                { value: '10K+', label: 'Active Screens' },
                { value: '500+', label: 'Companies' },
                { value: '99.9%', label: 'Uptime SLA' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--w1)', letterSpacing: '-0.02em' }}>{stat.value}</div>
                  <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--w3)', textTransform: 'uppercase', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.65, ease: expo, delay: 0.80 }}
              style={{ borderLeft: '2px solid var(--gold)', paddingLeft: 14, marginBottom: 16 }}
            >
              <p style={{ fontSize: 12, color: 'var(--w2)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 6 }}>
                &ldquo;SignageOS transformed how we manage 200+ screens. Setup is incredibly intuitive.&rdquo;
              </p>
              <span style={{ fontSize: 11, color: 'var(--w3)' }}>James Mitchell — Head of Operations, RetailCo</span>
            </motion.div>

            {/* Status dot */}
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.65, ease: expo, delay: 0.85 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', animation: 'blink 2.6s ease-in-out infinite' }} />
              <span style={{ fontSize: 11, color: 'var(--w3)' }}>All systems operational</span>
            </motion.div>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          background: '#c7c7c7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '28px 32px', position: 'relative',
        }}>
          {/* Gold ambient bloom */}
          <div style={{
            position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)',
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(192,124,16,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.80, ease: expo, delay: 0.20 }}
            >
              {/* Card with gold top accent */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -1, left: '18%', right: '18%', height: 1,
                  background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                  opacity: 0.6, zIndex: 1,
                }} />
                <div style={{
                  background: '#18181C',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  padding: '28px 28px',
                  position: 'relative',
                }}>
                  {children}
                </div>
              </div>
              <div style={{ textAlign: 'right', marginTop: 16, fontSize: 10, color: 'rgba(0,0,0,0.35)' }}>V4.2.1</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
