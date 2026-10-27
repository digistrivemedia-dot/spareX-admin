"use client"

import { Copy, Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/Combobox"
import { Field, FieldLabel } from "@/components/ui/field"
import { getProductFitmentAction } from "@/features/catalog/actions"
import type { FitmentRow } from "@/features/catalog/schemas"
import type { ProductOption } from "@/features/catalog/types"

type FitmentCopyPanelProps = {
  products: ProductOption[]
  /** Adds the copied rows; returns how many were new. */
  onCopy: (rows: FitmentRow[]) => number
}

/** Copies another product's fitment, e.g. from the same part in another brand. */
export function FitmentCopyPanel({ products, onCopy }: FitmentCopyPanelProps) {
  const [productId, setProductId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function copy() {
    if (!productId) return
    startTransition(async () => {
      const result = await getProductFitmentAction(productId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      const added = onCopy(result.data.map((row) => ({ ...row, id: crypto.randomUUID() })))
      toast.success(
        added ? `Copied ${added} vehicle${added === 1 ? "" : "s"}` : "Nothing new to copy",
      )
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Field className="sm:max-w-md">
        <FieldLabel htmlFor="copy-fitment">Copy fitment from another product</FieldLabel>
        <Combobox
          id="copy-fitment"
          options={products.map((product) => ({
            value: product.id,
            label: `${product.name} (${product.sku})`,
          }))}
          value={productId}
          onChange={setProductId}
          placeholder="Choose a product"
          searchPlaceholder="Search products"
        />
      </Field>
      <Button type="button" variant="outline" disabled={!productId || isPending} onClick={copy}>
        {isPending ? <Loader2 aria-hidden className="animate-spin" /> : <Copy aria-hidden />}
        Copy fitment
      </Button>
    </div>
  )
}
