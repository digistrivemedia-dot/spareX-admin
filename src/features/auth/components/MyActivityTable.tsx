"use client"

import { History } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { auditColumns } from "@/features/audit/columns"
import type { AuditEntry } from "@/features/audit/types"
import { AUDIT_ACTION_OPTIONS, AUDIT_ENTITY_OPTIONS } from "@/features/audit/utils"
import { exportMyActivityAction } from "@/features/auth/account-actions"
import type { Paginated } from "@/lib/types"

// Every row is the signed-in admin's own activity, so the "Who" column adds nothing here.
const columns = auditColumns.filter((column) => column.id !== "actor")

export function MyActivityTable({ data }: { data: Paginated<AuditEntry> }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      getRowId={(entry) => entry.id}
      exportAction={exportMyActivityAction}
      toolbar={
        <FilterBar
          searchPlaceholder="Search activity"
          filters={[
            { type: "select", key: "action", label: "Action", options: AUDIT_ACTION_OPTIONS },
            { type: "select", key: "entity", label: "Record", options: AUDIT_ENTITY_OPTIONS },
            { type: "dateRange" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={History}
          title="No activity yet"
          description="Changes you make in the panel will be listed here."
        />
      }
    />
  )
}
