"use client"

import { SearchX } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"
import { useListQuery } from "@/lib/use-list-query"

/** Keys that only page or sort; anything else in the URL is a search or filter. */
const NON_FILTER_KEYS = new Set(["page", "pageSize", "sort", "tab"])

/** Tells "nothing matches your filters" (with a way out) apart from "nothing here yet". */
export function DataTableEmpty({ emptyState }: { emptyState?: ReactNode }) {
  const { searchParams, setParams } = useListQuery()
  const filterKeys = [...searchParams.keys()].filter((key) => !NON_FILTER_KEYS.has(key))

  if (filterKeys.length === 0) {
    return (
      emptyState ?? (
        <EmptyState
          title="Nothing here yet"
          description="Records will appear here as they are added."
        />
      )
    )
  }

  return (
    <EmptyState
      icon={SearchX}
      title="No results"
      description="Nothing matches your search and filters."
      action={
        <Button
          variant="outline"
          onClick={() => setParams(Object.fromEntries(filterKeys.map((key) => [key, null])))}
        >
          Clear filters
        </Button>
      }
    />
  )
}
