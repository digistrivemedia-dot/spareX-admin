"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Truck } from "lucide-react"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { Booking } from "@/features/bookings/types"
import { formatDate } from "@/lib/format"

/** The time-slot column only exists while the `bookingTimeSlots` switch is on. */
export function bookingColumns(withTimeSlots: boolean): ColumnDef<Booking>[] {
  const columns: ColumnDef<Booking>[] = [
    {
      id: "number",
      meta: { label: "Booking", primary: true },
      enableHiding: false,
      enableSorting: false,
      header: "Booking",
      cell: ({ row }) => (
        <Link href={`/bookings/${row.original.id}`} className="flex flex-col">
          <span className="font-medium text-navy-700 hover:underline">{row.original.number}</span>
          <span className="text-xs text-gray-500">{row.original.customer.name}</span>
        </Link>
      ),
    },
    {
      id: "date",
      accessorKey: "date",
      meta: { label: "Service date" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Service date" />,
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: "vehicle",
      meta: { label: "Vehicle" },
      enableSorting: false,
      header: "Vehicle",
      cell: ({ row }) => (
        <span className="flex flex-col">
          <span className="whitespace-nowrap">{row.original.registrationNumber}</span>
          <span className="text-xs text-gray-500">{row.original.vehicleLabel}</span>
        </span>
      ),
    },
    {
      id: "garageName",
      accessorKey: "garageName",
      meta: { label: "Garage" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Garage" />,
      cell: ({ row }) => (
        <span className="flex flex-col">
          <span>{row.original.garageName}</span>
          <span className="text-xs text-gray-500">
            {row.original.services.map((service) => service.name).join(", ")}
          </span>
        </span>
      ),
    },
    {
      id: "pickAndDrop",
      meta: { label: "Pick and drop" },
      enableSorting: false,
      header: "Pick and drop",
      cell: ({ row }) =>
        row.original.pickAndDrop ? (
          <span className="inline-flex items-center gap-1 text-navy-700">
            <Truck aria-hidden className="size-4" />
            {row.original.pickAndDrop.pickupWindow}
          </span>
        ) : (
          <span className="text-gray-500">No</span>
        ),
    },
    {
      id: "status",
      meta: { label: "Status" },
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => <StatusBadge domain="booking" status={row.original.status} />,
    },
  ]
  if (!withTimeSlots) return columns
  return [
    ...columns.slice(0, 2),
    {
      id: "timeSlot",
      meta: { label: "Time slot" },
      enableSorting: false,
      header: "Time slot",
      cell: ({ row }) => row.original.timeSlot ?? "–",
    },
    ...columns.slice(2),
  ]
}
