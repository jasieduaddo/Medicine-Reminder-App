'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useMedication,
  useUpdateMedication,
<<<<<<< HEAD
  useMedications,
=======
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
} from '@/hooks/useMedications'
import {
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from '@/hooks/useSchedules'
import { useInventory, useUpsertInventory, useUpdateInventory } from '@/hooks/useInventory'
import { useAppStore } from '@/stores/appStore'
import { formatTime, formatDate, DAY_NAMES, daysRemaining, isRunningLow, runOutDate } from '@/lib/utils'
<<<<<<< HEAD
import PharmacyInput from '@/components/PharmacyInput'
import MedicineNameInput from '@/components/MedicineNameInput'
import { useT } from '@/hooks/useT'
import { usePremium } from '@/hooks/usePremium'
import { UpgradeModal } from '@/components/PremiumGate'
=======
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
import type { Schedule, Inventory } from '@/types'

// ─── Types ────────────────────────────────────────────────

interface MedFormData {
  name: string
  dosage: string
  unit: string
  instructions: string
  pharmacy_name: string
  pharmacy_phone: string
  prescribing_doctor: string
  prescription_number: string
}

interface ScheduleFormData {
  mode: 'specific' | 'interval'
  time: string
  startTime: string
  intervalHours: string
  days_of_week: number[]
  is_active: boolean
}

function generateIntervalTimes(startTime: string, intervalHours: number): string[] {
  const [h, m] = startTime.split(':').map(Number)
  const startMinutes = h * 60 + m
  const step = intervalHours * 60
  const times: string[] = []
  let cur = startMinutes
  while (cur < 24 * 60) {
    times.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`)
    cur += step
  }
  return times
}

interface InventoryFormData {
  current_stock: string
  doses_per_intake: string
  refill_alert_days: string
  last_refill_date: string
}

// ─── Page ─────────────────────────────────────────────────

export default function MedicationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const router = useRouter()
<<<<<<< HEAD
  const t = useT()
  const userId = useAppStore((s) => s.userId)

  const { data: medication, isLoading } = useMedication(id)
  const { data: allMedications } = useMedications()
=======
  const userId = useAppStore((s) => s.userId)

  const { data: medication, isLoading } = useMedication(id)
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  const { data: inventory } = useInventory(id)
  const updateMedication = useUpdateMedication()
  const createSchedule = useCreateSchedule()
  const updateSchedule = useUpdateSchedule()
  const deleteSchedule = useDeleteSchedule()
  const createInventory = useUpsertInventory()
  const updateInventory = useUpdateInventory()

<<<<<<< HEAD
  const { isPremium } = usePremium()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

=======
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  // Modal visibility
  const [showEditMedModal, setShowEditMedModal] = useState(false)
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)

  // Edit medication form
  const [medForm, setMedForm] = useState<MedFormData>({
    name: '',
    dosage: '',
    unit: '',
    instructions: '',
    pharmacy_name: '',
    pharmacy_phone: '',
    prescribing_doctor: '',
    prescription_number: '',
  })
  const [medFormError, setMedFormError] = useState<string | null>(null)

  // Add schedule form
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    mode: 'specific',
    time: '08:00',
    startTime: '08:00',
    intervalHours: '8',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    is_active: true,
  })
  const [scheduleFormError, setScheduleFormError] = useState<string | null>(null)

  // Inventory form
  const [invForm, setInvForm] = useState<InventoryFormData>({
    current_stock: '',
    doses_per_intake: '1',
    refill_alert_days: '3',
    last_refill_date: '',
  })
  const [invFormError, setInvFormError] = useState<string | null>(null)

  // ─── Handlers ────────────────────────────────────────────

  function openEditMedModal() {
    if (!medication) return
    setMedForm({
      name: medication.name,
      dosage: medication.dosage,
      unit: medication.unit,
      instructions: medication.instructions ?? '',
      pharmacy_name: medication.pharmacy_name ?? '',
      pharmacy_phone: medication.pharmacy_phone ?? '',
      prescribing_doctor: medication.prescribing_doctor ?? '',
      prescription_number: medication.prescription_number ?? '',
    })
    setMedFormError(null)
    setShowEditMedModal(true)
  }

  async function handleEditMedSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMedFormError(null)
    if (!medForm.name.trim() || !medForm.dosage.trim() || !medForm.unit.trim()) {
      setMedFormError('Name, Dosage, and Unit are required.')
      return
    }
    try {
      await updateMedication.mutateAsync({
        id,
        name: medForm.name.trim(),
        dosage: medForm.dosage.trim(),
        unit: medForm.unit.trim(),
        instructions: medForm.instructions.trim() || null,
        pharmacy_name: medForm.pharmacy_name.trim() || null,
        pharmacy_phone: medForm.pharmacy_phone.trim() || null,
        prescribing_doctor: medForm.prescribing_doctor.trim() || null,
        prescription_number: medForm.prescription_number.trim() || null,
      })
      setShowEditMedModal(false)
    } catch (err: unknown) {
      setMedFormError(err instanceof Error ? err.message : 'Failed to update medication.')
    }
  }

  function openAddScheduleModal() {
    setScheduleForm({
      mode: 'specific',
      time: '08:00',
      startTime: '08:00',
      intervalHours: '8',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      is_active: true,
    })
    setScheduleFormError(null)
    setShowAddScheduleModal(true)
  }

  function toggleDay(index: number) {
    setScheduleForm((prev) => {
      const days = prev.days_of_week.includes(index)
        ? prev.days_of_week.filter((d) => d !== index)
        : [...prev.days_of_week, index].sort((a, b) => a - b)
      return { ...prev, days_of_week: days }
    })
  }

  async function handleAddScheduleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setScheduleFormError(null)

    if (scheduleForm.days_of_week.length === 0) {
      setScheduleFormError('Select at least one day of the week.')
      return
    }

    if (scheduleForm.mode === 'interval') {
      const hours = parseInt(scheduleForm.intervalHours, 10)
      if (isNaN(hours) || hours < 1 || hours > 23) {
        setScheduleFormError('Interval must be between 1 and 23 hours.')
        return
      }
      const times = generateIntervalTimes(scheduleForm.startTime, hours)
      if (times.length === 0) {
        setScheduleFormError('No valid times generated. Try a different start time or interval.')
        return
      }
      try {
        for (const time of times) {
          await createSchedule.mutateAsync({
            medication_id: id,
            time,
            days_of_week: scheduleForm.days_of_week,
            is_active: scheduleForm.is_active,
          })
        }
        setShowAddScheduleModal(false)
      } catch (err: unknown) {
        setScheduleFormError(err instanceof Error ? err.message : 'Failed to add schedules.')
      }
      return
    }

    try {
      await createSchedule.mutateAsync({
        medication_id: id,
        time: scheduleForm.time,
        days_of_week: scheduleForm.days_of_week,
        is_active: scheduleForm.is_active,
      })
      setShowAddScheduleModal(false)
    } catch (err: unknown) {
      setScheduleFormError(err instanceof Error ? err.message : 'Failed to add schedule.')
    }
  }

  async function handleToggleScheduleActive(schedule: Schedule) {
    await updateSchedule.mutateAsync({
      id: schedule.id,
      medication_id: id,
      is_active: !schedule.is_active,
    })
  }

  async function handleDeleteSchedule(scheduleId: string) {
    await deleteSchedule.mutateAsync({ id: scheduleId, medicationId: id })
  }

  function openInventoryModal() {
    setInvForm({
      current_stock: inventory ? String(inventory.current_stock) : '',
      doses_per_intake: inventory ? String(inventory.doses_per_intake) : '1',
      refill_alert_days: inventory ? String(inventory.refill_alert_days) : '3',
      last_refill_date: inventory?.last_refill_date ?? '',
    })
    setInvFormError(null)
    setShowInventoryModal(true)
  }

  async function handleInventorySubmit(e: React.FormEvent) {
    e.preventDefault()
    setInvFormError(null)
    const currentStock = parseInt(invForm.current_stock, 10)
    const dosesPerIntake = parseInt(invForm.doses_per_intake, 10)
    const refillAlertDays = parseInt(invForm.refill_alert_days, 10)
    if (isNaN(currentStock) || isNaN(dosesPerIntake) || isNaN(refillAlertDays)) {
      setInvFormError('Stock, Doses per Intake, and Alert Days must be valid numbers.')
      return
    }
    try {
      if (inventory) {
        await updateInventory.mutateAsync({
          id: inventory.id,
          medication_id: id,
          current_stock: currentStock,
          doses_per_intake: dosesPerIntake,
          refill_alert_days: refillAlertDays,
          last_refill_date: invForm.last_refill_date || null,
        })
      } else {
        if (!userId) throw new Error('Not authenticated')
        await createInventory.mutateAsync({
          medication_id: id,
          user_id: userId!,
          current_stock: currentStock,
          doses_per_intake: dosesPerIntake,
          low_stock_threshold: 10,
          refill_alert_days: refillAlertDays,
          needs_refill: false,
          last_refill_date: invForm.last_refill_date || null,
        })
      }
      setShowInventoryModal(false)
    } catch (err: unknown) {
      setInvFormError(err instanceof Error ? err.message : 'Failed to save inventory.')
    }
  }

  // ─── Render ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div>
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-4 bg-gray-200 rounded w-64" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!medication) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Medication not found.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-green-600 hover:underline text-sm"
          >
            ← Go back
          </button>
        </div>
      </div>
    )
  }

  const activeDosesPerDay = medication?.schedules.filter((s) => s.is_active).length ?? 0
  const daysLeft = inventory
    ? daysRemaining(inventory.current_stock, inventory.doses_per_intake, activeDosesPerDay)
    : null
  const low = inventory ? isRunningLow(daysLeft, inventory.refill_alert_days) : false

  return (
    <div>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
          >
<<<<<<< HEAD
            {t.medications.back}
=======
            ← Back
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{medication.name}</h1>
          </div>
          <button
            onClick={openEditMedModal}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
<<<<<<< HEAD
            {t.common.edit}
=======
            Edit
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          </button>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
<<<<<<< HEAD
          <h2 className="font-semibold text-gray-800 mb-4">{t.medications.details}</h2>
          <dl className="space-y-3">
            <div className="flex gap-2">
              <dt className="text-sm text-gray-500 w-40 flex-shrink-0">{t.medications.dosageLabel}</dt>
=======
          <h2 className="font-semibold text-gray-800 mb-4">Medication Details</h2>
          <dl className="space-y-3">
            <div className="flex gap-2">
              <dt className="text-sm text-gray-500 w-40 flex-shrink-0">Dosage</dt>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              <dd className="text-sm text-gray-900 font-medium">
                {medication.dosage} {medication.unit}
              </dd>
            </div>
            {medication.instructions && (
              <div className="flex gap-2">
<<<<<<< HEAD
                <dt className="text-sm text-gray-500 w-40 flex-shrink-0">{t.medications.instructionsLabel}</dt>
=======
                <dt className="text-sm text-gray-500 w-40 flex-shrink-0">Instructions</dt>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                <dd className="text-sm text-gray-900">{medication.instructions}</dd>
              </div>
            )}
            {medication.pharmacy_name && (
              <div className="flex gap-2">
<<<<<<< HEAD
                <dt className="text-sm text-gray-500 w-40 flex-shrink-0">{t.medications.pharmacyLabel}</dt>
=======
                <dt className="text-sm text-gray-500 w-40 flex-shrink-0">Pharmacy</dt>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                <dd className="text-sm text-gray-900">{medication.pharmacy_name}</dd>
              </div>
            )}
            {medication.pharmacy_phone && (
              <div className="flex gap-2">
<<<<<<< HEAD
                <dt className="text-sm text-gray-500 w-40 flex-shrink-0">{t.medications.pharmacyPhoneLabel}</dt>
=======
                <dt className="text-sm text-gray-500 w-40 flex-shrink-0">Pharmacy Phone</dt>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                <dd className="text-sm text-gray-900">{medication.pharmacy_phone}</dd>
              </div>
            )}
            {medication.prescribing_doctor && (
              <div className="flex gap-2">
<<<<<<< HEAD
                <dt className="text-sm text-gray-500 w-40 flex-shrink-0">{t.medications.doctorLabel}</dt>
=======
                <dt className="text-sm text-gray-500 w-40 flex-shrink-0">Doctor</dt>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                <dd className="text-sm text-gray-900">{medication.prescribing_doctor}</dd>
              </div>
            )}
            {medication.prescription_number && (
              <div className="flex gap-2">
<<<<<<< HEAD
                <dt className="text-sm text-gray-500 w-40 flex-shrink-0">{t.medications.rxLabel}</dt>
=======
                <dt className="text-sm text-gray-500 w-40 flex-shrink-0">Rx Number</dt>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                <dd className="text-sm text-gray-900">{medication.prescription_number}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Schedules Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
<<<<<<< HEAD
            <h2 className="font-semibold text-gray-800">{t.medications.schedulesTitle}</h2>
=======
            <h2 className="font-semibold text-gray-800">Schedules</h2>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
            <button
              onClick={openAddScheduleModal}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
<<<<<<< HEAD
              {t.medications.addSchedule}
=======
              + Add Schedule
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
            </button>
          </div>

          {medication.schedules.length === 0 ? (
<<<<<<< HEAD
            <p className="text-sm text-gray-400">{t.medications.noSchedules}</p>
=======
            <p className="text-sm text-gray-400">No schedules set up yet.</p>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
          ) : (
            <div className="space-y-3">
              {medication.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(schedule.time)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {schedule.days_of_week.length === 7
<<<<<<< HEAD
                        ? t.medications.everyDay
=======
                        ? 'Every day'
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                        : schedule.days_of_week.map((d) => DAY_NAMES[d]).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Active toggle */}
                    <button
                      onClick={() => handleToggleScheduleActive(schedule)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        schedule.is_active ? 'bg-green-600' : 'bg-gray-300'
                      }`}
<<<<<<< HEAD
                      title={schedule.is_active ? t.medications.active : t.medications.inactive}
=======
                      title={schedule.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          schedule.is_active ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs text-gray-500 w-14">
<<<<<<< HEAD
                      {schedule.is_active ? t.medications.active : t.medications.inactive}
=======
                      {schedule.is_active ? 'Active' : 'Inactive'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                    </span>
                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                      title="Delete schedule"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
<<<<<<< HEAD
            <h2 className="font-semibold text-gray-800">{t.medications.inventoryTitle}</h2>
=======
            <h2 className="font-semibold text-gray-800">Inventory</h2>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
            {inventory && (
              <button
                onClick={openInventoryModal}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
<<<<<<< HEAD
                {t.common.edit}
=======
                Edit
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              </button>
            )}
          </div>

          {!inventory ? (
            <div>
<<<<<<< HEAD
              <p className="text-sm text-gray-400 mb-3">{t.medications.noInventoryMsg}</p>
=======
              <p className="text-sm text-gray-400 mb-3">No inventory tracking set up.</p>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              <button
                onClick={openInventoryModal}
                className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
<<<<<<< HEAD
                {t.medications.setUpInventory}
=======
                Set Up Inventory
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {low && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-2">
                  Refill soon —{' '}
                  {daysLeft !== null
                    ? `~${daysLeft} day${daysLeft !== 1 ? 's' : ''} left. Runs out ${runOutDate(daysLeft!)}.`
                    : `only ${inventory.current_stock} dose${inventory.current_stock !== 1 ? 's' : ''} remaining.`}
                </div>
              )}
<<<<<<< HEAD
              <div className="mb-3">
                <button
                  onClick={() => {
                    if (!isPremium) { setShowUpgradeModal(true); return }
                    const pharmacy = medication.pharmacy_name
                    const query = pharmacy
                      ? `${pharmacy} ${medication.name} prescription refill`
                      : `${medication.name} prescription refill near me`
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Buy Refill
                </button>
              </div>
              <dl className="space-y-2">
                <div className="flex gap-2">
                  <dt className="text-sm text-gray-500 w-44 flex-shrink-0">{t.medications.currentStockLabel}</dt>
=======
              <dl className="space-y-2">
                <div className="flex gap-2">
                  <dt className="text-sm text-gray-500 w-44 flex-shrink-0">Current Stock</dt>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                  <dd className={`text-sm font-semibold ${low ? 'text-red-600' : 'text-green-600'}`}>
                    {inventory.current_stock} dose{inventory.current_stock !== 1 ? 's' : ''}
                    {daysLeft !== null && (
                      <span className="ml-1 font-normal text-gray-500">
                        (~{daysLeft}d · runs out {runOutDate(daysLeft)})
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex gap-2">
<<<<<<< HEAD
                  <dt className="text-sm text-gray-500 w-44 flex-shrink-0">{t.medications.dosesPerIntakeLabel}</dt>
                  <dd className="text-sm text-gray-900">{inventory.doses_per_intake}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-sm text-gray-500 w-44 flex-shrink-0">{t.medications.alertDaysLabel}</dt>
                  <dd className="text-sm text-gray-900">{inventory.refill_alert_days} days</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-sm text-gray-500 w-44 flex-shrink-0">{t.medications.lastRefillLabel}</dt>
                  <dd className="text-sm text-gray-900">
                    {inventory.last_refill_date
                      ? formatDate(inventory.last_refill_date)
                      : t.medications.notRecorded}
=======
                  <dt className="text-sm text-gray-500 w-44 flex-shrink-0">Doses per Intake</dt>
                  <dd className="text-sm text-gray-900">{inventory.doses_per_intake}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-sm text-gray-500 w-44 flex-shrink-0">Alert (days before empty)</dt>
                  <dd className="text-sm text-gray-900">{inventory.refill_alert_days} days</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-sm text-gray-500 w-44 flex-shrink-0">Last Refill</dt>
                  <dd className="text-sm text-gray-900">
                    {inventory.last_refill_date
                      ? formatDate(inventory.last_refill_date)
                      : 'Not recorded'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

<<<<<<< HEAD
      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

=======
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
      {/* ─── Edit Medication Modal ─── */}
      {showEditMedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
<<<<<<< HEAD
              <h2 className="text-lg font-semibold text-gray-900">{t.medications.editMed}</h2>
=======
              <h2 className="text-lg font-semibold text-gray-900">Edit Medication</h2>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              <button
                onClick={() => setShowEditMedModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditMedSubmit} className="space-y-4">
              {medFormError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {medFormError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                  {t.medications.name} <span className="text-red-500">*</span>
                </label>
                <MedicineNameInput
                  value={medForm.name}
                  onChange={(v) => setMedForm((p) => ({ ...p, name: v }))}
                  existingNames={
                    allMedications
                      ?.filter((m) => m.id !== id)
                      .map((m) => m.name) ?? []
                  }
=======
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={medForm.name}
                  onChange={(e) => setMedForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                    {t.medications.dosage} <span className="text-red-500">*</span>
=======
                    Dosage <span className="text-red-500">*</span>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                  </label>
                  <input
                    type="text"
                    value={medForm.dosage}
                    onChange={(e) => setMedForm((p) => ({ ...p, dosage: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                    {t.medications.unit} <span className="text-red-500">*</span>
=======
                    Unit <span className="text-red-500">*</span>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                  </label>
                  <input
                    type="text"
                    value={medForm.unit}
                    onChange={(e) => setMedForm((p) => ({ ...p, unit: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                  {t.medications.instructions}
=======
                  Instructions
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </label>
                <textarea
                  value={medForm.instructions}
                  onChange={(e) => setMedForm((p) => ({ ...p, instructions: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <p className="text-sm font-semibold text-gray-700 mb-3 border-t border-gray-100 pt-4">
<<<<<<< HEAD
                  {t.medications.pharmacyDetails}
=======
                  Pharmacy Details
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                      {t.medications.pharmacyName}
                    </label>
                    <PharmacyInput
                      value={medForm.pharmacy_name}
                      onChange={(v) => setMedForm((p) => ({ ...p, pharmacy_name: v }))}
=======
                      Pharmacy Name
                    </label>
                    <input
                      type="text"
                      value={medForm.pharmacy_name}
                      onChange={(e) => setMedForm((p) => ({ ...p, pharmacy_name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                      {t.medications.pharmacyPhone}
=======
                      Pharmacy Phone
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                    </label>
                    <input
                      type="text"
                      value={medForm.pharmacy_phone}
                      onChange={(e) => setMedForm((p) => ({ ...p, pharmacy_phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                      {t.medications.prescribingDoctor}
=======
                      Prescribing Doctor
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                    </label>
                    <input
                      type="text"
                      value={medForm.prescribing_doctor}
                      onChange={(e) =>
                        setMedForm((p) => ({ ...p, prescribing_doctor: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                      {t.medications.prescriptionNumber}
=======
                      Prescription Number
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                    </label>
                    <input
                      type="text"
                      value={medForm.prescription_number}
                      onChange={(e) =>
                        setMedForm((p) => ({ ...p, prescription_number: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditMedModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
<<<<<<< HEAD
                  {t.common.cancel}
=======
                  Cancel
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </button>
                <button
                  type="submit"
                  disabled={updateMedication.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
<<<<<<< HEAD
                  {updateMedication.isPending ? t.common.saving : t.medications.saveChanges}
=======
                  {updateMedication.isPending ? 'Saving...' : 'Save Changes'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Schedule Modal ─── */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
<<<<<<< HEAD
              <h2 className="text-lg font-semibold text-gray-900">{t.medications.addScheduleModal}</h2>
=======
              <h2 className="text-lg font-semibold text-gray-900">Add Schedule</h2>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              <button
                onClick={() => setShowAddScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddScheduleSubmit} className="space-y-5">
              {scheduleFormError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {scheduleFormError}
                </div>
              )}

              {/* Mode toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setScheduleForm((p) => ({ ...p, mode: 'specific' }))}
                  className={`flex-1 py-2 transition-colors ${
                    scheduleForm.mode === 'specific'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
<<<<<<< HEAD
                  {t.medications.specificTime}
=======
                  Specific Time
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleForm((p) => ({ ...p, mode: 'interval' }))}
                  className={`flex-1 py-2 transition-colors ${
                    scheduleForm.mode === 'interval'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
<<<<<<< HEAD
                  {t.medications.everyXHours}
=======
                  Every X Hours
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </button>
              </div>

              {scheduleForm.mode === 'specific' ? (
                <div>
<<<<<<< HEAD
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.medications.time}</label>
=======
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, time: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
<<<<<<< HEAD
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.medications.startTime}</label>
=======
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                      <input
                        type="time"
                        value={scheduleForm.startTime}
                        onChange={(e) => setScheduleForm((p) => ({ ...p, startTime: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
<<<<<<< HEAD
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.medications.everyHours}</label>
=======
                      <label className="block text-sm font-medium text-gray-700 mb-1">Every (hours)</label>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                      <select
                        value={scheduleForm.intervalHours}
                        onChange={(e) => setScheduleForm((p) => ({ ...p, intervalHours: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {[2, 3, 4, 6, 8, 12].map((h) => (
<<<<<<< HEAD
                          <option key={h} value={h}>{h} {t.medications.hours}</option>
=======
                          <option key={h} value={h}>{h} hours</option>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Preview */}
                  {(() => {
                    const hours = parseInt(scheduleForm.intervalHours, 10)
                    const times = isNaN(hours) ? [] : generateIntervalTimes(scheduleForm.startTime, hours)
                    if (times.length === 0) return null
                    return (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800">
                        Creates {times.length} schedule{times.length !== 1 ? 's' : ''} at:{' '}
                        {times.map((t) => {
                          const [hh, mm] = t.split(':').map(Number)
                          const ampm = hh >= 12 ? 'PM' : 'AM'
                          const h12 = hh % 12 || 12
                          return `${h12}:${mm.toString().padStart(2, '0')} ${ampm}`
                        }).join(', ')}
                      </div>
                    )
                  })()}
                </div>
              )}

              <div>
<<<<<<< HEAD
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.medications.daysOfWeek}</label>
=======
                <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                <div className="flex gap-2 flex-wrap">
                  {DAY_NAMES.map((day, index) => {
                    const selected = scheduleForm.days_of_week.includes(index)
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(index)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          selected
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={scheduleForm.is_active}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="h-4 w-4 accent-green-600 rounded"
                />
<<<<<<< HEAD
                <label htmlFor="is_active" className="text-sm text-gray-700 font-medium">{t.medications.activeLabel}</label>
=======
                <label htmlFor="is_active" className="text-sm text-gray-700 font-medium">Active</label>
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddScheduleModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
<<<<<<< HEAD
                  {t.common.cancel}
=======
                  Cancel
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </button>
                <button
                  type="submit"
                  disabled={createSchedule.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
<<<<<<< HEAD
                  {createSchedule.isPending ? t.medications.adding : t.medications.addScheduleModal}
=======
                  {createSchedule.isPending ? 'Adding...' : 'Add Schedule'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Inventory Modal ─── */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
<<<<<<< HEAD
                {inventory ? t.medications.editInventory : t.medications.setUpInventory}
=======
                {inventory ? 'Edit Inventory' : 'Set Up Inventory'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
              </h2>
              <button
                onClick={() => setShowInventoryModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInventorySubmit} className="space-y-4">
              {invFormError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {invFormError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                  {t.medications.currentStock}
=======
                  Current Stock (doses)
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </label>
                <input
                  type="number"
                  min="0"
                  value={invForm.current_stock}
                  onChange={(e) => setInvForm((p) => ({ ...p, current_stock: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. 30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                  {t.medications.dosesPerIntake}
=======
                  Doses per Intake
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </label>
                <input
                  type="number"
                  min="1"
                  value={invForm.doses_per_intake}
                  onChange={(e) => setInvForm((p) => ({ ...p, doses_per_intake: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                  {t.medications.alertDays}
=======
                  Alert (days before empty)
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </label>
                <input
                  type="number"
                  min="1"
                  value={invForm.refill_alert_days}
                  onChange={(e) =>
                    setInvForm((p) => ({ ...p, refill_alert_days: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
<<<<<<< HEAD
                  {t.medications.lastRefillDate}
=======
                  Last Refill Date
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </label>
                <input
                  type="date"
                  value={invForm.last_refill_date}
                  onChange={(e) =>
                    setInvForm((p) => ({ ...p, last_refill_date: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInventoryModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
<<<<<<< HEAD
                  {t.common.cancel}
=======
                  Cancel
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </button>
                <button
                  type="submit"
                  disabled={createInventory.isPending || updateInventory.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  {createInventory.isPending || updateInventory.isPending
<<<<<<< HEAD
                    ? t.common.saving
                    : t.common.save}
=======
                    ? 'Saving...'
                    : 'Save'}
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
