import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { getUserByToken } from "@/features/auth/api"
import { SESSION_COOKIE } from "@/features/auth/cookies"
import { can, ROLES, type Permission } from "@/features/auth/permissions"
import type { Session } from "@/features/auth/types"
import type { ActorRef } from "@/lib/types"

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null
}

/** The signed-in admin with their role and permissions, or null. Cached for the length of one request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = await getSessionToken()
  if (!token) return null
  const user = await getUserByToken(token)
  if (!user) return null
  const role = ROLES[user.roleId]
  return { user, role, permissions: role.permissions }
})

/** For pages and layouts behind login. Sends visitors to the login screen. */
export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}

/** The token server components pass to feature APIs. Sends visitors without one to the login screen. */
export async function requireToken(): Promise<string> {
  const token = await getSessionToken()
  if (!token) redirect("/login")
  return token
}

/** For pages: sends admins without the permission to the "no access" screen. */
export async function requirePermission(permission: Permission): Promise<Session> {
  const session = await requireSession()
  if (!can(session, permission)) redirect("/no-access")
  return session
}

/**
 * For server actions, which must check permissions themselves rather than trust a hidden button.
 * Returns the session with its token, or an error message the action returns as-is.
 */
export async function authorizeAction(
  permission?: Permission,
): Promise<{ session: Session; token: string } | { error: string }> {
  const [session, token] = await Promise.all([getSession(), getSessionToken()])
  if (!session || !token) return { error: "Your session has ended. Sign in again." }
  if (permission && !can(session, permission))
    return { error: "You don't have permission to do this." }
  return { session, token }
}

export function actorFrom(session: Session): ActorRef {
  return { type: "admin", id: session.user.id, name: session.user.name }
}
