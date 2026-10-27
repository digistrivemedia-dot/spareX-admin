"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Power, PowerOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { setAdminUserActiveAction } from "@/features/admin-users/actions"
import { AdminUserDialog } from "@/features/admin-users/components/AdminUserDialog"
import type { AdminUser } from "@/features/admin-users/types"
import { ROLES } from "@/features/auth/permissions"
import { formatDateTime, formatPhone } from "@/lib/format"

export function adminUserColumns(
  canManage: boolean,
  currentUserId: string,
): ColumnDef<AdminUser>[] {
  const columns: ColumnDef<AdminUser>[] = [
    {
      id: "name",
      accessorKey: "name",
      meta: { label: "Admin", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Admin" />,
      cell: ({ row }) => (
        <span className="flex flex-col">
          <span className="font-medium text-gray-900">
            {row.original.name}
            {row.original.id === currentUserId && " (you)"}
          </span>
          <span className="text-xs text-gray-500">
            {row.original.email} · {formatPhone(row.original.phone)}
          </span>
        </span>
      ),
    },
    {
      id: "role",
      meta: { label: "Role" },
      enableSorting: false,
      header: "Role",
      cell: ({ row }) => (
        <span className="flex flex-col">
          {ROLES[row.original.roleId].name}
          <span className="text-xs text-gray-500">
            2-step {row.original.twoStepEnabled ? "on" : "off"}
          </span>
        </span>
      ),
    },
    {
      id: "lastLoginAt",
      accessorKey: "lastLoginAt",
      meta: { label: "Last sign-in" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last sign-in" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.original.lastLoginAt ? formatDateTime(row.original.lastLoginAt) : "Never"}
        </span>
      ),
    },
    {
      id: "status",
      meta: { label: "Status" },
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => <StatusBadge domain="adminUser" status={row.original.status} />,
    },
  ]
  if (!canManage) return columns
  return [
    ...columns,
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const user = row.original
        const active = user.status !== "inactive"
        return (
          <div className="flex justify-end gap-1">
            <AdminUserDialog
              user={user}
              trigger={
                <Button variant="ghost" size="icon" aria-label={`Edit ${user.name}`}>
                  <Pencil aria-hidden />
                </Button>
              }
            />
            {user.id !== currentUserId && (
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`${active ? "Deactivate" : "Reactivate"} ${user.name}`}
                  >
                    {active ? <PowerOff aria-hidden /> : <Power aria-hidden />}
                  </Button>
                }
                title={`${active ? "Deactivate" : "Reactivate"} ${user.name}?`}
                description={
                  active
                    ? "They are signed out and can't sign in until reactivated. Their history stays in the audit log."
                    : "They can sign in again with their existing password."
                }
                confirmLabel={active ? "Deactivate" : "Reactivate"}
                destructive={active}
                onConfirm={() => setAdminUserActiveAction(user.id, !active)}
                successMessage={active ? "Admin deactivated" : "Admin reactivated"}
              />
            )}
          </div>
        )
      },
    },
  ]
}
