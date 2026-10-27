import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Price } from "@/components/ui/Price"
import type { Order } from "@/features/orders/types"
import { formatPrice } from "@/lib/format"

/** Items with the price charged (B2B prices already have the business discount), and the order totals. */
export function OrderItems({ order }: { order: Order }) {
  const totals = [
    { label: "Items", value: order.subtotal },
    ...(order.discount ? [{ label: "Discount", value: -order.discount }] : []),
    { label: "Delivery", value: order.deliveryCharge },
  ]

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-gray-200 py-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Items</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-medium text-navy-700 hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-gray-500">
                  {item.sku} · {item.quantity} × {formatPrice(item.unitPrice)}
                  {item.unitPrice < item.mrp && (
                    <span className="line-through"> {formatPrice(item.mrp)}</span>
                  )}
                </p>
              </div>
              <Price paise={item.total} />
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-1 border-t border-gray-200 px-4 py-3 text-sm sm:px-6">
          {totals.map((row) => (
            <div key={row.label} className="flex justify-between">
              <dt className="text-gray-500">{row.label}</dt>
              <dd className="tabular-nums">{row.value === 0 ? "Free" : formatPrice(row.value)}</dd>
            </div>
          ))}
          <div className="flex justify-between">
            <dt className="text-gray-500">GST included</dt>
            <dd className="tabular-nums">{formatPrice(order.gstAmount, { exact: true })}</dd>
          </div>
          <div className="mt-1 flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
            <dt>Total</dt>
            <dd>
              <Price paise={order.total} gst="incl" />
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
