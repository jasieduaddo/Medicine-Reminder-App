import { getAdminStats, requireAdmin } from '@/lib/admin-db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireAdmin()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: message === 'Forbidden' ? 403 : 401 })
  }

  try {
    const stats = await getAdminStats()
    return NextResponse.json(stats)
  } catch (err) {
    console.error('[AdminStats]', err)
    return NextResponse.json({ error: 'Failed to load admin stats' }, { status: 500 })
  }
}