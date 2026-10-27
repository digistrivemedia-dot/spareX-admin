import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: ReactNode
  /** A short line under the value, e.g. "12 waiting more than 3 days". */
  hint?: string
  icon?: LucideIcon
  /** Makes the whole tile a link to the filtered list. */
  href?: string
  /** "attention" highlights tiles in the "Needs attention" row. */
  tone?: "default" | "attention"
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "default",
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {Icon && (
          <Icon
            aria-hidden
            className={cn("size-5", tone === "attention" ? "text-warning-700" : "text-navy-600")}
          />
        )}
      </div>
      <p className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </>
  )
  const className = cn(
    "flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm",
    tone === "attention" ? "border-warning-500/40" : "border-gray-200",
    href &&
      "transition-colors hover:border-navy-200 hover:bg-navy-50/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
  )
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  )
}
