import type { AdminUserStatus } from "@/features/admin-users/types"
import type { BookingStatus } from "@/features/bookings/types"
import type { StockStatus } from "@/features/catalog/types"
import type { ApplicationStatus, BusinessStatus, CreditStatus } from "@/features/businesses/types"
import type { CustomerStatus } from "@/features/customers/types"
import type { EnquiryStatus } from "@/features/enquiries/types"
import type { GarageStatus } from "@/features/garages/types"
import type {
  ApprovalStatus,
  JobCardPaymentStatus,
  JobCardStatus,
} from "@/features/job-cards/types"
import type { OrderStatus, PaymentStatus } from "@/features/orders/types"
import type { bannerState } from "@/features/content/utils"
import type { couponState } from "@/features/coupons/utils"
import type { Integration } from "@/features/settings/types"
import type { QuotationStatus } from "@/features/quotations/types"
import type { ReturnStatus } from "@/features/returns/types"
import type { ProductReview } from "@/features/reviews/types"

/** success = done / good, warning = waiting for someone, danger = problem, info = in progress, navy = on its way. */
export type StatusTone = "success" | "warning" | "danger" | "info" | "navy" | "neutral"

/** The one map from every status in the platform to a colour. */
export const STATUS_TONES = {
  order: {
    placed: "warning",
    confirmed: "info",
    processing: "info",
    packed: "info",
    shipped: "navy",
    out_for_delivery: "navy",
    delivered: "success",
    cancelled: "neutral",
  } satisfies Record<OrderStatus, StatusTone>,
  payment: {
    pending: "warning",
    paid: "success",
    failed: "danger",
    refunded: "neutral",
    partially_refunded: "neutral",
  } satisfies Record<PaymentStatus, StatusTone>,
  return: {
    requested: "warning",
    approved: "info",
    rejected: "danger",
    pickup_scheduled: "info",
    verified: "info",
    refunded: "success",
    credit_note_issued: "success",
    replacement_sent: "success",
    closed: "neutral",
  } satisfies Record<ReturnStatus, StatusTone>,
  booking: {
    pending: "warning",
    accepted: "info",
    declined: "danger",
    in_progress: "info",
    completed: "success",
    cancelled: "neutral",
  } satisfies Record<BookingStatus, StatusTone>,
  jobCard: {
    checked_in: "info",
    inspection: "info",
    awaiting_approval: "warning",
    in_progress: "info",
    quality_check: "info",
    ready_for_delivery: "navy",
    delivered: "success",
    cancelled: "neutral",
  } satisfies Record<JobCardStatus, StatusTone>,
  jobCardPayment: { unpaid: "warning", paid: "success" } satisfies Record<
    JobCardPaymentStatus,
    StatusTone
  >,
  approval: { pending: "warning", approved: "success", rejected: "danger" } satisfies Record<
    ApprovalStatus,
    StatusTone
  >,
  application: {
    submitted: "warning",
    under_review: "info",
    approved: "success",
    sent_back: "warning",
    rejected: "danger",
  } satisfies Record<ApplicationStatus, StatusTone>,
  quotation: {
    requested: "warning",
    sent: "info",
    accepted: "success",
    rejected: "danger",
    expired: "neutral",
    converted: "success",
  } satisfies Record<QuotationStatus, StatusTone>,
  credit: {
    active: "success",
    on_hold: "danger",
    overdue: "danger",
    disabled: "neutral",
  } satisfies Record<CreditStatus, StatusTone>,
  business: { active: "success", on_hold: "danger" } satisfies Record<BusinessStatus, StatusTone>,
  garage: { live: "success", not_live: "neutral" } satisfies Record<GarageStatus, StatusTone>,
  customer: {
    active: "success",
    inactive: "neutral",
    deletion_requested: "danger",
    deleted: "neutral",
  } satisfies Record<CustomerStatus, StatusTone>,
  adminUser: { active: "success", inactive: "neutral", invited: "info" } satisfies Record<
    AdminUserStatus,
    StatusTone
  >,
  enquiry: {
    new: "warning",
    in_progress: "info",
    resolved: "success",
    closed: "neutral",
  } satisfies Record<EnquiryStatus, StatusTone>,
  review: { pending: "warning", published: "success", hidden: "neutral" } satisfies Record<
    ProductReview["status"],
    StatusTone
  >,
  stock: { in_stock: "success", low_stock: "warning", out_of_stock: "danger" } satisfies Record<
    StockStatus,
    StatusTone
  >,
  banner: {
    live: "success",
    scheduled: "info",
    ended: "neutral",
    inactive: "neutral",
  } satisfies Record<ReturnType<typeof bannerState>, StatusTone>,
  coupon: {
    live: "success",
    scheduled: "info",
    ended: "neutral",
    inactive: "neutral",
    used_up: "warning",
  } satisfies Record<ReturnType<typeof couponState>, StatusTone>,
  feature: { on: "success", off: "neutral" } satisfies Record<"on" | "off", StatusTone>,
  integration: {
    connected: "success",
    error: "danger",
    not_configured: "warning",
  } satisfies Record<Integration["status"], StatusTone>,
  active: { active: "success", inactive: "neutral" } satisfies Record<
    "active" | "inactive",
    StatusTone
  >,
}

export type StatusDomain = keyof typeof STATUS_TONES
export type StatusOf<D extends StatusDomain> = keyof (typeof STATUS_TONES)[D] & string
