import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/EmptyState"
import { Price } from "@/components/ui/Price"
import type { CreditLedgerRow } from "@/features/businesses/types"
import { LEDGER_TYPE_LABELS } from "@/features/credit/utils"
import { formatDate, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Invoices, payments and credit notes, newest first, with the balance owed after each. */
export function CreditLedger({ rows }: { rows: CreditLedgerRow[] }) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-gray-200 py-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Ledger</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {rows.length === 0 ? (
          <EmptyState
            title="No entries yet"
            description="Credit orders, payments and credit notes appear here."
            className="py-10"
          />
        ) : (
          <ul className="divide-y divide-gray-200">
            {rows.map((row) => {
              const late = (row.unpaid ?? 0) > 0 && row.dueOn !== null && row.dueOn < today
              return (
                <li
                  key={row.id}
                  className="flex flex-wrap items-start gap-x-4 gap-y-1 px-4 py-3 sm:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      {LEDGER_TYPE_LABELS[row.type]} ·{" "}
                      {row.orderId ? (
                        <Link
                          href={`/orders/${row.orderId}`}
                          className="text-navy-700 hover:underline"
                        >
                          {row.reference}
                        </Link>
                      ) : (
                        row.reference
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(row.at)}
                      {row.unpaid === 0 && " · paid"}
                      {row.dueOn && (row.unpaid ?? 0) > 0 && (
                        <span className={cn(late && "text-danger-700")}>
                          {" "}
                          · {formatPrice(row.unpaid ?? 0)} due {formatDate(row.dueOn)}
                        </span>
                      )}
                      {row.note && ` · ${row.note}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Price
                      paise={Math.abs(row.amount)}
                      className={row.amount < 0 ? "text-success-700" : undefined}
                    />
                    <span className="text-xs text-gray-500">
                      {row.amount < 0 ? "Received" : "Owed"}
                    </span>
                  </div>
                  <div className="flex w-28 flex-col items-end">
                    <Price paise={row.balance} />
                    <span className="text-xs text-gray-500">Balance</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
