import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

import { AuthCard } from "@/components/layout/AuthCard"
import { FormAlert } from "@/components/ui/FormAlert"
import { getTwoStepChallenge } from "@/features/auth/api"
import { TwoStepForm } from "@/features/auth/components/TwoStepForm"
import { TWO_STEP_COOKIE } from "@/features/auth/cookies"

export const metadata: Metadata = { title: "2-step verification" }

export default async function VerifyPage({ searchParams }: PageProps<"/login/verify">) {
  const { next } = await searchParams
  const challengeId = (await cookies()).get(TWO_STEP_COOKIE)?.value
  const challenge = challengeId ? await getTwoStepChallenge(challengeId) : null
  if (!challenge) redirect("/login?expired=1")

  return (
    <AuthCard
      title="Enter your code"
      description={
        <>
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-900">{challenge.maskedPhone}</span>.
        </>
      }
    >
      {challenge.demoCode && (
        <FormAlert tone="success">
          Demo mode can&apos;t send an SMS. Use code {challenge.demoCode}.
        </FormAlert>
      )}
      <TwoStepForm next={typeof next === "string" ? next : undefined} />
      <Link href="/login" className="text-center text-sm text-navy-700 hover:underline">
        Use a different account
      </Link>
    </AuthCard>
  )
}
