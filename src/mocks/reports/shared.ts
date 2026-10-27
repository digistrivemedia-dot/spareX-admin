import "server-only"

import type {
  ReportColumn,
  ReportGrouping,
  ReportQuery,
  ReportSeries,
  ReportTable,
} from "@/features/reports/types"
import { formatDate } from "@/lib/format"
import { dateOnly } from "@/mocks/utils"

export const sum = <T>(rows: T[], value: (row: T) => number) =>
  rows.reduce((total, row) => total + value(row), 0)

export const inRange = (timestamp: string, query: ReportQuery) => {
  const day = dateOnly(timestamp)
  return day >= query.from && day <= query.to
}

/** The start of the period a day falls in, as a sortable key. */
function periodKey(day: string, group: ReportGrouping): string {
  if (group === "day") return day
  if (group === "month") return day.slice(0, 7)
  if (group === "year") return day.slice(0, 4)
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7))
  return date.toISOString().slice(0, 10)
}

function periodLabel(key: string, group: ReportGrouping): string {
  if (group === "year") return key
  if (group === "month") {
    return new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
  }
  const short = formatDate(key).replace(/ \d{4}$/, "")
  return group === "week" ? `w/c ${short}` : short
}

/**
 * Totals per period across the whole range, including empty periods, so a chart shows gaps as zero bars.
 * `value` returns the series key and amount for a record, or null to skip it.
 */
export function buildSeries<T>(
  rows: T[],
  query: ReportQuery,
  date: (row: T) => string,
  keys: ReportSeries["keys"],
  format: ReportSeries["format"],
  value: (row: T) => { key: string; amount: number } | null,
): ReportSeries {
  const totals = new Map<string, Record<string, number>>()
  for (
    let day = new Date(`${query.from}T00:00:00Z`);
    day.toISOString().slice(0, 10) <= query.to;
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    const key = periodKey(day.toISOString().slice(0, 10), query.group)
    if (!totals.has(key)) totals.set(key, Object.fromEntries(keys.map(({ key }) => [key, 0])))
  }
  for (const row of rows) {
    const entry = value(row)
    const bucket = totals.get(periodKey(dateOnly(date(row)), query.group))
    if (entry && bucket) bucket[entry.key] = (bucket[entry.key] ?? 0) + entry.amount
  }
  return {
    format,
    keys,
    points: [...totals].map(([key, values]) => ({ label: periodLabel(key, query.group), values })),
  }
}

/** Groups records into table rows, adding up each column; sorted by the first column, largest first. */
export function breakdown<T>(
  records: T[],
  group: (record: T) => { id: string; name: string; detail?: string } | null,
  columns: ReportColumn[],
  values: (record: T) => Record<string, number>,
  query: ReportQuery,
): ReportTable["rows"] {
  const rows = new Map<string, ReportTable["rows"][number]>()
  for (const record of records) {
    const key = group(record)
    if (!key) continue
    const row = rows.get(key.id) ?? { ...key, values: {} }
    for (const [column, amount] of Object.entries(values(record))) {
      row.values[column] = (row.values[column] ?? 0) + amount
    }
    rows.set(key.id, row)
  }
  const first = columns[0]?.key ?? ""
  const search = query.q.trim().toLowerCase()
  return [...rows.values()]
    .filter((row) => !search || row.name.toLowerCase().includes(search))
    .sort((a, b) => (b.values[first] ?? 0) - (a.values[first] ?? 0))
}

/** Adds a "share of total" percentage column from another column. */
export function withShare(rows: ReportTable["rows"], of: string): ReportTable["rows"] {
  const total = sum(rows, (row) => row.values[of] ?? 0)
  return rows.map((row) => ({
    ...row,
    values: {
      ...row.values,
      share: total ? Math.round(((row.values[of] ?? 0) / total) * 1000) / 10 : 0,
    },
  }))
}
