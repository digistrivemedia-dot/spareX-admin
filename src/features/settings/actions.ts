"use server"

import { z } from "zod"

import * as api from "@/features/settings/api"
import {
  integrationKeysSchema,
  SETTINGS_SCHEMAS,
  type IntegrationKeysValues,
  type SettingsInput,
  type SettingsValues,
} from "@/features/settings/schemas"
import type { IntegrationId, SettingsSection } from "@/features/settings/types"
import { runMutation, runValidatedMutation } from "@/lib/server-action"

const sectionSchema = z.enum(
  Object.keys(SETTINGS_SCHEMAS) as [SettingsSection, ...SettingsSection[]],
)
const integrationSchema = z.enum(["razorpay", "sms"] satisfies IntegrationId[])

export async function saveSettingsAction<S extends SettingsSection>(
  section: S,
  values: SettingsValues<S>,
) {
  // The section arrives from the browser, so check it before picking its schema.
  const checked = sectionSchema.parse(section) as S
  // TypeScript can't tie a generic key to its schema in a map, though `checked` is exactly that key.
  const schema = SETTINGS_SCHEMAS[checked] as unknown as z.ZodType<SettingsInput<S>>
  return runValidatedMutation("settings.manage", schema, values, (context, data) =>
    api.saveSettings(context, checked, data),
  )
}

export async function saveIntegrationKeysAction(id: IntegrationId, values: IntegrationKeysValues) {
  const checked = integrationSchema.parse(id)
  return runValidatedMutation(
    "integrations.manage",
    integrationKeysSchema,
    values,
    (context, data) => api.saveIntegrationKeys(context, checked, data),
  )
}

export async function testIntegrationAction(id: IntegrationId) {
  const checked = integrationSchema.parse(id)
  return runMutation("integrations.manage", (context) => api.testIntegration(context, checked))
}
