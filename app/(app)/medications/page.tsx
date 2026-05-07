'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  useMedications,
  useCreateMedication,
  useDeleteMedication,
} from '@/hooks/useMedications'
import { isLowStock } from '@/lib/utils'
import PharmacyInput from '@/components/PharmacyInput'
import MedicineNameInput from '@/components/MedicineNameInput'
import { useT } from '@/hooks/useT'

interface MedicationFormData {
  name: string
  dosage: string
  unit: string
  instructions: string
  pharmacy_name: string
  pharmacy_phone: string
  prescribing_doctor: string
  prescription_number: string
}

const EMPTY_FORM: MedicationFormData = {
  name: '',
  dosage: '',
  unit: '',
  instructions: '',
  pharmacy_name: '',
  pharmacy_phone: '',
  prescribing_doctor: '',
  prescription_number: '',
}

export default function MedicationsPage() {
  const t = useT()
  const router = useRouter()
  const { data: medications, isLoading } = useMedications()
  const createMedication = useCreateMedication()
  const deleteMedication = useDeleteMedication()

  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<MedicationFormData>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filtered = (medications ?? []).filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const suggestions = useMemo(() => {
    if (!search.trim() || !medications) return []
    return medications
      .map((m) => m.name)
      .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 8)
  }, [search, medications])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleFieldChange(field: keyof MedicationFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!formData.name.trim() || !formData.dosage.trim() || !formData.unit.trim()) {
      setFormError('Name, Dosage, and Unit are required.')
      return
    }

    try {
      await createMedication.mutateAsync({
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        unit: formData.unit.trim(),
        instructions: formData.instructions.trim() || null,
        pharmacy_name: formData.pharmacy_name.trim() || null,
        pharmacy_phone: formData.pharmacy_phone.trim() || null,
        prescribing_doctor: formData.prescribing_doctor.trim() || null,
        prescription_number: formData.prescription_number.trim() || null,
      })
      setShowModal(false)
      setFormData(EMPTY_FORM)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create medication.')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMedication.mutateAsync(id)
    } finally {
      setDeleteConfirmId(null)
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.medications.title}</h1>
          <p className="text-gray-500 mt-1">{t.medications.subtitle}</p>
        </div>
        <button
          onClick={() => {
            setFormData(EMPTY_FORM)
            setFormError(null)
            setShowModal(true)
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          {t.medications.add}
        </button>
      </div>

      {/* Search with autocomplete */}
      <div className="mb-6 relative max-w-sm" ref={searchRef}>
        <input
          type="text"
          placeholder={t.medications.search}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true) }}
          onFocus={() => { if (search.trim()) setShowSuggestions(true) }}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowSuggestions(false) }}
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setSearch(name); setShowSuggestions(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">💊</p>
          <p className="text-gray-500 text-lg font-medium">
            {search ? t.medications.noResults : t.medications.empty}
          </p>
          {!search && (
            <p className="text-gray-400 text-sm mt-1">{t.medications.emptyMsg}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((med) => {
            const low =
              med.inventory &&
              isLowStock(med.inventory.current_stock, med.inventory.low_stock_threshold)
            return (
              <div
                key={med.id}
                className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push('/medications/' + med.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-lg text-gray-900">{med.name}</p>
                    {low && (
                      <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                        {t.medications.lowStock}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{med.dosage} {med.unit}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {t.medications.schedule(med.schedules.length)}
                    </span>
                    {med.instructions && (
                      <span className="text-xs text-gray-400 truncate max-w-xs">{med.instructions}</span>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {deleteConfirmId === med.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{t.medications.deleteConfirm}</span>
                      <button
                        onClick={() => handleDelete(med.id)}
                        disabled={deleteMedication.isPending}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {t.common.yes}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {t.common.no}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(med.id)}
                      className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete medication"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Medication Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{t.medications.addModal}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.medications.name} <span className="text-red-500">*</span>
                </label>
                <MedicineNameInput
                  value={formData.name}
                  onChange={(v) => handleFieldChange('name', v)}
                  existingNames={medications?.map((m) => m.name) ?? []}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.medications.dosage} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => handleFieldChange('dosage', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.medications.unit} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleFieldChange('unit', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. mg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.medications.instructions}
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => handleFieldChange('instructions', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder={t.medications.instructionsPlaceholder}
                />
              </div>

              <div className="pt-2">
                <p className="text-sm font-semibold text-gray-700 mb-3 border-t border-gray-100 pt-4">
                  {t.medications.pharmacyDetails}
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.medications.pharmacyName}
                    </label>
                    <PharmacyInput
                      value={formData.pharmacy_name}
                      onChange={(v) => handleFieldChange('pharmacy_name', v)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.medications.pharmacyPhone}
                    </label>
                    <input
                      type="text"
                      value={formData.pharmacy_phone}
                      onChange={(e) => handleFieldChange('pharmacy_phone', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. +1 555-0100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.medications.prescribingDoctor}
                    </label>
                    <input
                      type="text"
                      value={formData.prescribing_doctor}
                      onChange={(e) => handleFieldChange('prescribing_doctor', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Dr. Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.medications.prescriptionNumber}
                    </label>
                    <input
                      type="text"
                      value={formData.prescription_number}
                      onChange={(e) => handleFieldChange('prescription_number', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. RX-12345"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={createMedication.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  {createMedication.isPending ? t.common.adding : t.medications.addModal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
