'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'

// ─── Design tokens — Broadcast Cyan Theme ────────────────────────────────────
const DS = {
  inputBase: {
    backgroundColor: '#E8F4FB',
    border: '1px solid #BAE6FD',
    color: '#0C1A2E',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #0891B2, #0284C7)',
    color: '#FFFFFF',
  },
  errorAlert: {
    backgroundColor: 'rgba(220,38,38,0.06)',
    border: '1px solid rgba(220,38,38,0.16)',
  },
} as const

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitted(true)
    } catch {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6"
          style={{ backgroundColor: 'rgba(5,150,105,0.08)' }}
        >
          <CheckCircle2 className="h-8 w-8" style={{ color: '#059669' }} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#0C1A2E' }}>
          Check your email
        </h1>
        <p className="text-sm mb-8" style={{ color: '#334155' }}>
          We&apos;ve sent a password reset link to your email address. It may take a few minutes to arrive.
        </p>

        <Link
          href="/sign-in"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: '#E8F4FB',
            border: '1px solid #BAE6FD',
            color: '#1A1917',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#DBEAFE' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#E8F4FB' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-2 text-sm mb-7 transition-colors"
        style={{ color: '#334155' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1A1917' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#78716C' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <div className="mb-7">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5"
          style={{ backgroundColor: 'rgba(8,145,178,0.08)' }}
        >
          <Mail className="h-7 w-7" style={{ color: '#0891B2' }} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#0C1A2E' }}>Reset password</h1>
        <p className="text-sm mt-1.5" style={{ color: '#334155' }}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-xl p-4"
            style={DS.errorAlert}
          >
            <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
          </motion.div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#0C1A2E' }}>
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94A3B8' }} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="w-full h-12 rounded-lg pl-10 pr-4 text-sm outline-none transition-all"
              style={DS.inputBase}
              onFocus={e => { e.currentTarget.style.borderColor = '#0891B2'; e.currentTarget.style.backgroundColor = '#FFFFFF' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#BAE6FD'; e.currentTarget.style.backgroundColor = '#E8F4FB' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60 active:scale-[0.98]"
          style={DS.btnPrimary}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(8,145,178,0.35)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              Sending...
            </span>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm" style={{ color: '#334155' }}>
        Remember your password?{' '}
        <Link
          href="/sign-in"
          className="font-semibold transition-colors"
          style={{ color: '#0891B2' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0E7490' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#0891B2' }}
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
