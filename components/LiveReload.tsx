<<<<<<< HEAD
'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'

const QUERY_KEYS = ['medications', 'todayDoses', 'doseLogs', 'inventory', 'profile'] as const

function formatTimestamp(date: Date | null) {
  if (!date) return 'Never reloaded'
  return `Last reload ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

export default function LiveReload() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.userId)
  const [isReloading, setIsReloading] = useState(false)
  const [lastReloadAt, setLastReloadAt] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  async function handleReload() {
    setIsReloading(true)
    try {
      await Promise.all(
        QUERY_KEYS.map((key) =>
          queryClient.invalidateQueries({ queryKey: [key], refetchType: 'all' })
        )
      )
      setLastReloadAt(new Date())
    } finally {
      setIsReloading(false)
    }
  }

  useEffect(() => {
    if (!autoRefresh) return

    const timer = window.setInterval(() => {
      handleReload()
    }, 30000)

    return () => window.clearInterval(timer)
  }, [autoRefresh, userId])

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <button
        type="button"
        onClick={handleReload}
        disabled={isReloading}
        className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isReloading ? 'Reloading…' : 'Reload data'}
      </button>
      <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 shadow-sm">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(event) => setAutoRefresh(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        Auto-refresh
      </label>
      <span className="hidden sm:inline-block text-xs text-gray-500">
        {formatTimestamp(lastReloadAt)}
      </span>
    </div>
  )
}
=======
'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'

const QUERY_KEYS = ['medications', 'todayDoses', 'doseLogs', 'inventory', 'profile'] as const

function formatTimestamp(date: Date | null) {
  if (!date) return 'Never reloaded'
  return `Last reload ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

export default function LiveReload() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.userId)
  const [isReloading, setIsReloading] = useState(false)
  const [lastReloadAt, setLastReloadAt] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  async function handleReload() {
    setIsReloading(true)
    try {
      await Promise.all(
        QUERY_KEYS.map((key) =>
          queryClient.invalidateQueries({ queryKey: [key], refetchType: 'all' })
        )
      )
      setLastReloadAt(new Date())
    } finally {
      setIsReloading(false)
    }
  }

  useEffect(() => {
    if (!autoRefresh) return

    const timer = window.setInterval(() => {
      handleReload()
    }, 30000)

    return () => window.clearInterval(timer)
  }, [autoRefresh, userId])

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <button
        type="button"
        onClick={handleReload}
        disabled={isReloading}
        className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isReloading ? 'Reloading…' : 'Reload data'}
      </button>
      <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 shadow-sm">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(event) => setAutoRefresh(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        Auto-refresh
      </label>
      <span className="hidden sm:inline-block text-xs text-gray-500">
        {formatTimestamp(lastReloadAt)}
      </span>
    </div>
  )
}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
