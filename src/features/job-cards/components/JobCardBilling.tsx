import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import { Price } from "@/components/ui/Price"
import type { JobCard } from "@/features/job-cards/types"
import { formatDateTime } from "@/lib/format"

/** Quality check, the garage's invoice (in its own name and GST) and how the customer paid. */
export function JobCardBilling({ card }: { card: JobCard }) {
  const { qualityCheck: qc, invoice, payment } = card

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quality check, invoice and payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DetailList
          items={[
            {
              label: "Quality check",
              value: qc
                ? `${qc.passed ? "Passed" : "Failed"} · ${qc.by.name}, ${formatDateTime(qc.at)}${qc.notes ? ` · ${qc.notes}` : ""}`
                : "Not done yet",
            },
            {
              label: "Invoice",
              value: invoice
                ? `${invoice.number} · ${formatDateTime(invoice.issuedAt)}`
                : "Not issued yet",
            },
            {
              label: "Taxable value",
              value: invoice ? <Price paise={invoice.taxableAmount} exact /> : "–",
            },
            { label: "GST", value: invoice ? <Price paise={invoice.gstAmount} exact /> : "–" },
            {
              label: "Invoice total",
              value: invoice ? <Price paise={invoice.total} gst="incl" exact /> : "–",
            },
            {
              label: "Payment",
              value:
                payment.status === "paid"
                  ? `Paid ${payment.method === "online" ? "online" : "at the garage"}${payment.paidAt ? `, ${formatDateTime(payment.paidAt)}` : ""}`
                  : "Not paid yet",
            },
          ]}
        />
      </CardContent>
    </Card>
  )
}
