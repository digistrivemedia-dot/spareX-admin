"use client"

import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import type { ActionResult } from "@/lib/types"

type DeleteButtonProps = {
  /** What is deleted, e.g. "banner". */
  noun: string
  name: string
  onConfirm: () => Promise<ActionResult<unknown>>
}

/** An icon button that deletes a content record after confirming. */
export function DeleteButton({ noun, name, onConfirm }: DeleteButtonProps) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" aria-label={`Delete ${name}`}>
          <Trash2 aria-hidden />
        </Button>
      }
      title={`Delete this ${noun}?`}
      description={`"${name}" is removed from the site. This can't be undone.`}
      confirmLabel={`Delete ${noun}`}
      destructive
      onConfirm={onConfirm}
      successMessage={`${noun[0]?.toUpperCase()}${noun.slice(1)} deleted`}
    />
  )
}
