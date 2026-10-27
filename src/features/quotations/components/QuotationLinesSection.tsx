"use client"

import { Trash2 } from "lucide-react"
import { useFieldArray, useWatch } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/Combobox"
import { TextField } from "@/components/ui/TextField"
import type { ProductOption } from "@/features/catalog/types"
import type { QuotationControl } from "@/features/quotations/schemas"
import { formatPrice } from "@/lib/format"
import { applyDiscount } from "@/lib/gst"

type QuotationLinesSectionProps = {
  control: QuotationControl
  products: ProductOption[]
  /** New lines start at the business's discount. */
  businessDiscount: number
}

/** Each product with quantity and line discount; the price is worked out from the current B2C price. */
export function QuotationLinesSection({
  control,
  products,
  businessDiscount,
}: QuotationLinesSectionProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "lines" })
  const lines = useWatch({ control, name: "lines" })
  const byId = new Map(products.map((product) => [product.id, product]))
  const available = products
    .filter((product) => !lines.some((line) => line.productId === product.id))
    .map((product) => ({ value: product.id, label: `${product.name} (${product.sku})` }))

  return (
    <FormSection
      title="Products"
      description={`Prices include GST. New lines start at this business's ${businessDiscount}% discount.`}
      columns="one"
    >
      <ul className="flex flex-col divide-y divide-gray-200">
        {fields.map((field, index) => {
          const line = lines[index]
          const product = line ? byId.get(line.productId) : undefined
          const unitPrice = product
            ? applyDiscount(product.price, Number(line?.discountPercent) || 0)
            : 0
          return (
            <li
              key={field.id}
              className="flex flex-col gap-3 py-3 first:pt-0 sm:flex-row sm:items-start"
            >
              <div className="min-w-0 flex-1 sm:pt-6">
                <p className="font-medium text-gray-900">{product?.name ?? "Unknown product"}</p>
                <p className="text-xs text-gray-500">
                  {product?.sku} · B2C {product ? formatPrice(product.price) : "–"} · now{" "}
                  {formatPrice(unitPrice)} each
                </p>
              </div>
              <div className="flex items-start gap-2 sm:w-80">
                <div className="w-20">
                  <TextField
                    control={control}
                    name={`lines.${index}.quantity`}
                    label="Qty"
                    inputMode="numeric"
                  />
                </div>
                <div className="w-20">
                  <TextField
                    control={control}
                    name={`lines.${index}.discountPercent`}
                    label="Discount %"
                    inputMode="decimal"
                  />
                </div>
                <p className="min-w-20 flex-1 pt-8 text-right text-sm font-semibold tabular-nums">
                  {formatPrice(unitPrice * (Number(line?.quantity) || 0))}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  aria-label={`Remove ${product?.name ?? `line ${index + 1}`}`}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
      <Combobox
        options={available}
        value={null}
        onChange={(productId) =>
          productId &&
          append({ id: "", productId, quantity: "1", discountPercent: String(businessDiscount) })
        }
        placeholder="Add a product"
        searchPlaceholder="Search products"
        className="sm:max-w-md"
      />
    </FormSection>
  )
}
