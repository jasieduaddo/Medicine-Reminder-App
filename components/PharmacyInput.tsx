'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { US_STATES, getPharmaciesForState, getAllPharmacies } from '@/lib/pharmacies'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function PharmacyInput({ value, onChange }: Props) {
  const [selectedState, setSelectedState] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const suggestions = useMemo(() => {
    const pool = selectedState ? getPharmaciesForState(selectedState) : getAllPharmacies()
    if (!value.trim()) return selectedState ? pool.slice(0, 10) : []
    return pool.filter((p) => p.toLowerCase().includes(value.toLowerCase())).slice(0, 10)
  }, [value, selectedState])

  return (
    <div ref={wrapperRef} className="space-y-2">
      {/* State selector */}
      <select
        value={selectedState}
        onChange={(e) => {
          setSelectedState(e.target.value)
          onChange('')
          setShowSuggestions(e.target.value !== '')
        }}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
      >
        <option value="">— Filter by state (optional) —</option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Pharmacy name input with autocomplete */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => {
            if (value.trim() || selectedState) setShowSuggestions(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowSuggestions(false)
          }}
          placeholder={selectedState ? 'Type or pick a pharmacy…' : 'e.g. CVS Pharmacy'}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-30 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(name)
                    setShowSuggestions(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
