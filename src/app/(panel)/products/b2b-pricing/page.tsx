import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { Price } from "@/components/ui/Price"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getProductOptions } from "@/features/catalog/api"
import { listPricing } from "@/features/pricing/api"
import { PricingTable } from "@/features/pricing/components/PricingTable"
import { ProductPreviewPicker } from "@/features/pricing/components/ProductPreviewPicker"
import { PRICING_FILTERS } from "@/features/pricing/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "B2B pricing" }

export default async function B2bPricingPage({ searchParams }: PageProps<"/products/b2b-pricing">) {
  const session = await requirePermission("pricing.view")
  const token = await requireToken()
  const query = await searchParams
  const params = parseListParams(query, {
    filterKeys: PRICING_FILTERS,
    defaultSort: { field: "name", direction: "asc" },
  })
  const productId = typeof query.product === "string" ? query.product : null
  const [data, products] = await Promise.all([
    listPricing(token, params, productId),
    getProductOptions(token),
  ])
  const product = products.find((item) => item.id === productId)

  return (
    <Container>
      <PageHeader
        title="B2B pricing"
        description="Each business gets one discount on every product: B2B price = B2C price minus the discount. No price lists, tiers or minimum quantities."
      />
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-card p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <ProductPreviewPicker products={products} />
        {product && (
          <p className="text-sm text-gray-600">
            B2C price <Price paise={product.price} gst="incl" />
          </p>
        )}
      </div>
      <PricingTable
        data={data}
        withPreview={Boolean(product)}
        canManage={can(session, "pricing.manage")}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
