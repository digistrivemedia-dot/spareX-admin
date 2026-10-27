"use client"

import { UserCog } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportAdminUsersAction } from "@/features/admin-users/actions"
import { adminUserColumns } from "@/features/admin-users/columns"
import type { AdminUser } from "@/features/admin-users/types"
import { ADMIN_STATUS_OPTIONS, ROLE_OPTIONS } from "@/features/admin-users/utils"
import type { Paginated } from "@/lib/types"

type AdminUsersTableProps = {
  data: Paginated<AdminUser>
  currentUserId: string
  canManage: boolean
  canExport: boolean
}

export function AdminUsersTable({
  data,
  currentUserId,
  canManage,
  canExport,
}: AdminUsersTableProps) {
  return (
    <DataTable
      columns={adminUserColumns(canManage, currentUserId)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportAdminUsersAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search name, email or mobile"
          filters={[
            { type: "select", key: "role", label: "Role", options: ROLE_OPTIONS },
            { type: "select", key: "status", label: "Status", options: ADMIN_STATUS_OPTIONS },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={UserCog}
          title="No admin users"
          description="Invite Kannali staff to the panel."
        />
      }
    />
  )
}
