import { formatPrice } from "@/lib/format"
import type { Paise } from "@/lib/types"
import { cn } from "@/lib/utils"

type PriceProps = {
  paise: Paise
  /** Adds the "incl. GST" / "excl. GST" label that every amount needs once per context. */
  gst?: "incl" | "excl"
  /** Shows paise even when the amount is whole (invoices, ledgers). */
  exact?: boolean
  className?: string
}

export function Price({ paise, gst, exact, className }: PriceProps) {
  return (
    <span className={cn("font-semibold whitespace-nowrap text-gray-900 tabular-nums", className)}>
      {formatPrice(paise, { exact })}
      {gst && (
        <span className="ml-1 text-xs font-normal text-gray-500">
          {gst === "incl" ? "incl. GST" : "excl. GST"}
        </span>
      )}
    </span>
  )
}
