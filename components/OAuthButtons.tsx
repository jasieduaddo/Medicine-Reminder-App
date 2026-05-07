'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useT } from '@/hooks/useT'

type OAuthProvider = 'google' | 'apple' | 'azure'

const providers: { id: OAuthProvider; label: string; icon: React.ReactNode }[] = [
  {
    id: 'google',
    label: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Apple',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
  {
    id: 'azure',
    label: 'Microsoft',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M11.4 24H0V12.6h11.4V24z" fill="#F25022"/>
        <path d="M24 24H12.6V12.6H24V24z" fill="#00A4EF"/>
        <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#7FBA00"/>
        <path d="M24 11.4H12.6V0H24v11.4z" fill="#FFB900"/>
      </svg>
    ),
  },
]

export default function OAuthButtons() {
  const t = useT()
  const { loginWithOAuth } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null)

  const handleOAuth = async (provider: OAuthProvider) => {
    setLoadingProvider(provider)
    try {
      await loginWithOAuth(provider)
    } catch {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-500">{t.auth.orContinueWith}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {providers.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleOAuth(id)}
            disabled={loadingProvider !== null}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {icon}
            {loadingProvider === id ? t.auth.signingIn : `${t.auth.continueWith} ${label}`}
          </button>
        ))}
      </div>
    </div>
  )
}
