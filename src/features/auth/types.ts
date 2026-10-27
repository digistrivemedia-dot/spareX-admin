import type { AdminUser } from "@/features/admin-users/types"
import type { Permission, Role } from "@/features/auth/permissions"
import type { IsoDateTime } from "@/lib/types"

export type Session = {
  user: AdminUser
  role: Role
  permissions: readonly Permission[]
}

export type SignInResult =
  { kind: "signed_in"; token: string } | { kind: "two_step_required"; challengeId: string }

export type TwoStepChallenge = {
  id: string
  maskedPhone: string
  expiresAt: IsoDateTime
  /** Only set by the demo data source, which cannot send an SMS. */
  demoCode: string | null
}

export type PasswordResetRequest = {
  /** Only set by the demo data source, which cannot send an email. */
  demoToken: string | null
}

/** Shown on the login screen in demo mode so the client can sign in as each role. */
export type DemoAccount = {
  email: string
  password: string
  roleName: string
}
