import type { FilterOption } from "@/components/ui/FilterSelect"
import type { Coupon, CouponDiscountType, CouponScope } from "@/features/coupons/types"
import { formatPrice } from "@/lib/format"

export const COUPON_FILTERS = ["scope", "discountType", "active"] as const

export const SCOPE_LABELS: Record<CouponScope, string> = {
  all: "All orders",
  product: "Selected products",
  brand: "Selected part brands",
  category: "Selected categories",
  first_order: "First order",
  b2b: "B2B orders",
  garage: "Selected garages",
  service_booking: "Service bookings",
}

/** Scopes that apply only to the records picked in `scopeIds`. */
export const SCOPES_WITH_IDS: CouponScope[] = ["product", "brand", "category", "garage"]

const DISCOUNT_TYPE_LABELS: Record<CouponDiscountType, string> = {
  percentage: "Percentage",
  flat: "Flat amount",
}

const fromLabels = (labels: Record<string, string>): FilterOption[] =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

export const SCOPE_OPTIONS = fromLabels(SCOPE_LABELS)
export const DISCOUNT_TYPE_OPTIONS = fromLabels(DISCOUNT_TYPE_LABELS)

/** "10% off, up to ₹250" or "₹150 off". */
export function describeDiscount(coupon: Pick<Coupon, "discountType" | "value" | "maxDiscount">) {
  if (coupon.discountType === "flat") return `${formatPrice(coupon.value)} off`
  return `${coupon.value}% off${coupon.maxDiscount ? `, up to ${formatPrice(coupon.maxDiscount)}` : ""}`
}

export function couponState(
  coupon: Pick<Coupon, "active" | "startsAt" | "endsAt" | "usageLimit" | "usedCount">,
): "live" | "scheduled" | "ended" | "inactive" | "used_up" {
  const now = new Date().toISOString()
  if (!coupon.active) return "inactive"
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return "used_up"
  if (coupon.startsAt > now) return "scheduled"
  if (coupon.endsAt && coupon.endsAt < now) return "ended"
  return "live"
}
