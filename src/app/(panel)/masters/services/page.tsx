import { Plus } from "lucide-react"
import type { Metadata } from "next"

import { SectionHeader } from "@/components/layout/SectionHeader"
import { Button } from "@/components/ui/button"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getServiceCategoryOptions, serviceItemsApi } from "@/features/masters/api"
import { ServiceDialog } from "@/features/masters/components/ServiceDialog"
import { ServicesTable } from "@/features/masters/components/ServicesTable"
import { MASTER_FILTERS } from "@/features/masters/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Services" }

export default async function ServicesPage({ searchParams }: PageProps<"/masters/services">) {
  const session = await requirePermission("masters.view")
  const token = await requireToken()
  const params = parseListParams(await searchParams, {
    filterKeys: MASTER_FILTERS.serviceItems,
    defaultSort: { field: "categoryName", direction: "asc" },
  })
  const [data, categories] = await Promise.all([
    serviceItemsApi.list(token, params),
    getServiceCategoryOptions(token),
  ])
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))
  const canManage = can(session, "masters.manage")

  return (
    <>
      <SectionHeader
        title="Services"
        description="The service names garages pick from. Each garage sets its own price."
        actions={
          canManage && (
            <ServiceDialog
              categoryOptions={categoryOptions}
              trigger={
                <Button>
                  <Plus aria-hidden />
                  Add service
                </Button>
              }
            />
          )
        }
      />
      <ServicesTable
        data={data}
        categoryOptions={categoryOptions}
        canManage={canManage}
        canExport={can(session, "data.export")}
      />
    </>
  )
}
