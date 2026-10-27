"use client"

import { format, parseISO } from "date-fns"
import { CalendarDays } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/lib/format"
import { useListQuery } from "@/lib/use-list-query"

/** Date range kept in the URL as `from` and `to` (yyyy-mm-dd). `emptyLabel` describes what no range means. */
export function DateRangeFilter({
  label = "Date",
  emptyLabel = "Any time",
}: {
  label?: string
  emptyLabel?: string
}) {
  const { searchParams, setParams } = useListQuery()
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const selected: DateRange | undefined = from
    ? { from: parseISO(from), to: to ? parseISO(to) : undefined }
    : undefined

  const summary = from
    ? `${formatDate(from)}${to && to !== from ? ` – ${formatDate(to)}` : ""}`
    : emptyLabel

  function select(range: DateRange | undefined) {
    setParams({
      from: range?.from ? format(range.from, "yyyy-MM-dd") : null,
      to: range?.to ? format(range.to, "yyyy-MM-dd") : null,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal sm:w-auto">
          <CalendarDays aria-hidden className="text-gray-500" />
          <span className="text-gray-500">{label}:</span>
          <span className="text-gray-900">{summary}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={select}
          numberOfMonths={1}
          disabled={{ after: new Date() }}
        />
        {from && (
          <div className="border-t border-gray-200 p-2">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => select(undefined)}>
              Clear dates
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
