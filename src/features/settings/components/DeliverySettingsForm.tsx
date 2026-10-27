"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { FormAlert } from "@/components/ui/FormAlert"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import { SettingsForm } from "@/features/settings/components/SettingsForm"
import { SETTINGS_SCHEMAS } from "@/features/settings/schemas"
import type { DeliverySettings } from "@/features/settings/types"
import { isEnabled } from "@/lib/features"

const rupees = (paise: number) => String(paise / 100)

export function DeliverySettingsForm({ settings }: { settings: DeliverySettings }) {
  const form = useForm({
    resolver: zodResolver(SETTINGS_SCHEMAS.delivery),
    defaultValues: {
      deliveryCharge: rupees(settings.deliveryCharge),
      freeDeliveryAbove: rupees(settings.freeDeliveryAbove),
      serviceablePincodes: settings.serviceablePincodes.join("\n"),
      codEnabled: settings.codEnabled,
      codLimit: rupees(settings.codLimit),
      codFee: rupees(settings.codFee),
    },
  })
  const codSwitchOn = isEnabled("b2cCashOnDelivery")

  return (
    <SettingsForm section="delivery" form={form}>
      <FormSection title="Delivery charges">
        <TextField
          control={form.control}
          name="deliveryCharge"
          label="Delivery charge (₹, incl. GST)"
          inputMode="decimal"
        />
        <TextField
          control={form.control}
          name="freeDeliveryAbove"
          label="Free delivery above (₹)"
          inputMode="decimal"
        />
        <div className="md:col-span-2">
          <TextareaField
            control={form.control}
            name="serviceablePincodes"
            label="Serviceable PIN codes"
            description="One per line: a PIN (560066) or a range (560001-560110)."
            rows={4}
          />
        </div>
      </FormSection>
      <FormSection title="Cash on delivery (B2C)">
        {!codSwitchOn && (
          <div className="md:col-span-2">
            <FormAlert tone="warning">
              B2C cash on delivery is switched off (Q-05). These values apply once it is turned on.
            </FormAlert>
          </div>
        )}
        <div className="md:col-span-2">
          <SwitchField
            control={form.control}
            name="codEnabled"
            label="Offer cash on delivery"
            description="B2B orders can always use COD."
          />
        </div>
        <TextField
          control={form.control}
          name="codLimit"
          label="Maximum order for COD (₹)"
          inputMode="decimal"
        />
        <TextField control={form.control} name="codFee" label="COD fee (₹)" inputMode="decimal" />
      </FormSection>
    </SettingsForm>
  )
}
