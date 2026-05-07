export interface Profile {
  id: string
  created_at: string
  whatsapp_phone: string | null
  whatsapp_api_key: string | null
  browser_notifications_enabled: boolean
  whatsapp_notifications_enabled: boolean
  role: string
  is_premium: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  premium_expires_at: string | null
}

export interface Medication {
  id: string
  user_id: string
  name: string
  dosage: string
  unit: string
  instructions: string | null
  pharmacy_name: string | null
  pharmacy_phone: string | null
  prescribing_doctor: string | null
  prescription_number: string | null
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  medication_id: string
  /** HH:MM 24-hour format */
  time: string
  days_of_week: number[]
  is_active: boolean
  created_at: string
}

export interface DoseLog {
  id: string
  medication_id: string
  schedule_id: string | null
  user_id: string
  scheduled_time: string
  taken_time: string | null
  status: 'pending' | 'taken' | 'missed' | 'skipped'
  notes: string | null
  created_at: string
}

export interface Inventory {
  id: string
  medication_id: string
  user_id: string
  current_stock: number
  doses_per_intake: number
  low_stock_threshold: number
  refill_alert_days: number
  needs_refill: boolean
  last_refill_date: string | null
  created_at: string
  updated_at: string
}

export interface InventoryWithMedication extends Inventory {
  medication: Medication & { schedules: Schedule[] }
}

export interface MedicationWithRelations extends Medication {
  schedules: Schedule[]
  inventory: Inventory | null
}
