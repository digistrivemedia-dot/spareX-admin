"use client"

import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { useListQuery } from "@/lib/use-list-query"

const DEBOUNCE_MS = 300

/** Free-text search kept in the URL as `q`, applied a moment after typing stops. */
export function SearchInput({ placeholder }: { placeholder: string }) {
  const { searchParams, setParams } = useListQuery()
  const urlValue = searchParams.get("q") ?? ""
  const [value, setValue] = useState(urlValue)
  const [syncedUrlValue, setSyncedUrlValue] = useState(urlValue)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Keep the box in step when the URL changes elsewhere (Clear filters, back button).
  if (urlValue !== syncedUrlValue) {
    setSyncedUrlValue(urlValue)
    setValue(urlValue)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  function update(next: string) {
    setValue(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setParams({ q: next.trim() || null }), DEBOUNCE_MS)
  }

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-gray-400"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => update(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => update("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm text-gray-400 hover:text-gray-700 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label="Clear search"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  )
}
