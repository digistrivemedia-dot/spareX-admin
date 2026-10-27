import { RecordList, type RecordListItem } from "@/components/ui/RecordList"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { GarageDetail } from "@/features/garages/types"
import { formatDate } from "@/lib/format"

export type GarageTab = "bookings" | "jobCards" | "ratings"

/** The garage's bookings, job cards and customer ratings. */
export function GarageRecords({ garage, tab }: { garage: GarageDetail; tab: GarageTab }) {
  const lists: Record<GarageTab, { title: string; empty: string; items: RecordListItem[] }> = {
    bookings: {
      title: "Bookings",
      empty: "No bookings yet",
      items: garage.bookings.map((booking) => ({
        id: booking.id,
        href: `/bookings/${booking.id}`,
        title: `${booking.number} · ${booking.customer.name}`,
        subtitle: `${formatDate(booking.date)} · ${booking.vehicleLabel}`,
        badge: <StatusBadge domain="booking" status={booking.status} />,
      })),
    },
    jobCards: {
      title: "Job cards",
      empty: "No job cards yet",
      items: garage.jobCards.map((card) => ({
        id: card.id,
        href: `/job-cards/${card.id}`,
        title: card.number,
        subtitle: `${formatDate(card.createdAt)} · ${card.vehicleLabel}`,
        badge: <StatusBadge domain="jobCard" status={card.status} />,
      })),
    },
    ratings: {
      title: "Customer ratings",
      empty: "No ratings yet",
      items: garage.reviews.map((review) => ({
        id: review.id,
        href: `/reviews?q=${encodeURIComponent(review.customerName)}`,
        title: `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} · ${review.customerName}`,
        subtitle: `${formatDate(review.createdAt)} · ${review.comment}`,
        badge: <StatusBadge domain="review" status={review.status} />,
      })),
    },
  }
  const list = lists[tab]
  return <RecordList title={list.title} items={list.items} emptyTitle={list.empty} />
}
