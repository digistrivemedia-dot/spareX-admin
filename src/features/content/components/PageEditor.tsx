"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"

import { FormLayout } from "@/components/layout/FormLayout"
import { FormSection } from "@/components/layout/FormSection"
import { Button } from "@/components/ui/button"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import { savePageAction } from "@/features/content/actions"
import { pageSchema, type PageValues } from "@/features/content/schemas"
import type { ContentPage } from "@/features/content/types"

/** A policy or help page as structured sections: a heading and paragraphs separated by a blank line. */
export function PageEditor({ page }: { page: ContentPage }) {
  const values: PageValues = {
    title: page.title,
    published: page.published,
    sections: page.sections.map((section) => ({
      id: section.id,
      heading: section.heading,
      body: section.paragraphs.join("\n\n"),
    })),
  }
  const form = useForm({ resolver: zodResolver(pageSchema), defaultValues: values })
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "sections",
  })

  return (
    <FormLayout
      form={form}
      action={(data) => savePageAction(page.id, data)}
      successMessage="Page saved"
      cancelHref="/content/pages"
    >
      <FormSection title="Page">
        <TextField control={form.control} name="title" label="Title" />
        <SwitchField
          control={form.control}
          name="published"
          label="Published"
          description="Unpublished pages are hidden on the B2C and B2B sites."
        />
      </FormSection>
      {fields.map((field, index) => (
        <FormSection key={field.id} title={`Section ${index + 1}`} columns="one">
          <TextField control={form.control} name={`sections.${index}.heading`} label="Heading" />
          <TextareaField
            control={form.control}
            name={`sections.${index}.body`}
            label="Text"
            description="Leave a blank line between paragraphs."
            rows={6}
          />
          <div className="flex gap-1 self-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
              aria-label={`Move section ${index + 1} up`}
            >
              <ArrowUp aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={index === fields.length - 1}
              onClick={() => move(index, index + 1)}
              aria-label={`Move section ${index + 1} down`}
            >
              <ArrowDown aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={fields.length === 1}
              onClick={() => remove(index)}
              aria-label={`Remove section ${index + 1}`}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        </FormSection>
      ))}
      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => append({ id: "", heading: "", body: "" }, { shouldFocus: true })}
      >
        <Plus aria-hidden />
        Add section
      </Button>
    </FormLayout>
  )
}
