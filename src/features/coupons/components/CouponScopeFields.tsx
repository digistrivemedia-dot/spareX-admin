"use client"

import { useWatch } from "react-hook-form"

import { CheckboxGroupField } from "@/components/ui/CheckboxGroupField"
import { SelectField } from "@/components/ui/SelectField"
import type { CouponControl } from "@/features/coupons/schemas"
import type { CouponScopeOptions } from "@/features/coupons/types"
import { SCOPE_LABELS, SCOPE_OPTIONS } from "@/features/coupons/utils"

/** Where the coupon applies, and for scoped coupons which products, brands, categories or garages. */
export function CouponScopeFields({
  control,
  options,
}: {
  control: CouponControl
  options: CouponScopeOptions
}) {
  const scope = useWatch({ control, name: "scope" })
  const scoped =
    scope === "product" || scope === "brand" || scope === "category" || scope === "garage"

  return (
    <>
      <SelectField control={control} name="scope" label="Applies to" options={SCOPE_OPTIONS} />
      {scoped && (
        // Long lists (60 products) scroll inside the form instead of stretching it.
        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 p-3 md:col-span-2">
          <CheckboxGroupField
            control={control}
            name="scopeIds"
            label={SCOPE_LABELS[scope]}
            options={options[scope]}
          />
        </div>
      )}
    </>
  )
}
