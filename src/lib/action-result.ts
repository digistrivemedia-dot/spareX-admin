import { z } from "zod"

import { ApiError } from "@/lib/api-client"
import type { ActionResult } from "@/lib/types"

type Failure = Extract<ActionResult, { ok: false }>

/** Turns a zod validation error into the field errors a form shows under each input. */
export function validationFailure(error: z.ZodError): Failure {
  return {
    ok: false,
    error: "Check the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
  }
}

/** Turns anything a server action catches into a message the screen can show. */
export function failure(error: unknown): Failure {
  if (error instanceof ApiError)
    return { ok: false, error: error.message, fieldErrors: error.fieldErrors }
  return { ok: false, error: "Something went wrong. Please try again." }
}
