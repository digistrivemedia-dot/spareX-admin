"use client"

import { CircleHelp } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportFaqsAction } from "@/features/content/actions"
import { faqColumns } from "@/features/content/columns/faqs"
import type { Faq } from "@/features/content/types"
import { FAQ_CATEGORY_OPTIONS } from "@/features/content/utils"
import { ACTIVE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

type FaqsTableProps = { data: Paginated<Faq>; canManage: boolean; canExport: boolean }

export function FaqsTable({ data, canManage, canExport }: FaqsTableProps) {
  return (
    <DataTable
      columns={faqColumns(canManage)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportFaqsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search questions and answers"
          filters={[
            { type: "select", key: "category", label: "Category", options: FAQ_CATEGORY_OPTIONS },
            { type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={CircleHelp}
          title="No FAQs yet"
          description="Questions and answers for the help page."
        />
      }
    />
  )
}
