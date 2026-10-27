import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { IntegrationKeysDialog } from "@/features/settings/components/IntegrationKeysDialog"
import { TestConnectionButton } from "@/features/settings/components/TestConnectionButton"
import type { Integration } from "@/features/settings/types"
import { formatDateTime, humanize } from "@/lib/format"

export function IntegrationCard({
  integration,
  canManage,
}: {
  integration: Integration
  canManage: boolean
}) {
  const configured = integration.status !== "not_configured"

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {integration.name} · {integration.provider}
          </CardTitle>
          <CardDescription>{integration.description}</CardDescription>
        </div>
        <StatusBadge domain="integration" status={integration.status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DetailList
          items={[
            { label: "Mode", value: configured ? humanize(integration.mode) : "–" },
            { label: "Key ID", value: integration.keyIdMasked || "Not added" },
            { label: "Secret", value: integration.secretMasked || "Not added" },
            {
              label: "Last check",
              value: integration.lastCheckedAt
                ? `${formatDateTime(integration.lastCheckedAt)}: ${integration.lastCheckMessage}`
                : integration.lastCheckMessage,
            },
          ]}
        />
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <IntegrationKeysDialog integration={integration} />
            <TestConnectionButton id={integration.id} disabled={!configured} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
