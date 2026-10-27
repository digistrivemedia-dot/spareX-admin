"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormLayout } from "@/components/layout/FormLayout"
import { saveInspectionTemplateAction } from "@/features/masters/actions"
import { InspectionSectionFields } from "@/features/masters/components/InspectionSectionFields"
import { inspectionTemplateSchema, type InspectionTemplateValues } from "@/features/masters/schemas"
import type { InspectionTemplate } from "@/features/masters/types"
import { INSPECTION_SECTION_LABELS, VEHICLE_TYPE_LABELS } from "@/features/masters/utils"

/** The checks garages run at check-in for one vehicle type. Sections are fixed; their checks are editable. */
export function InspectionTemplateForm({ template }: { template: InspectionTemplate }) {
  const defaultValues: InspectionTemplateValues = {
    vehicleType: template.vehicleType,
    sections: template.sections,
  }
  const form = useForm({ resolver: zodResolver(inspectionTemplateSchema), defaultValues })

  return (
    <FormLayout
      form={form}
      action={saveInspectionTemplateAction}
      successMessage={`${VEHICLE_TYPE_LABELS[template.vehicleType]} checklist saved`}
      submitLabel="Save checklist"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {template.sections.map((section, index) => (
          <InspectionSectionFields
            key={section.section}
            control={form.control}
            index={index}
            title={INSPECTION_SECTION_LABELS[section.section]}
          />
        ))}
      </div>
    </FormLayout>
  )
}
