'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  existingNames?: string[]
  placeholder?: string
}

export default function MedicineNameInput({
  value,
  onChange,
  existingNames = [],
  placeholder = 'e.g. Metformin',
}: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    if (!value.trim() || value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(value)}&maxList=10`,
          { signal: controller.signal }
        )
        const data = await res.json()
        const names: string[] = Array.isArray(data[1]) ? data[1] : []
        setSuggestions(names)
        setShowSuggestions(names.length > 0)
      } catch {
        // fetch aborted or network error — ignore
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [value])

  function select(name: string) {
    onChange(name)
    setShowSuggestions(false)
  }

  function isDuplicate(name: string) {
    return existingNames.some((n) => n.toLowerCase() === name.toLowerCase())
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowSuggestions(false) }}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 animate-pulse">
            ···
          </span>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-30 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {suggestions.map((name) => {
            const duplicate = isDuplicate(name)
            return (
              <li key={name}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(name)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors ${
                    duplicate
                      ? 'bg-amber-50 hover:bg-amber-100'
                      : 'hover:bg-green-50'
                  }`}
                >
                  <span className={duplicate ? 'text-amber-800 font-medium' : 'text-gray-800'}>
                    {name}
                  </span>
                  {duplicate && (
                    <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                      Already added
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
