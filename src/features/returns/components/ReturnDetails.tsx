import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import { FormAlert } from "@/components/ui/FormAlert"
import { Price } from "@/components/ui/Price"
import { Thumbnail } from "@/components/ui/Thumbnail"
import type { ReturnRequest } from "@/features/returns/types"
import { RESOLVED_STATUS } from "@/features/returns/utils"
import { formatDate, formatDateTime, formatPrice, humanize } from "@/lib/format"

/** Items, the customer's request, pickup, verification and how it was settled. */
export function ReturnDetails({ request }: { request: ReturnRequest }) {
  const { pickup, verification, resolution } = request
  const photos = [...request.photos, ...(verification?.photos ?? [])]

  return (
    <>
      {request.rejectionReason && (
        <FormAlert tone="warning">Rejected: {request.rejectionReason}</FormAlert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {request.items.map((item) => (
              <li key={item.orderItemId} className="flex items-center gap-4 py-2 first:pt-0">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-medium text-navy-700 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {item.sku} · {item.quantity} returned
                  </p>
                </div>
                <Price paise={item.amount} gst="incl" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Request and handling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              { label: "Reason", value: humanize(request.reason) },
              { label: "Customer says", value: request.customerNote },
              {
                label: "Pickup",
                value: pickup ? `${formatDate(pickup.date)}, ${pickup.window}` : "Not scheduled",
              },
              {
                label: "Verification",
                value: verification
                  ? `${humanize(verification.condition)}: ${verification.notes} (${formatDateTime(verification.at)})`
                  : "Not verified yet",
              },
              {
                label: "Resolution",
                value: resolution ? (
                  <>
                    {humanize(RESOLVED_STATUS[resolution.type])}{" "}
                    {resolution.type === "replacement" ? (
                      resolution.reference
                    ) : (
                      <Link
                        href={`/credit-notes?q=${encodeURIComponent(resolution.reference)}`}
                        className="text-navy-700 hover:underline"
                      >
                        {resolution.reference}
                      </Link>
                    )}
                    , {formatPrice(resolution.amount)} on {formatDate(resolution.at)}
                  </>
                ) : (
                  "Not resolved yet"
                ),
              },
            ]}
          />
          {photos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {photos.map((photo) => (
                <Thumbnail key={photo} src={photo} alt="Return photo" size="md" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
