"use client"

import { useEffect, useState } from "react"

import { ErrorState } from "@/components/ui/ErrorState"
import { Skeleton } from "@/components/ui/skeleton"
import { getStockHistoryAction } from "@/features/catalog/actions"
import type { StockAdjustment } from "@/features/catalog/types"
import { STOCK_REASON_LABELS } from "@/features/catalog/utils"
import { formatDateTime, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: StockAdjustment[] }

/** A product's stock adjustments, newest first. Loads when the drawer opens. */
export function StockHistory({ productId }: { productId: string }) {
  const [state, setState] = useState<State>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    getStockHistoryAction(productId).then((result) =>
      setState(
        result.ok
          ? { status: "ready", rows: result.data }
          : { status: "error", message: result.error },
      ),
    )
  }, [productId, attempt])

  if (state.status === "loading") {
    return (
      <div role="status" aria-label="Loading" className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    )
  }
  if (state.status === "error") {
    return (
      <ErrorState
        description={state.message}
        onRetry={() => {
          setState({ status: "loading" })
          setAttempt((value) => value + 1)
        }}
      />
    )
  }
  if (state.rows.length === 0) return <p className="text-sm text-gray-500">No adjustments yet.</p>

  return (
    <ol className="flex flex-col divide-y divide-gray-200">
      {state.rows.map((row) => (
        <li key={row.id} className="flex items-start gap-3 py-3">
          <span
            className={cn(
              "w-14 shrink-0 text-right font-semibold tabular-nums",
              row.change > 0 ? "text-success-700" : "text-danger-700",
            )}
          >
            {row.change > 0 ? "+" : ""}
            {formatNumber(row.change)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{STOCK_REASON_LABELS[row.reason]}</p>
            <p className="text-sm text-gray-600">{row.note}</p>
            <p className="mt-1 text-xs text-gray-500">
              {row.by.name} · {formatDateTime(row.at)} · balance {formatNumber(row.balanceAfter)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
