"use client"

import { DateRangeFilter } from "@/components/ui/DateRangeFilter"
import { FilterSelect, type FilterOption } from "@/components/ui/FilterSelect"
import { SearchInput } from "@/components/ui/SearchInput"

export type FilterConfig =
  | { type: "select"; key: string; label: string; options: FilterOption[]; allLabel?: string }
  | { type: "dateRange"; label?: string; emptyLabel?: string }

type FilterBarProps = {
  searchPlaceholder: string
  filters?: FilterConfig[]
}

/** Search, filters and date range for a list. Every value lives in the URL, so lists can be shared and bookmarked. */
export function FilterBar({ searchPlaceholder, filters = [] }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput placeholder={searchPlaceholder} />
      {filters.map((filter) =>
        filter.type === "select" ? (
          <FilterSelect
            key={filter.key}
            paramKey={filter.key}
            label={filter.label}
            options={filter.options}
            allLabel={filter.allLabel}
          />
        ) : (
          <DateRangeFilter key="date" label={filter.label} emptyLabel={filter.emptyLabel} />
        ),
      )}
    </div>
  )
}
