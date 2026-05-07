import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient, type SetAllCookies } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createBrowserClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function requireAdmin(): Promise<{ role: string } | never> {
  const supabase = await createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden')
  }

  return profile
}

export async function getAdminStats() {
  const supabase = await createAdminClient()

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Today's dose stats
  const { data: todayLogs } = await supabase
    .from('dose_logs')
    .select('status')
    .gte('scheduled_time', `${today}T00:00:00`)
    .lte('scheduled_time', `${today}T23:59:59.999`)

  const todayStats = { taken: 0, missed: 0, pending: 0, skipped: 0 }
  todayLogs?.forEach(log => {
    if (log.status in todayStats) {
      todayStats[log.status as keyof typeof todayStats]++
    }
  })

  // Weekly compliance
  const { data: weekLogs } = await supabase
    .from('dose_logs')
    .select('status')
    .gte('scheduled_time', `${weekAgo}T00:00:00`)

  const weekTotal = weekLogs?.length ?? 0
  const weekTaken = weekLogs?.filter(l => l.status === 'taken' || l.status === 'skipped').length ?? 0
  const complianceRate = weekTotal > 0 ? Math.round((weekTaken / weekTotal) * 100) : 0

  // Low stock items with medication names
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*, medication:medications(name, user_id)')

  const lowStock = (inventory ?? [])
    .filter(i => i.current_stock <= i.low_stock_threshold)
    .slice(0, 50)

  // Recent missed doses (last 20)
  const { data: recentMissed } = await supabase
    .from('dose_logs')
    .select('*, medication:medications(name)')
    .eq('status', 'missed')
    .order('scheduled_time', { ascending: false })
    .limit(20)

  return {
    totalUsers: totalUsers ?? 0,
    todayStats,
    complianceRate,
    lowStock: lowStock ?? [],
    recentMissed: recentMissed ?? [],
  }
}