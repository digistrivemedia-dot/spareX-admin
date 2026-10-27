import { Inbox, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  description?: string
  icon?: LucideIcon
  /** Usually one button that resolves the empty state (add the first item, clear filters). */
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-navy-50 text-navy-700">
        <Icon aria-hidden className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        {description && <p className="max-w-sm text-sm text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
