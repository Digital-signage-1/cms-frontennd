'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp, confirmSignUp, resendConfirmationCode } from '@/services/auth'
import { getErrorMessage } from '@/lib/errors'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

// ─── Design tokens — Ocean Breeze Theme ──────────────────────────────────────
const DS = {
  inputBase: {
    backgroundColor: '#e0f2fe',
    border: '1px solid #bae6fd',
    color: '#0c4a6e',
  },
  inputFocus: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #0ea5e9',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    color: '#FFFFFF',
  },
  btnSocial: {
    backgroundColor: '#e0f2fe',
    border: '1px solid #bae6fd',
    color: '#0c4a6e',
  },
  errorAlert: {
    backgroundColor: 'rgba(220,38,38,0.06)',
    border: '1px solid rgba(220,38,38,0.16)',
  },
  successAlert: {
    backgroundColor: 'rgba(5,150,105,0.06)',
    border: '1px solid rgba(5,150,105,0.16)',
  },
} as const

type Step = 'signup' | 'confirm'

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
        className={`w-full h-12 rounded-lg text-sm outline-none transition-all ${extraClass}`}
        style={DS.inputBase}
        onFocus={e => Object.assign(e.currentTarget.style, DS.inputFocus)}
        onBlur={e => Object.assign(e.currentTarget.style, DS.inputBase)}
      />
      {rightSlot}
    </div>
  )
}

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

  if (step === 'confirm') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          type="button"
          onClick={() => { setStep('signup'); setError(''); setMessage('') }}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: '#0369a1' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0c4a6e' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#0369a1' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign up
        </button>

        <div className="mb-7">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5"
            style={{ backgroundColor: 'rgba(14,165,233,0.08)' }}
          >
            <Mail className="h-7 w-7" style={{ color: '#0ea5e9' }} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#0c4a6e' }}>Verify your email</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#0369a1' }}>
            We sent a 6-digit code to{' '}
            <span className="font-medium" style={{ color: '#0c4a6e' }}>{email}</span>
          </p>
        </div>

        <form onSubmit={handleConfirm} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3 rounded-xl p-4"
              style={DS.errorAlert}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
              <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
            </motion.div>
          )}

          {message && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3 rounded-xl p-4"
              style={DS.successAlert}
            >
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
              <p className="text-sm" style={{ color: '#059669' }}>{message}</p>
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="code" className="block text-sm font-medium" style={{ color: '#0c4a6e' }}>
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
              className="w-full h-14 rounded-lg text-2xl font-semibold text-center tracking-[0.5em] outline-none transition-all"
              style={DS.inputBase}
              onFocus={e => Object.assign(e.currentTarget.style, DS.inputFocus)}
              onBlur={e => Object.assign(e.currentTarget.style, DS.inputBase)}
            />
            <p className="text-xs text-center" style={{ color: '#6b7280' }}>
              Enter the 6-digit code from your email
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60 active:scale-[0.98]"
            style={DS.btnPrimary}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                Verifying...
              </span>
            ) : (
              'Verify email'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="text-sm font-medium transition-colors disabled:opacity-50"
              style={{ color: '#0ea5e9' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0284c7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#0ea5e9' }}
            >
              {resending ? 'Sending...' : "Didn't receive a code? Resend"}
            </button>
          </div>
        </form>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#0c4a6e' }}>Create an account</h1>
        <p className="mt-1.5 text-sm" style={{ color: '#0369a1' }}>
          Start your 14-day free trial, no credit card required
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-xl p-4"
            style={DS.errorAlert}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
            <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
          </motion.div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium" style={{ color: '#0c4a6e' }}>Full name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6b7280' }} />
            <DsInput id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" extraClass="pl-10 pr-4" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#0c4a6e' }}>Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10" style={{ color: '#6b7280' }} />
            <DsInput id="email" name="email" type="email" placeholder="you@company.com" required autoComplete="email" extraClass="pl-10 pr-4" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#0c4a6e' }}>Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10" style={{ color: '#6b7280' }} />
            <DsInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              extraClass="pl-10 pr-10"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors z-10"
                  style={{ color: '#6b7280' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0891B2' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>
          <p className="text-xs" style={{ color: '#6b7280' }}>Must be at least 8 characters</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: '#0c4a6e' }}>
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10" style={{ color: '#6b7280' }} />
            <DsInput
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              extraClass="pl-10 pr-10"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors z-10"
                  style={{ color: '#6b7280' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0891B2' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280' }}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60 mt-1 active:scale-[0.98]"
          style={DS.btnPrimary}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(14,165,233,0.35)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-xs" style={{ color: '#6b7280' }}>
        By signing up, you agree to our{' '}
        <Link href="/terms" className="transition-colors" style={{ color: '#0ea5e9' }}>
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="transition-colors" style={{ color: '#0ea5e9' }}>
          Privacy Policy
        </Link>
      </p>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: '#bae6fd' }} />
        </div>
        <div className="relative flex justify-center">
          <span
            className="px-4 text-xs uppercase tracking-widest font-medium"
            style={{ backgroundColor: '#FFFFFF', color: '#6b7280' }}
          >
            or
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 h-12 rounded-lg text-sm font-medium transition-all"
          style={DS.btnSocial}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7dd3fc' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd' }}
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
          className="flex items-center justify-center gap-2.5 h-12 rounded-lg text-sm font-medium transition-all"
          style={DS.btnSocial}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7dd3fc' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd' }}
        >
          <svg className="h-4 w-4" fill="#0c4a6e" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          Apple
        </button>
      </div>

      <p className="mt-7 text-center text-sm" style={{ color: '#0369a1' }}>
        Already have an account?{' '}
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
