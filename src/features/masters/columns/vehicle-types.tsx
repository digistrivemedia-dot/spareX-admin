"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ActiveToggleButton } from "@/features/masters/components/ActiveToggleButton"
import { VehicleTypeDialog } from "@/features/masters/components/VehicleTypeDialog"
import type { VehicleTypeListItem } from "@/features/masters/types"
import { formatNumber } from "@/lib/format"

export function vehicleTypeColumns(canManage: boolean): ColumnDef<VehicleTypeListItem>[] {
  const columns: ColumnDef<VehicleTypeListItem>[] = [
    {
      id: "sortOrder",
      accessorKey: "sortOrder",
      meta: { label: "Order" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.sortOrder}</span>,
    },
    {
      id: "name",
      accessorKey: "name",
      meta: { label: "Vehicle type", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle type" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.original.name}</span>
          <span className="text-xs text-gray-500">{row.original.description}</span>
        </div>
      ),
    },
    {
      id: "brandCount",
      meta: { label: "Brands", align: "right" },
      enableSorting: false,
      header: "Brands",
      cell: ({ row }) => formatNumber(row.original.brandCount),
    },
    {
      id: "modelCount",
      accessorKey: "modelCount",
      meta: { label: "Models", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Models" />,
      cell: ({ row }) => formatNumber(row.original.modelCount),
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
          <VehicleTypeDialog
            record={row.original}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${row.original.name}`}>
                <Pencil aria-hidden />
              </Button>
            }
          />
          <ActiveToggleButton
            kind="vehicleType"
            id={row.original.id}
            name={row.original.name}
            active={row.original.active}
            noun="vehicle type"
          />
        </div>
      ),
    },
  ]
}
