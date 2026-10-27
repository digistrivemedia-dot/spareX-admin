import type { Order } from "@/features/orders/types"
import type { Quotation } from "@/features/quotations/types"
import type { ReturnRequest } from "@/features/returns/types"
import type {
  ActorRef,
  Address,
  Attachment,
  GeoPoint,
  IsoDate,
  IsoDateTime,
  Paise,
  TimelineEvent,
} from "@/lib/types"

export type BusinessType =
  "garage_workshop" | "fleet_operator" | "dealer" | "parts_retailer" | "reseller" | "corporate"

export type ApplicationStatus = "submitted" | "under_review" | "approved" | "sent_back" | "rejected"

export type BusinessDocumentType = "gst_certificate" | "pan_card" | "trade_licence" | "shop_photo"

export type BusinessDocument = Attachment & { type: BusinessDocumentType }

export type BusinessApplication = {
  id: string
  number: string
  businessName: string
  type: BusinessType
  gstin: string
  pan: string
  contactName: string
  phone: string
  email: string
  address: Address
  location: GeoPoint
  photos: string[]
  documents: BusinessDocument[]
  status: ApplicationStatus
  submittedAt: IsoDateTime
  /** Fields the applicant must correct when sent back. */
  sentBackFields: string[]
  note: string | null
  rejectionReason: string | null
  /** Set once approved. */
  businessId: string | null
  history: TimelineEvent<ApplicationStatus>[]
}

export type BusinessStatus = "active" | "on_hold"

export type BusinessBranch = {
  id: string
  name: string
  address: Address
  gstin: string | null
}

export type BusinessUserRole = "owner" | "manager" | "purchaser" | "accountant"

export type BusinessUser = {
  id: string
  name: string
  email: string
  phone: string
  role: BusinessUserRole
  active: boolean
}

export type Business = {
  id: string
  name: string
  type: BusinessType
  gstin: string
  pan: string
  ownerName: string
  phone: string
  email: string
  address: Address
  location: GeoPoint
  branches: BusinessBranch[]
  users: BusinessUser[]
  /** B2B price = B2C price minus this %. */
  discountPercent: number
  status: BusinessStatus
  holdReason: string | null
  /** null for businesses onboarded before online applications. */
  applicationId: string | null
  approvedAt: IsoDateTime
}

/** `overdue` is worked out by the server from unpaid invoices past their due date. */
export type CreditStatus = "active" | "on_hold" | "overdue" | "disabled"

export type CreditLedgerEntryType = "invoice" | "payment" | "credit_note"

export type CreditLedgerEntry = {
  id: string
  type: CreditLedgerEntryType
  at: IsoDateTime
  reference: string
  orderId: string | null
  /** Positive increases what the business owes (invoice); negative reduces it (payment, credit note). */
  amount: Paise
  dueOn: IsoDate | null
  note: string | null
  by: ActorRef
}

export type CreditAccount = {
  id: string
  businessId: string
  businessName: string
  status: CreditStatus
  limit: Paise
  termsDays: number
  outstanding: Paise
  overdue: Paise
  holdReason: string | null
  ledger: CreditLedgerEntry[]
  enabledAt: IsoDateTime
}

export type BusinessListItem = Business & {
  city: string
  /** null when credit has never been enabled. */
  creditStatus: CreditStatus | null
  orderCount: number
}

export type BusinessDetail = BusinessListItem & {
  creditAccountId: string | null
  orders: Pick<Order, "id" | "number" | "placedAt" | "status" | "total">[]
  quotations: Pick<Quotation, "id" | "number" | "createdAt" | "status" | "total">[]
  returns: Pick<ReturnRequest, "id" | "number" | "kind" | "status" | "requestedAt">[]
}

export type CreditAccountListItem = Omit<CreditAccount, "ledger"> & {
  /** Limit minus outstanding; never below zero. */
  available: Paise
}

/**
 * A ledger line with the balance owed after it. For invoices, `unpaid` is what is still owed on that invoice
 * (payments and credit notes settle the oldest invoices first); null for payments and credit notes.
 */
export type CreditLedgerRow = CreditLedgerEntry & { balance: Paise; unpaid: Paise | null }

export type CreditAccountDetail = CreditAccountListItem & { ledger: CreditLedgerRow[] }
