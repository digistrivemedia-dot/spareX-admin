import type { Metadata } from "next"

import { AuthCard } from "@/components/layout/AuthCard"
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm"

export const metadata: Metadata = { title: "Forgot password" }

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your admin email and we'll send you a link to set a new one."
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
