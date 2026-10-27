import "server-only"

import type { CreditNote } from "@/features/credit-notes/types"
import type {
  ItemCondition,
  ReturnKind,
  ReturnReason,
  ReturnRequest,
  ReturnResolution,
  ReturnStatus,
} from "@/features/returns/types"
import { RESOLVED_STATUS, RETURN_FLOW } from "@/features/returns/utils"
import { PICKUP_WINDOWS } from "@/lib/constants"
import { splitInclusiveGst } from "@/lib/gst"
import type { ActorRef, TimelineEvent } from "@/lib/types"
import { orders } from "@/mocks/orders"
import { dateOnly, daysAgo, persistent } from "@/mocks/utils"

const ADMIN: ActorRef = { type: "admin", id: "adm_meera", name: "Meera Iyer" }

type ReturnSeed = {
  orderIndex: number
  /** [order item position, quantity] */
  items: [number, number][]
  kind: ReturnKind
  reason: ReturnReason
  note: string
  status: ReturnStatus
  daysOld: number
  resolution?: ReturnResolution["type"]
  condition?: ItemCondition
  rejectionReason?: string
}

const RETURNS: ReturnSeed[] = [
  {
    orderIndex: 12,
    items: [[0, 1]],
    kind: "return",
    reason: "wrong_item",
    note: "Received 215/65 R16 instead of 215/60 R16.",
    status: "requested",
    daysOld: 1,
  },
  {
    orderIndex: 16,
    items: [[0, 1]],
    kind: "replacement",
    reason: "defective",
    note: "Battery does not hold charge after two days.",
    status: "approved",
    daysOld: 3,
  },
  {
    orderIndex: 17,
    items: [[0, 1]],
    kind: "return",
    reason: "does_not_fit",
    note: "Sprocket does not fit my bike.",
    status: "rejected",
    daysOld: 9,
    rejectionReason:
      "Fitment confirmed for the customer's Pulsar 150; the kit was already installed and used.",
  },
  {
    orderIndex: 35,
    items: [[0, 2]],
    kind: "return",
    reason: "damaged",
    note: "Two bottles leaked in transit.",
    status: "pickup_scheduled",
    daysOld: 4,
  },
  {
    orderIndex: 15,
    items: [[0, 1]],
    kind: "return",
    reason: "damaged",
    note: "Brake shoe lining is chipped.",
    status: "verified",
    daysOld: 7,
    condition: "damaged",
  },
  {
    orderIndex: 14,
    items: [[0, 1]],
    kind: "return",
    reason: "does_not_fit",
    note: "Pads are for the Ace Gold, I have the Ace EV.",
    status: "refunded",
    daysOld: 9,
    resolution: "refund",
    condition: "unused",
  },
  {
    orderIndex: 36,
    items: [[1, 4]],
    kind: "return",
    reason: "defective",
    note: "Four brake shoe sets have uneven lining.",
    status: "credit_note_issued",
    daysOld: 13,
    resolution: "credit_note",
    condition: "unused",
  },
  {
    orderIndex: 18,
    items: [[1, 1]],
    kind: "replacement",
    reason: "damaged",
    note: "Wiper blade arrived bent.",
    status: "replacement_sent",
    daysOld: 24,
    resolution: "replacement",
    condition: "damaged",
  },
  {
    orderIndex: 22,
    items: [[0, 2]],
    kind: "return",
    reason: "not_as_described",
    note: "Listing said 1 L; received 800 ml bottles.",
    status: "closed",
    daysOld: 50,
    resolution: "refund",
    condition: "unused",
  },
]

function timelineFor(seed: ReturnSeed, customer: ActorRef): TimelineEvent<ReturnStatus>[] {
  const steps: ReturnStatus[] =
    seed.status === "rejected"
      ? ["requested", "rejected"]
      : seed.resolution
        ? [
            ...RETURN_FLOW,
            RESOLVED_STATUS[seed.resolution],
            ...(seed.status === "closed" ? (["closed"] as const) : []),
          ]
        : RETURN_FLOW.slice(0, RETURN_FLOW.indexOf(seed.status) + 1)
  return steps.map((status, i) => ({
    status,
    at: daysAgo(Math.max(seed.daysOld - i, 0), 11 + i),
    by: i === 0 ? customer : ADMIN,
    note: status === "rejected" ? seed.rejectionReason : undefined,
  }))
}

/** Credit note numbers follow the default format (Q-13). */
export function creditNoteNumber(sequence: number): string {
  return `CN/26-27/${String(sequence).padStart(4, "0")}`
}

function buildReturns(): ReturnRequest[] {
  let creditNoteSequence = 0
  return RETURNS.map((seed, index) => {
    const order = orders[seed.orderIndex]
    if (!order) throw new Error(`Unknown demo order index ${seed.orderIndex}`)
    const customer: ActorRef = {
      type: order.customer.type,
      id: order.customer.id,
      name: order.customer.name,
    }
    const items = seed.items.map(([position, quantity]) => {
      const item = order.items[position]
      if (!item) throw new Error(`Demo order ${order.number} has no item ${position}`)
      return {
        orderItemId: item.id,
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        quantity,
        amount: item.unitPrice * quantity,
      }
    })
    const amount = items.reduce((sum, item) => sum + item.amount, 0)
    const timeline = timelineFor(seed, customer)
    const reached = (status: ReturnStatus) => timeline.find((event) => event.status === status)
    const verifiedAt = reached("verified")?.at
    const resolvedAt = seed.resolution ? reached(RESOLVED_STATUS[seed.resolution])?.at : undefined
    // Refunds and credit notes are both documented by a credit note; a replacement ships as a new order.
    const reference =
      seed.resolution === "replacement"
        ? `SPX-${10500 + index}`
        : seed.resolution
          ? creditNoteNumber(++creditNoteSequence)
          : ""
    return {
      id: `ret_${String(index + 1).padStart(3, "0")}`,
      number: `RET-${1001 + index}`,
      kind: seed.kind,
      channel: order.channel,
      orderId: order.id,
      orderNumber: order.number,
      customer: order.customer,
      items,
      reason: seed.reason,
      customerNote: seed.note,
      photos: [],
      status: seed.status,
      rejectionReason: seed.rejectionReason ?? null,
      pickup: reached("pickup_scheduled")
        ? {
            date: dateOnly(daysAgo(seed.daysOld - 3)),
            window: PICKUP_WINDOWS[index % PICKUP_WINDOWS.length] ?? "",
          }
        : null,
      verification:
        verifiedAt && seed.condition
          ? {
              condition: seed.condition,
              notes: "Checked against the order and photos.",
              photos: [],
              at: verifiedAt,
            }
          : null,
      resolution:
        seed.resolution && resolvedAt
          ? { type: seed.resolution, amount, reference, at: resolvedAt }
          : null,
      timeline,
      requestedAt: timeline[0]?.at ?? daysAgo(seed.daysOld),
    }
  })
}

export const returns = persistent<ReturnRequest[]>("returns", buildReturns)

export const creditNotes = persistent<CreditNote[]>("credit-notes", () => {
  const fromReturns = returns.flatMap((item) => {
    const resolution = item.resolution
    if (!resolution || resolution.type === "replacement") return []
    const { taxable, gst } = splitInclusiveGst(resolution.amount)
    return [
      {
        id: `cn_${resolution.reference.slice(-4)}`,
        number: resolution.reference,
        channel: item.channel,
        customer: item.customer,
        orderId: item.orderId,
        orderNumber: item.orderNumber,
        returnId: item.id,
        returnNumber: item.number,
        reason: `Return ${item.number}: ${item.customerNote}`,
        taxableAmount: taxable,
        gstAmount: gst,
        amount: resolution.amount,
        appliedTo: item.channel === "b2b" ? ("credit_ledger" as const) : ("refund" as const),
        issuedAt: resolution.at,
        issuedBy: ADMIN,
      },
    ]
  })

  // A short-supply adjustment on a B2B credit order, with no return behind it.
  const shortSupply = orders[38]
  const shortItem = shortSupply?.items[1]
  if (!shortSupply || !shortItem) return fromReturns
  const { taxable, gst } = splitInclusiveGst(shortItem.unitPrice)
  return [
    ...fromReturns,
    {
      id: "cn_0004",
      number: creditNoteNumber(fromReturns.length + 1),
      channel: shortSupply.channel,
      customer: shortSupply.customer,
      orderId: shortSupply.id,
      orderNumber: shortSupply.number,
      returnId: null,
      returnNumber: null,
      reason: `Short supply: 1 × ${shortItem.name} not delivered`,
      taxableAmount: taxable,
      gstAmount: gst,
      amount: shortItem.unitPrice,
      appliedTo: "credit_ledger" as const,
      issuedAt: daysAgo(30, 16),
      issuedBy: ADMIN,
    },
  ]
})
