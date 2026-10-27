import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import { FormAlert } from "@/components/ui/FormAlert"
import type { Order } from "@/features/orders/types"
import { PAYMENT_METHOD_LABELS } from "@/features/orders/utils"
import { formatDateTime, formatPhone, formatPrice, humanize } from "@/lib/format"

/** Who ordered, where it goes, how it was paid and how it is travelling. */
export function OrderParty({ order }: { order: Order }) {
  const { customer, shippingAddress: address, payment, shipment } = order
  const profile =
    customer.type === "business" ? `/businesses/${customer.id}` : `/customers/${customer.id}`

  return (
    <>
      {order.status === "cancelled" && order.cancellationReason && (
        <FormAlert tone="warning">Cancelled: {order.cancellationReason}</FormAlert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Customer and delivery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              {
                label: customer.type === "business" ? "Business" : "Customer",
                value: (
                  <Link href={profile} className="text-navy-700 hover:underline">
                    {customer.name}
                  </Link>
                ),
              },
              { label: "Mobile", value: formatPhone(customer.phone) },
              { label: "GSTIN on invoice", value: order.gstin ?? "None" },
              {
                label: "Deliver to",
                value: [
                  address.name,
                  address.line1,
                  address.line2,
                  `${address.city}, ${address.state} ${address.pincode}`,
                ]
                  .filter(Boolean)
                  .join(", "),
              },
              {
                label: "Shipment",
                value: shipment
                  ? `${shipment.courier} · ${shipment.trackingNumber} · shipped ${formatDateTime(shipment.shippedAt)}`
                  : "Not shipped yet",
              },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              {
                label: "Method",
                value: `${PAYMENT_METHOD_LABELS[payment.method]} (${payment.gateway === "razorpay" ? "Razorpay" : "offline"})`,
              },
              { label: "Status", value: humanize(payment.status) },
              { label: "Reference", value: payment.reference ?? "–" },
              { label: "Paid at", value: payment.paidAt ? formatDateTime(payment.paidAt) : "–" },
              ...(payment.refundedAmount
                ? [{ label: "Refunded", value: formatPrice(payment.refundedAmount) }]
                : []),
            ]}
          />
        </CardContent>
      </Card>
    </>
  )
}
