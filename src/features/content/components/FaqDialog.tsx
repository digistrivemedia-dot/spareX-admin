"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import { FormDialog } from "@/components/ui/FormDialog"
import { SelectField } from "@/components/ui/SelectField"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import { saveFaqAction } from "@/features/content/actions"
import { faqSchema, type FaqValues } from "@/features/content/schemas"
import type { Faq } from "@/features/content/types"
import { FAQ_CATEGORY_OPTIONS } from "@/features/content/utils"

type FaqDialogProps = { faq?: Faq; nextOrder: number; trigger: ReactNode }

export function FaqDialog({ faq, nextOrder, trigger }: FaqDialogProps) {
  const values: FaqValues = {
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    category: faq?.category ?? "orders",
    sortOrder: String(faq?.sortOrder ?? nextOrder),
    active: faq?.active ?? true,
  }
  const form = useForm({ resolver: zodResolver(faqSchema), values })

  return (
    <FormDialog
      trigger={trigger}
      title={faq ? "Edit FAQ" : "Add FAQ"}
      form={form}
      action={(data) => saveFaqAction(faq?.id ?? null, data)}
      successMessage={faq ? "FAQ saved" : "FAQ added"}
      submitLabel={faq ? "Save" : "Add FAQ"}
    >
      <TextField control={form.control} name="question" label="Question" />
      <TextareaField control={form.control} name="answer" label="Answer" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          control={form.control}
          name="category"
          label="Category"
          options={FAQ_CATEGORY_OPTIONS}
        />
        <TextField control={form.control} name="sortOrder" label="Order" inputMode="numeric" />
      </div>
      <SwitchField control={form.control} name="active" label="Show on the help page" />
    </FormDialog>
  )
}
