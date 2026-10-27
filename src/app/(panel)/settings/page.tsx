import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { TabNav } from "@/components/layout/TabNav"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getProductFormOptions } from "@/features/catalog/api"
import { BusinessSettingsForm } from "@/features/settings/components/BusinessSettingsForm"
import { DeliverySettingsForm } from "@/features/settings/components/DeliverySettingsForm"
import { FeatureSwitchesCard } from "@/features/settings/components/FeatureSwitchesCard"
import { OrderSettingsForm } from "@/features/settings/components/OrderSettingsForm"
import { QuotationSettingsForm } from "@/features/settings/components/QuotationSettingsForm"
import { SecuritySettingsForm } from "@/features/settings/components/SecuritySettingsForm"
import { ServiceSettingsForm } from "@/features/settings/components/ServiceSettingsForm"
import { getSettings } from "@/features/settings/api"
import { formatDateTime } from "@/lib/format"

export const metadata: Metadata = { title: "Settings" }

const TABS = [
  { id: "business", label: "Business and tax" },
  { id: "delivery", label: "Delivery" },
  { id: "orders", label: "Orders and returns" },
  { id: "quotations", label: "Quotations" },
  { id: "service", label: "Service" },
  { id: "security", label: "Security" },
  { id: "features", label: "Feature switches" },
]

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const { tab } = await searchParams
  await requirePermission("settings.view")
  const token = await requireToken()
  const settings = await getSettings(token)
  const active = TABS.find((item) => item.id === tab)?.id ?? "business"

  return (
    <Container className="max-w-5xl">
      <PageHeader
        title="Settings"
        description={`Platform-wide settings for B2C, B2B and this panel. Last changed by ${settings.updatedBy.name}, ${formatDateTime(settings.updatedAt)}.`}
      />
      <TabNav tabs={TABS} activeTab={active} basePath="/settings" label="Settings" />
      {active === "business" && <BusinessSettingsForm settings={settings.business} />}
      {active === "delivery" && <DeliverySettingsForm settings={settings.delivery} />}
      {active === "orders" && (
        <OrderSettingsForm
          settings={settings.orders}
          categories={(await getProductFormOptions(token)).categories
            .filter((category) => category.parentId === null)
            .map((category) => ({ value: category.id, label: category.name }))}
        />
      )}
      {active === "quotations" && <QuotationSettingsForm settings={settings.quotations} />}
      {active === "service" && <ServiceSettingsForm settings={settings.service} />}
      {active === "security" && <SecuritySettingsForm settings={settings.security} />}
      {active === "features" && <FeatureSwitchesCard />}
    </Container>
  )
}
