/**
 * Where each feature reads its data from. "mock" uses the in-memory demo data in `src/mocks/`; "api" calls the
 * backend through `lib/api-client.ts`. Flip one feature at a time as its backend endpoints go live.
 */
export type DataSource = "mock" | "api"

export const dataSource = {
  auth: "mock",
  audit: "mock",
  dashboard: "mock",
  adminUsers: "mock",
  masters: "mock",
  catalog: "mock",
  customers: "mock",
  vehicles: "mock",
  businesses: "mock",
  garages: "mock",
  orders: "mock",
  returns: "mock",
  creditNotes: "mock",
  quotations: "mock",
  bookings: "mock",
  jobCards: "mock",
  content: "mock",
  coupons: "mock",
  enquiries: "mock",
  reviews: "mock",
  reports: "mock",
  settings: "mock",
} as const satisfies Record<string, DataSource>

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
