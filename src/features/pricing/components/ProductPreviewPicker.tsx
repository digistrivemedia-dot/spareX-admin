"use client"

import { Combobox } from "@/components/ui/Combobox"
import { Field, FieldLabel } from "@/components/ui/field"
import type { ProductOption } from "@/features/catalog/types"
import { formatPrice } from "@/lib/format"
import { useListQuery } from "@/lib/use-list-query"

/** Picks a product (kept in the URL) to show each business's B2B price for it. */
export function ProductPreviewPicker({ products }: { products: ProductOption[] }) {
  const { searchParams, setParams } = useListQuery()

  return (
    <Field className="max-w-xl">
      <FieldLabel htmlFor="preview-product">Preview a product&apos;s B2B price</FieldLabel>
      <Combobox
        id="preview-product"
        options={products.map((product) => ({
          value: product.id,
          label: `${product.name} · ${formatPrice(product.price)}`,
        }))}
        value={searchParams.get("product")}
        onChange={(value) => setParams({ product: value })}
        placeholder="Choose a product"
        searchPlaceholder="Search products"
      />
    </Field>
  )
}
