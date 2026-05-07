'use client'

import { useState } from 'react'
import { usePremium } from '@/hooks/usePremium'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function PremiumGate({ children, fallback }: Props) {
  const { isPremium, isLoading } = usePremium()

  if (isLoading) return null
  if (isPremium) return <>{children}</>
  return <>{fallback ?? <UpgradePrompt inline />}</>
}

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const { startCheckout } = usePremium()
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleUpgrade(plan: 'monthly' | 'yearly') {
    setError(null)
    setLoading(plan)
    try {
      await startCheckout(plan)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="text-center mb-5">
          <p className="text-3xl mb-2">🔬</p>
          <h2 className="text-xl font-bold text-gray-900">Smart Refill Scanner</h2>
          <p className="text-sm text-gray-500 mt-1">
            Scan a pill bottle barcode to update your stock automatically. No manual counting needed.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4 text-center">
            {error}
          </p>
        )}

        <div className="space-y-3 mb-4">
          <button
            onClick={() => handleUpgrade('yearly')}
            disabled={!!loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors relative"
          >
            {loading === 'yearly' ? 'Redirecting…' : (
              <>
                <span>$9.99 / year</span>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Save 58%
                </span>
              </>
            )}
          </button>
          <button
            onClick={() => handleUpgrade('monthly')}
            disabled={!!loading}
            className="w-full border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-800 font-medium py-3 rounded-xl transition-colors"
          >
            {loading === 'monthly' ? 'Redirecting…' : '$1.99 / month'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mb-4">
          Cancel anytime. Secure payment via Stripe.
        </p>

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

interface UpgradePromptProps {
  inline?: boolean
}

export function UpgradePrompt({ inline }: UpgradePromptProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div
        className={`${inline ? '' : 'bg-white rounded-xl shadow-sm'} border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 text-center`}
      >
        <p className="text-2xl mb-2">🔬</p>
        <p className="font-semibold text-gray-900 text-sm mb-1">Smart Refill Scanner</p>
        <p className="text-xs text-gray-500 mb-3">
          Scan a pill bottle barcode to update stock instantly — a Premium feature.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Upgrade — from $1.99/mo
        </button>
      </div>

      <UpgradeModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
