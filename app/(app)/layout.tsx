'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import Sidebar from '@/components/sidebar'
import Link from 'next/link'

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/medications')) return 'Medications'
  if (pathname.startsWith('/inventory')) return 'Inventory'
  if (pathname.startsWith('/history')) return 'History'
  if (pathname.startsWith('/settings')) return 'Settings'
  if (pathname.startsWith('/admin')) return 'Admin'
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  return 'MediMind'
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()
  const { userFirstName, userLastName } = useAppStore()
  const isAdmin = useAuthStore((s) => s.isAdmin)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  const displayName =
    userFirstName || userLastName
      ? [userFirstName, userLastName].filter(Boolean).join(' ')
      : null

  const pageTitle = getPageTitle(pathname)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-green-600 text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 md:ml-64">
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              Menu
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
              {displayName && (
                <span className="text-sm text-gray-400">{displayName}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span>🔧</span>
                <span>Admin</span>
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
