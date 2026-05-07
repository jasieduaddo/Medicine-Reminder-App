'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  getMedications,
  getMedication,
  createMedication,
  updateMedication,
  deleteMedication,
} from '@/lib/db'
import type { Medication } from '@/types'

export function useMedications() {
  const userId = useAuthStore((s) => s.userId)
  return useQuery({
    queryKey: ['medications', userId],
    queryFn: () => getMedications(userId!),
    enabled: !!userId,
  })
}

export function useMedication(id: string) {
  return useQuery({
    queryKey: ['medication', id],
    queryFn: () => getMedication(id),
    enabled: !!id,
  })
}

export function useCreateMedication() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)
  return useMutation({
    mutationFn: (data: Omit<Medication, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!userId) {
        throw new Error('Unable to create medication: user is not authenticated.')
      }
      return createMedication({ ...data, user_id: userId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', userId] })
      queryClient.invalidateQueries({ queryKey: ['todayDoses', userId] })
    },
  })
}

export function useUpdateMedication() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Medication> & { id: string }) =>
      updateMedication(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      queryClient.invalidateQueries({ queryKey: ['medication', vars.id] })
      queryClient.invalidateQueries({ queryKey: ['todayDoses', userId] })
    },
  })
}

export function useDeleteMedication() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)
  return useMutation({
    mutationFn: deleteMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      queryClient.invalidateQueries({ queryKey: ['todayDoses', userId] })
    },
  })
}
