import { supabase } from '@/lib/supabase'
import type { Profile, Medication, Schedule, DoseLog, Inventory, InventoryWithMedication, MedicationWithRelations } from '@/types'

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error(`[DB Error] getProfile:`, error)
    if (error.code === 'PGRST116') return null // row not found
    throw error
  }
  return data as Profile
}

export async function upsertProfile(userId: string, updates: Partial<Profile>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ ...updates, id: userId }, { onConflict: 'id' })

  if (error) throw error
}

// ─────────────────────────────────────────────
// Medications
// ─────────────────────────────────────────────

export async function getMedications(userId: string): Promise<MedicationWithRelations[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*, schedules(*), inventory(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`[DB Error] getMedications:`, error)
    throw error
  }

  return (data ?? []).map((row: any) => ({
    ...row,
    schedules: Array.isArray(row.schedules) ? row.schedules : [],
    inventory: Array.isArray(row.inventory) ? (row.inventory[0] ?? null) : (row.inventory ?? null),
  })) as MedicationWithRelations[]
}

export async function getMedication(id: string): Promise<MedicationWithRelations | null> {
  const { data, error } = await supabase
    .from('medications')
    .select('*, schedules(*), inventory(*)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return {
    ...data,
    schedules: Array.isArray(data.schedules) ? data.schedules : [],
    inventory: Array.isArray(data.inventory) ? (data.inventory[0] ?? null) : (data.inventory ?? null),
  } as MedicationWithRelations
}

export async function createMedication(
  data: Omit<Medication, 'id' | 'created_at' | 'updated_at'>
): Promise<Medication> {
  const { data: created, error } = await supabase
    .from('medications')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error(`[DB Error] createMedication:`, error)
    throw error
  }
  return created as Medication
}

export async function updateMedication(id: string, data: Partial<Medication>): Promise<void> {
  const { error } = await supabase
    .from('medications')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function deleteMedication(id: string): Promise<void> {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─────────────────────────────────────────────
// Schedules
// ─────────────────────────────────────────────

export async function createSchedule(data: Omit<Schedule, 'id' | 'created_at'>): Promise<Schedule> {
  const { data: created, error } = await supabase
    .from('schedules')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return created as Schedule
}

export async function updateSchedule(id: string, data: Partial<Schedule>): Promise<void> {
  const { error } = await supabase
    .from('schedules')
    .update(data)
    .eq('id', id)

  if (error) throw error
}

export async function deleteSchedule(id: string): Promise<void> {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─────────────────────────────────────────────
// DoseLogs
// ─────────────────────────────────────────────

export async function getDoseLogsForDate(userId: string, date: string): Promise<DoseLog[]> {
  const { data, error } = await supabase
    .from('dose_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('scheduled_time', `${date}T00:00:00`)
    .lte('scheduled_time', `${date}T23:59:59.999`)
    .order('scheduled_time', { ascending: true })

  if (error) throw error
  return (data ?? []) as DoseLog[]
}

export async function getDoseLogs(
  userId: string,
<<<<<<< HEAD
  options?: { limit?: number; offset?: number; date?: string; startDate?: string; endDate?: string }
=======
  options?: { limit?: number; offset?: number; date?: string }
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
): Promise<DoseLog[]> {
  let query = supabase
    .from('dose_logs')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_time', { ascending: false })

  if (options?.date) {
    query = query
      .gte('scheduled_time', `${options.date}T00:00:00`)
      .lte('scheduled_time', `${options.date}T23:59:59.999`)
<<<<<<< HEAD
  } else if (options?.startDate && options?.endDate) {
    query = query
      .gte('scheduled_time', `${options.startDate}T00:00:00`)
      .lte('scheduled_time', `${options.endDate}T23:59:59.999`)
=======
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
  }

  if (options?.limit !== undefined) {
    query = query.limit(options.limit)
  }

  if (options?.offset !== undefined) {
    query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as DoseLog[]
}

export async function createDoseLog(data: Omit<DoseLog, 'id' | 'created_at'>): Promise<DoseLog> {
  const { data: created, error } = await supabase
    .from('dose_logs')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return created as DoseLog
}

export async function updateDoseLog(id: string, data: Partial<DoseLog>): Promise<void> {
  const { error } = await supabase
    .from('dose_logs')
    .update(data)
    .eq('id', id)

  if (error) throw error
}

// ─────────────────────────────────────────────
// Inventory
// ─────────────────────────────────────────────

export async function getAllInventory(userId: string): Promise<InventoryWithMedication[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, medication:medications(*, schedules(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as InventoryWithMedication[]
}

export async function getInventory(medicationId: string): Promise<Inventory | null> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('medication_id', medicationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Inventory
}

export async function upsertInventory(
  data: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>
): Promise<Inventory> {
  const { data: upserted, error } = await supabase
    .from('inventory')
    .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'medication_id' })
    .select()
    .single()

  if (error) throw error
  return upserted as Inventory
}

export async function updateInventory(id: string, data: Partial<Inventory>): Promise<void> {
  const { error } = await supabase
    .from('inventory')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ─────────────────────────────────────────────
// Today's Doses
// ─────────────────────────────────────────────

export interface TodayDose {
  id: string
  medication: Medication
  schedule: Schedule
  doseLog?: DoseLog
}

export async function getTodayDoses(userId: string): Promise<TodayDose[]> {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0] // "YYYY-MM-DD"
  const todayDayIndex = today.getDay() // 0 = Sunday, 6 = Saturday

  const medications = await getMedications(userId)
  const logs = await getDoseLogsForDate(userId, todayStr)

  const doses: TodayDose[] = []

  for (const med of medications) {
    for (const schedule of med.schedules) {
      if (!schedule.is_active) continue
      if (!schedule.days_of_week.includes(todayDayIndex)) continue

      // Build a deterministic composite id for this dose slot
      const slotId = `${med.id}-${schedule.id}-${todayStr}`
      const scheduledTime = `${todayStr}T${schedule.time}:00`

      const existingLog = logs.find(
        (log) => log.schedule_id === schedule.id && log.medication_id === med.id
      )

      doses.push({
        id: slotId,
        medication: med,
        schedule,
        doseLog: existingLog,
      })
    }
  }

  // Sort by schedule time ascending
  doses.sort((a, b) => a.schedule.time.localeCompare(b.schedule.time))

  return doses
}

// ─────────────────────────────────────────────
// Auto-log Missed Doses
// ─────────────────────────────────────────────

export async function autoLogMissedDoses(userId: string): Promise<number> {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const todayDayIndex = now.getDay()
  const currentTimeStr = now.toTimeString().slice(0, 5) // "HH:MM"

  const medications = await getMedications(userId)
  const logs = await getDoseLogsForDate(userId, todayStr)

  let count = 0

  for (const med of medications) {
    for (const schedule of med.schedules) {
      if (!schedule.is_active) continue
      if (!schedule.days_of_week.includes(todayDayIndex)) continue

      // Only consider schedules whose time has already passed
      if (schedule.time >= currentTimeStr) continue

      // Check if a log already exists for this schedule+medication today
      const alreadyLogged = logs.some(
        (log) => log.schedule_id === schedule.id && log.medication_id === med.id
      )

      if (alreadyLogged) continue

      const scheduledTime = `${todayStr}T${schedule.time}:00`

      await createDoseLog({
        medication_id: med.id,
        schedule_id: schedule.id,
        user_id: userId,
        scheduled_time: scheduledTime,
        taken_time: null,
        status: 'missed',
        notes: null,
      })

      count++
    }
  }

  return count
}
