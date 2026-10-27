import "server-only"

import type { SettingsInput } from "@/features/settings/schemas"
import type {
  Integration,
  IntegrationId,
  PlatformSettings,
  SettingsSection,
} from "@/features/settings/types"
import { ApiError } from "@/lib/api-client"
import { humanize } from "@/lib/format"
import type { ActorRef } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { integrations, platformSettings } from "@/mocks/settings"
import { delay } from "@/mocks/utils"

export async function getSettings(): Promise<PlatformSettings> {
  await delay()
  return platformSettings
}

/** Records every changed field, in the section's own words. */
export async function saveSettings<S extends SettingsSection>(
  actor: ActorRef,
  section: S,
  input: SettingsInput<S>,
) {
  await delay()
  const before: Record<string, unknown> = { ...platformSettings[section] }
  const after: Record<string, unknown> = { ...input }
  const text = (value: unknown) => (Array.isArray(value) ? value.join(", ") : String(value))
  const changes = Object.keys(after)
    .filter((key) => text(before[key]) !== text(after[key]))
    .map((key) => ({
      field: humanize(key.replace(/([A-Z])/g, "_$1").toLowerCase()),
      before: text(before[key]),
      after: text(after[key]),
    }))
  Object.assign(platformSettings[section], input)
  platformSettings.updatedAt = new Date().toISOString()
  platformSettings.updatedBy = actor
  recordAuditEntry(actor, {
    action: "update",
    entity: "settings",
    entityId: section,
    entityLabel: `${humanize(section)} settings`,
    summary: `Updated ${section} settings`,
    changes,
  })
}

export async function getIntegrations(): Promise<Integration[]> {
  await delay()
  return integrations
}

function find(id: IntegrationId): Integration {
  const integration = integrations.find((candidate) => candidate.id === id)
  if (!integration) throw new ApiError("Integration not found.", 404)
  return integration
}

const mask = (value: string) => `••••••••${value.slice(-4)}`

/** Keys are write-only: they are stored and only ever shown masked. */
export async function saveIntegrationKeys(
  actor: ActorRef,
  id: IntegrationId,
  keys: { mode: Integration["mode"]; keyId: string; secret: string },
) {
  await delay()
  const integration = find(id)
  Object.assign(integration, {
    mode: keys.mode,
    keyIdMasked: `${keys.keyId.slice(0, 9)}${mask(keys.keyId)}`,
    secretMasked: mask(keys.secret),
    status: "connected",
    lastCheckedAt: new Date().toISOString(),
    lastCheckMessage: "Keys saved. Run a test to check them.",
  })
  recordAuditEntry(actor, {
    action: "update",
    entity: "settings",
    entityId: `integration_${id}`,
    entityLabel: integration.provider,
    summary: `Updated ${integration.provider} keys (${keys.mode} mode)`,
    changes: [{ field: "Key", before: null, after: integration.keyIdMasked }],
  })
}

/** In the demo a configured integration always passes; the backend will call the provider. */
export async function testIntegration(actor: ActorRef, id: IntegrationId) {
  await delay(600)
  const integration = find(id)
  if (integration.status === "not_configured") {
    throw new ApiError("Add the keys before testing.", 409)
  }
  Object.assign(integration, {
    status: "connected",
    lastCheckedAt: new Date().toISOString(),
    lastCheckMessage:
      id === "razorpay"
        ? "Test payment of ₹1 created and refunded."
        : "Test OTP accepted by the provider.",
  })
  recordAuditEntry(actor, {
    action: "update",
    entity: "settings",
    entityId: `integration_${id}`,
    entityLabel: integration.provider,
    summary: `Tested ${integration.provider} connection`,
    changes: [],
  })
}
