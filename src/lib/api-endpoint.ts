import "server-only"

import { apiClient } from "@/lib/api-client"
import type { DataSource } from "@/lib/config"
import { listParamsToQuery } from "@/lib/list-params"
import type { ListParams, Paginated } from "@/lib/types"

type MockListEndpoint<T> = {
  list: (params: ListParams) => Promise<Paginated<T>>
  all: (params: ListParams) => Promise<T[]>
}

/**
 * A list's paginated endpoint and its unpaginated twin for CSV export (`<path>/all`), switching between the demo
 * data and the backend with the feature's data source.
 */
export function listEndpoint<T>(source: DataSource, path: string, mock: MockListEndpoint<T>) {
  return {
    list: (token: string, params: ListParams): Promise<Paginated<T>> =>
      source === "mock"
        ? mock.list(params)
        : apiClient.get(path, { token, query: listParamsToQuery(params) }),
    all: (token: string, params: ListParams): Promise<T[]> =>
      source === "mock"
        ? mock.all(params)
        : apiClient.get(`${path}/all`, { token, query: listParamsToQuery(params) }),
  }
}
