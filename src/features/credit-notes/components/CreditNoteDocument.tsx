import Link from "next/link"

import { AmountRow } from "@/components/ui/AmountRow"
import { TaxDocument } from "@/components/ui/TaxDocument"
import type { CreditNote } from "@/features/credit-notes/types"
import { APPLIED_TO_LABELS } from "@/features/credit-notes/utils"
import { formatDate, formatPrice } from "@/lib/format"

/** The credit note as printed. Links to the order and return are for the screen only. */
export function CreditNoteDocument({ note }: { note: CreditNote }) {
  return (
    <TaxDocument
      title="Credit note"
      meta={[`Credit note ${note.number}`, `Date ${formatDate(note.issuedAt)}`]}
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">Issued to</dt>
          <dd className="font-semibold text-gray-900">{note.customer.name}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">Against</dt>
          <dd>
            Order{" "}
            <Link href={`/orders/${note.orderId}`} className="text-navy-700 hover:underline">
              {note.orderNumber}
            </Link>
            {note.returnId && (
              <>
                {", return "}
                <Link href={`/returns/${note.returnId}`} className="text-navy-700 hover:underline">
                  {note.returnNumber}
                </Link>
              </>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">Reason</dt>
          <dd>{note.reason}</dd>
        </div>
      </dl>

      <div className="ml-auto flex w-full max-w-xs flex-col gap-2">
        <dl className="flex flex-col gap-1 tabular-nums">
          <AmountRow label="Taxable value" value={note.taxableAmount} />
          <AmountRow label="GST" value={note.gstAmount} />
          <div className="mt-1 flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
            <dt>Credit (incl. GST)</dt>
            <dd>{formatPrice(note.amount, { exact: true })}</dd>
          </div>
        </dl>
        <p className="text-xs text-gray-500">
          Applied to: {APPLIED_TO_LABELS[note.appliedTo].toLowerCase()}. Issued by{" "}
          {note.issuedBy.name}.
        </p>
      </div>
    </TaxDocument>
  )
}
