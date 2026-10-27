"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import * as api from "@/features/auth/api"
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  secureCookie,
  TWO_STEP_COOKIE,
  TWO_STEP_MAX_AGE_SECONDS,
} from "@/features/auth/cookies"
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  twoStepSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
  type SignInValues,
  type TwoStepValues,
} from "@/features/auth/schemas"
import { getSessionToken } from "@/features/auth/session"
import type { SignInResult } from "@/features/auth/types"
import { failure, validationFailure } from "@/lib/action-result"
import { HOME_ROUTE } from "@/lib/navigation"
import type { ActionResult } from "@/lib/types"

/** Only same-site paths are allowed after sign-in, so a crafted link cannot send admins elsewhere. */
function safeNextPath(next: string | undefined): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : HOME_ROUTE
}

async function finishSignIn(result: SignInResult, next: string | undefined): Promise<never> {
  const jar = await cookies()
  if (result.kind === "two_step_required") {
    jar.set(TWO_STEP_COOKIE, result.challengeId, {
      ...secureCookie,
      maxAge: TWO_STEP_MAX_AGE_SECONDS,
    })
    redirect(`/login/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`)
  }
  jar.delete(TWO_STEP_COOKIE)
  jar.set(SESSION_COOKIE, result.token, { ...secureCookie, maxAge: SESSION_MAX_AGE_SECONDS })
  redirect(safeNextPath(next))
}

export async function signInAction(values: SignInValues, next?: string): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(values)
  if (!parsed.success) return validationFailure(parsed.error)
  let result: SignInResult
  try {
    result = await api.signIn(parsed.data.email, parsed.data.password)
  } catch (error) {
    return failure(error)
  }
  return finishSignIn(result, next)
}

export async function verifyTwoStepAction(
  values: TwoStepValues,
  next?: string,
): Promise<ActionResult> {
  const parsed = twoStepSchema.safeParse(values)
  if (!parsed.success) return validationFailure(parsed.error)
  const challengeId = (await cookies()).get(TWO_STEP_COOKIE)?.value
  if (!challengeId) return { ok: false, error: "This code has expired. Sign in again." }
  let result: SignInResult
  try {
    result = await api.verifyTwoStep(challengeId, parsed.data.code)
  } catch (error) {
    return failure(error)
  }
  return finishSignIn(result, next)
}

export async function signOutAction(): Promise<void> {
  const token = await getSessionToken()
  if (token) await api.signOut(token)
  ;(await cookies()).delete(SESSION_COOKIE)
  redirect("/login")
}

export async function requestPasswordResetAction(
  values: ForgotPasswordValues,
): Promise<ActionResult<{ demoResetPath: string | null }>> {
  const parsed = forgotPasswordSchema.safeParse(values)
  if (!parsed.success) return validationFailure(parsed.error)
  try {
    const { demoToken } = await api.requestPasswordReset(parsed.data.email)
    return {
      ok: true,
      data: { demoResetPath: demoToken ? `/reset-password?token=${demoToken}` : null },
    }
  } catch (error) {
    return failure(error)
  }
}

export async function resetPasswordAction(values: ResetPasswordValues): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values)
  if (!parsed.success) return validationFailure(parsed.error)
  try {
    await api.resetPassword(parsed.data.token, parsed.data.newPassword)
  } catch (error) {
    return failure(error)
  }
  redirect("/login?reset=1")
}
