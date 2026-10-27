import "server-only"

import { refresh } from "next/cache"
import type { z } from "zod"

import type { Permission } from "@/features/auth/permissions"
import { actorFrom, authorizeAction } from "@/features/auth/session"
import { failure, validationFailure } from "@/lib/action-result"
import type { ActionResult, RequestContext } from "@/lib/types"

/**
 * The body of every server action that changes data: checks the permission on the server, runs the change through
 * the feature's API, and refreshes the screen. The API records the audit entry.
 */
export async function runMutation<TResult>(
  permission: Permission,
  run: (context: RequestContext) => Promise<TResult>,
): Promise<ActionResult<TResult>> {
  const auth = await authorizeAction(permission)
  if ("error" in auth) return { ok: false, error: auth.error }
  let data: TResult
  try {
    data = await run({ token: auth.token, actor: actorFrom(auth.session) })
  } catch (error) {
    return failure(error)
  }
  refresh()
  return { ok: true, data }
}

/** `runMutation` for changes that come from a form: validates the values with the same schema the form used. */
export async function runValidatedMutation<TSchema extends z.ZodType, TResult>(
  permission: Permission,
  schema: TSchema,
  values: unknown,
  run: (context: RequestContext, data: z.output<TSchema>) => Promise<TResult>,
): Promise<ActionResult<TResult>> {
  const parsed = schema.safeParse(values)
  if (!parsed.success) return validationFailure(parsed.error)
  return runMutation(permission, (context) => run(context, parsed.data))
}

/** For server actions that only read (e.g. a drawer loading its data): checks the permission, no refresh. */
export async function runQuery<TResult>(
  permission: Permission,
  run: (token: string) => Promise<TResult>,
): Promise<ActionResult<TResult>> {
  const auth = await authorizeAction(permission)
  if ("error" in auth) return { ok: false, error: auth.error }
  try {
    return { ok: true, data: await run(auth.token) }
  } catch (error) {
    return failure(error)
  }
}
