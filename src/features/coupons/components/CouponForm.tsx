"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"

import { FormLayout } from "@/components/layout/FormLayout"
import { FormSection } from "@/components/layout/FormSection"
import { SelectField } from "@/components/ui/SelectField"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextField } from "@/components/ui/TextField"
import { saveCouponAction } from "@/features/coupons/actions"
import { CouponScopeFields } from "@/features/coupons/components/CouponScopeFields"
import { couponSchema, type CouponValues } from "@/features/coupons/schemas"
import type { Coupon, CouponScopeOptions } from "@/features/coupons/types"
import { DISCOUNT_TYPE_OPTIONS } from "@/features/coupons/utils"
import { istDate } from "@/lib/dates"

const rupeesText = (paise: number | null) => (paise === null ? "" : String(paise / 100))

type CouponFormProps = { coupon: Coupon | null; options: CouponScopeOptions }

export function CouponForm({ coupon, options }: CouponFormProps) {
  const router = useRouter()
  const values: CouponValues = {
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    discountType: coupon?.discountType ?? "percentage",
    value: coupon
      ? coupon.discountType === "flat"
        ? rupeesText(coupon.value)
        : String(coupon.value)
      : "",
    maxDiscount: rupeesText(coupon?.maxDiscount ?? null),
    scope: coupon?.scope ?? "all",
    scopeIds: coupon?.scopeIds ?? [],
    minOrderValue: rupeesText(coupon?.minOrderValue ?? 0),
    startsOn: istDate(coupon?.startsAt ?? new Date().toISOString()),
    endsOn: coupon?.endsAt ? istDate(coupon.endsAt) : "",
    usageLimit: coupon?.usageLimit === null || !coupon ? "" : String(coupon.usageLimit),
    perCustomerLimit: String(coupon?.perCustomerLimit ?? 1),
    active: coupon?.active ?? true,
  }
  const form = useForm({ resolver: zodResolver(couponSchema), defaultValues: values })
  const isPercentage = useWatch({ control: form.control, name: "discountType" }) === "percentage"

  return (
    <FormLayout
      form={form}
      action={async (data) => {
        const result = await saveCouponAction(coupon?.id ?? null, data)
        if (result.ok && !coupon) router.push(`/coupons/${result.data.id}`)
        return result
      }}
      successMessage={coupon ? "Coupon saved" : "Coupon created"}
      submitLabel={coupon ? "Save changes" : "Create coupon"}
      cancelHref="/coupons"
    >
      <FormSection title="Offer">
        <TextField control={form.control} name="code" label="Code" placeholder="MONSOON10" />
        <TextField control={form.control} name="description" label="Description" />
        <SelectField
          control={form.control}
          name="discountType"
          label="Discount type"
          options={DISCOUNT_TYPE_OPTIONS}
        />
        <TextField
          control={form.control}
          name="value"
          label={isPercentage ? "Discount (%)" : "Discount (₹, incl. GST)"}
          inputMode="decimal"
        />
        {isPercentage && (
          <TextField
            control={form.control}
            name="maxDiscount"
            label="Maximum discount (₹, optional)"
            inputMode="decimal"
          />
        )}
        <TextField
          control={form.control}
          name="minOrderValue"
          label="Minimum order value (₹, incl. GST)"
          inputMode="decimal"
        />
      </FormSection>
      <FormSection title="Where it applies">
        <CouponScopeFields control={form.control} options={options} />
      </FormSection>
      <FormSection title="Validity and limits">
        <TextField control={form.control} name="startsOn" label="Starts on" type="date" />
        <TextField control={form.control} name="endsOn" label="Ends on (optional)" type="date" />
        <TextField
          control={form.control}
          name="usageLimit"
          label="Total uses (optional)"
          description="Leave empty for no limit."
          inputMode="numeric"
        />
        <TextField
          control={form.control}
          name="perCustomerLimit"
          label="Uses per customer"
          inputMode="numeric"
        />
        <SwitchField
          control={form.control}
          name="active"
          label="Active"
          description="Customers can use it between its dates while active."
        />
      </FormSection>
    </FormLayout>
  )
}
