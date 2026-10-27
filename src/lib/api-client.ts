import { apiBaseUrl } from "@/lib/config"

/** Error thrown for any non-2xx response, carrying the backend's message and field errors. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  query?: Record<string, string | number | undefined>
  /** Session token, added as a bearer header. Passed in by `features/auth/session.ts`. */
  token?: string
}

async function request<T>(
  path: string,
  { method = "GET", body, query, token }: RequestOptions = {},
) {
  const url = new URL(`${apiBaseUrl}${path}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value))
  }

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      // FormData (file uploads) sets its own multipart content type.
      ...(body === undefined || body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      message?: string
      fieldErrors?: Record<string, string[]>
    }
    throw new ApiError(payload.message ?? response.statusText, response.status, payload.fieldErrors)
  }

  return (response.status === 204 ? undefined : await response.json()) as T
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, options),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
}
