"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ActiveToggleButton } from "@/features/masters/components/ActiveToggleButton"
import type { VehicleModelListItem } from "@/features/masters/types"
import { FUEL_LABELS, VEHICLE_TYPE_LABELS, formatYearRange } from "@/features/masters/utils"
import { formatNumber } from "@/lib/format"

export function vehicleModelColumns(canManage: boolean): ColumnDef<VehicleModelListItem>[] {
  const columns: ColumnDef<VehicleModelListItem>[] = [
    {
      id: "brandName",
      accessorKey: "brandName",
      meta: { label: "Model", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Model" />,
      cell: ({ row }) => (
        <Link
          href={`/masters/vehicle-models/${row.original.id}`}
          className="flex flex-col hover:underline"
        >
          <span className="text-xs text-gray-500">{row.original.brandName}</span>
          <span className="font-medium text-navy-700">{row.original.name}</span>
        </Link>
      ),
    },
    {
      id: "vehicleType",
      meta: { label: "Type" },
      enableSorting: false,
      header: "Type",
      cell: ({ row }) => VEHICLE_TYPE_LABELS[row.original.vehicleType],
    },
    {
      id: "fuels",
      meta: { label: "Fuels" },
      enableSorting: false,
      header: "Fuels",
      cell: ({ row }) => row.original.fuels.map((fuel) => FUEL_LABELS[fuel]).join(", ") || "–",
    },
    {
      id: "years",
      meta: { label: "Years" },
      enableSorting: false,
      header: "Years",
      cell: ({ row }) => (
        <span className="tabular-nums">{formatYearRange(row.original.yearRange)}</span>
      ),
    },
    {
      id: "variantCount",
      accessorKey: "variantCount",
      meta: { label: "Variants", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Variants" />,
      cell: ({ row }) => formatNumber(row.original.variantCount),
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
        <div className="flex justify-end">
          <ActiveToggleButton
            kind="vehicleModel"
            id={row.original.id}
            name={`${row.original.brandName} ${row.original.name}`}
            active={row.original.active}
            noun="model"
          />
        </div>
      ),
    },
  ]
}
