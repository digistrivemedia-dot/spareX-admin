"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SlidersHorizontal } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/FormDialog"
import { SelectField } from "@/components/ui/SelectField"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import { adjustStockAction } from "@/features/catalog/actions"
import { stockAdjustmentSchema, type StockAdjustmentValues } from "@/features/catalog/schemas"
import type { StockListItem } from "@/features/catalog/types"
import { STOCK_REASON_LABELS } from "@/features/catalog/utils"
import { formatNumber } from "@/lib/format"

const DIRECTIONS = [
  { value: "add", label: "Add stock" },
  { value: "remove", label: "Remove stock" },
]
const REASONS = Object.entries(STOCK_REASON_LABELS).map(([value, label]) => ({ value, label }))

/** Every stock change needs a reason and a note, and is kept in the product's stock history. */
export function StockAdjustDialog({ item }: { item: StockListItem }) {
  const values: StockAdjustmentValues = {
    productId: item.id,
    direction: "add",
    quantity: "",
    reason: "purchase_received",
    note: "",
  }
  const form = useForm({ resolver: zodResolver(stockAdjustmentSchema), values })
  const [direction, quantity] = useWatch({ control: form.control, name: ["direction", "quantity"] })
  const change = /^\d+$/.test(quantity) ? Number(quantity) * (direction === "add" ? 1 : -1) : 0

  return (
    <FormDialog
      trigger={
        <Button variant="ghost" size="icon" aria-label={`Adjust stock of ${item.name}`}>
          <SlidersHorizontal aria-hidden />
        </Button>
      }
      title="Adjust stock"
      description={`${item.name} · ${formatNumber(item.stock)} in stock now`}
      form={form}
      action={adjustStockAction}
      successMessage="Stock updated"
      submitLabel="Save adjustment"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField control={form.control} name="direction" label="Change" options={DIRECTIONS} />
        <TextField control={form.control} name="quantity" label="Quantity" inputMode="numeric" />
      </div>
      <SelectField control={form.control} name="reason" label="Reason" options={REASONS} />
      <TextareaField
        control={form.control}
        name="note"
        label="Note"
        description="e.g. purchase order number, or what was damaged."
      />
      <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
        New stock:{" "}
        <span className="font-semibold tabular-nums">{formatNumber(item.stock + change)}</span>
      </p>
    </FormDialog>
  )
}
