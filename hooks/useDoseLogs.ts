'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  getTodayDoses,
  getDoseLogs,
  createDoseLog,
  updateDoseLog,
  autoLogMissedDoses,
  getProfile,
  getInventory,
  updateInventory,
} from '@/lib/db'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { formatTime } from '@/lib/utils'

export function useTodayDoses() {
  const userId = useAuthStore((s) => s.userId)
  return useQuery({
    queryKey: ['todayDoses', userId],
    queryFn: () => getTodayDoses(userId!),
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}

export function useDoseLogs(options?: { limit?: number; offset?: number; date?: string; startDate?: string; endDate?: string }) {
  const userId = useAuthStore((s) => s.userId)
  return useQuery({
    queryKey: ['doseLogs', userId, options],
    queryFn: () => getDoseLogs(userId!, options),
    enabled: !!userId,
  })
}

export function useTakeDose() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)
  return useMutation({
    mutationFn: async ({
      medicationId,
      scheduleId,
      scheduledTime,
      status = 'taken',
      notes = null,
    }: {
      medicationId: string
      scheduleId: string
      scheduledTime: string
      status?: 'taken' | 'skipped'
      notes?: string | null
    }) => {
      const doseLog = await createDoseLog({
        medication_id: medicationId,
        schedule_id: scheduleId,
        user_id: userId!,
        scheduled_time: scheduledTime,
        taken_time: status === 'taken' ? new Date().toISOString() : null,
        status,
        notes,
      })

      // Only decrement inventory when the dose was actually taken
      if (status === 'taken') {
        try {
          const inventory = await getInventory(medicationId)
          if (inventory && inventory.current_stock > 0) {
            const newStock = Math.max(0, inventory.current_stock - inventory.doses_per_intake)
            await updateInventory(inventory.id, { current_stock: newStock })
          }
        } catch (error) {
          console.warn('Failed to update inventory after taking dose:', error)
        }
      }

      return doseLog
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayDoses', userId] })
      queryClient.invalidateQueries({ queryKey: ['doseLogs'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useAutoLogMissedDoses() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)
  return useMutation({
    mutationFn: async () => {
      if (!userId) return 0
      const count = await autoLogMissedDoses(userId)
      if (count > 0) {
        try {
          const profile = await getProfile(userId)
          if (
            profile?.whatsapp_notifications_enabled &&
            profile?.whatsapp_phone &&
            profile?.whatsapp_api_key
          ) {
            await sendWhatsAppMessage(
              profile.whatsapp_phone,
              profile.whatsapp_api_key,
              `⚠️ You missed ${count} medication dose${count > 1 ? 's' : ''} today. Check MediMind for details.`
            )
          }
        } catch {
          /* best-effort */
        }
      }
      return count
    },
    onSuccess: (count) => {
      if (count > 0) {
        queryClient.invalidateQueries({ queryKey: ['todayDoses', userId] })
        queryClient.invalidateQueries({ queryKey: ['doseLogs'] })
      }
    },
  })
}
