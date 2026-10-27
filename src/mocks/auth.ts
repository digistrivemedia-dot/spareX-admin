import "server-only"

import { ROLES } from "@/features/auth/permissions"
import type {
  DemoAccount,
  PasswordResetRequest,
  SignInResult,
  TwoStepChallenge,
} from "@/features/auth/types"
import type { AdminUser } from "@/features/admin-users/types"
import type { AuditChange } from "@/features/audit/types"
import { ApiError } from "@/lib/api-client"
import { adminUsers } from "@/mocks/admin-users"
import { recordAuditEntry } from "@/mocks/audit"
import { delay, persistent } from "@/mocks/utils"

const DEMO_PASSWORD = "Demo@1234"
const DEMO_CODE = "123456"
const CHALLENGE_MINUTES = 10

/** Mirrors the backend: passwords, open sessions, 2-step challenges and reset tokens. */
const state = persistent("auth", () => ({
  passwords: new Map(adminUsers.map((user) => [user.id, DEMO_PASSWORD])),
  sessions: new Map<string, string>(),
  challenges: new Map<string, { userId: string; expiresAt: string }>(),
  resetTokens: new Map<string, string>(),
}))

function findActiveUser(id: string): AdminUser {
  const user = adminUsers.find((candidate) => candidate.id === id && candidate.status === "active")
  if (!user) throw new ApiError("Your account is not active. Contact a Super Admin.", 403)
  return user
}

function openSession(user: AdminUser): SignInResult {
  const token = crypto.randomUUID()
  state.sessions.set(token, user.id)
  user.lastLoginAt = new Date().toISOString()
  recordAuditEntry(
    { type: "admin", id: user.id, name: user.name },
    {
      action: "sign_in",
      entity: "admin_user",
      entityId: user.id,
      entityLabel: user.name,
      summary: "Signed in",
      changes: [],
    },
  )
  return { kind: "signed_in", token }
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  await delay()
  const user = adminUsers.find((candidate) => candidate.email === email.trim().toLowerCase())
  if (!user || state.passwords.get(user.id) !== password) {
    throw new ApiError("The email or password is incorrect.", 401)
  }
  findActiveUser(user.id)

  if (user.twoStepEnabled || ROLES[user.roleId].twoStepRequired) {
    const challengeId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + CHALLENGE_MINUTES * 60_000).toISOString()
    state.challenges.set(challengeId, { userId: user.id, expiresAt })
    return { kind: "two_step_required", challengeId }
  }
  return openSession(user)
}

export async function getTwoStepChallenge(challengeId: string): Promise<TwoStepChallenge | null> {
  const challenge = state.challenges.get(challengeId)
  if (!challenge || challenge.expiresAt < new Date().toISOString()) return null
  const digits = findActiveUser(challenge.userId).phone.slice(-10)
  return {
    id: challengeId,
    maskedPhone: `+91 ${digits.slice(0, 2)}••• ••${digits.slice(-3)}`,
    expiresAt: challenge.expiresAt,
    demoCode: DEMO_CODE,
  }
}

export async function verifyTwoStep(challengeId: string, code: string): Promise<SignInResult> {
  await delay()
  const challenge = await getTwoStepChallenge(challengeId)
  if (!challenge) throw new ApiError("This code has expired. Sign in again.", 410)
  if (code !== DEMO_CODE) throw new ApiError("The code is incorrect.", 401)
  const { userId } = state.challenges.get(challengeId) ?? { userId: "" }
  state.challenges.delete(challengeId)
  return openSession(findActiveUser(userId))
}

export async function getUserByToken(token: string): Promise<AdminUser | null> {
  const userId = state.sessions.get(token)
  const user = adminUsers.find((candidate) => candidate.id === userId)
  return user?.status === "active" ? user : null
}

export async function signOut(token: string): Promise<void> {
  state.sessions.delete(token)
}

export async function requestPasswordReset(email: string): Promise<PasswordResetRequest> {
  await delay()
  const user = adminUsers.find((candidate) => candidate.email === email.trim().toLowerCase())
  // Like the real API, the response never reveals whether the email belongs to an admin.
  if (!user || user.status !== "active") return { demoToken: null }
  const token = crypto.randomUUID()
  state.resetTokens.set(token, user.id)
  return { demoToken: token }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await delay()
  const userId = state.resetTokens.get(token)
  if (!userId) throw new ApiError("This reset link has expired or was already used.", 410)
  state.resetTokens.delete(token)
  state.passwords.set(userId, password)
}

export async function changePassword(userId: string, current: string, next: string) {
  await delay()
  if (state.passwords.get(userId) !== current) {
    throw new ApiError("Check the highlighted field.", 422, {
      currentPassword: ["Your current password is incorrect."],
    })
  }
  state.passwords.set(userId, next)
  accountAudit(findActiveUser(userId), "Changed own password", [])
}

export async function getDemoAccounts(): Promise<DemoAccount[]> {
  return adminUsers
    .filter((user) => user.status === "active")
    .filter((user, _, users) => users.find((other) => other.roleId === user.roleId) === user)
    .map((user) => ({
      email: user.email,
      password: DEMO_PASSWORD,
      roleName: ROLES[user.roleId].name,
    }))
}

function accountAudit(user: AdminUser, summary: string, changes: AuditChange[]) {
  recordAuditEntry(
    { type: "admin", id: user.id, name: user.name },
    {
      action: "update",
      entity: "admin_user",
      entityId: user.id,
      entityLabel: user.name,
      summary,
      changes,
    },
  )
}

export async function updateProfile(userId: string, input: { name: string; phone: string }) {
  await delay()
  const user = findActiveUser(userId)
  const changes: AuditChange[] = [
    { field: "Name", before: user.name, after: input.name },
    { field: "Mobile", before: user.phone, after: input.phone },
  ].filter((change) => change.before !== change.after)
  Object.assign(user, input)
  accountAudit(user, "Updated own profile", changes)
  return user
}

export async function setTwoStep(userId: string, enabled: boolean) {
  await delay()
  const user = findActiveUser(userId)
  if (!enabled && ROLES[user.roleId].twoStepRequired) {
    throw new ApiError(`2-step verification is mandatory for ${ROLES[user.roleId].name}.`, 422)
  }
  const before = user.twoStepEnabled
  user.twoStepEnabled = enabled
  accountAudit(user, enabled ? "Turned on 2-step verification" : "Turned off 2-step verification", [
    { field: "2-step verification", before: before ? "On" : "Off", after: enabled ? "On" : "Off" },
  ])
  return user
}
