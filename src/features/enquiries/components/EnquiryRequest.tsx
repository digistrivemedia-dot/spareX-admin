import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import type { Enquiry } from "@/features/enquiries/types"
import { VEHICLE_TYPE_LABELS } from "@/features/masters/utils"

/** What the customer asked for, with one-click routes to fix it in the vehicle master or the catalogue. */
export function EnquiryRequest({ enquiry }: { enquiry: Enquiry }) {
  const { vehicleType, brand, model, variant, year } = enquiry.vehicle
  const vehicleSearch = new URLSearchParams({ q: model, type: vehicleType }).toString()
  const partSearch = new URLSearchParams({
    q: enquiry.partQuery ?? "",
    type: vehicleType,
  }).toString()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Request</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <DetailList
          items={[
            { label: "Vehicle type", value: VEHICLE_TYPE_LABELS[vehicleType] },
            { label: "Brand and model", value: `${brand} ${model}` },
            { label: "Variant", value: variant ?? "Not given" },
            { label: "Year", value: year ?? "Not given" },
            ...(enquiry.partQuery ? [{ label: "Part wanted", value: enquiry.partQuery }] : []),
          ]}
        />
        <blockquote className="rounded-lg border-l-4 border-navy-200 bg-navy-50 px-4 py-3 text-sm text-gray-700">
          {enquiry.message}
        </blockquote>
        <div className="flex flex-wrap gap-2">
          {enquiry.kind === "vehicle_not_listed" ? (
            <Button variant="outline" asChild>
              <Link href={`/masters/vehicle-models?${vehicleSearch}`}>
                Add the vehicle in Masters
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href={`/products?${partSearch}`}>
                  Find a product to add fitment
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/masters/vehicle-models?${vehicleSearch}`}>
                  Check the vehicle master
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
