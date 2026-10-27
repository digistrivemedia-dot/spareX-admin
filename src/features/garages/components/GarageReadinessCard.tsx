import { CheckCircle2, Circle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GarageReadiness } from "@/features/garages/types"
import { READINESS_LABELS } from "@/features/garages/utils"
import { cn } from "@/lib/utils"

/** The go-live checklist: everything must be done before customers can see the garage. */
export function GarageReadinessCard({ readiness }: { readiness: GarageReadiness }) {
  const items = Object.entries(readiness) as [keyof GarageReadiness, boolean][]
  const done = items.filter(([, ok]) => ok).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Go-live checklist ({done} of {items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {items.map(([key, ok]) => (
            <li
              key={key}
              className={cn(
                "flex items-center gap-2 text-sm",
                ok ? "text-gray-700" : "text-warning-700",
              )}
            >
              {ok ? (
                <CheckCircle2 aria-hidden className="size-4 text-success-600" />
              ) : (
                <Circle aria-hidden className="size-4" />
              )}
              {READINESS_LABELS[key]}
              <span className="sr-only">{ok ? "(done)" : "(missing)"}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
