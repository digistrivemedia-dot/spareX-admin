"use client"

import { ReceiptText } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportCreditNotesAction } from "@/features/credit-notes/actions"
import { creditNoteColumns } from "@/features/credit-notes/columns"
import type { CreditNote } from "@/features/credit-notes/types"
import { APPLIED_TO_OPTIONS } from "@/features/credit-notes/utils"
import { CHANNEL_OPTIONS } from "@/features/orders/utils"
import type { Paginated } from "@/lib/types"

export function CreditNotesTable({
  data,
  canExport,
}: {
  data: Paginated<CreditNote>
  canExport: boolean
}) {
  return (
    <DataTable
      columns={creditNoteColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportCreditNotesAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search credit note, order, return or customer"
          filters={[
            { type: "select", key: "appliedTo", label: "Applied to", options: APPLIED_TO_OPTIONS },
            { type: "select", key: "channel", label: "Channel", options: CHANNEL_OPTIONS },
            { type: "dateRange", label: "Issued" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={ReceiptText}
          title="No credit notes yet"
          description="Credit notes are issued when a return is refunded or credited."
        />
      }
    />
  )
}
