'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
<<<<<<< HEAD
import { useT } from '@/hooks/useT'
import OAuthButtons from '@/components/OAuthButtons'

export default function RegisterPage() {
  const t = useT()
=======

export default function RegisterPage() {
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  const router = useRouter()
  const { register } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
      await register(email, password, { first_name: firstName, last_name: lastName })
      setSuccess(true)
<<<<<<< HEAD
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
=======
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(message)
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-4">✉️</div>
<<<<<<< HEAD
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t.auth.checkEmail}</h2>
        <p className="text-sm text-gray-500">{t.auth.checkEmailMsg(email)}</p>
        <p className="mt-4 text-xs text-gray-400">{t.auth.redirecting}</p>
=======
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Please
          verify your email address to continue.
        </p>
        <p className="mt-4 text-xs text-gray-400">Redirecting to sign in…</p>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
<<<<<<< HEAD
        <h1 className="text-2xl font-bold text-gray-900">{t.auth.createAccount}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.auth.createSubtitle}</p>
=======
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start managing your medications today
        </p>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
              {t.auth.firstName}
=======
              First name
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="Jane"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
              {t.auth.lastName}
=======
              Last name
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="Doe"
            />
          </div>
        </div>

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
            {t.auth.password}
=======
            Password
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
            {t.auth.confirmPassword}
=======
            Confirm password
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
          {loading ? t.auth.creating : t.auth.createAccount}
        </button>
      </form>

      <OAuthButtons />

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.auth.alreadyAccount}{' '}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
          {t.auth.signInLink}
=======
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
          Sign in
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
        </Link>
      </p>
    </>
  )
}
