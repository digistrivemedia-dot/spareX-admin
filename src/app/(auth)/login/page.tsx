import type { Metadata } from "next"

import { AuthCard } from "@/components/layout/AuthCard"
import { FormAlert } from "@/components/ui/FormAlert"
import { getDemoAccounts } from "@/features/auth/api"
import { DemoAccounts } from "@/features/auth/components/DemoAccounts"
import { LoginForm } from "@/features/auth/components/LoginForm"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, reset, expired } = await searchParams
  const accounts = await getDemoAccounts()

  return (
    <AuthCard title="Sign in" description="Use your Kannali Garage admin account.">
      {reset === "1" && (
        <FormAlert tone="success">Password changed. Sign in with your new password.</FormAlert>
      )}
      {expired === "1" && (
        <FormAlert tone="error">Your verification code expired. Sign in again.</FormAlert>
      )}
      <LoginForm next={typeof next === "string" ? next : undefined} />
      <DemoAccounts accounts={accounts} />
    </AuthCard>
  )
}
