import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { listAuditEntries } from "@/features/audit/api"
import { toActivityItems } from "@/features/audit/utils"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getProduct, getProductFormOptions } from "@/features/catalog/api"
import { ProductActiveButton } from "@/features/catalog/components/ProductActiveButton"
import { ProductForm } from "@/features/catalog/components/ProductForm"
import { formatNumber } from "@/lib/format"

export const metadata: Metadata = { title: "Product" }

const TABS = [
  { id: "details", label: "Details" },
  { id: "activity", label: "Activity" },
]

export default async function ProductPage({ params, searchParams }: PageProps<"/products/[id]">) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams])
  const session = await requirePermission("catalog.view")
  const token = await requireToken()
  const activeTab = tab === "activity" ? "activity" : "details"
  const [product, options, activity] = await Promise.all([
    getProduct(token, id),
    getProductFormOptions(token),
    activeTab === "activity"
      ? listAuditEntries(token, {
          page: 1,
          pageSize: 50,
          sort: { field: "at", direction: "desc" },
          filters: { record: id },
        })
      : null,
  ])
  if (!product) notFound()
  const canManage = can(session, "catalog.manage")

  return (
    <Container>
      <DetailLayout
        back={{ href: "/products", label: "Products" }}
        title={product.name}
        status={
          <>
            <StatusBadge domain="active" status={product.active ? "active" : "inactive"} />
            <StatusBadge domain="stock" status={product.stockStatus} />
          </>
        }
        facts={[
          { label: "SKU", value: product.sku },
          { label: "B2C price", value: <Price paise={product.price} gst="incl" /> },
          { label: "Stock", value: formatNumber(product.stock) },
          { label: "Fitment", value: `${product.fitmentCount} vehicles` },
        ]}
        actions={
          canManage && (
            <ProductActiveButton ids={[product.id]} label={product.name} active={product.active} />
          )
        }
        tabs={{ items: TABS, active: activeTab, basePath: `/products/${product.id}` }}
      >
        {activeTab === "activity" ? (
          <ActivityTimeline
            title="Price, fitment, stock and product changes"
            items={toActivityItems(activity?.items ?? [])}
          />
        ) : (
          // Keyed by update time so a refresh after saving starts from the saved values.
          <ProductForm key={product.updatedAt} product={product} options={options} />
        )}
      </DetailLayout>
    </Container>
  )
}
