'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'

// ─── Design tokens — Ocean Breeze Theme ──────────────────────────────────────
const DS = {
  inputBase: {
    backgroundColor: '#e0f2fe',
    border: '1px solid #bae6fd',
    color: '#0c4a6e',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
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

        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#0c4a6e' }}>
          Check your email
        </h1>
        <p className="text-sm mb-8" style={{ color: '#0369a1' }}>
          We&apos;ve sent a password reset link to your email address. It may take a few minutes to arrive.
        </p>

        <Link
          href="/sign-in"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: '#e0f2fe',
            border: '1px solid #bae6fd',
            color: '#0c4a6e',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7dd3fc' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd' }}
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
        style={{ color: '#0369a1' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0c4a6e' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#0369a1' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <div className="mb-7">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5"
          style={{ backgroundColor: 'rgba(14,165,233,0.08)' }}
        >
          <Mail className="h-7 w-7" style={{ color: '#0ea5e9' }} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#0c4a6e' }}>Reset password</h1>
        <p className="text-sm mt-1.5" style={{ color: '#0369a1' }}>
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
          <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#0c4a6e' }}>
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6b7280' }} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="w-full h-12 rounded-lg pl-10 pr-4 text-sm outline-none transition-all"
              style={DS.inputBase}
              onFocus={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.backgroundColor = '#FFFFFF' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#bae6fd'; e.currentTarget.style.backgroundColor = '#e0f2fe' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60 active:scale-[0.98]"
          style={DS.btnPrimary}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(14,165,233,0.35)' }}
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

      <p className="mt-7 text-center text-sm" style={{ color: '#0369a1' }}>
        Remember your password?{' '}
        <Link
          href="/sign-in"
          className="font-semibold transition-colors"
          style={{ color: '#0ea5e9' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0284c7' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#0ea5e9' }}
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
