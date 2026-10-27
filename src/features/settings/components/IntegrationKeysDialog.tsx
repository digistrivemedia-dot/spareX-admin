"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/FormDialog"
import { SelectField } from "@/components/ui/SelectField"
import { TextField } from "@/components/ui/TextField"
import { saveIntegrationKeysAction } from "@/features/settings/actions"
import { integrationKeysSchema, type IntegrationKeysValues } from "@/features/settings/schemas"
import type { Integration } from "@/features/settings/types"

const MODE_OPTIONS = [
  { value: "test", label: "Test" },
  { value: "live", label: "Live" },
]

/** Keys are write-only: the dialog never shows the saved ones, only lets you replace them. */
export function IntegrationKeysDialog({ integration }: { integration: Integration }) {
  const values: IntegrationKeysValues = { mode: integration.mode, keyId: "", secret: "" }
  const form = useForm({ resolver: zodResolver(integrationKeysSchema), values })

  return (
    <FormDialog
      trigger={
        <Button variant="outline">
          <KeyRound aria-hidden />
          {integration.status === "not_configured" ? "Add keys" : "Replace keys"}
        </Button>
      }
      title={`${integration.provider} keys`}
      description="Paste them from the provider's dashboard. Saved keys are only ever shown masked."
      form={form}
      action={(data) => saveIntegrationKeysAction(integration.id, data)}
      successMessage="Keys saved"
      submitLabel="Save keys"
    >
      <SelectField control={form.control} name="mode" label="Mode" options={MODE_OPTIONS} />
      <TextField control={form.control} name="keyId" label="Key ID" autoComplete="off" />
      <TextField
        control={form.control}
        name="secret"
        label="Secret"
        type="password"
        autoComplete="new-password"
      />
    </FormDialog>
  )
}
