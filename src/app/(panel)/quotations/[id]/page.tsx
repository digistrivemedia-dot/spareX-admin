import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getBusiness } from "@/features/businesses/api"
import { getProductOptions } from "@/features/catalog/api"
import { getQuotation } from "@/features/quotations/api"
import { QuotationEditor } from "@/features/quotations/components/QuotationEditor"
import { QuotationSummary } from "@/features/quotations/components/QuotationSummary"
import { isEditable } from "@/features/quotations/utils"
import { formatDate, formatDateTime, formatPrice } from "@/lib/format"

export const metadata: Metadata = { title: "Quotation" }

export default async function QuotationPage({ params }: PageProps<"/quotations/[id]">) {
  const { id } = await params
  const session = await requirePermission("quotations.view")
  const token = await requireToken()
  const quotation = await getQuotation(token, id)
  if (!quotation) notFound()

  const editable = isEditable(quotation.status) && can(session, "quotations.manage")
  const [business, products] = editable
    ? await Promise.all([getBusiness(token, quotation.businessId), getProductOptions(token)])
    : [null, []]

  const revisions = quotation.revisions.toReversed().map((revision) => ({
    id: String(revision.version),
    at: revision.at,
    actor: revision.by,
    title: `Revision ${revision.version} · ${formatPrice(revision.total)}`,
    detail: revision.note,
  }))

  return (
    <Container>
      <DetailLayout
        back={{ href: "/quotations", label: "Quotations" }}
        title={quotation.number}
        status={<StatusBadge domain="quotation" status={quotation.status} />}
        facts={[
          {
            label: "Business",
            value: (
              <Link
                href={`/businesses/${quotation.businessId}`}
                className="text-navy-700 hover:underline"
              >
                {quotation.businessName}
              </Link>
            ),
          },
          {
            label: "Requested by",
            value: `${quotation.requestedBy.name}, ${formatDateTime(quotation.createdAt)}`,
          },
          {
            label: "Valid until",
            value: quotation.validUntil ? formatDate(quotation.validUntil) : "Not sent yet",
          },
        ]}
        actions={
          quotation.orderId && (
            <Button variant="outline" asChild>
              <Link href={`/orders/${quotation.orderId}`}>View order</Link>
            </Button>
          )
        }
        activity={<ActivityTimeline title="Revisions" items={revisions} />}
      >
        <QuotationSummary quotation={quotation} showLines={!editable} />
        {editable && (
          <QuotationEditor
            quotation={quotation}
            products={products}
            businessDiscount={business?.discountPercent ?? 0}
          />
        )}
      </DetailLayout>
    </Container>
  )
}
