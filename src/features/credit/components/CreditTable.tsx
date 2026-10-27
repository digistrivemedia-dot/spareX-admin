"use client"

import { CreditCard } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import type { CreditAccountListItem } from "@/features/businesses/types"
import { exportCreditAccountsAction } from "@/features/credit/actions"
import { creditColumns } from "@/features/credit/columns"
import { CREDIT_STATUS_OPTIONS } from "@/features/credit/utils"
import type { Paginated } from "@/lib/types"

type CreditTableProps = { data: Paginated<CreditAccountListItem>; canExport: boolean }

export function CreditTable({ data, canExport }: CreditTableProps) {
  return (
    <DataTable
      columns={creditColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportCreditAccountsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search businesses"
          filters={[
            { type: "select", key: "status", label: "Status", options: CREDIT_STATUS_OPTIONS },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={CreditCard}
          title="No credit accounts"
          description="Credit is off by default. Enable it from a business's page."
        />
      }
    />
  )
}
