'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from '@/services/auth'
import { getErrorMessage } from '@/lib/errors'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'

const expo: [number, number, number, number] = [0.16, 1, 0.3, 1]

const inputBase: React.CSSProperties = {
  width: '100%', height: 44, borderRadius: 8, paddingLeft: 38, paddingRight: 16,
  fontSize: 14, outline: 'none', transition: 'border-color 200ms, box-shadow 200ms',
  backgroundColor: 'rgba(255,255,255,0.025)',
  border: '1px solid var(--line)',
  color: 'var(--w1)',
  boxSizing: 'border-box',
}

const btnSocial: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  height: 44, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  backgroundColor: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.055)',
  color: 'var(--w1)', transition: 'background 200ms, border-color 200ms',
}

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    try {
      await signIn(email, password)
      router.push('/home')
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  const fieldStyle = (field: string): React.CSSProperties => ({
    ...inputBase,
    borderColor: focused === field ? 'var(--gold)' : 'var(--line)',
    boxShadow: focused === field ? '0 0 0 3px var(--gold-g)' : 'none',
  })

  return (
    <div>
      {/* Card header */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: expo, delay: 0.34 }}
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line-s)' }} />
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            Secure Access
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--line-s)' }} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--w1)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13, color: 'var(--w2)' }}>Sign in to your account to continue</p>
      </motion.div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
              borderRadius: 8, backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)',
            }}
          >
            <AlertCircle style={{ width: 15, height: 15, color: '#f87171', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
          </motion.div>
        )}

        {/* Email */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: expo, delay: 0.46 }}
        >
          <label htmlFor="email" style={{ fontSize: 12, fontWeight: 500, color: 'var(--w2)', display: 'block', marginBottom: 6 }}>
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: focused === 'email' ? 'var(--gold)' : 'var(--w3)', transition: 'color 200ms' }} />
            <input
              id="email" name="email" type="email"
              placeholder="you@company.com" required autoComplete="email"
              style={fieldStyle('email')}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: expo, delay: 0.525 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label htmlFor="password" style={{ fontSize: 12, fontWeight: 500, color: 'var(--w2)' }}>
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{ fontSize: 12, color: 'var(--gold-h)', textDecoration: 'none', transition: 'opacity 200ms' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
            >
              Forgot?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: focused === 'password' ? 'var(--gold)' : 'var(--w3)', transition: 'color 200ms' }} />
            <input
              id="password" name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••" required autoComplete="current-password"
              style={{ ...fieldStyle('password'), paddingRight: 40 }}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w3)', padding: 0, display: 'flex' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--w2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--w3)' }}
            >
              {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
            </button>
          </div>
        </motion.div>

        {/* Sign in button */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: expo, delay: 0.60 }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 44, borderRadius: 8, fontWeight: 600, fontSize: 14,
              background: 'var(--gold)', color: '#0B0B0D', cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none', transition: 'background 200ms, box-shadow 200ms, transform 150ms',
              opacity: loading ? 0.65 : 1,
            }}
            onMouseEnter={e => { if (!loading) { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--gold-h)'; el.style.boxShadow = '0 4px 16px var(--gold-g), 0 2px 6px rgba(0,0,0,0.3)'; el.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--gold)'; el.style.boxShadow = 'none'; el.style.transform = 'none' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(11,11,13,0.3)', borderTopColor: '#0B0B0D', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Signing in...
              </span>
            ) : 'Sign in'}
          </button>
        </motion.div>
      </form>

      {/* OR divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line-s)' }} />
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--w3)', textTransform: 'uppercase' }}>or</span>
        <div style={{ flex: 1, height: 1, background: 'var(--line-s)' }} />
      </div>

      {/* Social buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button type="button" style={btnSocial}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'rgba(255,255,255,0.025)'; el.style.borderColor = 'rgba(255,255,255,0.055)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
        <button type="button" style={btnSocial}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'rgba(255,255,255,0.025)'; el.style.borderColor = 'rgba(255,255,255,0.055)' }}
        >
          <svg width="16" height="16" fill="var(--w1)" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          Apple
        </button>
      </div>

      {/* Sign up link */}
      <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--w3)' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/sign-up"
          style={{ color: 'var(--gold-h)', fontWeight: 500, textDecoration: 'none', transition: 'opacity 200ms' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        >
          Sign up free
        </Link>
      </p>
    </div>
  )
}
