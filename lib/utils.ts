export const DAY_NAMES: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Converts a 24-hour "HH:MM" time string to "h:mm AM/PM" display format.
 */
export function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour = parseInt(hourStr, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minuteStr} ${ampm}`
}

/**
 * Formats an ISO date string to a human-readable form: "Mon, Jan 1, 2025".
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Returns the short day name for a 0-based index (0 = "Sun", 6 = "Sat").
 */
export function getDayName(index: number): string {
  return DAY_NAMES[index] ?? ''
}

/**
 * Returns true when current_stock is at or below threshold.
 */
export function isLowStock(current: number, threshold: number): boolean {
  return current <= threshold
}

/**
 * Returns how many full days of medication remain.
 * Returns null when dosesPerDay or dosesPerIntake is 0 (can't compute).
 */
export function daysRemaining(
  currentStock: number,
  dosesPerIntake: number,
  dosesPerDay: number
): number | null {
  if (dosesPerDay <= 0 || dosesPerIntake <= 0) return null
  return Math.floor(currentStock / (dosesPerIntake * dosesPerDay))
}

/**
 * Returns true when days remaining is within the refill alert window.
 */
export function isRunningLow(days: number | null, refillAlertDays: number): boolean {
  if (days === null) return false
  return days <= refillAlertDays
}

/**
 * Returns the projected run-out date string (e.g. "May 15") given days remaining.
 * Returns null if days is null.
 */
export function runOutDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Returns the current day of the week as a 0-based index (0 = Sunday).
 */
export function getTodayDayIndex(): number {
  return new Date().getDay()
}

/**
 * Joins class name values, filtering out falsy entries.
 */
export function cn(
  ...classes: (string | undefined | false | null)[]
): string {
  return classes.filter(Boolean).join(' ')
}
