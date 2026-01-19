'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input, Label } from '@/components/ui'
import { signUp, confirmSignUp, resendConfirmationCode } from '@/services/auth'
import { getErrorMessage } from '@/lib/errors'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

type Step = 'signup' | 'confirm'

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

  console.log('[SignUpPage] Rendering with step:', step)

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const emailValue = formData.get('email') as string
    const passwordValue = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (passwordValue !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (passwordValue.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const result = await signUp(name, emailValue, passwordValue)
      console.log('[SignUpPage] Got result:', result)
      console.log('[SignUpPage] requiresConfirmation:', result.requiresConfirmation)
      setEmail(emailValue)
      setPassword(passwordValue)
      if (result.requiresConfirmation) {
        console.log('[SignUpPage] Transitioning to confirm step')
        setMessage(result.message)
        setStep('confirm')
        console.log('[SignUpPage] Step set to confirm')
        setTimeout(() => {
          console.log('[SignUpPage] Current step after timeout:', step)
        }, 100)
      } else {
        console.log('[SignUpPage] Redirecting to home')
        router.push('/home')
      }
    } catch (err) {
      console.error('[SignUpPage] Error:', err)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const code = formData.get('code') as string

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
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
      >
        <button
          type="button"
          onClick={() => {
            setStep('signup')
            setError('')
            setMessage('')
          }}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign up
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Verify your email</h1>
          <p className="text-text-secondary mt-2">
            We sent a 6-digit code to <span className="font-medium text-text-primary">{email}</span>
          </p>
        </div>

        <form onSubmit={handleConfirm} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3 rounded-lg bg-error/10 border border-error/20 p-4"
            >
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </motion.div>
          )}

          {message && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3 rounded-lg bg-success/10 border border-success/20 p-4"
            >
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-sm text-success">{message}</p>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium">
              Verification code
            </Label>
            <Input
              id="code"
              name="code"
              type="text"
              placeholder="000000"
              required
              autoComplete="one-time-code"
              maxLength={6}
              className="text-center text-2xl font-semibold tracking-[0.5em] h-14"
            />
            <p className="text-xs text-text-muted text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </div>
            ) : (
              'Verify email'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="text-sm text-primary hover:text-primary-hover disabled:opacity-50 transition-colors font-medium"
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Create an account</h1>
        <p className="text-text-secondary mt-2">Start your 14-day free trial, no credit card required</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-lg bg-error/10 border border-error/20 p-4"
          >
            <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </motion.div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full name
          </Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              autoComplete="name"
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Work email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="pl-10 pr-10 h-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-text-muted">Must be at least 8 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="pl-10 pr-10 h-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </div>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-text-muted">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-primary hover:text-primary-hover transition-colors">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-primary hover:text-primary-hover transition-colors">
          Privacy Policy
        </Link>
      </p>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-text-muted font-medium">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button" className="h-11">
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
        <Button variant="outline" type="button" className="h-11">
          <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          Apple
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-primary hover:text-primary-hover font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
