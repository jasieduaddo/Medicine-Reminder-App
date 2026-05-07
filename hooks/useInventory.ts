'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { getAllInventory, getInventory, upsertInventory, updateInventory } from '@/lib/db'
import type { Inventory } from '@/types'

export function useAllInventory() {
  const userId = useAuthStore((s) => s.userId)
  return useQuery({
    queryKey: ['inventory', userId],
    queryFn: () => getAllInventory(userId!),
    enabled: !!userId,
  })
}

export function useInventory(medicationId: string) {
  return useQuery({
    queryKey: ['inventory', medicationId],
    queryFn: () => getInventory(medicationId),
    enabled: !!medicationId,
  })
}

export function useUpsertInventory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>) =>
      upsertInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['medications'] })
    },
  })
}

export function useUpdateInventory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Inventory> & { id: string }) =>
      updateInventory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['medications'] })
    },
  })
}
