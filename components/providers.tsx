'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60000,
            gcTime: 300000,
          },
        },
      })
  )

  const { setAuthenticated } = useAppStore()
  const { setUser, clearUser } = useAuthStore()

  useEffect(() => {
    // Initialize both stores from the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata as Record<string, unknown>
        setUser(session.user.id, session.user.email ?? '')
        setAuthenticated(
          true,
          session.user.id,
          (meta?.first_name as string) ?? null,
          (meta?.last_name as string) ?? null
        )
      } else {
        clearUser()
        setAuthenticated(false, null, null, null)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata as Record<string, unknown>
        setUser(session.user.id, session.user.email ?? '')
        setAuthenticated(
          true,
          session.user.id,
          (meta?.first_name as string) ?? null,
          (meta?.last_name as string) ?? null
        )
      } else {
        clearUser()
        setAuthenticated(false, null, null, null)
        queryClient.clear()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
