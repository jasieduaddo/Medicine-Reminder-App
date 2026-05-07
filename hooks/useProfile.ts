'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { getProfile, upsertProfile } from '@/lib/db'
import type { Profile } from '@/types'

export function useProfile() {
  const userId = useAuthStore((s) => s.userId)
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  })
}

export function useUpsertProfile() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)
  return useMutation({
    mutationFn: (updates: Partial<Profile>) => upsertProfile(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })
}