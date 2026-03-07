'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp, confirmSignUp, resendConfirmationCode } from '@/services/auth'
import { getErrorMessage } from '@/lib/errors'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

type Step = 'signup' | 'confirm'

// ─── Shared sub-components ────────────────────────────────────────────────────

function DsInput({
  id,
  name,
  type,
  placeholder,
  required,
  autoComplete,
  maxLength,
  extraClass = '',
  rightSlot,
}: {
  id: string
  name: string
  type: string
  placeholder: string
  required?: boolean
  autoComplete?: string
  maxLength?: number
  extraClass?: string
  rightSlot?: React.ReactNode
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={`w-full h-12 rounded-lg text-sm text-text-primary placeholder:text-text-muted bg-input border border-input-border outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${extraClass}`}
      />
      {rightSlot}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resending, setResending] = useState(false)

  // ── Sign-up submit ──────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const name = fd.get('name') as string
    const emailVal = fd.get('email') as string
    const passwordVal = fd.get('password') as string
    const confirmPassword = fd.get('confirmPassword') as string

    if (passwordVal !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (passwordVal.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const result = await signUp(name, emailVal, passwordVal)
      setEmail(emailVal)
      setPassword(passwordVal)
      if (result.requiresConfirmation) {
        setMessage(result.message)
        setStep('confirm')
      } else {
        router.push('/home')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // ── Confirm submit ──────────────────────────────────────────────────────────
  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const code = fd.get('code') as string
    try {
      await confirmSignUp(email, code, password)
      router.push('/home')
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  // ── Resend code ─────────────────────────────────────────────────────────────
  const handleResendCode = async () => {
    setResending(true)
    setError('')
    try {
      await resendConfirmationCode(email)
      setMessage('A new verification code has been sent to your email.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setResending(false)
    }
  }

  // ── Verify email step ───────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back */}
        <button
          type="button"
          onClick={() => { setStep('signup'); setError(''); setMessage('') }}
          className="flex items-center gap-2 text-sm mb-6 text-text-muted transition-colors hover:text-text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign up
        </button>

        {/* Header */}
        <div className="mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Verify your email</h1>
          <p className="text-text-secondary mt-1.5 text-sm">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-text-primary">{email}</span>
          </p>
        </div>

        <form onSubmit={handleConfirm} className="space-y-5">
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Success */}
          {message && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4"
            >
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-emerald-600" />
              <p className="text-sm text-emerald-600">{message}</p>
            </motion.div>
          )}

          {/* OTP Input */}
          <div className="space-y-1.5">
            <label htmlFor="code" className="block text-sm font-medium text-text-primary">
              Verification code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              required
              autoComplete="one-time-code"
              maxLength={6}
              className="w-full h-14 rounded-lg text-2xl font-semibold text-text-primary text-center tracking-[0.5em] placeholder:text-text-muted placeholder:tracking-widest bg-input border border-input-border outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-center text-text-muted">
              Enter the 6-digit code from your email
            </p>
          </div>

          {/* Verify CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg font-semibold text-sm bg-primary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              'Verify email'
            )}
          </button>

          {/* Resend */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="text-sm font-medium text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {resending ? 'Sending...' : "Didn't receive a code? Resend"}
            </button>
          </div>
        </form>
      </motion.div>
    )
  }

  // ── Sign-up form ────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Create an account</h1>
        <p className="text-text-muted mt-1.5 text-sm">
          Start your 14-day free trial, no credit card required
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        {/* Error alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-text-primary">Full name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              autoComplete="name"
              className="w-full h-12 rounded-lg pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted bg-input border border-input-border outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-text-primary">Email</label>
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

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-text-primary">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full h-12 rounded-lg pl-10 pr-10 text-sm text-text-primary placeholder:text-text-muted bg-input border border-input-border outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-secondary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-text-muted">Must be at least 8 characters</p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full h-12 rounded-lg pl-10 pr-10 text-sm text-text-primary placeholder:text-text-muted bg-input border border-input-border outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-secondary"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg font-semibold text-sm bg-primary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60 mt-1"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Terms */}
      <p className="mt-4 text-center text-xs text-text-muted">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-primary transition-opacity hover:opacity-80">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-primary transition-opacity hover:opacity-80">
          Privacy Policy
        </Link>
      </p>

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-xs uppercase tracking-widest font-medium bg-surface text-text-muted">
            or
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 h-12 rounded-lg text-sm font-medium text-text-primary bg-surface border border-border transition-colors hover:bg-surface-hover"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 h-12 rounded-lg text-sm font-medium text-text-primary bg-surface border border-border transition-colors hover:bg-surface-hover"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          Apple
        </button>
      </div>

      {/* Footer */}
      <p className="mt-7 text-center text-sm text-text-muted">
        Already have an account?{' '}
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
