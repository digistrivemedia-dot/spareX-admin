"use client"

import { ChevronDown } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { setEnquiryStatusAction } from "@/features/enquiries/actions"
import type { EnquiryStatus } from "@/features/enquiries/types"
import { ENQUIRY_STATUS_OPTIONS } from "@/features/enquiries/utils"

/** Moves an enquiry between new, in progress, resolved and closed. */
export function EnquiryStatusMenu({ id, status }: { id: string; status: EnquiryStatus }) {
  const [isPending, startTransition] = useTransition()

  function change(next: EnquiryStatus, label: string) {
    startTransition(async () => {
      const result = await setEnquiryStatusAction(id, next)
      if (result.ok) toast.success(`Marked ${label.toLowerCase()}`)
      else toast.error(result.error)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          Change status
          <ChevronDown aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ENQUIRY_STATUS_OPTIONS.filter((option) => option.value !== status).map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => change(option.value as EnquiryStatus, option.label)}
          >
            Mark {option.label.toLowerCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
