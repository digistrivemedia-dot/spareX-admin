"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormLayout } from "@/components/layout/FormLayout"
import { FormSection } from "@/components/layout/FormSection"
import { TextField } from "@/components/ui/TextField"
import type { ProductOption } from "@/features/catalog/types"
import { sendQuotationAction } from "@/features/quotations/actions"
import { QuotationLinesSection } from "@/features/quotations/components/QuotationLinesSection"
import { quotationSchema, type QuotationValues } from "@/features/quotations/schemas"
import type { Quotation } from "@/features/quotations/types"
import { DEFAULT_QUOTATION_VALIDITY_DAYS } from "@/lib/constants"

type QuotationEditorProps = {
  quotation: Quotation
  products: ProductOption[]
  businessDiscount: number
}

/** Edit lines, add an extra discount and validity, then send. Every send is a new revision. */
export function QuotationEditor({ quotation, products, businessDiscount }: QuotationEditorProps) {
  const values: QuotationValues = {
    lines: quotation.lines.map((line) => ({
      id: line.id,
      productId: line.productId,
      quantity: String(line.quantity),
      discountPercent: String(line.discountPercent),
    })),
    extraDiscount: String(quotation.extraDiscount / 100),
    validityDays: String(DEFAULT_QUOTATION_VALIDITY_DAYS),
    note: "",
  }
  const form = useForm({ resolver: zodResolver(quotationSchema), defaultValues: values })

  return (
    <FormLayout
      form={form}
      action={(data) => sendQuotationAction(quotation.id, data)}
      successMessage={`${quotation.number} sent to ${quotation.businessName}`}
      submitLabel={quotation.status === "requested" ? "Send quotation" : "Send revision"}
    >
      <QuotationLinesSection
        control={form.control}
        products={products}
        businessDiscount={businessDiscount}
      />
      <FormSection title="Terms">
        <TextField
          control={form.control}
          name="extraDiscount"
          label="Extra discount (₹, incl. GST)"
          description="Taken off the whole quotation, after the line discounts."
          inputMode="decimal"
        />
        <TextField
          control={form.control}
          name="validityDays"
          label="Valid for (days)"
          description="Counted from when you send it."
          inputMode="numeric"
        />
        <TextField
          control={form.control}
          name="note"
          label="Note for the revision history (optional)"
          placeholder="e.g. Revised quantities after call with owner"
        />
      </FormSection>
    </FormLayout>
  )
}
