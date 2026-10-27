"use client"

import { Image } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportBannersAction } from "@/features/content/actions"
import { bannerColumns } from "@/features/content/columns/banners"
import type { Banner } from "@/features/content/types"
import { PLACEMENT_OPTIONS } from "@/features/content/utils"
import { ACTIVE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

type BannersTableProps = { data: Paginated<Banner>; canManage: boolean; canExport: boolean }

export function BannersTable({ data, canManage, canExport }: BannersTableProps) {
  return (
    <DataTable
      columns={bannerColumns(canManage)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportBannersAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search banners"
          filters={[
            { type: "select", key: "placement", label: "Placement", options: PLACEMENT_OPTIONS },
            { type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS },
            { type: "dateRange", label: "Starts" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={Image}
          title="No banners yet"
          description="Add a banner for the B2C home, dashboard, B2B offers or the announcement strip."
        />
      }
    />
  )
}
