import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { requirePermission } from "@/features/auth/session"
import { CsvImport } from "@/features/catalog/components/CsvImport"

export const metadata: Metadata = { title: "CSV import" }

const TABS = [
  { id: "products", label: "Products" },
  { id: "fitment", label: "Fitment" },
]

const HELP = {
  products:
    "Adds new products and updates existing ones, matched by SKU. Stock is only set for new products; change existing stock on the Stock screen.",
  fitment:
    "Adds vehicles to existing products, matched by SKU. Leave variant blank for every variant, and the years blank for every year.",
}

export default async function ImportPage({ searchParams }: PageProps<"/products/import">) {
  await requirePermission("catalog.manage")
  const { tab } = await searchParams
  const kind = tab === "fitment" ? "fitment" : "products"

  return (
    <Container>
      <DetailLayout
        back={{ href: "/products", label: "Products" }}
        title="CSV import"
        facts={[{ label: "What it does", value: HELP[kind] }]}
        tabs={{ items: TABS, active: kind, basePath: "/products/import" }}
      >
        {/* Keyed so switching tabs clears the chosen file and preview. */}
        <CsvImport key={kind} kind={kind} />
      </DetailLayout>
    </Container>
  )
}
