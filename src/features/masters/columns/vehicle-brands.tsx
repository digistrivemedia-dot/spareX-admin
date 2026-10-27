"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Thumbnail } from "@/components/ui/Thumbnail"
import { ActiveToggleButton } from "@/features/masters/components/ActiveToggleButton"
import { VehicleBrandDialog } from "@/features/masters/components/VehicleBrandDialog"
import type { VehicleBrandListItem } from "@/features/masters/types"
import { VEHICLE_TYPE_LABELS } from "@/features/masters/utils"
import { formatNumber } from "@/lib/format"

export function vehicleBrandColumns(canManage: boolean): ColumnDef<VehicleBrandListItem>[] {
  const columns: ColumnDef<VehicleBrandListItem>[] = [
    {
      id: "name",
      accessorKey: "name",
      meta: { label: "Brand", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Brand" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Thumbnail src={row.original.logoUrl} alt={`${row.original.name} logo`} />
          <div className="flex min-w-0 flex-col">
            <span className="font-medium text-gray-900">{row.original.name}</span>
            <span className="line-clamp-1 text-xs text-gray-500">{row.original.description}</span>
          </div>
        </div>
      ),
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
      id: "modelCount",
      accessorKey: "modelCount",
      meta: { label: "Models", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Models" />,
      cell: ({ row }) => (
        <Link
          href={`/masters/vehicle-models?brand=${row.original.id}`}
          className="text-navy-700 hover:underline"
        >
          {formatNumber(row.original.modelCount)}
        </Link>
      ),
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
          <VehicleBrandDialog
            brand={row.original}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${row.original.name}`}>
                <Pencil aria-hidden />
              </Button>
            }
          />
          <ActiveToggleButton
            kind="vehicleBrand"
            id={row.original.id}
            name={row.original.name}
            active={row.original.active}
            noun="brand"
          />
        </div>
      ),
    },
  ]
}
