import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/ui/PrintButton"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getOrder } from "@/features/orders/api"
import { InvoiceDocument } from "@/features/orders/components/InvoiceDocument"

export const metadata: Metadata = { title: "Invoice" }

export default async function InvoicePage({ params }: PageProps<"/orders/[id]/invoice">) {
  const { id } = await params
  await requirePermission("orders.view")
  const order = await getOrder(await requireToken(), id)
  if (!order?.invoiceNumber) notFound()

  return (
    <Container className="max-w-4xl">
      <div className="print:hidden">
        <PageHeader
          title={`Invoice ${order.invoiceNumber}`}
          description="Print it or save it as PDF from the print dialog."
          actions={
            <>
              <Button variant="outline" asChild>
                <Link href={`/orders/${order.id}`}>Back to order</Link>
              </Button>
              <PrintButton label="Print or save PDF" />
            </>
          }
        />
      </div>
      <InvoiceDocument order={order} />
    </Container>
  )
}
