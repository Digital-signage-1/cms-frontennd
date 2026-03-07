'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'

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

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 bg-emerald-50">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">
          Check your email
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          We&apos;ve sent a password reset link to your email address. It may take a few minutes to arrive.
        </p>

        <Link
          href="/sign-in"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-lg text-sm font-medium text-text-primary bg-surface border border-border transition-colors hover:bg-surface-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </motion.div>
    )
  }

  // ── Request form ───────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back link */}
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-2 text-sm mb-7 text-text-muted transition-colors hover:text-text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      {/* Header */}
      <div className="mb-7">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Reset password</h1>
        <p className="text-sm mt-1.5 text-text-muted">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-text-primary">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="w-full h-12 rounded-lg pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted bg-input border border-input-border outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg font-semibold text-sm bg-primary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-7 text-center text-sm text-text-muted">
        Remember your password?{' '}
        <Link
          href="/sign-in"
          className="font-medium text-primary transition-opacity hover:opacity-80"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
