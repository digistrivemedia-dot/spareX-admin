"use server"

import * as api from "@/features/coupons/api"
import { couponSchema, type CouponValues } from "@/features/coupons/schemas"
import {
  COUPON_FILTERS,
  couponState,
  describeDiscount,
  SCOPE_LABELS,
} from "@/features/coupons/utils"
import { exportCsv } from "@/lib/csv-export"
import { endOfDayIst, startOfDayIst } from "@/lib/dates"
import { formatDate, formatPrice, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runValidatedMutation } from "@/lib/server-action"

export async function saveCouponAction(id: string | null, values: CouponValues) {
  return runValidatedMutation("coupons.manage", couponSchema, values, (context, data) => {
    const { startsOn, endsOn, ...rest } = data
    return api.saveCoupon(context, id, {
      ...rest,
      startsAt: startOfDayIst(startsOn),
      endsAt: endsOn ? endOfDayIst(endsOn) : null,
    })
  })
}

export async function exportCouponsAction(query: string) {
  const params = listParamsFromQuery(query, COUPON_FILTERS)
  return exportCsv({
    entity: "coupon",
    label: "Coupons",
    load: (token) => api.couponsApi.all(token, params),
    columns: [
      { header: "Code", value: (row) => row.code },
      { header: "Description", value: (row) => row.description },
      { header: "Discount", value: (row) => describeDiscount(row) },
      { header: "Applies to", value: (row) => SCOPE_LABELS[row.scope] },
      { header: "Minimum order", value: (row) => formatPrice(row.minOrderValue) },
      { header: "Starts", value: (row) => formatDate(row.startsAt) },
      { header: "Ends", value: (row) => (row.endsAt ? formatDate(row.endsAt) : "") },
      { header: "Used", value: (row) => row.usedCount },
      { header: "Usage limit", value: (row) => row.usageLimit ?? "" },
      { header: "Status", value: (row) => humanize(couponState(row)) },
    ],
  })
}
