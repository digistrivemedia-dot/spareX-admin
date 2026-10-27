import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { EstimateItem } from "@/features/job-cards/types"
import { formatDateTime } from "@/lib/format"

/** Parts and labour the garage proposed, with the customer's decision on each item and when it was made. */
export function JobCardEstimate({ items }: { items: EstimateItem[] }) {
  const approved = items
    .filter((item) => item.approval === "approved")
    .reduce((sum, item) => sum + item.total, 0)

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-gray-200 py-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Estimate and approvals
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500 sm:px-6">No estimate sent yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    {item.kind === "part" ? "Part" : "Labour"} · qty {item.quantity}
                    {item.decidedAt && ` · decided ${formatDateTime(item.decidedAt)}`}
                  </p>
                </div>
                <StatusBadge domain="approval" status={item.approval} />
                <Price paise={item.total} className="w-24 text-right" />
              </li>
            ))}
            <li className="flex justify-between gap-4 px-4 py-3 font-medium text-gray-900 sm:px-6">
              <span>Approved total</span>
              <Price paise={approved} gst="incl" />
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
