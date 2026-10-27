import type { Metadata } from "next"
import Link from "next/link"

import { AuthCard } from "@/components/layout/AuthCard"
import { FormAlert } from "@/components/ui/FormAlert"
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm"

export const metadata: Metadata = { title: "Set a new password" }

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams

  if (typeof token !== "string" || !token) {
    return (
      <AuthCard title="Link not valid">
        <FormAlert tone="error">This reset link is incomplete. Ask for a new one.</FormAlert>
        <Link href="/forgot-password" className="text-center text-sm text-navy-700 hover:underline">
          Send a new reset link
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a new password for your admin account."
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  )
}
