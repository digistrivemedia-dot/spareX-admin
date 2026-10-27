import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/constants"
import type { ListParams, SortDirection } from "@/lib/types"

/** What Next.js passes to a page as `searchParams`. */
export type SearchParams = Record<string, string | string[] | undefined>

type ListOptions = {
  /** URL keys this list accepts as filters (e.g. ["status", "channel"]). Anything else is ignored. */
  filterKeys?: readonly string[]
  defaultSort?: ListParams["sort"]
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

function first(value: string | string[] | undefined): string | undefined {
  const text = Array.isArray(value) ? value[0] : value
  return text?.trim() || undefined
}

/** The URL is the source of truth for list state; this turns it into validated `ListParams`. */
export function parseListParams(
  searchParams: SearchParams,
  { filterKeys = [], defaultSort }: ListOptions = {},
): ListParams {
  const page = Math.max(1, Number.parseInt(first(searchParams.page) ?? "1", 10) || 1)
  const requestedSize = Number.parseInt(first(searchParams.pageSize) ?? "", 10)
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(requestedSize)
    ? requestedSize
    : DEFAULT_PAGE_SIZE

  const [field, direction] = first(searchParams.sort)?.split(".") ?? []
  const sort =
    field && (direction === "asc" || direction === "desc")
      ? { field, direction: direction as SortDirection }
      : defaultSort

  const from = first(searchParams.from)
  const to = first(searchParams.to)

  const filters: Record<string, string> = {}
  for (const key of filterKeys) {
    const value = first(searchParams[key])
    if (value) filters[key] = value
  }

  return {
    page,
    pageSize,
    q: first(searchParams.q),
    sort,
    from: from && DATE.test(from) ? from : undefined,
    to: to && DATE.test(to) ? to : undefined,
    filters,
  }
}

/** Flattens `ListParams` back into query-string values, for the API client and CSV exports. */
export function listParamsToQuery(params: ListParams): Record<string, string | number | undefined> {
  return {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    sort: params.sort ? `${params.sort.field}.${params.sort.direction}` : undefined,
    from: params.from,
    to: params.to,
    ...params.filters,
  }
}

/** `parseListParams` for a query string, as CSV export actions receive the list's current URL query. */
export function listParamsFromQuery(query: string, filterKeys: readonly string[]): ListParams {
  return parseListParams(Object.fromEntries(new URLSearchParams(query)), { filterKeys })
}
