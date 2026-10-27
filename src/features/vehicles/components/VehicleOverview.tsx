import { ExternalLink } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import { FUEL_LABELS, VEHICLE_TYPE_LABELS } from "@/features/masters/utils"
import type { VehicleDetail } from "@/features/vehicles/types"
import { DOCUMENT_LABELS } from "@/features/vehicles/utils"
import { formatDate, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

/** The vehicle's digital record: details and documents, with expired documents flagged. */
export function VehicleOverview({ vehicle }: { vehicle: VehicleDetail }) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              { label: "Brand and model", value: `${vehicle.brandName} ${vehicle.modelName}` },
              { label: "Variant", value: vehicle.variantName },
              { label: "Type", value: VEHICLE_TYPE_LABELS[vehicle.vehicleType] },
              { label: "Fuel", value: FUEL_LABELS[vehicle.fuel] },
              { label: "Year", value: vehicle.year },
              { label: "Colour", value: vehicle.colour },
              { label: "Chassis no.", value: vehicle.chassisNumber },
              { label: "Odometer", value: `${formatNumber(vehicle.odometerKm)} km` },
              {
                label: "Added by",
                value: vehicle.addedBy === "garage" ? "A garage, at check-in" : "The customer",
              },
              { label: "Added on", value: formatDate(vehicle.createdAt) },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {vehicle.documents.map((document) => {
              const expired = document.expiresOn !== null && document.expiresOn < today
              return (
                <li key={document.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{DOCUMENT_LABELS[document.type]}</p>
                    <p className="text-xs text-gray-500">{document.number}</p>
                  </div>
                  {document.expiresOn && (
                    <span
                      className={cn(
                        "text-sm",
                        expired ? "font-medium text-danger-700" : "text-gray-600",
                      )}
                    >
                      {expired ? "Expired" : "Valid until"} {formatDate(document.expiresOn)}
                    </span>
                  )}
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-navy-700 hover:underline"
                  >
                    Open
                    <ExternalLink aria-hidden className="size-3.5" />
                  </a>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
