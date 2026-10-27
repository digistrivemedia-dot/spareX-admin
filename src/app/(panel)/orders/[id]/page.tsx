import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getOrder } from "@/features/orders/api"
import { OrderActions } from "@/features/orders/components/OrderActions"
import { OrderItems } from "@/features/orders/components/OrderItems"
import { OrderParty } from "@/features/orders/components/OrderParty"
import { CHANNEL_LABELS } from "@/features/orders/utils"
import { formatDateTime, humanize } from "@/lib/format"

export const metadata: Metadata = { title: "Order" }

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params
  const session = await requirePermission("orders.view")
  const order = await getOrder(await requireToken(), id)
  if (!order) notFound()

  const timeline = order.timeline.toReversed().map((event, index) => ({
    id: `${event.status}-${index}`,
    at: event.at,
    actor: event.by,
    title: humanize(event.status),
    detail: event.note,
  }))

  return (
    <Container>
      <DetailLayout
        back={{ href: "/orders", label: "Orders" }}
        title={order.number}
        status={
          <>
            <StatusBadge domain="order" status={order.status} />
            <StatusBadge domain="payment" status={order.payment.status} />
          </>
        }
        facts={[
          { label: "Placed", value: formatDateTime(order.placedAt) },
          { label: "Channel", value: CHANNEL_LABELS[order.channel] },
          { label: "Total", value: <Price paise={order.total} gst="incl" /> },
          { label: "Invoice", value: order.invoiceNumber ?? "Issued on confirmation" },
        ]}
        actions={
          <OrderActions
            order={order}
            canManage={can(session, "orders.manage")}
            canConfirmPayment={can(session, "payments.manage")}
          />
        }
        activity={<ActivityTimeline title="Timeline" items={timeline} />}
      >
        <OrderItems order={order} />
        <OrderParty order={order} />
      </DetailLayout>
    </Container>
  )
}
