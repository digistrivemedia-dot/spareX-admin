import { cn } from "@/lib/utils"

type LogoProps = {
  /** "light" for the navy sidebar, "dark" for white backgrounds. */
  tone?: "light" | "dark"
  /** Only the "SX" mark, for the collapsed sidebar. */
  compact?: boolean
  className?: string
}

/** Text wordmark until the client's brand guide arrives. */
export function Logo({ tone = "dark", compact = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-sm font-bold text-white"
      >
        SX
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span
            className={cn(
              "text-base font-semibold",
              tone === "light" ? "text-white" : "text-navy-900",
            )}
          >
            SpareX Admin
          </span>
          <span className={cn("text-xs", tone === "light" ? "text-navy-200" : "text-gray-500")}>
            by Kannali Garage
          </span>
        </span>
      )}
      {compact && <span className="sr-only">SpareX Admin by Kannali Garage</span>}
    </div>
  )
}
