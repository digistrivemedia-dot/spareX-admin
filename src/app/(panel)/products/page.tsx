import { Plus, Upload } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { listProducts } from "@/features/catalog/api"
import { ProductsTable } from "@/features/catalog/components/ProductsTable"
import { CATALOG_FILTERS } from "@/features/catalog/utils"
import { getPartBrandOptions, getTopLevelCategories } from "@/features/masters/api"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Products" }

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const session = await requirePermission("catalog.view")
  const token = await requireToken()
  const params = parseListParams(await searchParams, {
    filterKeys: CATALOG_FILTERS.products,
    defaultSort: { field: "name", direction: "asc" },
  })
  const [data, categories, brands] = await Promise.all([
    listProducts(token, params),
    getTopLevelCategories(token),
    getPartBrandOptions(token),
  ])
  const canManage = can(session, "catalog.manage")

  return (
    <Container>
      <PageHeader
        title="Products"
        description="Everything Kannali sells, with prices, stock and the vehicles each part fits."
        actions={
          canManage && (
            <>
              <Button variant="outline" asChild>
                <Link href="/products/import">
                  <Upload aria-hidden />
                  Import CSV
                </Link>
              </Button>
              <Button asChild>
                <Link href="/products/new">
                  <Plus aria-hidden />
                  Add product
                </Link>
              </Button>
            </>
          )
        }
      />
      <ProductsTable
        data={data}
        categoryOptions={categories.map((category) => ({
          value: category.id,
          label: category.name,
        }))}
        brandOptions={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
        canManage={canManage}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
