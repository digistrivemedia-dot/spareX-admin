"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PAGE_SIZE_OPTIONS } from "@/lib/constants"
import { formatNumber } from "@/lib/format"
import { useListQuery } from "@/lib/use-list-query"

type DataTablePaginationProps = { page: number; pageSize: number; total: number }

export function DataTablePagination({ page, pageSize, total }: DataTablePaginationProps) {
  const { setParams } = useListQuery()
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-gray-500 tabular-nums">
        Showing {formatNumber(first)}–{formatNumber(last)} of {formatNumber(total)}
      </p>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span id="rows-per-page" className="text-sm text-gray-500">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setParams({ pageSize: value })}
          >
            <SelectTrigger size="sm" className="w-18" aria-labelledby="rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-gray-700 tabular-nums">
          Page {page} of {pageCount}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => setParams({ page: String(page - 1) })}
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= pageCount}
            onClick={() => setParams({ page: String(page + 1) })}
            aria-label="Next page"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  )
}
