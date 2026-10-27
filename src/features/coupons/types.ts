import type { IsoDateTime, Paise } from "@/lib/types"

/** What a coupon applies to. `scopeIds` holds the product, brand, category or garage ids where relevant. */
export type CouponScope =
  "all" | "product" | "brand" | "category" | "first_order" | "b2b" | "garage" | "service_booking"

export type CouponDiscountType = "percentage" | "flat"

export type Coupon = {
  id: string
  code: string
  description: string
  discountType: CouponDiscountType
  /** Percent for `percentage`, paise for `flat`. */
  value: number
  maxDiscount: Paise | null
  scope: CouponScope
  scopeIds: string[]
  minOrderValue: Paise
  startsAt: IsoDateTime
  endsAt: IsoDateTime | null
  usageLimit: number | null
  perCustomerLimit: number
  usedCount: number
  active: boolean
  createdAt: IsoDateTime
}

/** The records a scoped coupon can be limited to, as checkbox options. */
export type CouponScopeOptions = Record<
  "product" | "brand" | "category" | "garage",
  { value: string; label: string }[]
>
