import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getIntegrations } from "@/features/settings/api"
import { IntegrationCard } from "@/features/settings/components/IntegrationCard"

export const metadata: Metadata = { title: "Integrations" }

export default async function IntegrationsPage() {
  const session = await requirePermission("integrations.view")
  const integrations = await getIntegrations(await requireToken())

  return (
    <Container className="max-w-5xl">
      <PageHeader
        title="Integrations"
        description="Services the platform connects to. Keys are stored by the backend and only shown masked."
      />
      <div className="grid gap-6">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            canManage={can(session, "integrations.manage")}
          />
        ))}
      </div>
    </Container>
  )
}
