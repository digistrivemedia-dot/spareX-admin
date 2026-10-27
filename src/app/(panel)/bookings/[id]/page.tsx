import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { Button } from "@/components/ui/button"
import { ReasonDialog } from "@/components/ui/ReasonDialog"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { cancelBookingAction } from "@/features/bookings/actions"
import { getBooking } from "@/features/bookings/api"
import { BookingDetails } from "@/features/bookings/components/BookingDetails"
import { CANCELLABLE_BOOKING_STATUSES } from "@/features/bookings/utils"
import { formatDate, humanize } from "@/lib/format"

export const metadata: Metadata = { title: "Booking" }

export default async function BookingPage({ params }: PageProps<"/bookings/[id]">) {
  const { id } = await params
  const session = await requirePermission("bookings.view")
  const booking = await getBooking(await requireToken(), id)
  if (!booking) notFound()

  const cancellable =
    can(session, "bookings.manage") && CANCELLABLE_BOOKING_STATUSES.includes(booking.status)
  const timeline = booking.timeline.toReversed().map((event, index) => ({
    id: `${event.status}-${index}`,
    at: event.at,
    actor: event.by,
    title: humanize(event.status),
    detail: event.note,
  }))

  return (
    <Container>
      <DetailLayout
        back={{ href: "/bookings", label: "Bookings" }}
        title={booking.number}
        status={<StatusBadge domain="booking" status={booking.status} />}
        facts={[
          { label: "Service date", value: formatDate(booking.date) },
          { label: "Garage", value: booking.garageName },
          {
            label: "Pick and drop",
            value: booking.pickAndDrop ? booking.pickAndDrop.pickupWindow : "No",
          },
          {
            label: "Job card",
            value: booking.jobCardId ? (
              <Link
                href={`/job-cards/${booking.jobCardId}`}
                className="text-navy-700 hover:underline"
              >
                Open job card
              </Link>
            ) : (
              "Not started"
            ),
          },
        ]}
        actions={
          cancellable && (
            <ReasonDialog
              trigger={<Button variant="destructive">Cancel booking</Button>}
              title={`Cancel ${booking.number}?`}
              description="The customer and the garage are told, with your reason."
              reasonLabel="Reason for cancelling"
              suggestions={[
                "Garage closed that day",
                "Customer asked us to cancel",
                "Duplicate booking",
              ]}
              confirmLabel="Cancel booking"
              destructive
              onConfirm={cancelBookingAction.bind(null, booking.id)}
              successMessage="Booking cancelled"
            />
          )
        }
        activity={<ActivityTimeline title="History" items={timeline} />}
      >
        <BookingDetails booking={booking} />
      </DetailLayout>
    </Container>
  )
}
