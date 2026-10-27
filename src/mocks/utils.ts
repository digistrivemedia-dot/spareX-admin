import "server-only"

import type { IsoDate, IsoDateTime, ListParams, Paginated } from "@/lib/types"

/**
 * Keeps demo data in memory for the life of the server process. Stored on `globalThis` so edits made in the demo
 * survive hot reloads in development.
 */
const store = globalThis as typeof globalThis & { __sparexDemoData?: Map<string, unknown> }

export function persistent<T>(key: string, seed: () => T): T {
  store.__sparexDemoData ??= new Map()
  if (!store.__sparexDemoData.has(key)) store.__sparexDemoData.set(key, seed())
  return store.__sparexDemoData.get(key) as T
}

/** Makes mock calls feel like network calls so loading states are visible in the demo. */
export function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

/** Demo dates are relative to today so the data always looks current. */
export function daysAgo(days: number, hour = 11, minute = 0): IsoDateTime {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export function daysFromNow(days: number): IsoDate {
  return daysAgo(-days).slice(0, 10)
}

export function dateOnly(value: IsoDateTime): IsoDate {
  return value.slice(0, 10)
}

/** Small deterministic random generator so the demo data is the same on every start. */
export function seededRandom(seed: number) {
  let state = seed
  const next = () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T,
  }
}

export type QueryOptions<T> = {
  /** Text the `q` search matches against. */
  searchText?: (row: T) => string
  /** How each URL filter key matches a row. */
  filters?: Record<string, (row: T, value: string) => boolean>
  /** Values used for each sortable field. */
  sortValues?: Record<string, (row: T) => string | number | boolean | null>
  /** The date the `from` / `to` range applies to. */
  date?: (row: T) => IsoDateTime
}

function inDateRange(value: IsoDateTime, from?: IsoDate, to?: IsoDate): boolean {
  const day = value.slice(0, 10)
  return (!from || day >= from) && (!to || day <= to)
}

/** Searches, filters and sorts like the real API will; returns every match (used by lists and CSV exports). */
export function filterRows<T>(rows: T[], params: ListParams, options: QueryOptions<T>): T[] {
  const q = params.q?.toLowerCase()
  let result = rows.filter((row) => {
    if (q && options.searchText && !options.searchText(row).toLowerCase().includes(q)) return false
    if (options.date && !inDateRange(options.date(row), params.from, params.to)) return false
    return Object.entries(params.filters).every(([key, value]) => {
      const match = options.filters?.[key]
      return match ? match(row, value) : true
    })
  })

  const sortValue = params.sort && options.sortValues?.[params.sort.field]
  if (params.sort && sortValue) {
    const direction = params.sort.direction === "asc" ? 1 : -1
    result = [...result].sort((a, b) => {
      const left = sortValue(a) ?? ""
      const right = sortValue(b) ?? ""
      return left < right ? -direction : left > right ? direction : 0
    })
  }
  return result
}

function paginate<T>(rows: T[], { page, pageSize }: ListParams): Paginated<T> {
  const start = (page - 1) * pageSize
  return { items: rows.slice(start, start + pageSize), page, pageSize, total: rows.length }
}

export function queryList<T>(
  rows: T[],
  params: ListParams,
  options: QueryOptions<T>,
): Paginated<T> {
  return paginate(filterRows(rows, params, options), params)
}

/** A list endpoint and its unpaginated twin (used by CSV export), sharing one set of query rules. */
export function listEndpoint<T>(rows: () => T[], options: QueryOptions<T>) {
  return {
    list: async (params: ListParams) => {
      await delay()
      return queryList(rows(), params, options)
    },
    all: async (params: ListParams) => {
      await delay()
      return filterRows(rows(), params, options)
    },
  }
}

/** A copy without one property, e.g. a list row without its heavy detail. */
export function omit<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  const copy = { ...value }
  delete copy[key]
  return copy
}
