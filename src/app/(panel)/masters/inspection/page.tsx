import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SectionHeader } from "@/components/layout/SectionHeader"
import { TabNav } from "@/components/layout/TabNav"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getInspectionTemplate } from "@/features/masters/api"
import { InspectionTemplateForm } from "@/features/masters/components/InspectionTemplateForm"
import type { VehicleType } from "@/features/masters/types"
import {
  INSPECTION_SECTION_LABELS,
  VEHICLE_TYPE_LABELS,
  VEHICLE_TYPE_OPTIONS,
} from "@/features/masters/utils"
import { formatDateTime } from "@/lib/format"

export const metadata: Metadata = { title: "Inspection checklist" }

const TABS = VEHICLE_TYPE_OPTIONS.map((option) => ({ id: option.value, label: option.label }))

export default async function InspectionPage({ searchParams }: PageProps<"/masters/inspection">) {
  const { tab } = await searchParams
  const session = await requirePermission("masters.view")
  const vehicleType = (TABS.some((item) => item.id === tab) ? tab : "bike") as VehicleType
  const template = await getInspectionTemplate(await requireToken(), vehicleType)
  if (!template) notFound()

  return (
    <>
      <SectionHeader
        title="Inspection checklist"
        description={`What garages check at vehicle check-in, per vehicle type. Last changed ${formatDateTime(template.updatedAt)}.`}
      />
      <TabNav
        tabs={TABS}
        activeTab={vehicleType}
        basePath="/masters/inspection"
        label="Vehicle types"
      />
      {can(session, "masters.manage") ? (
        // Keyed by type so switching tabs starts a fresh form.
        <InspectionTemplateForm key={vehicleType} template={template} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {template.sections.map((section) => (
            <section
              key={section.section}
              className="rounded-xl border border-gray-200 bg-card p-4 shadow-sm"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {INSPECTION_SECTION_LABELS[section.section]}
              </h3>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {section.items.map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500">
        {VEHICLE_TYPE_LABELS[vehicleType]} checklist. AC checks apply to cars and commercial
        vehicles only.
      </p>
    </>
  )
}
