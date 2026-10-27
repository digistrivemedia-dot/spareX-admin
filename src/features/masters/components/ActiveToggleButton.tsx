"use client"

import { Power, PowerOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { setMasterActiveAction } from "@/features/masters/actions"
import type { MasterKind } from "@/features/masters/types"

type ActiveToggleButtonProps = {
  kind: MasterKind
  id: string
  name: string
  active: boolean
  /** What the record is, for the dialog: "brand", "variant"… */
  noun: string
}

/** Activates or deactivates a master record after confirming. Inactive records are hidden on B2C and B2B. */
export function ActiveToggleButton({ kind, id, name, active, noun }: ActiveToggleButtonProps) {
  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${active ? "Deactivate" : "Activate"} ${name}`}
        >
          {active ? <PowerOff aria-hidden /> : <Power aria-hidden />}
        </Button>
      }
      title={`${active ? "Deactivate" : "Activate"} ${name}?`}
      description={
        active
          ? `The ${noun} will be hidden on the B2C and B2B sites. Records that already use it are kept.`
          : `The ${noun} will be available on the B2C and B2B sites again.`
      }
      confirmLabel={active ? "Deactivate" : "Activate"}
      destructive={active}
      onConfirm={() => setMasterActiveAction(kind, id, !active)}
      successMessage={`${name} ${active ? "deactivated" : "activated"}`}
    />
  )
}
