'use client'

import { useState, useMemo } from 'react'
import { useDoseLogs } from '@/hooks/useDoseLogs'
import { useMedications } from '@/hooks/useMedications'
import { formatDate, formatTime } from '@/lib/utils'
import { useT } from '@/hooks/useT'
import type { DoseLog } from '@/types'

const PAGE_SIZE = 20

function getDatePart(isoString: string): string {
  return isoString.split('T')[0]
}

function getTimePart(isoString: string): string {
  const timePart = isoString.split('T')[1] ?? ''
  return timePart.slice(0, 5)
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function offsetDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

type LogStatus = DoseLog['status']

const STATUS_CLASSES: Record<LogStatus, string> = {
  taken: 'bg-green-100 text-green-700',
  missed: 'bg-red-100 text-red-700',
  skipped: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-600',
}

const STATUS_ACTIVE_CLASSES: Record<LogStatus, string> = {
  taken: 'bg-green-100 text-green-700 ring-2 ring-offset-1 ring-green-400',
  missed: 'bg-red-100 text-red-700 ring-2 ring-offset-1 ring-red-400',
  skipped: 'bg-yellow-100 text-yellow-700 ring-2 ring-offset-1 ring-yellow-400',
  pending: 'bg-gray-200 text-gray-700 ring-2 ring-offset-1 ring-gray-400',
}

const ALL_STATUSES: LogStatus[] = ['taken', 'missed', 'skipped', 'pending']

export default function HistoryPage() {
  const t = useT()
  const [startDate, setStartDate] = useState<string>(todayStr())
  const [endDate, setEndDate] = useState<string>(todayStr())
  const [selectedMedId, setSelectedMedId] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<LogStatus | ''>('')
  const [page, setPage] = useState(0)

  const STATUS_LABELS: Record<LogStatus, string> = {
    taken: t.history.taken,
    missed: t.history.missed,
    skipped: t.history.skipped,
    pending: t.history.pending,
  }

  const { data: allLogs, isLoading: loadingLogs } = useDoseLogs({ startDate, endDate, limit: 1000 })
  const { data: medications, isLoading: loadingMeds } = useMedications()
  const isLoading = loadingLogs || loadingMeds

  const medMap = useMemo(() => {
    const map = new Map<string, { name: string; dosage: string; unit: string }>()
    for (const med of medications ?? []) {
      map.set(med.id, { name: med.name, dosage: med.dosage, unit: med.unit })
    }
    return map
  }, [medications])

  const filteredLogs = useMemo(() => {
    if (!allLogs) return []
    return [...allLogs]
      .filter((log) => !selectedMedId || log.medication_id === selectedMedId)
      .filter((log) => !selectedStatus || log.status === selectedStatus)
      .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
  }, [allLogs, selectedMedId, selectedStatus])

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pagedLogs = filteredLogs.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  function setRange(start: string, end: string) {
    setStartDate(start)
    setEndDate(end)
    setPage(0)
  }

  function clearFilters() {
    setSelectedMedId('')
    setSelectedStatus('')
    setPage(0)
  }

  const isToday = startDate === todayStr() && endDate === todayStr()
  const isLast7 = startDate === offsetDate(-6) && endDate === todayStr()
  const isLast30 = startDate === offsetDate(-29) && endDate === todayStr()
  const hasActiveFilters = !!selectedMedId || !!selectedStatus

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.history.title}</h1>
        <p className="text-gray-500 mt-1">{t.history.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-3">
        {/* Date range row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t.history.dateFrom}</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0) }}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <span className="text-gray-400 text-sm">—</span>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t.history.dateTo}</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={todayStr()}
              onChange={(e) => { setEndDate(e.target.value); setPage(0) }}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <span className="text-sm text-gray-400 ml-auto">{t.history.records(filteredLogs.length)}</span>
        </div>

        {/* Date presets */}
        <div className="flex gap-2">
          {[
            { label: t.history.today, active: isToday, onClick: () => setRange(todayStr(), todayStr()) },
            { label: t.history.last7Days, active: isLast7, onClick: () => setRange(offsetDate(-6), todayStr()) },
            { label: t.history.last30Days, active: isLast30, onClick: () => setRange(offsetDate(-29), todayStr()) },
          ].map(({ label, active, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-3">
          {/* Medication filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide w-20 flex-shrink-0">
              {t.history.filterMedication}
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => { setSelectedMedId(e.target.value); setPage(0) }}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t.history.allMedications}</option>
              {(medications ?? []).map((med) => (
                <option key={med.id} value={med.id}>{med.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide w-20 flex-shrink-0">
              {t.history.filterStatus}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => { setSelectedStatus(''); setPage(0) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedStatus === '' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.history.allStatuses}
              </button>
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSelectedStatus(selectedStatus === s ? '' : s); setPage(0) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedStatus === s
                      ? STATUS_ACTIVE_CLASSES[s]
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-green-600 hover:text-green-700 font-medium ml-auto"
              >
                {t.history.clearFilters}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 p-4 border-b border-gray-100 last:border-0">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-4 bg-gray-200 rounded flex-1" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 text-lg font-medium">{t.history.noLogs}</p>
          <p className="text-gray-400 text-sm mt-1">{t.history.noLogsMsg}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto mb-4">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[t.history.scheduled, t.history.medication, t.history.dosage, t.history.status, t.history.takenAt, t.history.notes].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedLogs.map((log) => {
                  const med = medMap.get(log.medication_id)
                  const scheduledTimePart = getTimePart(log.scheduled_time)
                  const scheduledDatePart = getDatePart(log.scheduled_time)
                  return (
                    <tr key={log.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                        <span className="block text-xs text-gray-400">{formatDate(scheduledDatePart)}</span>
                        <span className="font-medium">{scheduledTimePart ? formatTime(scheduledTimePart) : '—'}</span>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">{med?.name ?? log.medication_id}</td>
                      <td className="px-5 py-4 text-gray-600">{med ? `${med.dosage} ${med.unit}` : '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[log.status]}`}>
                          {STATUS_LABELS[log.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        {log.taken_time ? (
                          <>
                            <span className="block text-xs text-gray-400">{formatDate(getDatePart(log.taken_time))}</span>
                            <span>{formatTime(getTimePart(log.taken_time))}</span>
                          </>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500 max-w-xs">
                        {log.notes ? (
                          <span className="truncate block" title={log.notes}>{log.notes}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {t.history.showing(safePage * PAGE_SIZE + 1, Math.min((safePage + 1) * PAGE_SIZE, filteredLogs.length), filteredLogs.length)}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t.history.prev}
                </button>
                <span className="text-sm text-gray-500">{t.history.page(safePage + 1, totalPages)}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t.history.next}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
