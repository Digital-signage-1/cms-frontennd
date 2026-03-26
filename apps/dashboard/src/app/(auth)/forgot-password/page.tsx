'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'

const expo: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)

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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: expo }}
        style={{ textAlign: 'center' }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 52, height: 52, borderRadius: 12, marginBottom: 16,
          background: 'rgba(61,191,122,0.1)', border: '1px solid rgba(61,191,122,0.25)',
        }}>
          <CheckCircle2 style={{ width: 24, height: 24, color: 'var(--ok)' }} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--w1)', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Check your email
        </h1>
        <p style={{ fontSize: 13, color: 'var(--w2)', marginBottom: 24, lineHeight: 1.6 }}>
          We&apos;ve sent a password reset link to your email address. It may take a few minutes to arrive.
        </p>

        <Link
          href="/sign-in"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            height: 44, borderRadius: 8, fontSize: 13, fontWeight: 500,
            backgroundColor: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.055)',
            color: 'var(--w1)', textDecoration: 'none', transition: 'background 200ms',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.025)' }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to sign in
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: expo }}
    >
      <Link
        href="/sign-in"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--w3)', textDecoration: 'none', marginBottom: 24, transition: 'color 200ms' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--w2)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--w3)' }}
      >
        <ArrowLeft style={{ width: 14, height: 14 }} />
        Back to sign in
      </Link>

      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 48, height: 48, borderRadius: 10, marginBottom: 14,
          background: 'rgba(192,124,16,0.1)', border: '1px solid rgba(192,124,16,0.2)',
        }}>
          <Mail style={{ width: 22, height: 22, color: 'var(--gold)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line-s)' }} />
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            Account Recovery
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--line-s)' }} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--w1)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Reset password
        </h1>
        <p style={{ fontSize: 13, color: 'var(--w2)', lineHeight: 1.5 }}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '10px 12px', borderRadius: 8,
              backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)',
            }}
          >
            <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
          </motion.div>
        )}

        <div>
          <label htmlFor="email" style={{ fontSize: 12, fontWeight: 500, color: 'var(--w2)', display: 'block', marginBottom: 6 }}>Email</label>
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: focused ? 'var(--gold)' : 'var(--w3)', transition: 'color 200ms' }} />
            <input
              id="email" name="email" type="email" placeholder="you@company.com"
              required autoComplete="email"
              style={{
                width: '100%', height: 44, borderRadius: 8, paddingLeft: 38, paddingRight: 16,
                fontSize: 14, outline: 'none', transition: 'border-color 200ms, box-shadow 200ms',
                backgroundColor: 'rgba(255,255,255,0.025)',
                border: `1px solid ${focused ? 'var(--gold)' : 'var(--line)'}`,
                color: 'var(--w1)',
                boxShadow: focused ? '0 0 0 3px var(--gold-g)' : 'none',
                boxSizing: 'border-box',
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', height: 44, borderRadius: 8, fontWeight: 600, fontSize: 14,
            background: 'var(--gold)', color: '#0B0B0D', cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none', transition: 'background 200ms', opacity: loading ? 0.65 : 1,
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = 'var(--gold-h)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold)' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(11,11,13,0.3)', borderTopColor: '#0B0B0D', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              Sending...
            </span>
          ) : 'Send reset link'}
        </button>
      </form>

      <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--w3)' }}>
        Remember your password?{' '}
        <Link
          href="/sign-in"
          style={{ color: 'var(--gold-h)', fontWeight: 500, textDecoration: 'none' }}
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
