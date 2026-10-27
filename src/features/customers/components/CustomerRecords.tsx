import { Price } from "@/components/ui/Price"
import { RecordList, type RecordListItem } from "@/components/ui/RecordList"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { CustomerDetail } from "@/features/customers/types"
import { ENQUIRY_KIND_LABELS } from "@/features/enquiries/utils"
import { vehicleTitle } from "@/features/vehicles/utils"
import { formatDate, humanize } from "@/lib/format"

export type CustomerTab = "vehicles" | "orders" | "returns" | "bookings" | "enquiries"

/** The customer's related records for one tab, each linking to its own page. */
export function CustomerRecords({ customer, tab }: { customer: CustomerDetail; tab: CustomerTab }) {
  const lists: Record<CustomerTab, { title: string; empty: string; items: RecordListItem[] }> = {
    vehicles: {
      title: "Vehicles",
      empty: "No vehicles added",
      items: customer.vehicles.map((vehicle) => ({
        id: vehicle.id,
        href: `/vehicles/${vehicle.id}`,
        title: vehicle.registrationNumber,
        subtitle: vehicleTitle(vehicle),
      })),
    },
    orders: {
      title: "Orders",
      empty: "No orders yet",
      items: customer.orders.map((order) => ({
        id: order.id,
        href: `/orders/${order.id}`,
        title: order.number,
        subtitle: formatDate(order.placedAt),
        badge: <StatusBadge domain="order" status={order.status} />,
        meta: <Price paise={order.total} />,
      })),
    },
    returns: {
      title: "Returns and replacements",
      empty: "No returns",
      items: customer.returns.map((item) => ({
        id: item.id,
        href: `/returns/${item.id}`,
        title: item.number,
        subtitle: `${humanize(item.kind)} · requested ${formatDate(item.requestedAt)}`,
        badge: <StatusBadge domain="return" status={item.status} />,
      })),
    },
    bookings: {
      title: "Service bookings",
      empty: "No bookings",
      items: customer.bookings.map((booking) => ({
        id: booking.id,
        href: `/bookings/${booking.id}`,
        title: booking.number,
        subtitle: `${booking.garageName} · ${formatDate(booking.date)}`,
        badge: <StatusBadge domain="booking" status={booking.status} />,
      })),
    },
    enquiries: {
      title: "Enquiries",
      empty: "No enquiries",
      items: customer.enquiries.map((enquiry) => ({
        id: enquiry.id,
        href: `/enquiries/${enquiry.id}`,
        title: enquiry.number,
        subtitle: `${ENQUIRY_KIND_LABELS[enquiry.kind]} · ${formatDate(enquiry.createdAt)}`,
        badge: <StatusBadge domain="enquiry" status={enquiry.status} />,
      })),
    },
  }
  const list = lists[tab]
  return <RecordList title={list.title} items={list.items} emptyTitle={list.empty} />
}
