import type { FilterOption } from "@/components/ui/FilterSelect"
import type {
  ReportFormat,
  ReportGrouping,
  ReportKind,
  ReportQuery,
} from "@/features/reports/types"
import { formatNumber, formatPercent, formatPrice } from "@/lib/format"

/** Reports open on the last 90 days, grouped by week. */
export const DEFAULT_REPORT_DAYS = 90

export const REPORT_TABS: { id: ReportKind; label: string; description: string }[] = [
  {
    id: "sales",
    label: "Sales",
    description: "Parts sales incl. GST, excluding cancelled orders.",
  },
  {
    id: "service",
    label: "Service",
    description: "Bookings, completed and cancelled work, and job value by garage.",
  },
  {
    id: "customers",
    label: "Customers",
    description: "New, active and repeat customers, and lifetime spend.",
  },
  {
    id: "vehicles",
    label: "Vehicles",
    description: "Vehicles on the platform, service frequency, spend and fitment gaps.",
  },
]

export const GROUP_OPTIONS: FilterOption[] = (
  ["day", "week", "month", "year"] satisfies ReportGrouping[]
).map((value) => ({ value, label: `By ${value}` }))

/** The breakdowns each report offers; the first is the default. */
export const DIMENSION_OPTIONS: Record<ReportKind, FilterOption[]> = {
  sales: [
    { value: "category", label: "By category" },
    { value: "brand", label: "By part brand" },
    { value: "product", label: "By product" },
    { value: "channel", label: "By channel" },
  ],
  service: [
    { value: "garage", label: "By garage" },
    { value: "service", label: "By service" },
    { value: "vehicleType", label: "By vehicle type" },
  ],
  customers: [
    { value: "customer", label: "Top customers" },
    { value: "type", label: "B2C and B2B" },
  ],
  vehicles: [
    { value: "type", label: "By vehicle type" },
    { value: "brand", label: "By brand" },
    { value: "model", label: "By model" },
  ],
}

const GROUPINGS = ["day", "week", "month", "year"]

/** Reads a report's filters from the URL, filling in the defaults. */
export function parseReportQuery(kind: ReportKind, params: URLSearchParams): ReportQuery {
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - (DEFAULT_REPORT_DAYS - 1))
  const day = (date: Date) => date.toISOString().slice(0, 10)
  const dimensions = DIMENSION_OPTIONS[kind].map((option) => option.value)
  const group = params.get("group") ?? ""
  const dimension = params.get("dimension") ?? ""
  const channel = params.get("channel")
  return {
    from: params.get("from") ?? day(start),
    to: params.get("to") ?? day(today),
    group: (GROUPINGS.includes(group) ? group : "week") as ReportGrouping,
    dimension: dimensions.includes(dimension) ? dimension : (dimensions[0] ?? ""),
    channel: channel === "b2c" || channel === "b2b" ? channel : null,
    q: params.get("q") ?? "",
  }
}

/** Next.js page `searchParams` as URLSearchParams (repeated keys keep their first value). */
export function toSearchParams(record: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(record)) {
    const first = Array.isArray(value) ? value[0] : value
    if (first) params.set(key, first)
  }
  return params
}

export function formatReportValue(value: number, format: ReportFormat): string {
  // Report totals are read at a glance, so money is rounded to the rupee (the CSV keeps paise).
  if (format === "money") return formatPrice(Math.round(value / 100) * 100)
  if (format === "percent") return formatPercent(value)
  return formatNumber(value)
}
