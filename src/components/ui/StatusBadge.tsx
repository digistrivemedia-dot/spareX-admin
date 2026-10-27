import { cva } from "class-variance-authority"

import { humanize } from "@/lib/format"
import { STATUS_TONES, type StatusDomain, type StatusOf, type StatusTone } from "@/lib/status"
import { cn } from "@/lib/utils"

const toneVariants = cva(
  "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        success: "bg-success-50 text-success-700",
        warning: "bg-warning-50 text-warning-700",
        danger: "bg-danger-50 text-danger-700",
        info: "bg-info-50 text-info-700",
        navy: "bg-navy-50 text-navy-700",
        neutral: "bg-gray-100 text-gray-600",
      } satisfies Record<StatusTone, string>,
    },
  },
)

type StatusBadgeProps<D extends StatusDomain> = {
  domain: D
  status: StatusOf<D>
  /** Overrides the label derived from the status, e.g. "Live" instead of "live". */
  label?: string
  className?: string
}

export function StatusBadge<D extends StatusDomain>({
  domain,
  status,
  label,
  className,
}: StatusBadgeProps<D>) {
  const tones: Record<string, StatusTone> = STATUS_TONES[domain]
  return (
    <span className={cn(toneVariants({ tone: tones[status] ?? "neutral" }), className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label ?? humanize(status)}
    </span>
  )
}
