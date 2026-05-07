'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSchedule, updateSchedule, deleteSchedule } from '@/lib/db'
import { useAuthStore } from '@/stores/authStore'
import type { Schedule } from '@/types'

export function useCreateSchedule() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)
  return useMutation({
    mutationFn: (data: Omit<Schedule, 'id' | 'created_at'>) => createSchedule(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['medication', vars.medication_id] })
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      queryClient.invalidateQueries({ queryKey: ['todayDoses', userId] })
    },
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Schedule> & { id: string }) => updateSchedule(id, data),
    onSuccess: (_, vars) => {
      if (vars.medication_id)
        queryClient.invalidateQueries({ queryKey: ['medication', vars.medication_id] })
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      queryClient.invalidateQueries({ queryKey: ['todayDoses', userId] })
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)
  return useMutation({
    mutationFn: ({ id }: { id: string; medicationId: string }) => deleteSchedule(id),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['medication', vars.medicationId] })
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      queryClient.invalidateQueries({ queryKey: ['todayDoses', userId] })
    },
  })
}
