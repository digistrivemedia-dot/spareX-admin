import "server-only"

import type { SettingsInput } from "@/features/settings/schemas"
import type {
  Integration,
  IntegrationId,
  PlatformSettings,
  SettingsSection,
} from "@/features/settings/types"
import { apiClient } from "@/lib/api-client"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/settings-api"

const useMock = dataSource.settings === "mock"

export async function getSettings(token: string): Promise<PlatformSettings> {
  return useMock ? mock.getSettings() : apiClient.get("/settings", { token })
}

export async function saveSettings<S extends SettingsSection>(
  { actor, token }: RequestContext,
  section: S,
  input: SettingsInput<S>,
) {
  if (useMock) return mock.saveSettings(actor, section, input)
  return apiClient.patch(`/settings/${section}`, input, { token })
}

export async function getIntegrations(token: string): Promise<Integration[]> {
  return useMock ? mock.getIntegrations() : apiClient.get("/integrations", { token })
}

export async function saveIntegrationKeys(
  { actor, token }: RequestContext,
  id: IntegrationId,
  keys: { mode: Integration["mode"]; keyId: string; secret: string },
) {
  if (useMock) return mock.saveIntegrationKeys(actor, id, keys)
  return apiClient.patch(`/integrations/${id}`, keys, { token })
}

export async function testIntegration({ actor, token }: RequestContext, id: IntegrationId) {
  if (useMock) return mock.testIntegration(actor, id)
  return apiClient.post(`/integrations/${id}/test`, {}, { token })
}
