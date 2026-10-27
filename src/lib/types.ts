/** Shapes shared by every feature. They mirror what the backend API returns. */

/** Money is always integer paise (₹1 = 100). */
export type Paise = number

/** ISO 8601 date-time string, e.g. "2026-10-12T11:00:00.000Z". */
export type IsoDateTime = string

/** Calendar date without time, e.g. "2026-10-12". */
export type IsoDate = string

export type Channel = "b2c" | "b2b"

export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export type ActionResult<T = void> =
  { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export type SortDirection = "asc" | "desc"

/** Everything a list screen sends to the server. Built from the URL by `parseListParams`. */
export type ListParams = {
  page: number
  pageSize: number
  q?: string
  sort?: { field: string; direction: SortDirection }
  from?: IsoDate
  to?: IsoDate
  filters: Record<string, string>
}

export type Address = {
  id: string
  label?: string
  name: string
  phone: string
  line1: string
  line2?: string
  landmark?: string
  city: string
  state: string
  pincode: string
  isDefault?: boolean
}

export type GeoPoint = { lat: number; lng: number }

/** A compact reference to the person or company on the other side of a record. */
export type PartyRef = {
  type: "customer" | "business"
  id: string
  name: string
  phone: string
  email?: string
}

/** Who performed an action: an admin, the customer, a business user or the system. */
export type ActorRef = {
  type: "admin" | "customer" | "business" | "garage" | "system"
  id: string
  name: string
}

export type Attachment = {
  id: string
  name: string
  url: string
  mimeType: "application/pdf" | "image/jpeg" | "image/png"
  sizeBytes: number
}

/** One step in a record's history (orders, returns, applications, bookings…). */
export type TimelineEvent<TStatus extends string = string> = {
  status: TStatus
  at: IsoDateTime
  by: ActorRef
  note?: string
}

/** What a server action hands a feature API: the token for the backend and the admin for the audit log. */
export type RequestContext = {
  token: string
  actor: ActorRef
}
