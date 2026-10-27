import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import { FormAlert } from "@/components/ui/FormAlert"
import { Price } from "@/components/ui/Price"
import type { Booking } from "@/features/bookings/types"
import { isEnabled } from "@/lib/features"
import { formatDate, formatPhone } from "@/lib/format"
import type { Address } from "@/lib/types"

const oneLine = (address: Address) =>
  [address.line1, address.line2, `${address.city} ${address.pincode}`].filter(Boolean).join(", ")

/** Everything about the booking, read only: who, which vehicle, where, what, and pick and drop. */
export function BookingDetails({ booking }: { booking: Booking }) {
  return (
    <>
      {booking.status === "cancelled" && booking.cancellationReason && (
        <FormAlert tone="warning">Cancelled: {booking.cancellationReason}</FormAlert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              {
                label: "Customer",
                value: (
                  <Link
                    href={`/customers/${booking.customer.id}`}
                    className="text-navy-700 hover:underline"
                  >
                    {booking.customer.name}
                  </Link>
                ),
              },
              { label: "Mobile", value: formatPhone(booking.customer.phone) },
              {
                label: "Vehicle",
                value: (
                  <Link
                    href={`/vehicles/${booking.vehicleId}`}
                    className="text-navy-700 hover:underline"
                  >
                    {booking.registrationNumber} · {booking.vehicleLabel}
                  </Link>
                ),
              },
              {
                label: "Garage",
                value: (
                  <Link
                    href={`/garages/${booking.garageId}`}
                    className="text-navy-700 hover:underline"
                  >
                    {booking.garageName}
                  </Link>
                ),
              },
              { label: "Service date", value: formatDate(booking.date) },
              ...(isEnabled("bookingTimeSlots")
                ? [{ label: "Time slot", value: booking.timeSlot ?? "–" }]
                : []),
              { label: "Customer note", value: booking.customerNote || "–" },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200 text-sm">
            {booking.services.map((service) => (
              <li key={service.serviceId} className="flex justify-between gap-4 py-2">
                <span>{service.name}</span>
                <Price paise={service.price} />
              </li>
            ))}
            <li className="flex justify-between gap-4 pt-3 font-medium text-gray-900">
              <span>Estimate (garage&apos;s prices)</span>
              <Price paise={booking.estimatedTotal} gst="incl" />
            </li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Pick and drop</CardTitle>
        </CardHeader>
        <CardContent>
          {booking.pickAndDrop ? (
            <DetailList
              items={[
                { label: "Pickup window", value: booking.pickAndDrop.pickupWindow },
                { label: "Pickup address", value: oneLine(booking.pickAndDrop.pickupAddress) },
                { label: "Drop address", value: oneLine(booking.pickAndDrop.dropAddress) },
              ]}
            />
          ) : (
            <p className="text-sm text-gray-500">The customer brings the vehicle to the garage.</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
