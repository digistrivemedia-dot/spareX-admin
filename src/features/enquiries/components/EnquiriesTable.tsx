"use client"

import { MessageSquareWarning } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportEnquiriesAction } from "@/features/enquiries/actions"
import { enquiryColumns } from "@/features/enquiries/columns"
import type { Enquiry } from "@/features/enquiries/types"
import { ENQUIRY_KIND_OPTIONS, ENQUIRY_STATUS_OPTIONS } from "@/features/enquiries/utils"
import { VEHICLE_TYPE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

export function EnquiriesTable({
  data,
  canExport,
}: {
  data: Paginated<Enquiry>
  canExport: boolean
}) {
  return (
    <DataTable
      columns={enquiryColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportEnquiriesAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search number, name, vehicle or part"
          filters={[
            { type: "select", key: "status", label: "Status", options: ENQUIRY_STATUS_OPTIONS },
            { type: "select", key: "kind", label: "Type", options: ENQUIRY_KIND_OPTIONS },
            { type: "select", key: "vehicleType", label: "Vehicle", options: VEHICLE_TYPE_OPTIONS },
            { type: "dateRange", label: "Received" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={MessageSquareWarning}
          title="No enquiries"
          description="Customers' “vehicle not listed” and “no part fits” requests appear here."
        />
      }
    />
  )
}
