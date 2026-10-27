"use client"

import { Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { SimpleSelect } from "@/components/ui/SimpleSelect"
import type { ProductFormOptions } from "@/features/catalog/api"
import type { FitmentRow } from "@/features/catalog/schemas"

const ALL = "all"

type FitmentAddPanelProps = {
  options: Pick<ProductFormOptions, "vehicleBrands" | "vehicleModels" | "vehicleVariants">
  onAdd: (row: FitmentRow) => void
}

/** Brand → model → variant (or all) → years (or all). Choosing "All variants" adds the whole model at once. */
export function FitmentAddPanel({ options, onAdd }: FitmentAddPanelProps) {
  const [brandId, setBrandId] = useState("")
  const [modelId, setModelId] = useState("")
  const [variantId, setVariantId] = useState(ALL)
  const [yearFrom, setYearFrom] = useState(ALL)
  const [yearTo, setYearTo] = useState(ALL)

  const models = options.vehicleModels.filter((model) => model.brandId === brandId)
  const variants = options.vehicleVariants.filter((variant) => variant.modelId === modelId)
  const years = [
    ...new Set(
      (variantId === ALL ? variants : variants.filter((v) => v.id === variantId)).flatMap(
        (v) => v.years,
      ),
    ),
  ].sort()
  const yearList = years.map((year) => ({ value: String(year), label: String(year) }))
  const fromOptions = [{ value: ALL, label: "All years" }, ...yearList]
  const toOptions = [{ value: ALL, label: "Latest year" }, ...yearList]

  function add() {
    const from = yearFrom === ALL ? null : Number(yearFrom)
    const to = yearTo === ALL ? Math.max(...years) : Number(yearTo)
    onAdd({
      id: crypto.randomUUID(),
      brandId,
      modelId,
      variantId: variantId === ALL ? null : variantId,
      years: from && to ? years.filter((year) => year >= from && year <= to) : [],
    })
    setVariantId(ALL)
    setYearFrom(ALL)
    setYearTo(ALL)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-900">Add vehicles</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SimpleSelect
          id="fit-brand"
          label="Brand"
          value={brandId}
          onChange={(value) => {
            setBrandId(value)
            setModelId("")
            setVariantId(ALL)
          }}
          options={options.vehicleBrands.map((brand) => ({ value: brand.id, label: brand.name }))}
        />
        <SimpleSelect
          id="fit-model"
          label="Model"
          value={modelId}
          onChange={(value) => {
            setModelId(value)
            setVariantId(ALL)
          }}
          options={models.map((model) => ({ value: model.id, label: model.name }))}
          disabled={!brandId}
        />
        <SimpleSelect
          id="fit-variant"
          label="Variant"
          value={variantId}
          onChange={setVariantId}
          options={[
            { value: ALL, label: "All variants" },
            ...variants.map((v) => ({ value: v.id, label: `${v.name} (${v.fuel})` })),
          ]}
          disabled={!modelId}
        />
        <SimpleSelect
          id="fit-from"
          label="From year"
          value={yearFrom}
          onChange={setYearFrom}
          options={fromOptions}
          disabled={!modelId}
        />
        <SimpleSelect
          id="fit-to"
          label="To year"
          value={yearTo}
          onChange={setYearTo}
          options={toOptions}
          disabled={!modelId || yearFrom === ALL}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        disabled={!modelId}
        onClick={add}
      >
        <Plus aria-hidden />
        Add to fitment
      </Button>
    </div>
  )
}
