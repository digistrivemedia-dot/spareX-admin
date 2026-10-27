import "server-only"

import type { CouponInput } from "@/features/coupons/schemas"
import type { Coupon, CouponScopeOptions } from "@/features/coupons/types"
import { couponState, describeDiscount } from "@/features/coupons/utils"
import { ApiError } from "@/lib/api-client"
import type { ActorRef } from "@/lib/types"
import { diffChanges, recordAuditEntry } from "@/mocks/audit"
import { products } from "@/mocks/catalog"
import { coupons } from "@/mocks/coupons"
import { garages } from "@/mocks/garages"
import { partBrands, productCategories } from "@/mocks/masters"
import { delay, listEndpoint, newId } from "@/mocks/utils"

export const couponEndpoint = listEndpoint<Coupon>(() => coupons, {
  searchText: (row) => `${row.code} ${row.description}`,
  date: (row) => row.startsAt,
  filters: {
    scope: (row, value) => row.scope === value,
    discountType: (row, value) => row.discountType === value,
    active: (row, value) => row.active === (value === "active"),
  },
  sortValues: {
    code: (row) => row.code,
    usedCount: (row) => row.usedCount,
    startsAt: (row) => row.startsAt,
    state: (row) => couponState(row),
  },
})

export async function getCoupon(id: string): Promise<Coupon | null> {
  await delay()
  return coupons.find((candidate) => candidate.id === id) ?? null
}

export async function couponScopeOptions(): Promise<CouponScopeOptions> {
  const option = ({ id, name }: { id: string; name: string }) => ({ value: id, label: name })
  return {
    product: products.map(option),
    brand: partBrands.map(option),
    category: productCategories.filter((row) => row.parentId === null).map(option),
    garage: garages.map(option),
  }
}

const LABELS = {
  code: "Code",
  description: "Description",
  discount: "Discount",
  scope: "Applies to",
  minOrderValue: "Minimum order (paise)",
  startsAt: "Starts",
  endsAt: "Ends",
  usageLimit: "Usage limit",
  perCustomerLimit: "Per customer",
  active: "Active",
} as const

export async function saveCoupon(actor: ActorRef, id: string | null, input: CouponInput) {
  await delay()
  if (coupons.some((other) => other.code === input.code && other.id !== id)) {
    throw new ApiError("Check the highlighted field.", 422, {
      code: ["Another coupon already uses this code."],
    })
  }
  const snapshot = (coupon: Coupon) => ({ ...coupon, discount: describeDiscount(coupon) })
  if (id) {
    const coupon = coupons.find((candidate) => candidate.id === id)
    if (!coupon) throw new ApiError("Coupon not found.", 404)
    const before = snapshot(coupon)
    Object.assign(coupon, input)
    recordAuditEntry(actor, {
      action: "update",
      entity: "coupon",
      entityId: id,
      entityLabel: coupon.code,
      summary: "Edited coupon",
      changes: diffChanges(before, snapshot(coupon), LABELS),
    })
    return { id }
  }
  const coupon: Coupon = {
    id: newId("cpn"),
    ...input,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  }
  coupons.push(coupon)
  recordAuditEntry(actor, {
    action: "create",
    entity: "coupon",
    entityId: coupon.id,
    entityLabel: coupon.code,
    summary: `Created coupon: ${describeDiscount(coupon)}`,
    changes: [],
  })
  return { id: coupon.id }
}
