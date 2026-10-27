"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { FormLayout } from "@/components/layout/FormLayout"
import { saveProductAction } from "@/features/catalog/actions"
import type { ProductFormOptions } from "@/features/catalog/api"
import { FitmentManager } from "@/features/catalog/components/FitmentManager"
import { ProductBasicsSection } from "@/features/catalog/components/ProductBasicsSection"
import { ProductListingSection } from "@/features/catalog/components/ProductListingSection"
import { ProductPricingSection } from "@/features/catalog/components/ProductPricingSection"
import { ProductShippingSection } from "@/features/catalog/components/ProductShippingSection"
import { ProductSpecsSection } from "@/features/catalog/components/ProductSpecsSection"
import { productSchema, type ProductValues } from "@/features/catalog/schemas"
import type { Product } from "@/features/catalog/types"
import { NO_SUBCATEGORY } from "@/features/catalog/utils"
import { GST_RATE_PERCENT } from "@/lib/constants"

const rupees = (paise: number) => String(paise / 100)

function valuesFor(product: Product | null): ProductValues {
  return {
    name: product?.name ?? "",
    categoryId: product?.categoryId ?? "",
    subcategoryId: product?.subcategoryId ?? NO_SUBCATEGORY,
    partBrandId: product?.partBrandId ?? "",
    vehicleTypes: product?.vehicleTypes ?? [],
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    partNumber: product?.partNumber ?? "",
    hsnCode: product?.hsnCode ?? "",
    gstRate: String(product?.gstRate ?? GST_RATE_PERCENT) as ProductValues["gstRate"],
    mrp: product ? rupees(product.mrp) : "",
    price: product ? rupees(product.price) : "",
    openingStock: "0",
    lowStockLevel: String(product?.lowStockLevel ?? 10),
    lengthMm: product?.dimensionsMm ? String(product.dimensionsMm.length) : "",
    widthMm: product?.dimensionsMm ? String(product.dimensionsMm.width) : "",
    heightMm: product?.dimensionsMm ? String(product.dimensionsMm.height) : "",
    weightGrams: String(product?.weightGrams ?? 0),
    warrantyMonths: String(product?.warrantyMonths ?? 0),
    specs: product?.specs ?? [],
    images: product?.images ?? [],
    fitment: product?.fitment ?? [],
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? "",
    active: product?.active ?? true,
    installationAvailable: product?.installationAvailable ?? false,
    installationCharge: product?.installationCharge ? rupees(product.installationCharge) : "",
  }
}

type ProductFormProps = { product: Product | null; options: ProductFormOptions }

/** Add or edit a product, its prices and its fitment. A new product opens its own page once saved. */
export function ProductForm({ product, options }: ProductFormProps) {
  const router = useRouter()
  const form = useForm({ resolver: zodResolver(productSchema), defaultValues: valuesFor(product) })

  return (
    <FormLayout
      form={form}
      action={async (values) => {
        const result = await saveProductAction(product?.id ?? null, values)
        if (result.ok && !product) router.push(`/products/${result.data.id}`)
        return result
      }}
      successMessage={product ? "Product saved" : "Product added"}
      submitLabel={product ? "Save changes" : "Add product"}
      cancelHref="/products"
    >
      <ProductBasicsSection control={form.control} options={options} />
      <ProductPricingSection control={form.control} currentStock={product?.stock ?? null} />
      <FitmentManager control={form.control} options={options} productId={product?.id ?? null} />
      <ProductSpecsSection control={form.control} />
      <ProductShippingSection control={form.control} />
      <ProductListingSection control={form.control} />
    </FormLayout>
  )
}
