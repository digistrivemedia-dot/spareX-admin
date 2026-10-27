"use client"

import Link from "next/link"

import { Container } from "@/components/layout/Container"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/ErrorState"
import { HOME_ROUTE } from "@/lib/navigation"

export default function PanelError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Container>
      <div className="rounded-xl border border-gray-200 bg-card shadow-sm">
        <ErrorState onRetry={reset} className="py-20">
          <Button variant="ghost" asChild>
            <Link href={HOME_ROUTE}>Go to dashboard</Link>
          </Button>
        </ErrorState>
      </div>
    </Container>
  )
}
