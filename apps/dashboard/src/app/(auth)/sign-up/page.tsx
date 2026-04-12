'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp, confirmSignUp, resendConfirmationCode } from '@/services/auth'
import { getErrorMessage } from '@/lib/errors'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

const expo: [number, number, number, number] = [0.16, 1, 0.3, 1]

type Step = 'signup' | 'confirm'

const socialBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  height: 44, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  backgroundColor: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.055)',
  color: 'var(--w1)', transition: 'background 200ms, border-color 200ms',
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
  const [focused, setFocused] = useState<string | null>(null)

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

  const fieldStyle = (field: string, extraPaddingRight = false): React.CSSProperties => ({
    width: '100%', height: 44, borderRadius: 8,
    paddingLeft: 38, paddingRight: extraPaddingRight ? 40 : 16,
    fontSize: 14, outline: 'none', transition: 'border-color 200ms, box-shadow 200ms',
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderColor: focused === field ? 'var(--gold)' : 'var(--line)',
    border: `1px solid ${focused === field ? 'var(--gold)' : 'var(--line)'}`,
    color: 'var(--w1)',
    boxShadow: focused === field ? '0 0 0 3px var(--gold-g)' : 'none',
    boxSizing: 'border-box' as const,
  })

  const iconColor = (field: string) => focused === field ? 'var(--gold)' : 'var(--w3)'

  const goldBtn: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 8, fontWeight: 600, fontSize: 14,
    background: 'var(--gold)', color: '#0B0B0D', cursor: loading ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'background 200ms', opacity: loading ? 0.65 : 1,
  }

  const errorAlert = (
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
  )

  if (step === 'confirm') {
    return (
      <motion.div
        key="confirm"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: expo }}
      >
        <button
          type="button"
          onClick={() => { setStep('signup'); setError(''); setMessage('') }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--w3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20, transition: 'color 200ms' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--w2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--w3)' }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to sign up
        </button>

        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 10, marginBottom: 14,
            background: 'rgba(192,124,16,0.1)', border: '1px solid rgba(192,124,16,0.2)',
          }}>
            <Mail style={{ width: 22, height: 22, color: 'var(--gold)' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--w1)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Verify your email
          </h1>
          <p style={{ fontSize: 13, color: 'var(--w2)' }}>
            We sent a 6-digit code to{' '}
            <span style={{ color: 'var(--w1)', fontWeight: 500 }}>{email}</span>
          </p>
        </div>

        <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && errorAlert}

          {message && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                borderRadius: 8, backgroundColor: 'rgba(61,191,122,0.06)', border: '1px solid rgba(61,191,122,0.2)',
              }}
            >
              <CheckCircle2 style={{ width: 15, height: 15, color: 'var(--ok)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: 'var(--ok)' }}>{message}</p>
            </motion.div>
          )}

          <div>
            <label htmlFor="code" style={{ fontSize: 12, fontWeight: 500, color: 'var(--w2)', display: 'block', marginBottom: 6 }}>
              Verification code
            </label>
            <input
              id="code" name="code" type="text" inputMode="numeric"
              placeholder="000000" required autoComplete="one-time-code" maxLength={6}
              style={{
                width: '100%', height: 52, borderRadius: 8, fontSize: 22, fontWeight: 600,
                textAlign: 'center', letterSpacing: '0.4em', outline: 'none',
                transition: 'border-color 200ms, box-shadow 200ms',
                backgroundColor: 'rgba(255,255,255,0.025)',
                border: `1px solid ${focused === 'code' ? 'var(--gold)' : 'var(--line)'}`,
                color: 'var(--w1)',
                boxShadow: focused === 'code' ? '0 0 0 3px var(--gold-g)' : 'none',
                boxSizing: 'border-box',
              }}
              onFocus={() => setFocused('code')}
              onBlur={() => setFocused(null)}
            />
            <p style={{ fontSize: 11, textAlign: 'center', color: 'var(--w3)', marginTop: 6 }}>
              Enter the 6-digit code from your email
            </p>
          </div>

          <button type="submit" disabled={loading} style={goldBtn}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(11,11,13,0.3)', borderTopColor: '#0B0B0D', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Verifying...
              </span>
            ) : 'Verify email'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              style={{ fontSize: 13, color: 'var(--gold-h)', background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 200ms', opacity: resending ? 0.5 : 1 }}
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
      key="signup"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: expo }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line-s)' }} />
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            Create Account
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--line-s)' }} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--w1)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Join SignageOS
        </h1>
        <p style={{ fontSize: 13, color: 'var(--w2)' }}>Start your 14-day free trial</p>
      </div>

      <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && errorAlert}

        {/* Name */}
        <div>
          <label htmlFor="name" style={{ fontSize: 12, fontWeight: 500, color: 'var(--w2)', display: 'block', marginBottom: 6 }}>Full name</label>
          <div style={{ position: 'relative' }}>
            <UserIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: iconColor('name'), transition: 'color 200ms' }} />
            <input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name"
              style={fieldStyle('name')}
              onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" style={{ fontSize: 12, fontWeight: 500, color: 'var(--w2)', display: 'block', marginBottom: 6 }}>Email</label>
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: iconColor('email'), transition: 'color 200ms' }} />
            <input id="email" name="email" type="email" placeholder="you@company.com" required autoComplete="email"
              style={fieldStyle('email')}
              onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" style={{ fontSize: 12, fontWeight: 500, color: 'var(--w2)', display: 'block', marginBottom: 6 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: iconColor('password'), transition: 'color 200ms' }} />
            <input id="password" name="password" type={showPassword ? 'text' : 'password'}
              placeholder="••••••••" required autoComplete="new-password"
              style={fieldStyle('password', true)}
              onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w3)', padding: 0, display: 'flex' }}>
              {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--w3)', marginTop: 4 }}>Must be at least 8 characters</p>
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" style={{ fontSize: 12, fontWeight: 500, color: 'var(--w2)', display: 'block', marginBottom: 6 }}>Confirm password</label>
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: iconColor('confirmPassword'), transition: 'color 200ms' }} />
            <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••" required autoComplete="new-password"
              style={fieldStyle('confirmPassword', true)}
              onFocus={() => setFocused('confirmPassword')} onBlur={() => setFocused(null)}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w3)', padding: 0, display: 'flex' }}>
              {showConfirmPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          style={{ ...goldBtn, marginTop: 4 }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = 'var(--gold-h)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold)' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(11,11,13,0.3)', borderTopColor: '#0B0B0D', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              Creating account...
            </span>
          ) : 'Create account'}
        </button>
      </form>

      <p style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: 'var(--w3)' }}>
        By signing up, you agree to our{' '}
        <Link href="/terms" style={{ color: 'var(--gold-h)', textDecoration: 'none' }}>Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" style={{ color: 'var(--gold-h)', textDecoration: 'none' }}>Privacy Policy</Link>
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line-s)' }} />
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--w3)', textTransform: 'uppercase' }}>or</span>
        <div style={{ flex: 1, height: 1, background: 'var(--line-s)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button type="button" style={socialBtn}
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
        <button type="button" style={socialBtn}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'rgba(255,255,255,0.025)'; el.style.borderColor = 'rgba(255,255,255,0.055)' }}
        >
          <svg width="16" height="16" fill="var(--w1)" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          Apple
        </button>
      </div>

      <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--w3)' }}>
        Already have an account?{' '}
        <Link href="/sign-in" style={{ color: 'var(--gold-h)', fontWeight: 500, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
