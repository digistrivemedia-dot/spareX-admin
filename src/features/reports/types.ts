import type { IsoDate } from "@/lib/types"

export type ReportKind = "sales" | "service" | "customers" | "vehicles"

export type ReportGrouping = "day" | "week" | "month" | "year"

/** How a number is shown: money in paise, a plain count, or a percentage. */
export type ReportFormat = "money" | "count" | "percent"

/** What the admin asked for; every field lives in the URL. */
export type ReportQuery = {
  from: IsoDate
  to: IsoDate
  group: ReportGrouping
  /** The breakdown, e.g. "category" for sales by category. */
  dimension: string
  channel: "b2c" | "b2b" | null
  /** Narrows the breakdown rows by name. */
  q: string
}

export type ReportStat = { label: string; value: number; format: ReportFormat; hint?: string }

export type ReportSeries = {
  format: ReportFormat
  /** Each key is one bar in a period, e.g. B2C and B2B. */
  keys: { key: string; label: string }[]
  points: { label: string; values: Record<string, number> }[]
}

export type ReportColumn = { key: string; label: string; format: ReportFormat }

export type ReportTable = {
  title: string
  description?: string
  columns: ReportColumn[]
  rows: { id: string; name: string; detail?: string; values: Record<string, number> }[]
}

/** Every report has the same shape, so one view renders them all. */
export type Report = {
  stats: ReportStat[]
  chartTitle: string
  series: ReportSeries
  table: ReportTable
  /** A second table where a report needs one (fitment gaps on the vehicle report). */
  extraTable?: ReportTable
}
