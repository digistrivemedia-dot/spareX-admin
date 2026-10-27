import "server-only"

import type { QuotationInput } from "@/features/quotations/schemas"
import type { Quotation, QuotationLine } from "@/features/quotations/types"
import { isEditable } from "@/features/quotations/utils"
import { ApiError } from "@/lib/api-client"
import { formatPrice } from "@/lib/format"
import { applyDiscount, splitInclusiveGst } from "@/lib/gst"
import type { ActorRef } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { businesses } from "@/mocks/businesses"
import { products } from "@/mocks/catalog"
import { quotations } from "@/mocks/quotations"
import { dateOnly, daysFromNow, delay, listEndpoint, newId } from "@/mocks/utils"

/** A sent quotation past its validity reads as expired, as the backend reports it. */
function withExpiry(quotation: Quotation): Quotation {
  const today = dateOnly(new Date().toISOString())
  if (quotation.status === "sent" && quotation.validUntil && quotation.validUntil < today) {
    quotation.status = "expired"
  }
  return quotation
}

export const quotationEndpoint = listEndpoint<Quotation>(() => quotations.map(withExpiry), {
  searchText: (row) =>
    `${row.number} ${row.businessName} ${row.lines.map((line) => line.name).join(" ")}`,
  date: (row) => row.createdAt,
  filters: {
    status: (row, value) => row.status === value,
    business: (row, value) => row.businessId === value,
  },
  sortValues: {
    createdAt: (row) => row.createdAt,
    total: (row) => row.total,
    validUntil: (row) => row.validUntil,
  },
})

export async function getQuotation(id: string): Promise<Quotation | null> {
  await delay()
  const quotation = quotations.find((candidate) => candidate.id === id)
  return quotation ? withExpiry(quotation) : null
}

/**
 * Re-prices every line from the product's current B2C price and the chosen line discount (the business's discount
 * by default), applies the extra discount, then sends it as a new revision valid for `validityDays`.
 */
export async function sendQuotation(actor: ActorRef, id: string, input: QuotationInput) {
  await delay()
  const quotation = quotations.find((candidate) => candidate.id === id)
  if (!quotation) throw new ApiError("Quotation not found.", 404)
  if (!isEditable(quotation.status)) {
    throw new ApiError("Only open quotations can be edited and sent.", 409)
  }
  const business = businesses.find((candidate) => candidate.id === quotation.businessId)
  const lines: QuotationLine[] = input.lines.map((line) => {
    const product = products.find((candidate) => candidate.id === line.productId)
    if (!product) throw new ApiError("A product on the quotation no longer exists.", 422)
    const unitPrice = applyDiscount(product.price, line.discountPercent)
    return {
      id: line.id || newId("ql"),
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity: line.quantity,
      listPrice: product.price,
      discountPercent: line.discountPercent,
      unitPrice,
      total: unitPrice * line.quantity,
    }
  })
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0)
  if (input.extraDiscount >= subtotal) {
    throw new ApiError("Check the highlighted field.", 422, {
      extraDiscount: ["The extra discount must be less than the subtotal."],
    })
  }
  const before = quotation.total
  const now = new Date().toISOString()
  Object.assign(quotation, {
    lines,
    subtotal,
    extraDiscount: input.extraDiscount,
    total: subtotal - input.extraDiscount,
    gstAmount: splitInclusiveGst(subtotal - input.extraDiscount).gst,
    status: "sent",
    validUntil: daysFromNow(input.validityDays),
    sentAt: now,
  })
  quotation.revisions.push({
    version: quotation.revisions.length + 1,
    at: now,
    by: actor,
    total: quotation.total,
    note: input.note || `Sent to ${business?.name ?? quotation.businessName}`,
  })
  recordAuditEntry(actor, {
    action: "update",
    entity: "quotation",
    entityId: quotation.id,
    entityLabel: quotation.number,
    summary: `Sent revision ${quotation.revisions.length}, valid for ${input.validityDays} days`,
    changes:
      before === quotation.total
        ? []
        : [{ field: "Total", before: formatPrice(before), after: formatPrice(quotation.total) }],
  })
}
