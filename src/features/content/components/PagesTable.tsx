"use client"

import { FileText } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportPagesAction } from "@/features/content/actions"
import { pageColumns } from "@/features/content/columns/pages"
import type { ContentPage } from "@/features/content/types"
import { PAGE_KIND_OPTIONS } from "@/features/content/utils"
import type { Paginated } from "@/lib/types"

export function PagesTable({
  data,
  canExport,
}: {
  data: Paginated<ContentPage>
  canExport: boolean
}) {
  return (
    <DataTable
      columns={pageColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportPagesAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search pages"
          filters={[{ type: "select", key: "kind", label: "Type", options: PAGE_KIND_OPTIONS }]}
        />
      }
      emptyState={
        <EmptyState
          icon={FileText}
          title="No pages"
          description="Policy and help pages appear here."
        />
      }
    />
  )
}
