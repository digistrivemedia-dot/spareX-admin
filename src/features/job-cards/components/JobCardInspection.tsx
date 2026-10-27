import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import type { JobCard } from "@/features/job-cards/types"
import { INSPECTION_RESULT_LABELS } from "@/features/job-cards/utils"
import { INSPECTION_SECTION_LABELS } from "@/features/masters/utils"
import { formatDateTime, formatNumber, humanize } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Check-in (odometer, fuel, complaints) and the inspection findings. */
export function JobCardInspection({ card }: { card: JobCard }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              {
                label: "Checked in",
                value: `${formatDateTime(card.checkIn.at)} by ${card.checkIn.by.name}`,
              },
              { label: "Odometer", value: `${formatNumber(card.checkIn.odometerKm)} km` },
              { label: "Fuel level", value: humanize(card.checkIn.fuelLevel) },
              { label: "Complaints", value: card.checkIn.complaints.join("; ") || "None" },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Inspection</CardTitle>
        </CardHeader>
        <CardContent>
          {card.inspection.length === 0 ? (
            <p className="text-sm text-gray-500">Not inspected yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200 text-sm">
              {card.inspection.map((finding) => (
                <li
                  key={`${finding.section}-${finding.item}`}
                  className="flex flex-wrap items-start gap-x-4 gap-y-1 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      {INSPECTION_SECTION_LABELS[finding.section]} · {finding.item}
                    </p>
                    {finding.note && <p className="text-xs text-gray-500">{finding.note}</p>}
                  </div>
                  <span
                    className={cn(
                      "font-medium",
                      finding.result === "ok" && "text-success-700",
                      finding.result === "attention" && "text-warning-700",
                      finding.result === "replace" && "text-danger-700",
                    )}
                  >
                    {INSPECTION_RESULT_LABELS[finding.result]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}
