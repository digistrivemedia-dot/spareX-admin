"use client"

import Link from "next/link"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/ErrorState"

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4">
      <Logo />
      <ErrorState
        onRetry={reset}
        description="An unexpected error stopped this page from loading. Try again, or sign in afresh."
      >
        <Button variant="ghost" asChild>
          <Link href="/login">Go to sign in</Link>
        </Button>
      </ErrorState>
    </main>
  )
}
