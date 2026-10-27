"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { FUEL_LABELS, VEHICLE_TYPE_LABELS } from "@/features/masters/utils"
import type { VehicleListItem } from "@/features/vehicles/types"
import { formatDate } from "@/lib/format"

export const vehicleColumns: ColumnDef<VehicleListItem>[] = [
  {
    id: "registrationNumber",
    accessorKey: "registrationNumber",
    meta: { label: "Vehicle", primary: true },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehicle" />,
    cell: ({ row }) => (
      <Link href={`/vehicles/${row.original.id}`} className="flex flex-col">
        <span className="font-medium whitespace-nowrap text-navy-700 hover:underline">
          {row.original.registrationNumber}
        </span>
        <span className="text-xs text-gray-500">
          {row.original.brandName} {row.original.modelName} {row.original.variantName}
        </span>
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
    id: "fuel",
    meta: { label: "Fuel" },
    enableSorting: false,
    header: "Fuel",
    cell: ({ row }) => FUEL_LABELS[row.original.fuel],
  },
  {
    id: "year",
    accessorKey: "year",
    meta: { label: "Year", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
    cell: ({ row }) => row.original.year,
  },
  {
    id: "owner",
    meta: { label: "Owner" },
    enableSorting: false,
    header: "Owner",
    cell: ({ row }) =>
      row.original.ownerId ? (
        <Link href={`/customers/${row.original.ownerId}`} className="text-navy-700 hover:underline">
          {row.original.ownerName}
        </Link>
      ) : (
        <span className="text-warning-700">Walk-in, not linked</span>
      ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    meta: { label: "Added" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
]
