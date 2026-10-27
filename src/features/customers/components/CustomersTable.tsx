"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportCustomersAction } from "@/features/customers/actions"
import { customerColumns } from "@/features/customers/columns"
import type { CustomerListItem } from "@/features/customers/types"
import { CUSTOMER_STATUS_OPTIONS } from "@/features/customers/utils"
import type { Paginated } from "@/lib/types"

type CustomersTableProps = {
  data: Paginated<CustomerListItem>
  cities: string[]
  canExport: boolean
}

export function CustomersTable({ data, cities, canExport }: CustomersTableProps) {
  return (
    <DataTable
      columns={customerColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportCustomersAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search name, email or mobile"
          filters={[
            { type: "select", key: "status", label: "Status", options: CUSTOMER_STATUS_OPTIONS },
            {
              type: "select",
              key: "city",
              label: "City",
              options: cities.map((city) => ({ value: city, label: city })),
            },
            { type: "dateRange", label: "Joined" },
          ]}
        />
      }
    />
  )
}
