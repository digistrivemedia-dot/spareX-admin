"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { useListQuery } from "@/lib/use-list-query"
import { cn } from "@/lib/utils"

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
  className?: string
}

/** A header that sorts the list through the URL: none → ascending → descending → none. */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { searchParams, setParams } = useListQuery()
  if (!column.getCanSort()) return <span className={className}>{title}</span>

  const [field, direction] = searchParams.get("sort")?.split(".") ?? []
  const current = field === column.id ? direction : undefined
  const next = current === undefined ? "asc" : current === "asc" ? "desc" : null
  const Icon = current === "asc" ? ArrowUp : current === "desc" ? ArrowDown : ChevronsUpDown

  return (
    <button
      type="button"
      onClick={() => setParams({ sort: next ? `${column.id}.${next}` : null })}
      className={cn(
        "-mx-2 inline-flex h-8 items-center gap-1 rounded-md px-2 font-medium hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        current && "text-gray-900",
        className,
      )}
      aria-label={`Sort by ${title}`}
    >
      {title}
      <Icon aria-hidden className={cn("size-3.5", !current && "text-gray-400")} />
    </button>
  )
}
