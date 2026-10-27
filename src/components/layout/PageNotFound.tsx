import { FileQuestion } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"
import { HOME_ROUTE } from "@/lib/navigation"

/** The 404 message, used inside the panel and on the bare not-found page. */
export function PageNotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved. Check the address, or head back to the dashboard."
      action={
        <Button asChild>
          <Link href={HOME_ROUTE}>Go to dashboard</Link>
        </Button>
      }
      className="py-24"
    />
  )
}
