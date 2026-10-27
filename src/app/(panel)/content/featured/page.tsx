import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getFeatured } from "@/features/content/api"
import { FeaturedEditor } from "@/features/content/components/FeaturedEditor"

export const metadata: Metadata = { title: "Featured" }

export default async function FeaturedPage() {
  const session = await requirePermission("content.view")
  const featured = await getFeatured(await requireToken())
  const canManage = can(session, "content.manage")

  return (
    <Container>
      <PageHeader
        title="Featured categories and products"
        description="What the B2C home page shows first, in this order."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <FeaturedEditor
          kind="categories"
          title="Featured categories"
          description="Shown as tiles on the B2C home. Six fit one row on desktop."
          items={featured.categories}
          options={featured.options.categories}
          canManage={canManage}
        />
        <FeaturedEditor
          kind="products"
          title="Featured products"
          description="Shown in the 'Popular parts' row. Eight fit two rows."
          items={featured.products}
          options={featured.options.products}
          canManage={canManage}
        />
      </div>
    </Container>
  )
}
