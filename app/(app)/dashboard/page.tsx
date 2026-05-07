'use client'

<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTodayDoses, useTakeDose, useAutoLogMissedDoses } from '@/hooks/useDoseLogs'
import { useAllInventory } from '@/hooks/useInventory'
import { useProfile } from '@/hooks/useProfile'
import { usePremium } from '@/hooks/usePremium'
import { UpgradeModal } from '@/components/PremiumGate'
import { formatDate, formatTime, daysRemaining, isRunningLow, runOutDate } from '@/lib/utils'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { useT } from '@/hooks/useT'
import type { TodayDose } from '@/lib/db'

export default function DashboardPage() {
  const t = useT()
=======
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTodayDoses, useTakeDose, useAutoLogMissedDoses } from '@/hooks/useDoseLogs'
import { useAllInventory } from '@/hooks/useInventory'
import { useAuthStore } from '@/stores/authStore'
import { useProfile } from '@/hooks/useProfile'
import { formatDate, formatTime, daysRemaining, isRunningLow, runOutDate } from '@/lib/utils'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import type { TodayDose } from '@/lib/db'

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  const autoLogMissedDoses = useAutoLogMissedDoses()
  const { data: todayDoses, isLoading } = useTodayDoses()
  const { data: inventory } = useAllInventory()
  const { data: profile } = useProfile()
  const takeDose = useTakeDose()
<<<<<<< HEAD
  const notifiedDoseIds = useRef<string[]>([])
  const notifiedLowStockIds = useRef<string[]>([])
  const { isPremium } = usePremium()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
=======
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const notifiedDoseIds = useRef<string[]>([])
  const notifiedLowStockIds = useRef<string[]>([])
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  const [pendingAction, setPendingAction] = useState<{ dose: TodayDose; action: 'taken' | 'skipped' } | null>(null)
  const [actionNotes, setActionNotes] = useState('')

  useEffect(() => {
    autoLogMissedDoses.mutate()
  }, [])

  useEffect(() => {
<<<<<<< HEAD
    const tick = () => autoLogMissedDoses.mutate()
    const interval = setInterval(tick, 60 * 1000)
    const onVisible = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

=======
    if (typeof window === 'undefined' || !('Notification' in window)) return
    setNotificationPermission(Notification.permission)
  }, [])

  // Set up refresh timers for each medication (1 minute after scheduled time)
  useEffect(() => {
    if (!todayDoses) return

    const now = new Date()
    const timers: NodeJS.Timeout[] = []

    todayDoses.forEach((dose) => {
      const [hour, minute] = dose.schedule.time.split(':').map(Number)
      const scheduledTime = new Date(now)
      scheduledTime.setHours(hour, minute, 0, 0)
      
      // Calculate 1 minute after scheduled time
      const refreshTime = new Date(scheduledTime.getTime() + 60 * 1000)
      const delay = refreshTime.getTime() - now.getTime()
      
      if (delay > 0) {
        const timer = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['todayDoses', userId] })
        }, delay)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [todayDoses, queryClient, userId])

>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  const lowStockItems = useMemo(
    () => (inventory ?? []).filter((item) => {
      const dosesPerDay = item.medication.schedules.filter((s) => s.is_active).length
      const days = daysRemaining(item.current_stock, item.doses_per_intake, dosesPerDay)
      return isRunningLow(days, item.refill_alert_days)
    }),
    [inventory]
  )

  const upcomingReminders = useMemo(() => {
    const now = new Date()
    if (!todayDoses) return []
<<<<<<< HEAD
=======

>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
    return todayDoses.filter((dose) => {
      const status = dose.doseLog?.status
      if (status && status !== 'pending') return false
      const [hour, minute] = dose.schedule.time.split(':').map(Number)
      const scheduled = new Date(now)
      scheduled.setHours(hour, minute, 0, 0)
      const delta = scheduled.getTime() - now.getTime()
      return delta > 0 && delta <= 5 * 60 * 1000
    })
  }, [todayDoses])

  useEffect(() => {
<<<<<<< HEAD
=======
    if (notificationPermission !== 'granted') return

    const dosesToNotify = upcomingReminders.filter(
      (dose) => !notifiedDoseIds.current.includes(dose.id)
    )

    dosesToNotify.forEach((dose) => {
      const title = 'Medication reminder'
      const body = `Take ${dose.medication.name} at ${formatTime(dose.schedule.time)}.`
      new Notification(title, { body })
      notifiedDoseIds.current.push(dose.id)
    })
  }, [notificationPermission, upcomingReminders])

  useEffect(() => {
    if (notificationPermission !== 'granted') return

    const lowStockToNotify = lowStockItems.filter(
      (item) => !notifiedLowStockIds.current.includes(item.id)
    )

    lowStockToNotify.forEach((item) => {
      const title = 'Low stock alert'
      const body = `${item.medication.name} is low (${item.current_stock} left). Refill soon.`
      new Notification(title, { body })
      notifiedLowStockIds.current.push(item.id)
    })
  }, [notificationPermission, lowStockItems])

  // WhatsApp: upcoming dose reminder
  useEffect(() => {
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
    if (!profile?.whatsapp_notifications_enabled) return
    const phone = profile.whatsapp_phone
    const apiKey = profile.whatsapp_api_key
    if (!phone || !apiKey) return
<<<<<<< HEAD
    const dosesToNotify = upcomingReminders.filter(
      (dose) => !notifiedDoseIds.current.includes(dose.id)
    )
    dosesToNotify.forEach((dose) => {
      sendWhatsAppMessage(
        phone, apiKey,
=======

    const dosesToNotify = upcomingReminders.filter(
      (dose) => !notifiedDoseIds.current.includes(dose.id)
    )

    dosesToNotify.forEach((dose) => {
      sendWhatsAppMessage(
        phone,
        apiKey,
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
        `💊 Reminder: Take ${dose.medication.name} (${dose.medication.dosage} ${dose.medication.unit}) at ${formatTime(dose.schedule.time)}.`
      ).catch(() => {})
      notifiedDoseIds.current.push(dose.id)
    })
  }, [upcomingReminders, profile])

<<<<<<< HEAD
=======
  // WhatsApp: low stock alert
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  useEffect(() => {
    if (!profile?.whatsapp_notifications_enabled) return
    const phone = profile.whatsapp_phone
    const apiKey = profile.whatsapp_api_key
    if (!phone || !apiKey) return
<<<<<<< HEAD
    const lowStockToNotify = lowStockItems.filter(
      (item) => !notifiedLowStockIds.current.includes(item.id)
    )
    lowStockToNotify.forEach((item) => {
      sendWhatsAppMessage(
        phone, apiKey,
=======

    const lowStockToNotify = lowStockItems.filter(
      (item) => !notifiedLowStockIds.current.includes(item.id)
    )

    lowStockToNotify.forEach((item) => {
      sendWhatsAppMessage(
        phone,
        apiKey,
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
        `⚠️ Low stock alert: ${item.medication.name} is running low — refill within ${item.refill_alert_days} day(s). Please refill soon.`
      ).catch(() => {})
      notifiedLowStockIds.current.push(item.id)
    })
  }, [lowStockItems, profile])

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

<<<<<<< HEAD
  const totalCount = todayDoses?.length ?? 0
  const takenCount = todayDoses?.filter((d) => d.doseLog?.status === 'taken').length ?? 0
  const remainingCount = todayDoses?.filter(
    (d) => !d.doseLog || (d.doseLog.status !== 'taken' && d.doseLog.status !== 'skipped' && d.doseLog.status !== 'missed')
  ).length ?? 0
  const pendingDoses = todayDoses?.filter(
    (d) => d.doseLog?.status !== 'taken' && d.doseLog?.status !== 'skipped' && d.doseLog?.status !== 'missed'
  ) ?? []

=======
  const notificationSupported = typeof Notification !== 'undefined'
  const canRequestNotificationPermission = notificationSupported && notificationPermission === 'default'
  const notificationStatusMessage = notificationSupported
    ? notificationPermission === 'granted'
      ? 'Browser reminders are enabled.'
      : notificationPermission === 'denied'
      ? 'Browser reminders are blocked. Enable them in your browser settings.'
      : 'Enable browser reminders to get low-stock and dose alerts.'
    : 'Your browser does not support notifications.'

  const totalCount = todayDoses?.length ?? 0
  const takenCount = todayDoses?.filter((d) => d.doseLog?.status === 'taken').length ?? 0
  const remainingCount = todayDoses?.filter(
    (d) => !d.doseLog || (d.doseLog.status !== 'taken' && d.doseLog.status !== 'skipped')
  ).length ?? 0
  const pendingDoses = todayDoses?.filter(
    (d) => d.doseLog?.status !== 'taken' && d.doseLog?.status !== 'skipped'
  ) ?? []

  async function handleRequestNotificationPermission() {
    if (!notificationSupported) return
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
  }

>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  function handleOpenAction(dose: TodayDose, action: 'taken' | 'skipped') {
    setPendingAction({ dose, action })
    setActionNotes('')
  }

  async function handleConfirmAction() {
    if (!pendingAction) return
    const { dose, action } = pendingAction
<<<<<<< HEAD
    const t2 = dose.schedule.time.length === 5 ? dose.schedule.time + ':00' : dose.schedule.time
    const scheduledTime = todayStr + 'T' + t2
=======
    const t = dose.schedule.time.length === 5 ? dose.schedule.time + ':00' : dose.schedule.time
    const scheduledTime = todayStr + 'T' + t
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8

    await takeDose.mutateAsync({
      medicationId: dose.medication.id,
      scheduleId: dose.schedule.id,
      scheduledTime,
      status: action,
      notes: actionNotes.trim() || null,
    })

<<<<<<< HEAD
=======
    // WhatsApp low-stock alert only after actually taking the dose
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
    if (action === 'taken' && profile?.whatsapp_notifications_enabled && profile?.whatsapp_phone && profile?.whatsapp_api_key) {
      const inv = inventory?.find((i) => i.medication_id === dose.medication.id)
      if (inv) {
        const dosesPerDay = inv.medication.schedules.filter((s) => s.is_active).length
        const days = daysRemaining(inv.current_stock, inv.doses_per_intake, dosesPerDay)
        if (isRunningLow(days, inv.refill_alert_days)) {
          sendWhatsAppMessage(
            profile.whatsapp_phone,
            profile.whatsapp_api_key,
            `⚠️ Low stock after dose: ${dose.medication.name} has ~${days ?? inv.current_stock} ${days !== null ? 'days' : 'doses'} left. Refill recommended.`
          ).catch(() => {})
        }
      }
    }

    setPendingAction(null)
    setActionNotes('')
  }

  return (
    <div>
<<<<<<< HEAD
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>
=======
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
        <p className="text-gray-500 mt-1">{formatDate(today.toISOString())}</p>
      </div>

      <div className="mb-6 space-y-4">
<<<<<<< HEAD
        {lowStockItems.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-semibold mb-2">{t.dashboard.lowStockAlert}</div>
=======
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">{notificationStatusMessage}</p>
          {canRequestNotificationPermission && (
            <button
              type="button"
              onClick={handleRequestNotificationPermission}
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700"
            >
              Enable reminders
            </button>
          )}
        </div>

        {lowStockItems.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-semibold mb-2">Low stock alert</div>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
            <ul className="list-disc list-inside space-y-1">
              {lowStockItems.map((item) => {
                const dosesPerDay = item.medication.schedules.filter((s) => s.is_active).length
                const days = daysRemaining(item.current_stock, item.doses_per_intake, dosesPerDay)
                return (
<<<<<<< HEAD
                  <li key={item.id} className="flex items-center gap-2 flex-wrap">
                    <span>
                      <span className="font-semibold">{item.medication.name}</span>
                      {days !== null
                        ? ` — ~${days} day${days !== 1 ? 's' : ''} left (runs out ${runOutDate(days)})`
                        : ` — ${item.current_stock} doses left`}.
                    </span>
                    <button
                      onClick={() => {
                        if (!isPremium) { setShowUpgradeModal(true); return }
                        const pharmacy = item.medication.pharmacy_name
                        const query = pharmacy
                          ? `${pharmacy} ${item.medication.name} prescription refill`
                          : `${item.medication.name} prescription refill near me`
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
                      }}
                      className="inline-flex items-center bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
                    >
                      {t.inventory.buyRefill}
                    </button>
=======
                  <li key={item.id}>
                    <span className="font-semibold">{item.medication.name}</span>
                    {days !== null
                      ? ` — ~${days} day${days !== 1 ? 's' : ''} left (runs out ${runOutDate(days)})`
                      : ` — ${item.current_stock} doses left`}.
                    {' '}
                    <Link href="/inventory" className="underline hover:no-underline">Refill</Link>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {upcomingReminders.length > 0 && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
<<<<<<< HEAD
            <div className="font-semibold mb-2">{t.dashboard.upcomingDose}</div>
            <ul className="list-disc list-inside space-y-1">
              {upcomingReminders.map((dose) => (
                <li key={dose.id}>
                  <span className="font-semibold">{dose.medication.name}</span> {t.dashboard.at} {formatTime(dose.schedule.time)}.
=======
            <div className="font-semibold mb-2">Upcoming dose</div>
            <ul className="list-disc list-inside space-y-1">
              {upcomingReminders.map((dose) => (
                <li key={dose.id}>
                  <span className="font-semibold">{dose.medication.name}</span> at {formatTime(dose.schedule.time)}.
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
<<<<<<< HEAD
          <p className="text-sm text-gray-500 mb-1">{t.dashboard.totalToday}</p>
          <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">{t.dashboard.taken}</p>
          <p className="text-3xl font-bold text-green-600">{takenCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">{t.dashboard.remaining}</p>
=======
          <p className="text-sm text-gray-500 mb-1">Total Today</p>
          <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Taken</p>
          <p className="text-3xl font-bold text-green-600">{takenCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Remaining</p>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          <p className="text-3xl font-bold text-yellow-500">{remainingCount}</p>
        </div>
      </div>

      {/* Dose List */}
      <div>
<<<<<<< HEAD
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t.dashboard.todaySchedule}</h2>
=======
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Schedule</h2>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
<<<<<<< HEAD
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse flex justify-between items-center">
=======
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-4 animate-pulse flex justify-between items-center"
              >
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-9 bg-gray-200 rounded-lg w-20" />
              </div>
            ))}
          </div>
        ) : !todayDoses || todayDoses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">💊</p>
<<<<<<< HEAD
            <p className="text-gray-500 text-lg font-medium">{t.dashboard.noDoses}</p>
            <p className="text-gray-400 text-sm mt-1">{t.dashboard.noDosesMsg}</p>
=======
            <p className="text-gray-500 text-lg font-medium">No doses scheduled for today</p>
            <p className="text-gray-400 text-sm mt-1">
              Add medications and schedules to see your daily plan here.
            </p>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          </div>
        ) : pendingDoses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">✅</p>
<<<<<<< HEAD
            <p className="text-gray-500 text-lg font-medium">{t.dashboard.allDone}</p>
            <p className="text-gray-400 text-sm mt-1">{t.dashboard.allDoneMsg(takenCount)}</p>
=======
            <p className="text-gray-500 text-lg font-medium">All done for today!</p>
            <p className="text-gray-400 text-sm mt-1">
              You've taken all {takenCount} dose{takenCount !== 1 ? 's' : ''}. See you tomorrow.
            </p>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDoses.map((dose) => {
              const status = dose.doseLog?.status
              return (
<<<<<<< HEAD
                <div key={dose.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{dose.medication.name}</p>
                    <p className="text-sm text-gray-500">{dose.medication.dosage} {dose.medication.unit}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(dose.schedule.time)}</p>
                  </div>
=======
                <div
                  key={dose.id}
                  className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between"
                >
                  {/* Left: medication info */}
                  <div>
                    <p className="font-semibold text-gray-900">{dose.medication.name}</p>
                    <p className="text-sm text-gray-500">
                      {dose.medication.dosage} {dose.medication.unit}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatTime(dose.schedule.time)}
                    </p>
                  </div>

                  {/* Right: action / status badge */}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                  <div>
                    {!status ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenAction(dose, 'taken')}
                          disabled={takeDose.isPending}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        >
<<<<<<< HEAD
                          {t.dashboard.take}
=======
                          Take
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                        </button>
                        <button
                          onClick={() => handleOpenAction(dose, 'skipped')}
                          disabled={takeDose.isPending}
                          className="border border-yellow-300 text-yellow-700 hover:bg-yellow-50 disabled:opacity-60 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        >
<<<<<<< HEAD
                          {t.dashboard.skip}
=======
                          Skip
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                        </button>
                      </div>
                    ) : status === 'missed' ? (
                      <span className="inline-flex items-center bg-red-100 text-red-700 text-sm font-medium px-3 py-1.5 rounded-full">
<<<<<<< HEAD
                        {t.dashboard.missed}
                      </span>
                    ) : status === 'skipped' ? (
                      <span className="inline-flex items-center bg-yellow-100 text-yellow-700 text-sm font-medium px-3 py-1.5 rounded-full">
                        {t.dashboard.skipped}
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1.5 rounded-full">
                        {t.dashboard.pending}
=======
                        Missed
                      </span>
                    ) : status === 'skipped' ? (
                      <span className="inline-flex items-center bg-yellow-100 text-yellow-700 text-sm font-medium px-3 py-1.5 rounded-full">
                        Skipped
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1.5 rounded-full">
                        Pending
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

<<<<<<< HEAD
      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

      {/* Take / Skip modal */}
=======
      {/* ─── Take / Skip modal ─── */}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
      {pendingAction && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-0.5">
<<<<<<< HEAD
              {pendingAction.action === 'taken' ? t.dashboard.takeDose : t.dashboard.skipDose}
=======
              {pendingAction.action === 'taken' ? 'Take dose' : 'Skip dose'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {pendingAction.dose.medication.name} · {formatTime(pendingAction.dose.schedule.time)}
            </p>
<<<<<<< HEAD
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.common.notes} <span className="text-gray-400 font-normal">({t.common.optional})</span>
=======

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  pendingAction.action === 'taken'
<<<<<<< HEAD
                    ? t.dashboard.notesPlaceholderTaken
                    : t.dashboard.notesPlaceholderSkipped
=======
                    ? 'e.g. Took with food…'
                    : 'e.g. Felt nauseous, skipping this dose…'
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                }
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
<<<<<<< HEAD
=======

>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setPendingAction(null); setActionNotes('') }}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
<<<<<<< HEAD
                {t.common.cancel}
=======
                Cancel
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={takeDose.isPending}
                className={`flex-1 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 ${
                  pendingAction.action === 'taken'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
              >
                {takeDose.isPending
<<<<<<< HEAD
                  ? t.common.saving
                  : pendingAction.action === 'taken'
                  ? t.dashboard.confirmTake
                  : t.dashboard.confirmSkip}
=======
                  ? 'Saving…'
                  : pendingAction.action === 'taken'
                  ? 'Confirm Take'
                  : 'Confirm Skip'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
