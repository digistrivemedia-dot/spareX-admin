import { ChevronRight, Inbox } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/EmptyState"

export type RecordListItem = {
  id: string
  href: string
  title: ReactNode
  subtitle?: ReactNode
  /** Right-hand side: an amount or a date. */
  meta?: ReactNode
  /** Usually a `StatusBadge`. */
  badge?: ReactNode
}

type RecordListProps = {
  title: string
  items: RecordListItem[]
  emptyTitle: string
}

/** A short list of related records on a detail page (a customer's orders, a vehicle's visits…). */
export function RecordList({ title, items, emptyTitle }: RecordListProps) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-gray-200 py-4">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {items.length === 0 ? (
          <EmptyState icon={Inbox} title={emptyTitle} className="py-10" />
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none sm:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-navy-700">{item.title}</p>
                    {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right sm:flex-row sm:items-center sm:gap-4">
                    {item.badge}
                    {item.meta && (
                      <span className="text-sm text-gray-700 tabular-nums">{item.meta}</span>
                    )}
                  </div>
                  <ChevronRight aria-hidden className="size-4 shrink-0 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
