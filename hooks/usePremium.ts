'use client'
import { useProfile } from '@/hooks/useProfile'

export function usePremium() {
  const { data: profile, isLoading } = useProfile()

  const isPremium = !!profile?.is_premium

  async function startCheckout(plan: 'monthly' | 'yearly') {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else throw new Error(data.error ?? 'Failed to start checkout')
  }

  async function openBillingPortal() {
    const res = await fetch('/api/stripe/create-portal-session', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else throw new Error(data.error ?? 'Failed to open portal')
  }

  return { isPremium, isLoading, startCheckout, openBillingPortal }
}
