import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { productReviewsApi } from "@/features/reviews/api"
import { ProductReviewsTable } from "@/features/reviews/components/ProductReviewsTable"
import { ReviewsTabs } from "@/features/reviews/components/ReviewsTabs"
import { PRODUCT_REVIEW_FILTERS } from "@/features/reviews/utils"
import { isEnabled } from "@/lib/features"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Product reviews" }

/** Behind the `productReviews` switch (off at launch, Q-03). */
export default async function ProductReviewsPage({ searchParams }: PageProps<"/reviews/products">) {
  if (!isEnabled("productReviews")) notFound()
  const session = await requirePermission("reviews.view")
  const params = parseListParams(await searchParams, {
    filterKeys: PRODUCT_REVIEW_FILTERS,
    defaultSort: { field: "createdAt", direction: "desc" },
  })
  const data = await productReviewsApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Reviews"
        description="Product reviews wait for moderation before customers see them."
      />
      <ReviewsTabs active="products" />
      <ProductReviewsTable
        data={data}
        canManage={can(session, "reviews.manage")}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
