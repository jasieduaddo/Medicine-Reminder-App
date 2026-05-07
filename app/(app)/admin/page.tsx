'use client'
import { useEffect, useState } from 'react'

interface LowStockItem {
  id: string
  current_stock: number
  low_stock_threshold: number
  medication: { name: string; user_id: string } | null
}

interface RecentMissed {
  id: string
  scheduled_time: string
  medication: { name: string } | null
}

interface AdminStats {
  totalUsers: number
  todayStats: { taken: number; missed: number; pending: number; skipped: number }
  complianceRate: number
  lowStock: LowStockItem[]
  recentMissed: RecentMissed[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => {
        if (!r.ok) throw new Error(r.status === 403 ? 'Access denied — admin only' : 'Failed to load')
        return r.json()
      })
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-4xl mb-3">🔒</p>
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-gray-400 text-sm mt-1">Contact an admin if you believe this is a mistake.</p>
      </div>
    )
  }

  const { todayStats, lowStock, recentMissed } = stats ?? {
    todayStats: { taken: 0, missed: 0, pending: 0, skipped: 0 },
    lowStock: [],
    recentMissed: [],
  }
  const totalToday = todayStats.taken + todayStats.missed + todayStats.pending + todayStats.skipped

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Compliance (7d)</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.complianceRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Taken Today</p>
          <p className="text-3xl font-bold text-green-600">{todayStats.taken}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Missed Today</p>
          <p className="text-3xl font-bold text-red-500">{todayStats.missed}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low stock table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Low Stock Alert</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-500">No low stock items</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Medication</th>
                    <th className="pb-3 font-medium text-right">Stock</th>
                    <th className="pb-3 font-medium text-right">Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(item => (
                    <tr key={item.id} className="border-t border-gray-50">
                      <td className="py-3 text-gray-900 font-medium">{item.medication?.name ?? 'Unknown'}</td>
                      <td className="py-3 text-right text-red-600 font-medium">{item.current_stock}</td>
                      <td className="py-3 text-right text-gray-500">{item.low_stock_threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent missed doses */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Missed Doses</h2>
          {recentMissed.length === 0 ? (
            <p className="text-sm text-gray-500">No missed doses</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Medication</th>
                    <th className="pb-3 font-medium">Scheduled Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMissed.map(dose => (
                    <tr key={dose.id} className="border-t border-gray-50">
                      <td className="py-3 text-gray-900 font-medium">{dose.medication?.name ?? 'Unknown'}</td>
                      <td className="py-3 text-gray-500">{new Date(dose.scheduled_time).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Today's breakdown bar */}
      {totalToday > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="font-semibold text-gray-800 mb-4">Today&apos;s Dose Breakdown</h2>
          <div className="flex rounded-full overflow-hidden h-4 bg-gray-100">
            {todayStats.taken > 0 && (
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(todayStats.taken / totalToday) * 100}%` }}
                title={`Taken: ${todayStats.taken}`}
              />
            )}
            {todayStats.missed > 0 && (
              <div
                className="bg-red-400 h-full"
                style={{ width: `${(todayStats.missed / totalToday) * 100}%` }}
                title={`Missed: ${todayStats.missed}`}
              />
            )}
            {todayStats.skipped > 0 && (
              <div
                className="bg-yellow-400 h-full"
                style={{ width: `${(todayStats.skipped / totalToday) * 100}%` }}
                title={`Skipped: ${todayStats.skipped}`}
              />
            )}
            {todayStats.pending > 0 && (
              <div
                className="bg-gray-300 h-full"
                style={{ width: `${(todayStats.pending / totalToday) * 100}%` }}
                title={`Pending: ${todayStats.pending}`}
              />
            )}
          </div>
          <div className="flex gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Taken {todayStats.taken}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />Missed {todayStats.missed}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />Skipped {todayStats.skipped}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />Pending {todayStats.pending}</span>
          </div>
        </div>
      )}
    </div>
  )
}