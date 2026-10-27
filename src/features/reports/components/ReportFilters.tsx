"use client"

import { FilterBar, type FilterConfig } from "@/components/ui/FilterBar"
import { CHANNEL_OPTIONS } from "@/features/orders/utils"
import type { ReportKind } from "@/features/reports/types"
import { DEFAULT_REPORT_DAYS, DIMENSION_OPTIONS, GROUP_OPTIONS } from "@/features/reports/utils"

/** Period, grouping, breakdown and (where it applies) channel; all in the URL like every list. */
export function ReportFilters({ kind }: { kind: ReportKind }) {
  const [defaultDimension, ...otherDimensions] = DIMENSION_OPTIONS[kind]
  const filters: FilterConfig[] = [
    { type: "dateRange", label: "Period", emptyLabel: `Last ${DEFAULT_REPORT_DAYS} days` },
    {
      type: "select",
      key: "group",
      label: "Group",
      options: GROUP_OPTIONS.filter((option) => option.value !== "week"),
      allLabel: "By week",
    },
    {
      type: "select",
      key: "dimension",
      label: "Breakdown",
      options: otherDimensions,
      allLabel: defaultDimension?.label,
    },
  ]
  if (kind === "sales" || kind === "customers") {
    filters.push({ type: "select", key: "channel", label: "Channel", options: CHANNEL_OPTIONS })
  }
  return <FilterBar searchPlaceholder="Search the breakdown" filters={filters} />
}
