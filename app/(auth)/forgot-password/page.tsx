'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/supabase'
<<<<<<< HEAD
import { useT } from '@/hooks/useT'

export default function ForgotPasswordPage() {
  const t = useT()
=======

export default function ForgotPasswordPage() {
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-4">✉️</div>
<<<<<<< HEAD
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t.auth.checkEmailReset}</h2>
        <p className="text-sm text-gray-500">{t.auth.checkEmailResetMsg(email)}</p>
        <p className="mt-4 text-sm text-gray-400">
          <Link href="/login" className="text-green-600 hover:underline">{t.auth.backToSignIn}</Link>
=======
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
        </p>
        <p className="mt-4 text-sm text-gray-400">
          <Link href="/login" className="text-green-600 hover:underline">Back to sign in</Link>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
<<<<<<< HEAD
        <h1 className="text-2xl font-bold text-gray-900">{t.auth.resetPassword}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.auth.resetSubtitle}</p>
=======
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
            {t.auth.email}
=======
            Email
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            placeholder="you@example.com"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
        >
<<<<<<< HEAD
          {loading ? t.auth.sending : t.auth.sendResetLink}
=======
          {loading ? 'Sending…' : 'Send reset link'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
<<<<<<< HEAD
        {t.auth.rememberPassword}{' '}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
          {t.auth.signIn}
=======
        Remember your password?{' '}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
          Sign in
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
        </Link>
      </p>
    </>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
