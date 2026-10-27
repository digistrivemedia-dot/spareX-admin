"use client"

import { CalendarCheck } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { exportBookingsAction } from "@/features/bookings/actions"
import { bookingColumns } from "@/features/bookings/columns"
import type { Booking } from "@/features/bookings/types"
import { BOOKING_STATUS_OPTIONS, PICK_AND_DROP_OPTIONS } from "@/features/bookings/utils"
import { isEnabled } from "@/lib/features"
import type { Paginated } from "@/lib/types"

type BookingsTableProps = {
  data: Paginated<Booking>
  garageOptions: FilterOption[]
  canExport: boolean
}

export function BookingsTable({ data, garageOptions, canExport }: BookingsTableProps) {
  return (
    <DataTable
      columns={bookingColumns(isEnabled("bookingTimeSlots"))}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportBookingsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search booking, customer, registration or garage"
          filters={[
            { type: "select", key: "status", label: "Status", options: BOOKING_STATUS_OPTIONS },
            { type: "select", key: "garage", label: "Garage", options: garageOptions },
            {
              type: "select",
              key: "pickAndDrop",
              label: "Pick and drop",
              options: PICK_AND_DROP_OPTIONS,
            },
            { type: "dateRange", label: "Service date" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={CalendarCheck}
          title="No bookings yet"
          description="Service bookings from B2C appear here."
        />
      }
    />
  )
}
