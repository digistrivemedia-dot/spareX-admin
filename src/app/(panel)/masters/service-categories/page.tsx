import { Plus } from "lucide-react"
import type { Metadata } from "next"

import { SectionHeader } from "@/components/layout/SectionHeader"
import { Button } from "@/components/ui/button"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { serviceCategoriesApi } from "@/features/masters/api"
import { ServiceCategoriesTable } from "@/features/masters/components/ServiceCategoriesTable"
import { ServiceCategoryDialog } from "@/features/masters/components/ServiceCategoryDialog"
import { MASTER_FILTERS } from "@/features/masters/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Service categories" }

export default async function ServiceCategoriesPage({
  searchParams,
}: PageProps<"/masters/service-categories">) {
  const session = await requirePermission("masters.view")
  const params = parseListParams(await searchParams, {
    filterKeys: MASTER_FILTERS.serviceCategories,
    defaultSort: { field: "sortOrder", direction: "asc" },
  })
  const data = await serviceCategoriesApi.list(await requireToken(), params)
  const canManage = can(session, "masters.manage")

  return (
    <>
      <SectionHeader
        title="Service categories"
        description="Groups for the service list garages pick from."
        actions={
          canManage && (
            <ServiceCategoryDialog
              trigger={
                <Button>
                  <Plus aria-hidden />
                  Add category
                </Button>
              }
            />
          )
        }
      />
      <ServiceCategoriesTable
        data={data}
        canManage={canManage}
        canExport={can(session, "data.export")}
      />
    </>
  )
}
