"use client"

import { Trash2 } from "lucide-react"
import { useFieldArray } from "react-hook-form"
import { toast } from "sonner"

import { FormSection } from "@/components/layout/FormSection"
import { Button } from "@/components/ui/button"
import type { ProductFormOptions } from "@/features/catalog/api"
import { FitmentAddPanel } from "@/features/catalog/components/FitmentAddPanel"
import { FitmentCopyPanel } from "@/features/catalog/components/FitmentCopyPanel"
import type { FitmentRow, ProductControl } from "@/features/catalog/schemas"

type FitmentManagerProps = {
  control: ProductControl
  options: ProductFormOptions
  /** Excluded from "copy from"; null while adding a new product. */
  productId: string | null
}

const sameVehicle = (a: FitmentRow, b: FitmentRow) =>
  a.modelId === b.modelId && a.variantId === b.variantId

/** The vehicles this part fits. Fitment is the core of SpareX, so adding a whole model or copying is one step. */
export function FitmentManager({ control, options, productId }: FitmentManagerProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "fitment", keyName: "key" })

  function label(row: FitmentRow) {
    const brand = options.vehicleBrands.find((item) => item.id === row.brandId)?.name
    const model = options.vehicleModels.find((item) => item.id === row.modelId)?.name
    const variant = options.vehicleVariants.find((item) => item.id === row.variantId)?.name
    const years = row.years.length ? `${row.years[0]}–${row.years.at(-1)}` : "All years"
    return {
      vehicle: `${brand ?? ""} ${model ?? ""}`,
      detail: `${variant ?? "All variants"} · ${years}`,
    }
  }

  function addRows(rows: FitmentRow[]): number {
    const fresh = rows.filter((row) => !fields.some((field) => sameVehicle(field, row)))
    if (fresh.length) append(fresh)
    return fresh.length
  }

  return (
    <FormSection
      title={`Fitment (${fields.length})`}
      description="Customers only see this part for the vehicles listed here."
      columns="one"
    >
      {fields.length === 0 ? (
        <p className="rounded-lg bg-warning-50 px-3 py-2 text-sm text-warning-700">
          No fitment yet. This part won&apos;t show up when customers search by vehicle.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
          {fields.map((field, index) => {
            const { vehicle, detail } = label(field)
            return (
              <li key={field.key} className="flex items-center gap-3 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{vehicle}</p>
                  <p className="text-xs text-gray-500">{detail}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${vehicle}`}
                >
                  <Trash2 aria-hidden />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
      <FitmentAddPanel
        options={options}
        onAdd={(row) => {
          if (addRows([row]) === 0) toast.info("That vehicle is already in the fitment.")
        }}
      />
      <FitmentCopyPanel
        products={options.products.filter((product) => product.id !== productId)}
        onCopy={addRows}
      />
    </FormSection>
  )
}
