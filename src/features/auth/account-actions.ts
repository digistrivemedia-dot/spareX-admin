"use server"

import { refresh } from "next/cache"

import { listAllAuditEntries } from "@/features/audit/api"
import type { AuditEntry } from "@/features/audit/types"
import * as api from "@/features/auth/api"
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordValues,
  type ProfileValues,
} from "@/features/auth/schemas"
import { authorizeAction } from "@/features/auth/session"
import { AUDIT_CSV_COLUMNS, MY_ACTIVITY_FILTERS } from "@/features/audit/utils"
import { failure, validationFailure } from "@/lib/action-result"
import type { CsvFile } from "@/lib/csv"
import { exportCsv } from "@/lib/csv-export"
import { listParamsFromQuery } from "@/lib/list-params"
import type { ActionResult } from "@/lib/types"

export async function updateProfileAction(values: ProfileValues): Promise<ActionResult> {
  const auth = await authorizeAction()
  if ("error" in auth) return { ok: false, error: auth.error }
  const parsed = profileSchema.safeParse(values)
  if (!parsed.success) return validationFailure(parsed.error)
  try {
    await api.updateProfile(auth.token, auth.session.user.id, parsed.data)
  } catch (error) {
    return failure(error)
  }
  refresh()
  return { ok: true, data: undefined }
}

export async function changePasswordAction(values: ChangePasswordValues): Promise<ActionResult> {
  const auth = await authorizeAction()
  if ("error" in auth) return { ok: false, error: auth.error }
  const parsed = changePasswordSchema.safeParse(values)
  if (!parsed.success) return validationFailure(parsed.error)
  try {
    await api.changePassword(
      auth.token,
      auth.session.user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    )
  } catch (error) {
    return failure(error)
  }
  return { ok: true, data: undefined }
}

export async function setTwoStepAction(enabled: boolean): Promise<ActionResult> {
  const auth = await authorizeAction()
  if ("error" in auth) return { ok: false, error: auth.error }
  try {
    await api.setTwoStep(auth.token, auth.session.user.id, enabled)
  } catch (error) {
    return failure(error)
  }
  refresh()
  return { ok: true, data: undefined }
}

/** Exports the signed-in admin's own activity with the filters currently in the URL. */
export async function exportMyActivityAction(query: string): Promise<ActionResult<CsvFile>> {
  const auth = await authorizeAction()
  if ("error" in auth) return { ok: false, error: auth.error }
  const params = listParamsFromQuery(query, MY_ACTIVITY_FILTERS)
  params.filters.actor = auth.session.user.id
  return exportCsv<AuditEntry>({
    entity: "admin_user",
    label: "My activity",
    load: (token) => listAllAuditEntries(token, params),
    // Every row is the signed-in admin's own, so "Who" adds nothing.
    columns: AUDIT_CSV_COLUMNS.filter((column) => column.header !== "Who"),
  })
}
