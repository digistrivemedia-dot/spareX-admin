"use client"

import { FileClock } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { exportAuditLogAction } from "@/features/audit/actions"
import { auditColumns } from "@/features/audit/columns"
import type { AuditEntry } from "@/features/audit/types"
import { AUDIT_ACTION_OPTIONS, AUDIT_ENTITY_OPTIONS } from "@/features/audit/utils"
import type { Paginated } from "@/lib/types"

type AuditLogTableProps = {
  data: Paginated<AuditEntry>
  adminOptions: FilterOption[]
  canExport: boolean
}

export function AuditLogTable({ data, adminOptions, canExport }: AuditLogTableProps) {
  return (
    <DataTable
      columns={auditColumns}
      data={data}
      getRowId={(entry) => entry.id}
      exportAction={canExport ? exportAuditLogAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search summary, record or person"
          filters={[
            { type: "select", key: "entity", label: "Record", options: AUDIT_ENTITY_OPTIONS },
            { type: "select", key: "action", label: "Action", options: AUDIT_ACTION_OPTIONS },
            { type: "select", key: "actor", label: "Who", options: adminOptions },
            { type: "dateRange" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={FileClock}
          title="No matching entries"
          description="Every change and export in the panel is recorded here."
        />
      }
    />
  )
}
