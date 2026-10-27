import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getProductFormOptions } from "@/features/catalog/api"
import { ProductForm } from "@/features/catalog/components/ProductForm"

export const metadata: Metadata = { title: "Add product" }

export default async function NewProductPage() {
  await requirePermission("catalog.manage")
  const options = await getProductFormOptions(await requireToken())

  return (
    <Container>
      <DetailLayout back={{ href: "/products", label: "Products" }} title="Add product">
        <ProductForm product={null} options={options} />
      </DetailLayout>
    </Container>
  )
}
