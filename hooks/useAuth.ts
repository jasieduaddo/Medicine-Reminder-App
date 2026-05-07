'use client'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
<<<<<<< HEAD
import { signIn, signUp, signOut, signInWithOAuth, supabase } from '@/lib/supabase'
=======
import { signIn, signUp, signOut, supabase } from '@/lib/supabase'
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const { setUser, clearUser, setAdmin, userId, isAuthenticated, isLoading } = useAuthStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    const data = await signIn(email, password)
    if (data.user) {
      setUser(data.user.id, data.user.email ?? '')
      // Fetch admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      setAdmin(profile?.role === 'admin')
    }
    return data
  }

  const register = async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => {
    return signUp(email, password, metadata)
  }

<<<<<<< HEAD
  const loginWithOAuth = (provider: 'google' | 'apple' | 'azure') => signInWithOAuth(provider)

=======
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  const logout = async () => {
    await signOut()
    clearUser()
    queryClient.clear()
    router.push('/login')
  }

<<<<<<< HEAD
  return { login, register, logout, loginWithOAuth, userId, isAuthenticated, isLoading }
=======
  return { login, register, logout, userId, isAuthenticated, isLoading }
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
}
