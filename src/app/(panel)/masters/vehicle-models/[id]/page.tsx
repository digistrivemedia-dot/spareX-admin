import { Pencil } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { listAuditEntries } from "@/features/audit/api"
import { toActivityItems } from "@/features/audit/utils"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getVehicleBrandOptions, getVehicleModel } from "@/features/masters/api"
import { ActiveToggleButton } from "@/features/masters/components/ActiveToggleButton"
import { VariantList } from "@/features/masters/components/VariantList"
import { VehicleModelDialog } from "@/features/masters/components/VehicleModelDialog"
import { VEHICLE_TYPE_LABELS, formatYearRange } from "@/features/masters/utils"

export const metadata: Metadata = { title: "Vehicle model" }

export default async function VehicleModelPage({
  params,
}: PageProps<"/masters/vehicle-models/[id]">) {
  const { id } = await params
  const session = await requirePermission("masters.view")
  const token = await requireToken()
  const [model, brands, activity] = await Promise.all([
    getVehicleModel(token, id),
    getVehicleBrandOptions(token),
    listAuditEntries(token, {
      page: 1,
      pageSize: 20,
      sort: { field: "at", direction: "desc" },
      filters: { entity: "master", record: id },
    }),
  ])
  if (!model) notFound()
  const canManage = can(session, "masters.manage")
  const fullName = `${model.brandName} ${model.name}`

  return (
    <DetailLayout
      back={{ href: "/masters/vehicle-models", label: "Models and variants" }}
      title={fullName}
      status={<StatusBadge domain="active" status={model.active ? "active" : "inactive"} />}
      facts={[
        { label: "Brand", value: model.brandName },
        { label: "Vehicle type", value: VEHICLE_TYPE_LABELS[model.vehicleType] },
        { label: "Variants", value: model.variantCount },
        { label: "Years", value: formatYearRange(model.yearRange) },
      ]}
      actions={
        canManage && (
          <>
            <VehicleModelDialog
              model={model}
              brandOptions={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
              trigger={
                <Button variant="outline">
                  <Pencil aria-hidden />
                  Edit model
                </Button>
              }
            />
            <ActiveToggleButton
              kind="vehicleModel"
              id={model.id}
              name={fullName}
              active={model.active}
              noun="model"
            />
          </>
        )
      }
      activity={<ActivityTimeline items={toActivityItems(activity.items)} />}
    >
      <VariantList
        modelId={model.id}
        modelName={fullName}
        variants={model.variants}
        canManage={canManage}
      />
    </DetailLayout>
  )
}
