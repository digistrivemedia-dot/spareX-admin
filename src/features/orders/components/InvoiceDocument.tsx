import { AmountRow } from "@/components/ui/AmountRow"
import { TaxDocument } from "@/components/ui/TaxDocument"
import type { Order } from "@/features/orders/types"
import { SELLER } from "@/lib/constants"
import { formatDate, formatPrice } from "@/lib/format"
import { gstinStateCode, splitInclusiveGst } from "@/lib/gst"

const KARNATAKA = "Karnataka"

/** Tax invoice. Prices include GST, so each line is split into taxable value and tax. */
export function InvoiceDocument({ order }: { order: Order }) {
  const buyer = order.shippingAddress
  // Supply inside the seller's state is CGST + SGST; across states it is IGST.
  const intraState = order.gstin
    ? gstinStateCode(order.gstin) === SELLER.stateCode
    : buyer.state === KARNATAKA
  const lines = order.items.map((item) => ({
    ...item,
    ...splitInclusiveGst(item.total, item.gstRate),
  }))
  const extras = order.deliveryCharge - order.discount
  const taxable =
    lines.reduce((sum, line) => sum + line.taxable, 0) + splitInclusiveGst(extras).taxable

  return (
    <TaxDocument
      title="Tax invoice"
      meta={[
        `Invoice ${order.invoiceNumber}`,
        `Order ${order.number}`,
        `Date ${formatDate(order.placedAt)}`,
      ]}
    >
      <section aria-label="Billed to" className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          Billed and shipped to
        </p>
        <p className="font-semibold text-gray-900">{order.customer.name}</p>
        <p>
          {[buyer.line1, buyer.line2, `${buyer.city}, ${buyer.state} ${buyer.pincode}`]
            .filter(Boolean)
            .join(", ")}
        </p>
        {order.gstin && <p>GSTIN {order.gstin}</p>}
      </section>

      <div className="overflow-x-auto">
        <table className="w-full min-w-xl text-left">
          <thead className="border-b border-gray-200 text-xs text-gray-500">
            <tr>
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Taxable value</th>
              <th className="py-2 text-right font-medium">GST</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 tabular-nums">
            {lines.map((line) => (
              <tr key={line.id}>
                <td className="py-2">
                  {line.name}
                  <span className="block text-xs text-gray-500">{line.sku}</span>
                </td>
                <td className="py-2 text-right">{line.quantity}</td>
                <td className="py-2 text-right">{formatPrice(line.taxable, { exact: true })}</td>
                <td className="py-2 text-right">
                  {formatPrice(line.gst, { exact: true })}
                  <span className="block text-xs text-gray-500">{line.gstRate}%</span>
                </td>
                <td className="py-2 text-right">{formatPrice(line.total, { exact: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="ml-auto flex w-full max-w-xs flex-col gap-1 tabular-nums">
        {order.discount > 0 && <AmountRow label="Discount" value={-order.discount} />}
        <AmountRow label="Delivery" value={order.deliveryCharge} />
        <AmountRow label="Taxable value" value={taxable} />
        {intraState ? (
          <>
            <AmountRow label="CGST" value={Math.floor(order.gstAmount / 2)} />
            <AmountRow label="SGST" value={Math.ceil(order.gstAmount / 2)} />
          </>
        ) : (
          <AmountRow label="IGST" value={order.gstAmount} />
        )}
        <div className="mt-1 flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
          <dt>Total (incl. GST)</dt>
          <dd>{formatPrice(order.total, { exact: true })}</dd>
        </div>
      </dl>
    </TaxDocument>
  )
}
