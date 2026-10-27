"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Truck } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/FormDialog"
import { SelectField } from "@/components/ui/SelectField"
import { TextField } from "@/components/ui/TextField"
import { schedulePickupAction } from "@/features/returns/actions"
import { pickupSchema, type PickupValues } from "@/features/returns/schemas"
import { PICKUP_WINDOWS } from "@/lib/constants"

const WINDOW_OPTIONS = PICKUP_WINDOWS.map((window) => ({ value: window, label: window }))

/** Kannali arranges the pickup; the customer sees the date and time window. */
export function SchedulePickupDialog({ returnId }: { returnId: string }) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const values: PickupValues = {
    date: tomorrow.toISOString().slice(0, 10),
    window: PICKUP_WINDOWS[0],
  }
  const form = useForm({ resolver: zodResolver(pickupSchema), values })

  return (
    <FormDialog
      trigger={
        <Button>
          <Truck aria-hidden />
          Schedule pickup
        </Button>
      }
      title="Schedule pickup"
      description="The customer is told the date and time window."
      form={form}
      action={(data) => schedulePickupAction(returnId, data)}
      successMessage="Pickup scheduled"
      submitLabel="Schedule pickup"
    >
      <TextField control={form.control} name="date" label="Pickup date" type="date" />
      <SelectField
        control={form.control}
        name="window"
        label="Time window"
        options={WINDOW_OPTIONS}
      />
    </FormDialog>
  )
}
