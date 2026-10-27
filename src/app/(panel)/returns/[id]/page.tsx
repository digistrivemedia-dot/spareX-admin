import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getOrder } from "@/features/orders/api"
import { CHANNEL_LABELS } from "@/features/orders/utils"
import { getReturn } from "@/features/returns/api"
import { ReturnActions } from "@/features/returns/components/ReturnActions"
import { ReturnDetails } from "@/features/returns/components/ReturnDetails"
import { resolutionFor, returnAmount } from "@/features/returns/utils"
import { formatDateTime, humanize } from "@/lib/format"

export const metadata: Metadata = { title: "Return" }

export default async function ReturnPage({ params }: PageProps<"/returns/[id]">) {
  const { id } = await params
  const session = await requirePermission("returns.view")
  const token = await requireToken()
  const request = await getReturn(token, id)
  if (!request) notFound()
  const order = await getOrder(token, request.orderId)
  const amount = returnAmount(request)
  const customerHref =
    request.customer.type === "business"
      ? `/businesses/${request.customer.id}`
      : `/customers/${request.customer.id}`

  const timeline = request.timeline.toReversed().map((event, index) => ({
    id: `${event.status}-${index}`,
    at: event.at,
    actor: event.by,
    title: humanize(event.status),
    detail: event.note,
  }))

  return (
    <Container>
      <DetailLayout
        back={{ href: "/returns", label: "Returns" }}
        title={`${request.number} · ${humanize(request.kind)}`}
        status={<StatusBadge domain="return" status={request.status} />}
        facts={[
          {
            label: "Customer",
            value: (
              <Link href={customerHref} className="text-navy-700 hover:underline">
                {request.customer.name}
              </Link>
            ),
          },
          {
            label: "Order",
            value: (
              <Link href={`/orders/${request.orderId}`} className="text-navy-700 hover:underline">
                {request.orderNumber}
              </Link>
            ),
          },
          { label: "Channel", value: CHANNEL_LABELS[request.channel] },
          { label: "Requested", value: formatDateTime(request.requestedAt) },
          { label: "Amount", value: <Price paise={amount} gst="incl" /> },
        ]}
        actions={
          can(session, "returns.manage") &&
          order && (
            <ReturnActions
              request={request}
              resolution={resolutionFor(request.kind, order.payment.method)}
              amount={amount}
            />
          )
        }
        activity={<ActivityTimeline title="Timeline" items={timeline} />}
      >
        <ReturnDetails request={request} />
      </DetailLayout>
    </Container>
  )
}
