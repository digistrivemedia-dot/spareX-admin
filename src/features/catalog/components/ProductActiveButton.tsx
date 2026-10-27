"use client"

import { Power, PowerOff } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { setProductsActiveAction } from "@/features/catalog/actions"

type ProductActiveButtonProps = {
  ids: string[]
  /** "Motul 7100…" for one product, "3 products" for a selection. */
  label: string
  active: boolean
  /** Defaults to an icon button; bulk actions pass a labelled one. */
  trigger?: ReactNode
  onDone?: () => void
}

/** Activates or deactivates products after confirming. Inactive products are hidden on B2C and B2B. */
export function ProductActiveButton({
  ids,
  label,
  active,
  trigger,
  onDone,
}: ProductActiveButtonProps) {
  return (
    <ConfirmDialog
      trigger={
        trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${active ? "Deactivate" : "Activate"} ${label}`}
          >
            {active ? <PowerOff aria-hidden /> : <Power aria-hidden />}
          </Button>
        )
      }
      title={`${active ? "Deactivate" : "Activate"} ${label}?`}
      description={
        active
          ? "Customers and businesses won't see or order it. Open orders are not affected."
          : "It will be listed and orderable on B2C and B2B again."
      }
      confirmLabel={active ? "Deactivate" : "Activate"}
      destructive={active}
      onConfirm={async () => {
        const result = await setProductsActiveAction(ids, !active)
        if (result.ok) onDone?.()
        return result
      }}
      successMessage={`${label} ${active ? "deactivated" : "activated"}`}
    />
  )
}
