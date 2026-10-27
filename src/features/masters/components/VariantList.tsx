"use client"

import { Pencil, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/EmptyState"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ActiveToggleButton } from "@/features/masters/components/ActiveToggleButton"
import { VariantDialog } from "@/features/masters/components/VariantDialog"
import type { VehicleVariant } from "@/features/masters/types"
import { FUEL_LABELS, formatYearRange } from "@/features/masters/utils"

type VariantListProps = {
  modelId: string
  modelName: string
  variants: VehicleVariant[]
  canManage: boolean
}

function powerLabel(variant: VehicleVariant): string {
  return variant.fuel === "electric"
    ? `${variant.batteryKwh ?? "–"} kWh`
    : `${variant.engineCc ?? "–"} cc`
}

/** A model's variants, each with its fuel, engine or battery and model years. */
export function VariantList({ modelId, modelName, variants, canManage }: VariantListProps) {
  const addButton = canManage && (
    <VariantDialog
      modelId={modelId}
      modelName={modelName}
      trigger={
        <Button>
          <Plus aria-hidden />
          Add variant
        </Button>
      }
    />
  )

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-gray-200 py-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Variants</CardTitle>
        {addButton && <CardAction>{addButton}</CardAction>}
      </CardHeader>
      <CardContent className="px-0">
        {variants.length === 0 ? (
          <EmptyState
            title="No variants yet"
            description="Add the first variant with its fuel and model years."
          />
        ) : (
          <ul className="divide-y divide-gray-200">
            {variants.map((variant) => (
              <li
                key={variant.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6"
              >
                <div className="min-w-40 flex-1">
                  <p className="font-medium text-gray-900">{variant.name}</p>
                  <p className="text-xs text-gray-500">
                    {FUEL_LABELS[variant.fuel]} · {powerLabel(variant)}
                  </p>
                </div>
                <div className="w-28">
                  <p className="text-xs text-gray-500">Years</p>
                  <p className="tabular-nums">
                    {formatYearRange({
                      from: variant.years[0] ?? 0,
                      to: variant.years.at(-1) ?? 0,
                    })}
                  </p>
                </div>
                <StatusBadge domain="active" status={variant.active ? "active" : "inactive"} />
                {canManage && (
                  <div className="ml-auto flex gap-1">
                    <VariantDialog
                      modelId={modelId}
                      modelName={modelName}
                      variant={variant}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Edit ${variant.name}`}>
                          <Pencil aria-hidden />
                        </Button>
                      }
                    />
                    <ActiveToggleButton
                      kind="vehicleVariant"
                      id={variant.id}
                      name={`${modelName} ${variant.name}`}
                      active={variant.active}
                      noun="variant"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
