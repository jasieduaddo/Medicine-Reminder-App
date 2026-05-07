'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
<<<<<<< HEAD
import { useT } from '@/hooks/useT'

export default function ResetPasswordPage() {
  const t = useT()
=======

export default function ResetPasswordPage() {
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
<<<<<<< HEAD
      setError(t.auth.minPassword)
      return
    }
    if (password !== confirmPassword) {
      setError(t.auth.passwordMatch)
=======
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-4">✅</div>
<<<<<<< HEAD
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t.auth.passwordUpdated}</h2>
        <p className="text-sm text-gray-500">{t.auth.passwordUpdatedMsg}</p>
=======
        <h2 className="text-xl font-bold text-gray-900 mb-2">Password updated</h2>
        <p className="text-sm text-gray-500">Your password has been changed. Redirecting to sign in…</p>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
<<<<<<< HEAD
        <h1 className="text-2xl font-bold text-gray-900">{t.auth.setNewPassword}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.auth.setNewPasswordSubtitle}</p>
=======
        <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
        <p className="mt-1 text-sm text-gray-500">Enter your new password below</p>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
            {t.auth.newPassword}
=======
            New password
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
<<<<<<< HEAD
            placeholder={t.auth.minPasswordPlaceholder}
=======
            placeholder="Min. 8 characters"
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
            {t.auth.confirmNewPassword}
=======
            Confirm new password
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
<<<<<<< HEAD
            placeholder={t.auth.reenterPlaceholder}
=======
            placeholder="Re-enter your password"
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
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
          {loading ? t.auth.updating : t.auth.updatePassword}
=======
          {loading ? 'Updating…' : 'Update password'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
<<<<<<< HEAD
          {t.auth.backToSignIn}
=======
          Back to sign in
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
