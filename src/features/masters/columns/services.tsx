"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ActiveToggleButton } from "@/features/masters/components/ActiveToggleButton"
import { ServiceDialog } from "@/features/masters/components/ServiceDialog"
import type { ServiceItemListItem } from "@/features/masters/types"
import { VEHICLE_TYPE_LABELS } from "@/features/masters/utils"

export function serviceColumns(
  canManage: boolean,
  categoryOptions: FilterOption[],
): ColumnDef<ServiceItemListItem>[] {
  const columns: ColumnDef<ServiceItemListItem>[] = [
    {
      id: "name",
      accessorKey: "name",
      meta: { label: "Service", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Service" />,
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col">
          <span className="font-medium text-gray-900">{row.original.name}</span>
          <span className="line-clamp-1 text-xs text-gray-500">{row.original.description}</span>
        </div>
      ),
    },
    {
      id: "categoryName",
      accessorKey: "categoryName",
      meta: { label: "Category" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => row.original.categoryName,
    },
    {
      id: "vehicleTypes",
      meta: { label: "Vehicle types" },
      enableSorting: false,
      header: "Vehicle types",
      cell: ({ row }) =>
        row.original.vehicleTypes.map((type) => VEHICLE_TYPE_LABELS[type]).join(", "),
    },
    {
      id: "active",
      meta: { label: "Status" },
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge domain="active" status={row.original.active ? "active" : "inactive"} />
      ),
    },
  ]
  if (!canManage) return columns
  return [
    ...columns,
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <ServiceDialog
            service={row.original}
            categoryOptions={categoryOptions}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${row.original.name}`}>
                <Pencil aria-hidden />
              </Button>
            }
          />
          <ActiveToggleButton
            kind="serviceItem"
            id={row.original.id}
            name={row.original.name}
            active={row.original.active}
            noun="service"
          />
        </div>
      ),
    },
  ]
}
