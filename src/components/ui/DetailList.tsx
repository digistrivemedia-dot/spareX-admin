import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DetailItem = { label: string; value: ReactNode }

/** Label / value pairs for record details. Two columns from `sm` up. */
export function DetailList({ items, className }: { items: DetailItem[]; className?: string }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-4 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs font-medium text-gray-500">{item.label}</dt>
          <dd className="mt-1 text-sm break-words text-gray-900">{item.value ?? "–"}</dd>
        </div>
      ))}
    </dl>
  )
}
