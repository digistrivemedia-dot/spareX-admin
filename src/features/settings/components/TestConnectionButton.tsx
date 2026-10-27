"use client"

import { Loader2, PlugZap } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { testIntegrationAction } from "@/features/settings/actions"
import type { IntegrationId } from "@/features/settings/types"

export function TestConnectionButton({ id, disabled }: { id: IntegrationId; disabled: boolean }) {
  const [isPending, startTransition] = useTransition()

  function test() {
    startTransition(async () => {
      const result = await testIntegrationAction(id)
      if (result.ok) toast.success("Connection works")
      else toast.error(result.error)
    })
  }

  return (
    <Button onClick={test} disabled={disabled || isPending}>
      {isPending ? <Loader2 aria-hidden className="animate-spin" /> : <PlugZap aria-hidden />}
      Test connection
    </Button>
  )
}
