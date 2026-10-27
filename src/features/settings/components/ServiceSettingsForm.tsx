"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import { SettingsForm } from "@/features/settings/components/SettingsForm"
import { SETTINGS_SCHEMAS } from "@/features/settings/schemas"
import type { ServiceSettings } from "@/features/settings/types"
import { isEnabled } from "@/lib/features"

export function ServiceSettingsForm({ settings }: { settings: ServiceSettings }) {
  const form = useForm({
    resolver: zodResolver(SETTINGS_SCHEMAS.service),
    defaultValues: {
      pickupWindows: settings.pickupWindows.join("\n"),
      inspectionFee: String(settings.inspectionFee / 100),
      timeSlots: settings.timeSlots.join("\n"),
    },
  })

  return (
    <SettingsForm section="service" form={form}>
      <FormSection title="Bookings">
        <TextareaField
          control={form.control}
          name="pickupWindows"
          label="Pickup time windows"
          description="For free pick and drop, one per line (Q-15)."
          rows={4}
        />
        <TextField
          control={form.control}
          name="inspectionFee"
          label="Inspection fee (₹)"
          description="Charged when every estimate item is rejected; 0 for none (Q-14)."
          inputMode="decimal"
        />
        {isEnabled("bookingTimeSlots") && (
          <TextareaField
            control={form.control}
            name="timeSlots"
            label="Booking time slots"
            description="One per line."
            rows={6}
          />
        )}
      </FormSection>
    </SettingsForm>
  )
}
