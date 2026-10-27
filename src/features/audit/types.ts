import type { ActorRef, IsoDateTime } from "@/lib/types"

/** Every kind of record whose changes are audited (§3). */
export type AuditEntity =
  | "product"
  | "price"
  | "fitment"
  | "stock"
  | "order"
  | "return"
  | "payment"
  | "credit"
  | "credit_note"
  | "quotation"
  | "business"
  | "application"
  | "garage"
  | "booking"
  | "customer"
  | "vehicle"
  | "master"
  | "content"
  | "coupon"
  | "enquiry"
  | "review"
  | "admin_user"
  | "settings"
  | "report"

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "approve"
  | "reject"
  | "export"
  | "import"
  | "sign_in"

export type AuditChange = {
  field: string
  before: string | null
  after: string | null
}

export type AuditEntry = {
  id: string
  at: IsoDateTime
  actor: ActorRef
  action: AuditAction
  entity: AuditEntity
  /** Empty for actions that are not about one record, such as an export. */
  entityId: string
  entityLabel: string
  summary: string
  changes: AuditChange[]
}

/** What a feature passes when it records an audit entry; the actor and time are added by the audit service. */
export type AuditInput = Omit<AuditEntry, "id" | "at" | "actor">
