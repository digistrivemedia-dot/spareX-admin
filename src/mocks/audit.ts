import "server-only"

import type {
  AuditAction,
  AuditChange,
  AuditEntity,
  AuditEntry,
  AuditInput,
} from "@/features/audit/types"
import { formatPrice, humanize } from "@/lib/format"
import type { ActorRef, ListParams, Paginated } from "@/lib/types"
import { adminUsers } from "@/mocks/admin-users"
import { applications } from "@/mocks/businesses"
import { products, stockAdjustments } from "@/mocks/catalog"
import { orders } from "@/mocks/orders"
import { returns } from "@/mocks/returns"
import {
  daysAgo,
  delay,
  filterRows,
  newId,
  persistent,
  queryList,
  type QueryOptions,
} from "@/mocks/utils"

function admin(id: string): ActorRef {
  const user = adminUsers.find((candidate) => candidate.id === id)
  return { type: "admin", id, name: user?.name ?? id }
}

/** [days ago, hour, admin id, action, entity, record id, record label, summary, changes] */
type AuditSeed = [
  number,
  number,
  string,
  AuditAction,
  AuditEntity,
  string,
  string,
  string,
  AuditChange[],
]

const change = (field: string, before: string | null, after: string | null): AuditChange => ({
  field,
  before,
  after,
})

const MANUAL: AuditSeed[] = [
  [
    1,
    10,
    "adm_kiran",
    "update",
    "price",
    "prd_002",
    "Motul 3100 Gold 4T 10W-30, 1 L",
    "Changed B2C price",
    [change("B2C price", formatPrice(47_900), formatPrice(45_900))],
  ],
  [
    3,
    12,
    "adm_meera",
    "update",
    "price",
    "prd_032",
    "Amaron Go 35L 35Ah Car Battery",
    "Changed MRP and B2C price",
    [
      change("MRP", formatPrice(479_000), formatPrice(495_000)),
      change("B2C price", formatPrice(439_900), formatPrice(449_900)),
    ],
  ],
  [
    9,
    15,
    "adm_kiran",
    "update",
    "price",
    "prd_041",
    "MRF ZLX 185/65 R15 Car Tyre",
    "Changed B2C price",
    [change("B2C price", formatPrice(529_900), formatPrice(515_000))],
  ],
  [
    18,
    11,
    "adm_suresh",
    "update",
    "price",
    "prd_045",
    "Philips HS1 12V 35/35W Headlamp Bulb",
    "Changed B2C price",
    [change("B2C price", formatPrice(24_900), formatPrice(22_900))],
  ],
  [
    5,
    16,
    "adm_meera",
    "create",
    "product",
    "prd_062",
    "Steelbird SBH-34 Full Face Helmet",
    "Added product",
    [],
  ],
  [
    12,
    14,
    "adm_meera",
    "create",
    "product",
    "prd_040",
    "TVS Eurogrip Conti Grip 90/90-12 Tubeless Tyre",
    "Added product",
    [],
  ],
  [
    6,
    10,
    "adm_kiran",
    "update",
    "product",
    "prd_047",
    "Uno Minda Universal Indicator Set (pair)",
    "Deactivated product",
    [change("Active", "Yes", "No")],
  ],
  [
    2,
    17,
    "adm_meera",
    "update",
    "fitment",
    "prd_040",
    "TVS Eurogrip Conti Grip 90/90-12 Tubeless Tyre",
    "Added fitment for 3 models",
    [change("Fitment", "0 vehicles", "TVS iQube, Bajaj Chetak, Hero Vida V1")],
  ],
  [
    8,
    13,
    "adm_kiran",
    "update",
    "fitment",
    "prd_006",
    "Castrol Magnatec 5W-30 Diesel, 3.5 L",
    "Copied fitment from another product",
    [change("Fitment", "2 vehicles", "6 vehicles")],
  ],
  [
    20,
    12,
    "adm_suresh",
    "import",
    "fitment",
    "",
    "fitment-october.csv",
    "Imported fitment from CSV (48 rows, 2 skipped)",
    [],
  ],
  [
    4,
    15,
    "adm_priya",
    "update",
    "credit",
    "cr_003",
    "Lakshmi Auto Spares",
    "Put credit on hold",
    [change("Status", "Active", "On hold")],
  ],
  [
    14,
    11,
    "adm_priya",
    "update",
    "credit",
    "cr_004",
    "Vinayaka Motors",
    "Changed credit limit and terms",
    [
      change("Limit", formatPrice(30_000_000), formatPrice(40_000_000)),
      change("Terms", "Net 30", "Net 45"),
    ],
  ],
  [
    40,
    15,
    "adm_priya",
    "update",
    "credit",
    "cr_005",
    "Udupi Logistics",
    "Recorded payment",
    [change("Outstanding", formatPrice(5_230_000), formatPrice(0))],
  ],
  [
    7,
    12,
    "adm_ravi",
    "update",
    "business",
    "bus_007",
    "Speedline Moto Spares",
    "Put account on hold",
    [change("Status", "Active", "On hold")],
  ],
  [
    22,
    10,
    "adm_kiran",
    "update",
    "business",
    "bus_003",
    "Lakshmi Auto Spares",
    "Changed discount",
    [change("Discount", "12%", "15%")],
  ],
  [
    24,
    16,
    "adm_ravi",
    "status_change",
    "garage",
    "gar_007",
    "Silk Board Car Care",
    "Switched garage live",
    [change("Status", "Not live", "Live")],
  ],
  [
    26,
    11,
    "adm_kiran",
    "update",
    "garage",
    "gar_008",
    "QuickFix Auto Care",
    "Checked go-live checklist: services and hours missing",
    [],
  ],
  [
    2,
    9,
    "adm_kiran",
    "status_change",
    "booking",
    "bk_025",
    "BK-2025",
    "Cancelled booking",
    [change("Status", "Pending", "Cancelled")],
  ],
  [
    3,
    11,
    "adm_meera",
    "update",
    "content",
    "ban_5",
    "Mysuru deliveries announcement",
    "Switched banner off",
    [change("Active", "Yes", "No")],
  ],
  [
    10,
    15,
    "adm_meera",
    "update",
    "content",
    "page_return-policy",
    "Return and refund policy",
    "Edited page",
    [change("Sections", "2", "3")],
  ],
  [
    11,
    12,
    "adm_meera",
    "create",
    "content",
    "ban_3",
    "Free pick and drop on your next service",
    "Added banner",
    [],
  ],
  [16, 10, "adm_suresh", "create", "coupon", "cpn_2", "OIL150", "Created coupon", []],
  [
    6,
    14,
    "adm_suresh",
    "update",
    "review",
    "rev_006",
    "Review of Royal Riders Garage",
    "Hid review",
    [change("Status", "Published", "Hidden")],
  ],
  [
    30,
    10,
    "adm_meera",
    "create",
    "master",
    "vm_royal-enfield-himalayan-450",
    "Royal Enfield Himalayan 450",
    "Added vehicle model",
    [],
  ],
  [
    33,
    16,
    "adm_kiran",
    "update",
    "master",
    "sv_pre-purchase-inspection",
    "Pre-purchase inspection",
    "Edited service description",
    [],
  ],
  [
    9,
    12,
    "adm_suresh",
    "update",
    "enquiry",
    "enq_005",
    "ENQ-505",
    "Replied and resolved",
    [change("Status", "In progress", "Resolved")],
  ],
  [
    1,
    16,
    "adm_kiran",
    "update",
    "payment",
    "ord_033",
    "SPX-10433",
    "Marked paid by bank transfer",
    [change("Payment", "Pending", "Paid (UTR SBIN0322648819)")],
  ],
  [
    26,
    13,
    "adm_suresh",
    "update",
    "payment",
    "ord_038",
    "SPX-10438",
    "Marked paid in cash",
    [change("Payment", "Pending", "Paid (Receipt 2237)")],
  ],
  [
    45,
    10,
    "adm_ravi",
    "create",
    "admin_user",
    "adm_suresh",
    "Suresh Reddy",
    "Invited admin user",
    [],
  ],
  [
    40,
    17,
    "adm_ravi",
    "update",
    "admin_user",
    "adm_ananya",
    "Ananya Bhat",
    "Deactivated admin user",
    [change("Status", "Active", "Inactive")],
  ],
  [2, 18, "adm_kiran", "export", "order", "", "Orders", "Exported orders to CSV (41 rows)", []],
  [
    12,
    11,
    "adm_priya",
    "export",
    "credit",
    "",
    "Credit accounts",
    "Exported credit accounts to CSV (5 rows)",
    [],
  ],
  [
    21,
    15,
    "adm_meera",
    "export",
    "product",
    "",
    "Products",
    "Exported products to CSV (63 rows)",
    [],
  ],
]

function seedEntries(): AuditEntry[] {
  const manual: AuditEntry[] = MANUAL.map(
    ([days, hour, actorId, action, entity, entityId, entityLabel, summary, changes], index) => ({
      id: `aud_m${index + 1}`,
      at: daysAgo(days, hour, (index * 7) % 60),
      actor: admin(actorId),
      action,
      entity,
      entityId,
      entityLabel,
      summary,
      changes,
    }),
  )

  const orderChanges: AuditEntry[] = orders
    .flatMap((order) =>
      order.timeline
        .slice(1)
        .filter((event) => event.by.type === "admin")
        .map((event, i) => {
          const before = order.timeline[order.timeline.indexOf(event) - 1]?.status ?? "placed"
          return {
            id: `aud_${order.id}_${i}`,
            at: event.at,
            actor: event.by,
            action: "status_change" as const,
            entity: "order" as const,
            entityId: order.id,
            entityLabel: order.number,
            summary:
              event.status === "shipped" && order.shipment
                ? `Marked shipped with ${order.shipment.courier}`
                : `Changed status to ${humanize(event.status).toLowerCase()}`,
            changes: [change("Status", humanize(before), humanize(event.status))],
          }
        }),
    )
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 14)

  const returnChanges: AuditEntry[] = returns.flatMap((item) =>
    item.timeline
      .filter((event) => event.by.type === "admin")
      .slice(0, 1)
      .map((event) => ({
        id: `aud_${item.id}`,
        at: event.at,
        actor: event.by,
        action: event.status === "rejected" ? ("reject" as const) : ("approve" as const),
        entity: "return" as const,
        entityId: item.id,
        entityLabel: item.number,
        summary: event.status === "rejected" ? "Rejected return" : `Approved ${item.kind}`,
        changes: [change("Status", "Requested", humanize(event.status))],
      })),
  )

  const applicationChanges: AuditEntry[] = applications.flatMap((application) =>
    application.history
      .slice(-1)
      .filter((event) => event.by.type === "admin")
      .map((event) => ({
        id: `aud_${application.id}`,
        at: event.at,
        actor: event.by,
        action:
          event.status === "approved"
            ? ("approve" as const)
            : event.status === "rejected"
              ? ("reject" as const)
              : ("status_change" as const),
        entity: "application" as const,
        entityId: application.id,
        entityLabel: application.businessName,
        summary: `${humanize(event.status)}${event.note ? `: ${event.note}` : ""}`,
        changes: [change("Status", "Submitted", humanize(event.status))],
      })),
  )

  const stockChanges: AuditEntry[] = stockAdjustments.map((adjustment) => ({
    id: `aud_${adjustment.id}`,
    at: adjustment.at,
    actor: adjustment.by,
    action: "update",
    entity: "stock",
    entityId: adjustment.productId,
    entityLabel:
      products.find((product) => product.id === adjustment.productId)?.name ?? adjustment.productId,
    summary: `Adjusted stock (${adjustment.change > 0 ? "+" : ""}${adjustment.change}): ${humanize(adjustment.reason).toLowerCase()}`,
    changes: [
      change(
        "Stock",
        String(adjustment.balanceAfter - adjustment.change),
        String(adjustment.balanceAfter),
      ),
    ],
  }))

  return [
    ...manual,
    ...orderChanges,
    ...returnChanges,
    ...applicationChanges,
    ...stockChanges,
  ].sort((a, b) => b.at.localeCompare(a.at))
}

/** Seeded lazily: other mocks call `recordAuditEntry`, and this seed reads their data. */
function entries(): AuditEntry[] {
  return persistent("audit", seedEntries)
}

/** Every mock mutation calls this, as the real backend records an entry for every change. */
export function recordAuditEntry(actor: ActorRef, input: AuditInput): AuditEntry {
  const entry: AuditEntry = { id: newId("aud"), at: new Date().toISOString(), actor, ...input }
  entries().unshift(entry)
  return entry
}

const AUDIT_QUERY: QueryOptions<AuditEntry> = {
  searchText: (entry) => `${entry.summary} ${entry.entityLabel} ${entry.actor.name}`,
  date: (entry) => entry.at,
  filters: {
    entity: (entry, value) => entry.entity === value,
    action: (entry, value) => entry.action === value,
    actor: (entry, value) => entry.actor.id === value,
    record: (entry, value) => entry.entityId === value,
  },
  sortValues: {
    at: (entry) => entry.at,
    entity: (entry) => entry.entity,
    actor: (entry) => entry.actor.name,
  },
}

export async function listAuditEntries(params: ListParams): Promise<Paginated<AuditEntry>> {
  await delay()
  return queryList(entries(), params, AUDIT_QUERY)
}

/** Every matching entry, unpaginated, for CSV export. */
export async function listAllAuditEntries(params: ListParams): Promise<AuditEntry[]> {
  await delay()
  return filterRows(entries(), params, AUDIT_QUERY)
}

function auditValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : null
  return String(value)
}

/** The fields that changed between two versions of a record, labelled for the audit log. */
export function diffChanges<T extends object>(
  before: T | null,
  after: T,
  labels: Partial<Record<keyof T, string>>,
): AuditChange[] {
  return (Object.keys(labels) as (keyof T)[]).flatMap((key) => {
    const previous = auditValue(before?.[key])
    const next = auditValue(after[key])
    return previous === next
      ? []
      : [{ field: labels[key] ?? String(key), before: previous, after: next }]
  })
}
