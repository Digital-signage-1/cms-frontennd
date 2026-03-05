'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from '@/services/auth'
import { getErrorMessage } from '@/lib/errors'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="text-[#6B7280] mt-1.5 text-sm">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-lg p-4"
            style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
            <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
          </motion.div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-white">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B7280' }} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="w-full h-12 rounded-lg pl-10 pr-4 text-sm text-white placeholder:text-[#6B7280] outline-none transition-colors focus:border-[#F5A624]"
              style={{
                backgroundColor: '#1C1C1C',
                border: '1px solid #2A2A2A',
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: '#F5A624' }}
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B7280' }} />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••"
              required
              autoComplete="current-password"
              className="w-full h-12 rounded-lg pl-10 pr-10 text-sm text-white placeholder:text-[#6B7280] outline-none transition-colors focus:ring-1"
              style={{
                backgroundColor: '#1C1C1C',
                border: '1px solid #2A2A2A',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
              style={{ color: '#6B7280' }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60 mt-1"
          style={{ backgroundColor: '#F5A624', color: '#000000' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: '#2A2A2A' }} />
        </div>
        <div className="relative flex justify-center">
          <span
            className="px-4 text-xs uppercase tracking-widest font-medium"
            style={{ backgroundColor: '#141414', color: '#6B7280' }}
          >
            or
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 h-12 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-80"
          style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
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
          className="flex items-center justify-center gap-2.5 h-12 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-80"
          style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          Apple
        </button>
      </div>

      {/* Sign Up Link */}
      <p className="mt-7 text-center text-sm" style={{ color: '#6B7280' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/sign-up"
          className="font-medium transition-colors hover:opacity-80"
          style={{ color: '#F5A624' }}
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  )
}
