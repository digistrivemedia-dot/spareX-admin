import { Lock } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/layout/Container"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"
import { HOME_ROUTE } from "@/lib/navigation"

export const metadata: Metadata = { title: "No access" }

/** Where `requirePermission` sends an admin who opens a screen their role doesn't include. */
export default function NoAccessPage() {
  return (
    <Container>
      <div className="rounded-xl border border-gray-200 bg-card shadow-sm">
        <EmptyState
          icon={Lock}
          title="You don't have access to this page"
          description="Your role doesn't include this screen. Ask a Super Admin if you need it."
          action={
            <Button asChild>
              <Link href={HOME_ROUTE}>Go to dashboard</Link>
            </Button>
          }
          className="py-24"
        />
      </div>
    </Container>
  )
}
