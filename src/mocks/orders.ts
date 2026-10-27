import "server-only"

import type {
  Order,
  OrderItem,
  OrderPayment,
  OrderStatus,
  PaymentMethod,
} from "@/features/orders/types"
import { ORDER_FLOW } from "@/features/orders/utils"
import { applyDiscount, splitInclusiveGst } from "@/lib/gst"
import type { ActorRef, Channel, PartyRef, TimelineEvent } from "@/lib/types"
import { businesses } from "@/mocks/businesses"
import { products } from "@/mocks/catalog"
import { customers } from "@/mocks/customers"
import { daysAgo, persistent, seededRandom } from "@/mocks/utils"

const RAZORPAY_METHODS: PaymentMethod[] = ["upi", "card", "netbanking", "wallet"]
const COURIERS = ["Delhivery", "Blue Dart", "DTDC", "Shadowfax", "Kannali delivery"]
const FREE_DELIVERY_ABOVE = 49_900
const DELIVERY_CHARGE = 4_900

/** [days ago, channel, customer or business id, [product number, quantity][], status, payment method, cancellation reason] */
type OrderSeed = [number, Channel, string, [number, number][], OrderStatus, PaymentMethod, string?]

const ORDERS: OrderSeed[] = [
  [
    0,
    "b2c",
    "cus_001",
    [
      [3, 1],
      [58, 1],
    ],
    "placed",
    "upi",
  ],
  [0, "b2c", "cus_007", [[2, 2]], "placed", "card"],
  [1, "b2c", "cus_012", [[29, 1]], "placed", "upi"],
  [1, "b2c", "cus_003", [[41, 2]], "confirmed", "netbanking"],
  [
    2,
    "b2c",
    "cus_014",
    [
      [7, 1],
      [45, 1],
    ],
    "confirmed",
    "upi",
  ],
  [2, "b2c", "cus_020", [[62, 1]], "processing", "wallet"],
  [
    3,
    "b2c",
    "cus_009",
    [
      [21, 1],
      [13, 1],
    ],
    "processing",
    "card",
  ],
  [3, "b2c", "cus_025", [[36, 1]], "packed", "upi"],
  [
    4,
    "b2c",
    "cus_018",
    [
      [50, 2],
      [16, 1],
    ],
    "packed",
    "upi",
  ],
  [5, "b2c", "cus_002", [[1, 2]], "shipped", "card"],
  [5, "b2c", "cus_030", [[40, 1]], "shipped", "upi"],
  [6, "b2c", "cus_011", [[37, 2]], "out_for_delivery", "upi"],
  [7, "b2c", "cus_004", [[42, 4]], "delivered", "card"],
  [
    9,
    "b2c",
    "cus_001",
    [
      [5, 1],
      [13, 1],
      [21, 1],
    ],
    "delivered",
    "upi",
  ],
  [12, "b2c", "cus_006", [[28, 1]], "delivered", "netbanking"],
  [
    15,
    "b2c",
    "cus_010",
    [
      [25, 1],
      [45, 1],
    ],
    "delivered",
    "upi",
  ],
  [18, "b2c", "cus_015", [[33, 1]], "delivered", "card"],
  [22, "b2c", "cus_019", [[57, 1]], "delivered", "upi"],
  [
    27,
    "b2c",
    "cus_024",
    [
      [8, 1],
      [55, 1],
    ],
    "delivered",
    "wallet",
  ],
  [33, "b2c", "cus_026", [[38, 1]], "delivered", "upi"],
  [40, "b2c", "cus_013", [[30, 1]], "delivered", "upi"],
  [48, "b2c", "cus_021", [[60, 1]], "delivered", "card"],
  [55, "b2c", "cus_031", [[10, 2]], "delivered", "upi"],
  [62, "b2c", "cus_008", [[20, 1]], "delivered", "upi"],
  [4, "b2c", "cus_017", [[61, 1]], "cancelled", "upi", "Ordered by mistake"],
  [10, "b2c", "cus_023", [[39, 1]], "cancelled", "card", "Bought the part locally"],
  [
    11,
    "b2c",
    "cus_027",
    [[35, 1]],
    "cancelled",
    "netbanking",
    "Out of stock; cancelled by Kannali and refunded",
  ],
  [
    0,
    "b2b",
    "bus_001",
    [
      [2, 24],
      [45, 50],
      [50, 40],
    ],
    "placed",
    "credit",
  ],
  [
    1,
    "b2b",
    "bus_006",
    [
      [29, 10],
      [30, 6],
    ],
    "placed",
    "bank_transfer",
  ],
  [
    2,
    "b2b",
    "bus_002",
    [
      [9, 6],
      [11, 6],
    ],
    "confirmed",
    "credit",
  ],
  [3, "b2b", "bus_008", [[55, 10]], "confirmed", "bank_transfer"],
  [
    4,
    "b2b",
    "bus_004",
    [
      [36, 20],
      [37, 10],
    ],
    "processing",
    "credit",
  ],
  [
    6,
    "b2b",
    "bus_009",
    [
      [16, 30],
      [26, 30],
    ],
    "packed",
    "bank_transfer",
  ],
  [
    8,
    "b2b",
    "bus_005",
    [
      [43, 4],
      [34, 2],
    ],
    "shipped",
    "credit",
  ],
  [9, "b2b", "bus_015", [[33, 6]], "out_for_delivery", "cod"],
  [
    14,
    "b2b",
    "bus_003",
    [
      [1, 24],
      [4, 48],
    ],
    "delivered",
    "credit",
  ],
  [
    20,
    "b2b",
    "bus_001",
    [
      [24, 20],
      [25, 20],
      [19, 10],
    ],
    "delivered",
    "credit",
  ],
  [
    26,
    "b2b",
    "bus_010",
    [
      [17, 20],
      [18, 20],
    ],
    "delivered",
    "cash",
  ],
  [
    35,
    "b2b",
    "bus_002",
    [
      [6, 12],
      [20, 6],
    ],
    "delivered",
    "credit",
  ],
  [
    45,
    "b2b",
    "bus_011",
    [
      [57, 6],
      [1, 12],
    ],
    "delivered",
    "upi",
  ],
  [
    16,
    "b2b",
    "bus_003",
    [[48, 5]],
    "cancelled",
    "credit",
    "Wrong part ordered by the purchase desk",
  ],
]

const ADMIN: ActorRef = { type: "admin", id: "adm_kiran", name: "Kiran Gowda" }

function partyFor(channel: Channel, id: string) {
  if (channel === "b2c") {
    const customer = customers.find((candidate) => candidate.id === id)
    if (!customer) throw new Error(`Unknown demo customer ${id}`)
    const party: PartyRef = {
      type: "customer",
      id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    }
    return { party, address: customer.addresses[0], discount: 0, gstin: null }
  }
  const business = businesses.find((candidate) => candidate.id === id)
  if (!business) throw new Error(`Unknown demo business ${id}`)
  const party: PartyRef = {
    type: "business",
    id,
    name: business.name,
    phone: business.phone,
    email: business.email,
  }
  return {
    party,
    address: business.address,
    discount: business.discountPercent,
    gstin: business.gstin,
  }
}

function paymentFor(
  method: PaymentMethod,
  status: OrderStatus,
  total: number,
  placedAt: string,
  index: number,
): OrderPayment {
  const gateway = RAZORPAY_METHODS.includes(method) ? "razorpay" : "offline"
  const base = { method, gateway, refundedAmount: 0 } as const
  if (gateway === "razorpay") {
    // One failed attempt shows up in "payments to confirm".
    if (index === 2)
      return { ...base, status: "failed", reference: `pay_Fail${index}x9Lq`, paidAt: null }
    const paid = {
      ...base,
      reference: `pay_N${index}${placedAt.slice(5, 10).replace("-", "")}kQ7`,
      paidAt: placedAt,
    }
    return status === "cancelled"
      ? { ...paid, status: "refunded", refundedAmount: total }
      : { ...paid, status: "paid" }
  }
  if (method === "credit") return { ...base, status: "pending", reference: null, paidAt: null }
  if (method === "cash")
    return { ...base, status: "paid", reference: `Receipt ${2200 + index}`, paidAt: placedAt }
  if (method === "cod") return { ...base, status: "pending", reference: null, paidAt: null }
  // Bank transfers: the packed order has been confirmed with a UTR; the newer ones wait for admin.
  return status === "packed"
    ? { ...base, status: "paid", reference: `UTR SBIN0${index}2648819`, paidAt: placedAt }
    : { ...base, status: "pending", reference: null, paidAt: null }
}

function timelineFor(
  status: OrderStatus,
  daysOld: number,
  party: PartyRef,
  reason?: string,
): TimelineEvent<OrderStatus>[] {
  const customerActor: ActorRef = { type: party.type, id: party.id, name: party.name }
  const reached =
    status === "cancelled"
      ? ["placed" as const]
      : ORDER_FLOW.slice(0, ORDER_FLOW.indexOf(status) + 1)
  const events: TimelineEvent<OrderStatus>[] = reached.map((step, i) => ({
    status: step,
    at: daysAgo(Math.max(daysOld - i, 0), 10 + i),
    by: i === 0 ? customerActor : ADMIN,
  }))
  if (status === "cancelled") {
    const byKannali = reason?.includes("Kannali") ?? false
    events.push({
      status,
      at: daysAgo(daysOld, 15),
      by: byKannali ? ADMIN : customerActor,
      note: reason,
    })
  }
  return events
}

function buildOrders(): Order[] {
  const random = seededRandom(23)
  let invoiceSequence = 0
  return ORDERS.map(([daysOld, channel, partyId, lines, status, method, reason], index) => {
    const { party, address, discount, gstin } = partyFor(channel, partyId)
    if (!address) throw new Error(`Demo party ${partyId} has no address`)
    const items: OrderItem[] = lines.map(([number, quantity], line) => {
      const product = products[number - 1]
      if (!product) throw new Error(`Unknown demo product ${number}`)
      const unitPrice = applyDiscount(product.price, discount)
      return {
        id: `ord_${index + 1}_item${line + 1}`,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity,
        mrp: product.mrp,
        unitPrice,
        gstRate: product.gstRate,
        total: unitPrice * quantity,
      }
    })
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const deliveryCharge = channel === "b2c" && subtotal < FREE_DELIVERY_ABOVE ? DELIVERY_CHARGE : 0
    const total = subtotal + deliveryCharge
    const placedAt = daysAgo(daysOld, 10)
    const shipped = ORDER_FLOW.indexOf(status) >= ORDER_FLOW.indexOf("shipped")
    const invoiced = status !== "placed" && status !== "cancelled"
    return {
      id: `ord_${String(index + 1).padStart(3, "0")}`,
      number: `SPX-${10401 + index}`,
      channel,
      customer: party,
      gstin,
      items,
      subtotal,
      discount: 0,
      deliveryCharge,
      total,
      gstAmount: splitInclusiveGst(total).gst,
      status,
      payment: paymentFor(method, status, total, placedAt, index),
      shippingAddress: address,
      shipment: shipped
        ? {
            courier: random.pick(COURIERS),
            trackingNumber: `${random.int(100000000, 999999999)}`,
            shippedAt: daysAgo(Math.max(daysOld - 4, 0), 16),
          }
        : null,
      cancellationReason: reason ?? null,
      invoiceNumber: invoiced ? `KG/26-27/${String(++invoiceSequence).padStart(4, "0")}` : null,
      quotationId: index === 36 ? "quo_006" : null,
      timeline: timelineFor(status, daysOld, party, reason),
      placedAt,
    }
  })
}

export const orders = persistent<Order[]>("orders", buildOrders)
