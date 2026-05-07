'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
<<<<<<< HEAD
import { useT } from '@/hooks/useT'
import OAuthButtons from '@/components/OAuthButtons'

export default function LoginPage() {
  const t = useT()
=======

export default function LoginPage() {
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
<<<<<<< HEAD
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
=======
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(message)
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6">
<<<<<<< HEAD
        <h1 className="text-2xl font-bold text-gray-900">{t.auth.welcomeBack}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.auth.signInSubtitle}</p>
=======
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            placeholder="••••••••"
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
          {loading ? t.auth.signingIn : t.auth.signIn}
=======
          {loading ? 'Signing in…' : 'Sign in'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
        </button>

        <p className="text-center">
          <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
<<<<<<< HEAD
            {t.auth.forgotPassword}
=======
            Forgot password?
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          </Link>
        </p>
      </form>

<<<<<<< HEAD
      <OAuthButtons />

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.auth.noAccount}{' '}
        <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
          {t.auth.signUp}
=======
      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
          Sign up
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
        </Link>
      </p>
    </>
  )
}
