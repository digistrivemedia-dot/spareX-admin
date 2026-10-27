import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/format"
import type { ActorRef, IsoDateTime } from "@/lib/types"

export type ActivityItem = {
  id: string
  at: IsoDateTime
  actor: ActorRef
  title: string
  /** "Price: ₹459 → ₹449", or a note. */
  detail?: string
}

/** The history of a record, newest first. Fed by the record's timeline or by its audit entries. */
export function ActivityTimeline({
  items,
  title = "Activity",
}: {
  items: ActivityItem[]
  title?: string
}) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No activity yet.</p>
        ) : (
          <ol className="relative flex flex-col gap-5 border-l border-gray-200 pl-5">
            {items.map((item) => (
              <li key={item.id} className="relative">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-6 size-2.5 rounded-full border-2 border-white bg-navy-600"
                />
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                {item.detail && <p className="mt-0.5 text-sm text-gray-600">{item.detail}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  {item.actor.name} · <time dateTime={item.at}>{formatDateTime(item.at)}</time>
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
