import { ImageOff } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import { EmptyState } from "@/components/ui/EmptyState"
import { MapLink } from "@/components/ui/MapLink"
import { Thumbnail } from "@/components/ui/Thumbnail"
import type { GarageDetail } from "@/features/garages/types"
import { WEEKDAY_LABELS } from "@/features/garages/utils"
import { VEHICLE_TYPE_LABELS } from "@/features/masters/utils"
import { formatDate, formatPhone } from "@/lib/format"

/** What customers see about the garage, and its working hours. */
export function GarageProfile({ garage }: { garage: GarageDetail }) {
  const { address } = garage

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm text-gray-700">{garage.description || "No description yet."}</p>
          <DetailList
            items={[
              { label: "Owner", value: garage.ownerName },
              { label: "Mobile", value: formatPhone(garage.phone) },
              { label: "Email", value: garage.email },
              { label: "GSTIN", value: garage.gstin },
              {
                label: "Vehicles",
                value: garage.vehicleTypes.map((type) => VEHICLE_TYPE_LABELS[type]).join(", "),
              },
              { label: "Free pick and drop", value: garage.pickAndDrop ? "Yes" : "No" },
              {
                label: "Address",
                value: [address.line1, address.line2, `${address.city} ${address.pincode}`]
                  .filter(Boolean)
                  .join(", "),
              },
              {
                label: "Live since",
                value: garage.liveSince ? formatDate(garage.liveSince) : "Not live",
              },
            ]}
          />
          <MapLink location={garage.location} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Opening hours</CardTitle>
        </CardHeader>
        <CardContent>
          {garage.openingHours.length === 0 ? (
            <p className="text-sm text-warning-700">Not set yet.</p>
          ) : (
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {garage.openingHours.map((day) => (
                <div
                  key={day.day}
                  className="flex justify-between gap-4 border-b border-gray-100 py-1.5"
                >
                  <dt className="text-gray-500">{WEEKDAY_LABELS[day.day]}</dt>
                  <dd className="text-gray-900 tabular-nums">
                    {day.closed ? "Closed" : `${day.opensAt} – ${day.closesAt}`}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          {garage.photos.length === 0 ? (
            <EmptyState
              icon={ImageOff}
              title="No photos yet"
              description="The garage adds photos from B2B."
              className="py-6"
            />
          ) : (
            <div className="flex flex-wrap gap-3">
              {garage.photos.map((photo, index) => (
                <Thumbnail
                  key={photo}
                  src={photo}
                  alt={`${garage.name} photo ${index + 1}`}
                  size="md"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
