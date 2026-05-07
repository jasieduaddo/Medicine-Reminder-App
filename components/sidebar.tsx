'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useT } from '@/hooks/useT'
import { useLocaleStore } from '@/stores/localeStore'
import { usePremium } from '@/hooks/usePremium'
import { UpgradeModal } from '@/components/PremiumGate'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const t = useT()
  const { locale, setLocale } = useLocaleStore()
  const { isPremium } = usePremium()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const navItems = [
    { label: t.nav.dashboard,   href: '/dashboard',   icon: '🏠' },
    { label: t.nav.medications, href: '/medications',  icon: '💊' },
    { label: t.nav.inventory,   href: '/inventory',    icon: '📦' },
    { label: t.nav.history,     href: '/history',      icon: '📋' },
    { label: t.nav.settings,    href: '/settings',     icon: '⚙️' },
  ]

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 z-20 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:inset-auto md:h-dvh ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-2 md:block">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <span className="text-xl font-bold text-green-600">MediMind</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 md:hidden"
          >
            {t.nav.close}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-colors text-sm ${
                      isActive
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={onClose}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="px-4 py-3 border-t border-gray-100 space-y-2">
          {/* Premium / Upgrade */}
          {isPremium ? (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                ✓ {t.nav.premiumActive}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 transition-colors"
            >
              <span className="text-base leading-none">⭐</span>
              <span>{t.nav.upgradePremium}</span>
            </button>
          )}

          {/* Language toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => setLocale('en')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                locale === 'en'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('es')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                locale === 'es'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ES
            </button>
          </div>

          <button
            onClick={() => {
              logout()
              onClose?.()
            }}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-base leading-none">🚪</span>
            <span>{t.nav.logOut}</span>
          </button>
        </div>
      </aside>

      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  )
}
