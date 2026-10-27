"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListQuery } from "@/lib/use-list-query"

export type FilterOption = { value: string; label: string }

const ALL = "__all"

/** One filter kept in the URL under `paramKey`; "All" (or `allLabel`, for a default) removes it. */
export function FilterSelect({
  paramKey,
  label,
  options,
  allLabel = "All",
}: {
  paramKey: string
  label: string
  options: FilterOption[]
  allLabel?: string
}) {
  const { searchParams, setParams } = useListQuery()
  const value = searchParams.get(paramKey) ?? ALL

  return (
    <Select
      value={value}
      onValueChange={(next) => setParams({ [paramKey]: next === ALL ? null : next })}
    >
      <SelectTrigger aria-label={label} className="w-full sm:w-auto sm:min-w-36">
        <span className="text-gray-500">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
