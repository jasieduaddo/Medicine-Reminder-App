'use client'

import React, { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAllInventory, useUpdateInventory } from '@/hooks/useInventory'
import { formatDate, daysRemaining, isRunningLow, runOutDate } from '@/lib/utils'
import { useT } from '@/hooks/useT'
import { usePremium } from '@/hooks/usePremium'
import { UpgradeModal } from '@/components/PremiumGate'
import type { InventoryWithMedication } from '@/types'

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), { ssr: false })

interface EditFormData {
  current_stock: string
  doses_per_intake: string
  refill_alert_days: string
  last_refill_date: string
}

type ScanStep = 'scanning' | 'confirm'

export default function InventoryPage() {
  const t = useT()
  const { data: inventories, isLoading } = useAllInventory()
  const updateInventory = useUpdateInventory()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormData>({
    current_stock: '',
    doses_per_intake: '',
    refill_alert_days: '3',
    last_refill_date: '',
  })
  const [editError, setEditError] = useState<string | null>(null)

  const [scanInv, setScanInv] = useState<InventoryWithMedication | null>(null)
  const [scanStep, setScanStep] = useState<ScanStep>('scanning')
  const [scannedCode, setScannedCode] = useState('')
  const [pillCount, setPillCount] = useState('')
  const [scanSaving, setScanSaving] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { isPremium } = usePremium()

  function getDosesPerDay(inv: InventoryWithMedication) {
    return inv.medication.schedules.filter((s) => s.is_active).length
  }

  function getDaysLeft(inv: InventoryWithMedication) {
    return daysRemaining(inv.current_stock, inv.doses_per_intake, getDosesPerDay(inv))
  }

  function isLow(inv: InventoryWithMedication) {
    return isRunningLow(getDaysLeft(inv), inv.refill_alert_days)
  }

  const totalTracked = inventories?.length ?? 0
  const lowStockCount = inventories?.filter(isLow).length ?? 0
  const refillList = inventories?.filter((inv) => inv.needs_refill) ?? []

  function openEdit(inv: InventoryWithMedication) {
    setEditingId(inv.id)
    setEditForm({
      current_stock: String(inv.current_stock),
      doses_per_intake: String(inv.doses_per_intake),
      refill_alert_days: String(inv.refill_alert_days),
      last_refill_date: inv.last_refill_date ?? '',
    })
    setEditError(null)
  }

  function closeEdit() {
    setEditingId(null)
    setEditError(null)
  }

  async function handleMarkRefill(inv: InventoryWithMedication) {
    await updateInventory.mutateAsync({ id: inv.id, needs_refill: true })
  }

  function handleBuyRefill(inv: InventoryWithMedication) {
    if (!isPremium) { setShowUpgradeModal(true); return }
    updateInventory.mutate({ id: inv.id, needs_refill: true })
    const pharmacy = inv.medication.pharmacy_name
    const query = pharmacy
      ? `${pharmacy} ${inv.medication.name} prescription refill`
      : `${inv.medication.name} prescription refill near me`
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
  }

  async function handleCollected(inv: InventoryWithMedication) {
    const today = new Date().toISOString().split('T')[0]
    await updateInventory.mutateAsync({ id: inv.id, needs_refill: false, last_refill_date: today })
  }

  async function handleEditSubmit(e: React.FormEvent, inv: InventoryWithMedication) {
    e.preventDefault()
    setEditError(null)

    const currentStock = parseInt(editForm.current_stock, 10)
    const dosesPerIntake = parseInt(editForm.doses_per_intake, 10)
    const refillAlertDays = parseInt(editForm.refill_alert_days, 10)

    if (isNaN(currentStock) || isNaN(dosesPerIntake) || isNaN(refillAlertDays)) {
      setEditError(t.inventory.numericError)
      return
    }

    try {
      await updateInventory.mutateAsync({
        id: inv.id,
        medication_id: inv.medication_id,
        current_stock: currentStock,
        doses_per_intake: dosesPerIntake,
        refill_alert_days: refillAlertDays,
        last_refill_date: editForm.last_refill_date || null,
        needs_refill: editForm.last_refill_date ? false : inv.needs_refill,
      })
      closeEdit()
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : t.inventory.updateError)
    }
  }

  function openScan(inv: InventoryWithMedication) {
    setScanInv(inv)
    setScanStep('scanning')
    setScannedCode('')
    setPillCount('')
    setScanSaving(false)
  }

  function closeScan() {
    setScanInv(null)
  }

  const handleScanDetected = useCallback((code: string) => {
    setScannedCode(code)
    setScanStep('confirm')
  }, [])

  async function handleScanSave() {
    if (!scanInv) return
    const count = parseInt(pillCount, 10)
    if (isNaN(count) || count < 0) return
    setScanSaving(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await updateInventory.mutateAsync({
        id: scanInv.id,
        current_stock: count,
        last_refill_date: today,
        needs_refill: false,
      })
      closeScan()
    } finally {
      setScanSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.inventory.title}</h1>
        <p className="text-gray-500 mt-1">{t.inventory.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">{t.inventory.medicationsTracked}</p>
          <p className="text-3xl font-bold text-gray-900">{totalTracked}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">{t.inventory.runningLow}</p>
          <p className={`text-3xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {lowStockCount}
          </p>
        </div>
      </div>

      {refillList.length > 0 && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="font-semibold text-amber-900 mb-3">{t.inventory.refillList}</h2>
          <ul className="space-y-2">
            {refillList.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-4">
                <span className="text-sm text-amber-900 font-medium">{inv.medication.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => isPremium ? openScan(inv) : setShowUpgradeModal(true)}
                    className="text-xs bg-white border border-amber-300 text-amber-700 font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    {t.inventory.scanBottle}
                  </button>
                  <button
                    onClick={() => handleCollected(inv)}
                    disabled={updateInventory.isPending}
                    className="text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {t.inventory.collected}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 p-4 border-b border-gray-100 last:border-0">
                <div className="h-4 bg-gray-200 rounded flex-1" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
        </div>
      ) : !inventories || inventories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-500 text-lg font-medium">{t.inventory.noInventory}</p>
          <p className="text-gray-400 text-sm mt-1">{t.inventory.noInventoryMsg}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[t.inventory.medication, t.inventory.stock, t.inventory.daysLeft, t.inventory.alertDays, t.inventory.lastRefill].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {inventories.map((inv) => {
                const low = isLow(inv)
                const daysLeft = getDaysLeft(inv)
                return (
                  <React.Fragment key={inv.id}>
                    <tr className={`border-b border-gray-100 last:border-0 ${low ? 'bg-red-50' : ''}`}>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        <span>{inv.medication.name}</span>
                        {low && (
                          <span className="ml-2 text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                            {t.inventory.refillSoon}
                          </span>
                        )}
                        {inv.needs_refill && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                            {t.inventory.onList}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-semibold ${low ? 'text-red-600' : 'text-green-600'}`}>
                          {inv.current_stock}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {daysLeft !== null ? (
                          <span className={low ? 'text-red-600 font-semibold' : ''}>
                            ~{daysLeft}d
                            <span className={`block text-xs font-normal ${low ? 'text-red-400' : 'text-gray-400'}`}>
                              Runs out {runOutDate(daysLeft)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-700">{inv.refill_alert_days}d</td>
                      <td className="px-5 py-4 text-gray-500">
                        {inv.last_refill_date ? formatDate(inv.last_refill_date) : t.inventory.notSet}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => isPremium ? openScan(inv) : setShowUpgradeModal(true)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            {t.inventory.scan}
                          </button>
                          <button
                            onClick={() => handleBuyRefill(inv)}
                            className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                          >
                            {t.inventory.buyRefill}
                          </button>
                          <button
                            onClick={() => openEdit(inv)}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            {t.common.edit}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {editingId === inv.id && (
                      <tr key={inv.id + '-edit'} className={low ? 'bg-red-50' : 'bg-gray-50'}>
                        <td colSpan={6} className="px-5 py-5">
                          <form onSubmit={(e) => handleEditSubmit(e, inv)}>
                            {editError && (
                              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                                {editError}
                              </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{t.inventory.currentStock}</label>
                                <input
                                  type="number" min="0"
                                  value={editForm.current_stock}
                                  onChange={(e) => setEditForm((p) => ({ ...p, current_stock: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{t.inventory.dosesPerIntake}</label>
                                <input
                                  type="number" min="1"
                                  value={editForm.doses_per_intake}
                                  onChange={(e) => setEditForm((p) => ({ ...p, doses_per_intake: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{t.inventory.alertDaysLabel}</label>
                                <input
                                  type="number" min="1"
                                  value={editForm.refill_alert_days}
                                  onChange={(e) => setEditForm((p) => ({ ...p, refill_alert_days: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{t.inventory.lastRefillDate}</label>
                                <input
                                  type="date"
                                  value={editForm.last_refill_date}
                                  onChange={(e) => setEditForm((p) => ({ ...p, last_refill_date: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="submit"
                                disabled={updateInventory.isPending}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                              >
                                {updateInventory.isPending ? t.inventory.saving : t.common.save}
                              </button>
                              <button
                                type="button" onClick={closeEdit}
                                className="border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                {t.common.cancel}
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

      {/* Barcode Scan Modal */}
      {scanInv && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t.inventory.scanBottleTitle}</h2>
                <p className="text-sm text-gray-500">{scanInv.medication.name}</p>
              </div>
              <button onClick={closeScan} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            {scanStep === 'scanning' ? (
              <BarcodeScanner onDetected={handleScanDetected} />
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 mb-0.5">{t.inventory.barcodeDetected}</p>
                  <p className="text-sm font-mono font-medium text-gray-800 break-all">{scannedCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.inventory.pillCountLabel}
                  </label>
                  <input
                    type="number" min="0" autoFocus
                    value={pillCount}
                    onChange={(e) => setPillCount(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t.inventory.pillCountHint}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setScanStep('scanning')}
                    className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    {t.inventory.rescan}
                  </button>
                  <button
                    onClick={handleScanSave}
                    disabled={!pillCount || scanSaving}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {scanSaving ? t.inventory.saving : t.common.save}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
