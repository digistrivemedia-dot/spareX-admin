import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Price } from "@/components/ui/Price"
import type { Quotation } from "@/features/quotations/types"
import { formatPrice } from "@/lib/format"

/** The quotation as last sent (or as requested), with its totals. Editing happens in `QuotationEditor`. */
export function QuotationSummary({
  quotation,
  showLines,
}: {
  quotation: Quotation
  showLines: boolean
}) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-gray-200 py-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {showLines ? "Products" : "Current totals"}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {showLines && (
          <ul className="divide-y divide-gray-200">
            {quotation.lines.map((line) => (
              <li
                key={line.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${line.productId}`}
                    className="font-medium text-navy-700 hover:underline"
                  >
                    {line.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {line.sku} · {line.quantity} × {formatPrice(line.unitPrice)} (
                    {line.discountPercent}% off {formatPrice(line.listPrice)})
                  </p>
                </div>
                <Price paise={line.total} />
              </li>
            ))}
          </ul>
        )}
        <dl className="flex flex-col gap-1 px-4 py-3 text-sm tabular-nums sm:px-6">
          <div className="flex justify-between">
            <dt className="text-gray-500">Subtotal</dt>
            <dd>{formatPrice(quotation.subtotal)}</dd>
          </div>
          {quotation.extraDiscount > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Extra discount</dt>
              <dd>{formatPrice(-quotation.extraDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-500">GST included</dt>
            <dd>{formatPrice(quotation.gstAmount, { exact: true })}</dd>
          </div>
          <div className="mt-1 flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
            <dt>Total</dt>
            <dd>
              <Price paise={quotation.total} gst="incl" />
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
