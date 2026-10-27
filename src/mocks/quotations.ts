import "server-only"

import type { Quotation, QuotationLine, QuotationStatus } from "@/features/quotations/types"
import { DEFAULT_QUOTATION_VALIDITY_DAYS } from "@/lib/constants"
import { applyDiscount, splitInclusiveGst } from "@/lib/gst"
import type { ActorRef } from "@/lib/types"
import { businesses } from "@/mocks/businesses"
import { products } from "@/mocks/catalog"
import { dateOnly, daysAgo, persistent } from "@/mocks/utils"

const ADMIN: ActorRef = { type: "admin", id: "adm_suresh", name: "Suresh Reddy" }

/** [business id, [product number, quantity][], status, days ago, extra discount ₹, linked order id] */
type QuotationSeed = [string, [number, number][], QuotationStatus, number, number, string | null]

const QUOTATIONS: QuotationSeed[] = [
  [
    "bus_006",
    [
      [29, 25],
      [30, 25],
      [31, 10],
    ],
    "requested",
    1,
    0,
    null,
  ],
  [
    "bus_004",
    [
      [36, 40],
      [37, 40],
      [38, 20],
    ],
    "sent",
    3,
    2_000,
    null,
  ],
  [
    "bus_002",
    [
      [9, 12],
      [11, 12],
      [20, 8],
    ],
    "accepted",
    6,
    1_500,
    null,
  ],
  [
    "bus_009",
    [
      [45, 200],
      [50, 200],
    ],
    "rejected",
    12,
    0,
    null,
  ],
  [
    "bus_015",
    [
      [33, 10],
      [41, 20],
    ],
    "expired",
    20,
    3_000,
    null,
  ],
  [
    "bus_001",
    [
      [24, 20],
      [25, 20],
      [19, 10],
    ],
    "converted",
    23,
    0,
    "ord_037",
  ],
]

export const quotations = persistent<Quotation[]>("quotations", () =>
  QUOTATIONS.map(
    ([businessId, lineSeeds, status, daysOld, extraDiscountRupees, orderId], index) => {
      const business = businesses.find((candidate) => candidate.id === businessId)
      if (!business) throw new Error(`Unknown demo business ${businessId}`)
      const id = `quo_${String(index + 1).padStart(3, "0")}`
      const lines: QuotationLine[] = lineSeeds.map(([number, quantity], line) => {
        const product = products[number - 1]
        if (!product) throw new Error(`Unknown demo product ${number}`)
        const unitPrice = applyDiscount(product.price, business.discountPercent)
        return {
          id: `${id}_l${line + 1}`,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          quantity,
          listPrice: product.price,
          discountPercent: business.discountPercent,
          unitPrice,
          total: unitPrice * quantity,
        }
      })
      const subtotal = lines.reduce((sum, line) => sum + line.total, 0)
      const extraDiscount = extraDiscountRupees * 100
      const total = subtotal - extraDiscount
      const requester: ActorRef = {
        type: "business",
        id: business.id,
        name: business.users[0]?.name ?? business.ownerName,
      }
      const createdAt = daysAgo(daysOld, 10)
      const sentAt = status === "requested" ? null : daysAgo(daysOld - 1, 15)
      const revisions: Quotation["revisions"] = sentAt
        ? [
            {
              version: 1,
              at: sentAt,
              by: ADMIN,
              total: subtotal,
              note: "Auto-priced at the business discount.",
            },
          ]
        : []
      if (extraDiscount > 0 && sentAt) {
        revisions.push({
          version: 2,
          at: daysAgo(daysOld - 1, 17),
          by: ADMIN,
          total,
          note: "Added an extra discount for the bulk quantity.",
        })
      }
      return {
        id,
        number: `QT-${1001 + index}`,
        businessId,
        businessName: business.name,
        requestedBy: requester,
        lines,
        subtotal,
        extraDiscount,
        total,
        gstAmount: splitInclusiveGst(total).gst,
        status,
        validUntil: sentAt
          ? dateOnly(daysAgo(daysOld - 1 - DEFAULT_QUOTATION_VALIDITY_DAYS))
          : null,
        orderId,
        revisions,
        createdAt,
        sentAt,
      }
    },
  ),
)
