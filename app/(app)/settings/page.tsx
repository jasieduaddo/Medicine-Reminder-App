'use client'
import { useEffect, useState } from 'react'
import { useProfile, useUpsertProfile } from '@/hooks/useProfile'
import { useT } from '@/hooks/useT'
import { useLocaleStore } from '@/stores/localeStore'
import { usePremium } from '@/hooks/usePremium'
import { UpgradeModal } from '@/components/PremiumGate'

export default function SettingsPage() {
  const t = useT()
  const { locale, setLocale } = useLocaleStore()
  const { data: profile, isLoading } = useProfile()
  const upsertProfile = useUpsertProfile()
  const { isPremium, openBillingPortal } = usePremium()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [whatsappApiKey, setWhatsappApiKey] = useState('')
  const [browserEnabled, setBrowserEnabled] = useState(true)
  const [whatsappEnabled, setWhatsappEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setWhatsappPhone(profile.whatsapp_phone ?? '')
      setWhatsappApiKey(profile.whatsapp_api_key ?? '')
      setBrowserEnabled(profile.browser_notifications_enabled ?? true)
      setWhatsappEnabled(profile.whatsapp_notifications_enabled ?? true)
    }
  }, [profile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    try {
      await upsertProfile.mutateAsync({
        whatsapp_phone: whatsappPhone.trim() || null,
        whatsapp_api_key: whatsappApiKey.trim() || null,
        browser_notifications_enabled: browserEnabled,
        whatsapp_notifications_enabled: whatsappEnabled,
      })
      setSuccess(true)
    } catch {
      setError(t.settings.saveError)
    }
  }

  if (isLoading) {
    return (
      <div className="pl-2 sm:pl-3">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="pl-2 sm:pl-3 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.settings.title}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-4">
          {t.settings.savedSuccess}
        </div>
      )}

      {/* Language card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-1">{t.settings.language}</h2>
        <p className="text-sm text-gray-500 mb-4">{t.settings.languageSubtitle}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setLocale('en')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              locale === 'en'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.settings.english}
          </button>
          <button
            onClick={() => setLocale('es')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              locale === 'es'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.settings.spanish}
          </button>
        </div>
      </div>

      {/* Subscription card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        {isPremium ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-semibold text-gray-900">Premium</span>
              <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Smart Refill Scanner and all premium features are enabled.</p>
            {portalError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{portalError}</p>
            )}
            <button
              onClick={async () => {
                setPortalError(null)
                setPortalLoading(true)
                try { await openBillingPortal() }
                catch (err: unknown) { setPortalError(err instanceof Error ? err.message : 'Something went wrong.') }
                finally { setPortalLoading(false) }
              }}
              disabled={portalLoading}
              className="w-full border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-800 font-medium py-2.5 rounded-xl text-sm transition-colors"
            >
              {portalLoading ? 'Redirecting…' : 'Manage Billing'}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Upgrade to Premium</h2>
            <p className="text-sm text-gray-500 mb-4">Unlock the Smart Refill Scanner — scan any pill bottle barcode to update your stock automatically.</p>
            <div className="space-y-2">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Upgrade — from $1.99/mo
              </button>
            </div>
          </>
        )}
      </div>

      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-sm p-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t.settings.whatsapp}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {t.settings.whatsappDesc}{' '}
            <a
              href="https://www.callmebot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline"
            >
              {t.settings.whatsappDescLink}
            </a>{' '}
            {t.settings.whatsappDescEnd}
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.settings.phone}
              </label>
              <input
                type="tel"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder={t.settings.phonePlaceholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">{t.settings.phoneHint}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.settings.apiKey}
              </label>
              <input
                type="password"
                value={whatsappApiKey}
                onChange={(e) => setWhatsappApiKey(e.target.value)}
                placeholder={t.settings.apiKeyPlaceholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t.settings.notificationPrefs}</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={browserEnabled}
                onChange={(e) => setBrowserEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{t.settings.appNotifications}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{t.settings.whatsappNotifications}</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={upsertProfile.isPending}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {upsertProfile.isPending ? t.settings.saving : t.settings.saveSettings}
        </button>
      </form>
    </div>
  )
}
