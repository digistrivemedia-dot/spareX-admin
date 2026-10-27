import "server-only"

import type { AdminUser } from "@/features/admin-users/types"
import type {
  DemoAccount,
  PasswordResetRequest,
  SignInResult,
  TwoStepChallenge,
} from "@/features/auth/types"
import { apiClient } from "@/lib/api-client"
import { dataSource } from "@/lib/config"
import * as mock from "@/mocks/auth"

const useMock = dataSource.auth === "mock"

export async function signIn(email: string, password: string): Promise<SignInResult> {
  if (useMock) return mock.signIn(email, password)
  return apiClient.post("/auth/sign-in", { email, password })
}

export async function getTwoStepChallenge(challengeId: string): Promise<TwoStepChallenge | null> {
  if (useMock) return mock.getTwoStepChallenge(challengeId)
  return apiClient.get(`/auth/two-step/${challengeId}`)
}

export async function verifyTwoStep(challengeId: string, code: string): Promise<SignInResult> {
  if (useMock) return mock.verifyTwoStep(challengeId, code)
  return apiClient.post("/auth/two-step/verify", { challengeId, code })
}

export async function getUserByToken(token: string): Promise<AdminUser | null> {
  if (useMock) return mock.getUserByToken(token)
  return apiClient.get("/auth/me", { token })
}

export async function signOut(token: string): Promise<void> {
  if (useMock) return mock.signOut(token)
  return apiClient.post("/auth/sign-out", undefined, { token })
}

export async function requestPasswordReset(email: string): Promise<PasswordResetRequest> {
  if (useMock) return mock.requestPasswordReset(email)
  return apiClient.post("/auth/password-reset", { email })
}

export async function resetPassword(token: string, password: string): Promise<void> {
  if (useMock) return mock.resetPassword(token, password)
  return apiClient.post("/auth/password-reset/confirm", { token, password })
}

/** Only the demo data source has demo accounts; the real API never exposes credentials. */
export async function getDemoAccounts(): Promise<DemoAccount[]> {
  return useMock ? mock.getDemoAccounts() : []
}

export async function updateProfile(
  token: string,
  userId: string,
  input: { name: string; phone: string },
): Promise<AdminUser> {
  if (useMock) return mock.updateProfile(userId, input)
  return apiClient.patch("/me", input, { token })
}

export async function changePassword(
  token: string,
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (useMock) return mock.changePassword(userId, currentPassword, newPassword)
  return apiClient.post("/me/password", { currentPassword, newPassword }, { token })
}

export async function setTwoStep(
  token: string,
  userId: string,
  enabled: boolean,
): Promise<AdminUser> {
  if (useMock) return mock.setTwoStep(userId, enabled)
  return apiClient.patch("/me/two-step", { enabled }, { token })
}
