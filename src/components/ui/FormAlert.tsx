import { AlertCircle, CheckCircle2, TriangleAlert } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type Tone = "error" | "warning" | "success"

const TONES: Record<Tone, { icon: typeof AlertCircle; className: string }> = {
  error: { icon: AlertCircle, className: "border-danger-600/30 bg-danger-50 text-danger-700" },
  warning: {
    icon: TriangleAlert,
    className: "border-warning-500/40 bg-warning-50 text-warning-700",
  },
  success: {
    icon: CheckCircle2,
    className: "border-success-600/30 bg-success-50 text-success-700",
  },
}

/** A message above a form or record: an error, something that needs action, or a confirmation. */
export function FormAlert({ tone, children }: { tone: Tone; children: ReactNode }) {
  const { icon: Icon, className } = TONES[tone]
  return (
    <div
      role={tone === "success" ? "status" : "alert"}
      className={cn("flex gap-2 rounded-lg border px-3 py-2.5 text-sm", className)}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
