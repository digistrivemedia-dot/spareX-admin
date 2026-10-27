import type { ActivityItem } from "@/components/layout/ActivityTimeline"
import type { AuditAction, AuditEntity, AuditEntry } from "@/features/audit/types"
import type { FilterOption } from "@/components/ui/FilterSelect"
import type { CsvColumn } from "@/lib/csv"
import { formatDateTime, humanize } from "@/lib/format"

/** URL filters on the "My activity" list (the actor is always the signed-in admin). */
export const MY_ACTIVITY_FILTERS = ["action", "entity"] as const
export const AUDIT_LOG_FILTERS = ["entity", "action", "actor"] as const

/** The audit log as CSV, shared by the full log and "My activity". */
export const AUDIT_CSV_COLUMNS: CsvColumn<AuditEntry>[] = [
  { header: "When", value: (entry) => formatDateTime(entry.at) },
  { header: "Who", value: (entry) => entry.actor.name },
  { header: "Action", value: (entry) => humanize(entry.action) },
  { header: "Record type", value: (entry) => humanize(entry.entity) },
  { header: "Record", value: (entry) => entry.entityLabel },
  { header: "Summary", value: (entry) => entry.summary },
  {
    header: "Changes",
    value: (entry) =>
      entry.changes.map((c) => `${c.field}: ${c.before ?? "–"} → ${c.after ?? "–"}`).join("; "),
  },
]

const ACTIONS: AuditAction[] = [
  "create",
  "update",
  "delete",
  "status_change",
  "approve",
  "reject",
  "export",
  "import",
  "sign_in",
]

const ENTITIES: AuditEntity[] = [
  "product",
  "price",
  "fitment",
  "stock",
  "order",
  "return",
  "payment",
  "credit",
  "credit_note",
  "quotation",
  "business",
  "application",
  "garage",
  "booking",
  "customer",
  "vehicle",
  "master",
  "content",
  "coupon",
  "enquiry",
  "review",
  "admin_user",
  "settings",
  "report",
]

export const AUDIT_ACTION_OPTIONS: FilterOption[] = ACTIONS.map((value) => ({
  value,
  label: humanize(value),
}))
export const AUDIT_ENTITY_OPTIONS: FilterOption[] = ENTITIES.map((value) => ({
  value,
  label: humanize(value),
}))

const RECORD_PATHS: Partial<Record<AuditEntity, string>> = {
  product: "/products",
  price: "/products",
  fitment: "/products",
  stock: "/products",
  order: "/orders",
  payment: "/orders",
  return: "/returns",
  credit: "/credit",
  credit_note: "/credit-notes",
  quotation: "/quotations",
  business: "/businesses",
  application: "/applications",
  garage: "/garages",
  booking: "/bookings",
  customer: "/customers",
  vehicle: "/vehicles",
  coupon: "/coupons",
  enquiry: "/enquiries",
}

/** Content records are told apart by their id prefix. */
function contentHref(entityId: string): string {
  if (entityId.startsWith("ban_")) return "/content/banners"
  if (entityId.startsWith("featured_")) return "/content/featured"
  if (entityId.startsWith("faq_")) return "/content/pages?tab=faq"
  if (entityId.startsWith("page_")) return `/content/pages/${entityId}`
  return "/content/pages"
}

/** Where an audit entry's record lives in the panel, or null when there is no single record to open. */
export function auditRecordHref(entity: AuditEntity, entityId: string): string | null {
  if (!entityId) return null
  if (entity === "content") return contentHref(entityId)
  if (entity === "master") {
    return entityId.startsWith("vm_") ? `/masters/vehicle-models/${entityId}` : "/masters"
  }
  if (entity === "review") return "/reviews"
  // Admin users are edited in a dialog on the list, so there is no page per admin.
  if (entity === "admin_user") return "/admin-users"
  if (entity === "settings") return "/settings"
  if (entity === "report") return "/reports"
  const base = RECORD_PATHS[entity]
  return base ? `${base}/${entityId}` : null
}

/** Audit entries as the items of a record's activity timeline. */
export function toActivityItems(entries: AuditEntry[]): ActivityItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    at: entry.at,
    actor: entry.actor,
    title: entry.summary,
    detail:
      entry.changes
        .map((change) => `${change.field}: ${change.before ?? "–"} → ${change.after ?? "–"}`)
        .join("; ") || undefined,
  }))
}
