"use client"

import { Radio } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ReasonDialog } from "@/components/ui/ReasonDialog"
import { goLiveAction, takeOfflineAction } from "@/features/garages/actions"
import type { GarageDetail } from "@/features/garages/types"

/** Switches the garage's visibility on B2C. Going live is only offered once the checklist is complete. */
export function GarageLiveActions({ garage }: { garage: GarageDetail }) {
  if (garage.status === "live") {
    return (
      <ReasonDialog
        trigger={<Button variant="destructive">Take offline</Button>}
        title={`Take ${garage.name} offline?`}
        description="Customers can't find or book it. Existing bookings stay with the garage."
        reasonLabel="Reason"
        suggestions={[
          "Garage closed for renovation",
          "Too many cancellations",
          "Partner agreement ended",
        ]}
        confirmLabel="Take offline"
        destructive
        onConfirm={(reason) => takeOfflineAction(garage.id, reason)}
        successMessage="Garage is offline"
      />
    )
  }

  const ready = Object.values(garage.readiness).every(Boolean)
  if (!ready) {
    return (
      <Button disabled title="Complete the go-live checklist first">
        <Radio aria-hidden />
        Go live
      </Button>
    )
  }

  return (
    <ConfirmDialog
      trigger={
        <Button>
          <Radio aria-hidden />
          Go live
        </Button>
      }
      title={`Make ${garage.name} live?`}
      description="Customers on B2C can find the garage and book its services at the prices it has set."
      confirmLabel="Go live"
      onConfirm={() => goLiveAction(garage.id)}
      successMessage="Garage is live"
    />
  )
}
