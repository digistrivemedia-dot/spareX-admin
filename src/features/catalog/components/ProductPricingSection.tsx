"use client"

import Link from "next/link"
import { useWatch } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SelectField } from "@/components/ui/SelectField"
import { TextField } from "@/components/ui/TextField"
import type { ProductControl } from "@/features/catalog/schemas"
import { GST_RATE_OPTIONS } from "@/features/catalog/utils"
import { formatPrice } from "@/lib/format"
import { splitInclusiveGst } from "@/lib/gst"

type ProductPricingSectionProps = {
  control: ProductControl
  /** The saved stock for an existing product; it changes only through stock adjustments. */
  currentStock: number | null
}

/** Codes, prices (incl. GST) and stock. The B2B price is the B2C price minus each business's discount. */
export function ProductPricingSection({ control, currentStock }: ProductPricingSectionProps) {
  const [price, gstRate] = useWatch({ control, name: ["price", "gstRate"] })
  const paise = /^\d+(\.\d{1,2})?$/.test(price) ? Math.round(Number(price) * 100) : null
  const split = paise !== null ? splitInclusiveGst(paise, Number(gstRate)) : null

  return (
    <FormSection
      title="Codes, price and stock"
      description="Prices include GST, as customers see them."
    >
      <TextField
        control={control}
        name="sku"
        label="SKU"
        description="Kannali's code, unique per product."
      />
      <TextField control={control} name="partNumber" label="Manufacturer part no." />
      <TextField control={control} name="hsnCode" label="HSN code" inputMode="numeric" />
      <SelectField control={control} name="gstRate" label="GST rate" options={GST_RATE_OPTIONS} />
      <TextField control={control} name="mrp" label="MRP (₹, incl. GST)" inputMode="decimal" />
      <TextField
        control={control}
        name="price"
        label="B2C price (₹, incl. GST)"
        inputMode="decimal"
        description={
          split
            ? `${formatPrice(split.taxable, { exact: true })} + ${formatPrice(split.gst, { exact: true })} GST`
            : undefined
        }
      />
      {currentStock === null ? (
        <TextField
          control={control}
          name="openingStock"
          label="Opening stock"
          inputMode="numeric"
        />
      ) : (
        <Field>
          <FieldLabel htmlFor="currentStock">Stock</FieldLabel>
          <Input id="currentStock" value={currentStock} disabled readOnly />
          <FieldDescription>
            Change it with a reason on the{" "}
            <Link href="/stock" className="text-navy-700 underline">
              Stock
            </Link>{" "}
            screen.
          </FieldDescription>
        </Field>
      )}
      <TextField
        control={control}
        name="lowStockLevel"
        label="Low-stock level"
        inputMode="numeric"
        description="Flagged as low stock at or below this quantity."
      />
    </FormSection>
  )
}
