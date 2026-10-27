import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { listAuditEntries } from "@/features/audit/api"
import { toActivityItems } from "@/features/audit/utils"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getCustomerOptions } from "@/features/customers/api"
import { getVehicle } from "@/features/vehicles/api"
import { TransferVehicleDialog } from "@/features/vehicles/components/TransferVehicleDialog"
import { VehicleOverview } from "@/features/vehicles/components/VehicleOverview"
import { VehicleRecords, type VehicleTab } from "@/features/vehicles/components/VehicleRecords"
import { vehicleTitle } from "@/features/vehicles/utils"
import { formatNumber } from "@/lib/format"

export const metadata: Metadata = { title: "Vehicle" }

const RECORD_TABS: VehicleTab[] = ["owners", "service", "parts", "invoices"]

export default async function VehiclePage({ params, searchParams }: PageProps<"/vehicles/[id]">) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams])
  const session = await requirePermission("vehicles.view")
  const token = await requireToken()
  const canManage = can(session, "vehicles.manage")
  const [vehicle, activity, customers] = await Promise.all([
    getVehicle(token, id),
    listAuditEntries(token, {
      page: 1,
      pageSize: 20,
      sort: { field: "at", direction: "desc" },
      filters: { record: id },
    }),
    canManage ? getCustomerOptions(token) : [],
  ])
  if (!vehicle) notFound()

  const activeTab = RECORD_TABS.find((item) => item === tab) ?? "details"
  const tabs = [
    { id: "details", label: "Details" },
    { id: "owners", label: "Owners", count: vehicle.owners.length },
    { id: "service", label: "Service history", count: vehicle.serviceHistory.length },
    { id: "parts", label: "Parts installed", count: vehicle.partsInstalled.length },
    { id: "invoices", label: "Invoices", count: vehicle.invoices.length },
  ]

  return (
    <Container>
      <DetailLayout
        back={{ href: "/vehicles", label: "Vehicles" }}
        title={vehicle.registrationNumber}
        facts={[
          { label: "Vehicle", value: vehicleTitle(vehicle) },
          {
            label: "Owner",
            value: vehicle.ownerId ? (
              <Link
                href={`/customers/${vehicle.ownerId}`}
                className="text-navy-700 hover:underline"
              >
                {vehicle.ownerName}
              </Link>
            ) : (
              <span className="text-warning-700">Walk-in, not linked</span>
            ),
          },
          { label: "Odometer", value: `${formatNumber(vehicle.odometerKm)} km` },
          { label: "Garage visits", value: vehicle.serviceHistory.length },
        ]}
        actions={
          canManage && (
            <TransferVehicleDialog
              vehicleId={vehicle.id}
              registration={vehicle.registrationNumber}
              isWalkIn={vehicle.ownerId === null}
              customers={customers.filter((customer) => customer.id !== vehicle.ownerId)}
            />
          )
        }
        tabs={{ items: tabs, active: activeTab, basePath: `/vehicles/${vehicle.id}` }}
        activity={<ActivityTimeline items={toActivityItems(activity.items)} />}
      >
        {activeTab === "details" ? (
          <VehicleOverview vehicle={vehicle} />
        ) : (
          <VehicleRecords vehicle={vehicle} tab={activeTab} />
        )}
      </DetailLayout>
    </Container>
  )
}
