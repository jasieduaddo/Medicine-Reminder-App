'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/supabase'
import { useT } from '@/hooks/useT'

export default function ForgotPasswordPage() {
  const t = useT()
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t.auth.checkEmailReset}</h2>
        <p className="text-sm text-gray-500">{t.auth.checkEmailResetMsg(email)}</p>
        <p className="mt-4 text-sm text-gray-400">
          <Link href="/login" className="text-green-600 hover:underline">{t.auth.backToSignIn}</Link>
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.auth.resetPassword}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.auth.resetSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t.auth.email}
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
          {loading ? t.auth.sending : t.auth.sendResetLink}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.auth.rememberPassword}{' '}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
          {t.auth.signIn}
        </Link>
      </p>
    </>
  )
}
