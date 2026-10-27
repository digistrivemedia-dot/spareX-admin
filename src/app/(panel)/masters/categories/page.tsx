import { Plus } from "lucide-react"
import type { Metadata } from "next"

import { SectionHeader } from "@/components/layout/SectionHeader"
import { Button } from "@/components/ui/button"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getTopLevelCategories, productCategoriesApi } from "@/features/masters/api"
import { CategoriesTable } from "@/features/masters/components/CategoriesTable"
import { CategoryDialog } from "@/features/masters/components/CategoryDialog"
import { MASTER_FILTERS } from "@/features/masters/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Product categories" }

export default async function CategoriesPage({ searchParams }: PageProps<"/masters/categories">) {
  const session = await requirePermission("masters.view")
  const token = await requireToken()
  const params = parseListParams(await searchParams, {
    filterKeys: MASTER_FILTERS.productCategories,
    defaultSort: { field: "sortOrder", direction: "asc" },
  })
  const [data, parents] = await Promise.all([
    productCategoriesApi.list(token, params),
    getTopLevelCategories(token),
  ])
  const parentOptions = parents.map((parent) => ({ value: parent.id, label: parent.name }))
  const canManage = can(session, "masters.manage")

  return (
    <>
      <SectionHeader
        title="Product categories"
        description="Categories and subcategories for the B2C and B2B catalogue, in menu order."
        actions={
          canManage && (
            <CategoryDialog
              parentOptions={parentOptions}
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
      <CategoriesTable
        data={data}
        parentOptions={parentOptions}
        canManage={canManage}
        canExport={can(session, "data.export")}
      />
    </>
  )
}
