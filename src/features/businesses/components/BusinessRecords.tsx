import { Price } from "@/components/ui/Price"
import { RecordList, type RecordListItem } from "@/components/ui/RecordList"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { BusinessDetail } from "@/features/businesses/types"
import { formatDate, humanize } from "@/lib/format"

export type BusinessTab = "orders" | "quotations" | "returns"

/** The business's orders, quotations and returns, each linking to its own page. */
export function BusinessRecords({ business, tab }: { business: BusinessDetail; tab: BusinessTab }) {
  const lists: Record<BusinessTab, { title: string; empty: string; items: RecordListItem[] }> = {
    orders: {
      title: "Orders",
      empty: "No orders yet",
      items: business.orders.map((order) => ({
        id: order.id,
        href: `/orders/${order.id}`,
        title: order.number,
        subtitle: formatDate(order.placedAt),
        badge: <StatusBadge domain="order" status={order.status} />,
        meta: <Price paise={order.total} />,
      })),
    },
    quotations: {
      title: "Quotations",
      empty: "No quotations yet",
      items: business.quotations.map((quote) => ({
        id: quote.id,
        href: `/quotations/${quote.id}`,
        title: quote.number,
        subtitle: formatDate(quote.createdAt),
        badge: <StatusBadge domain="quotation" status={quote.status} />,
        meta: <Price paise={quote.total} />,
      })),
    },
    returns: {
      title: "Returns and replacements",
      empty: "No returns",
      items: business.returns.map((item) => ({
        id: item.id,
        href: `/returns/${item.id}`,
        title: item.number,
        subtitle: `${humanize(item.kind)} · requested ${formatDate(item.requestedAt)}`,
        badge: <StatusBadge domain="return" status={item.status} />,
      })),
    },
  }
  const list = lists[tab]
  return <RecordList title={list.title} items={list.items} emptyTitle={list.empty} />
}
