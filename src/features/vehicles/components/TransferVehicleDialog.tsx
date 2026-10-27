"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightLeft } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/Combobox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { FormAlert } from "@/components/ui/FormAlert"
import { FormDialog } from "@/components/ui/FormDialog"
import { TextField } from "@/components/ui/TextField"
import type { CustomerOption } from "@/features/customers/api"
import { transferVehicleAction } from "@/features/vehicles/actions"
import { transferSchema, type TransferValues } from "@/features/vehicles/schemas"
import { formatPhone } from "@/lib/format"

type TransferVehicleDialogProps = {
  vehicleId: string
  registration: string
  /** A walk-in vehicle is linked rather than transferred. */
  isWalkIn: boolean
  customers: CustomerOption[]
}

/** Moves the vehicle and its whole history to a new owner, or links a walk-in to a customer. */
export function TransferVehicleDialog({
  vehicleId,
  registration,
  isWalkIn,
  customers,
}: TransferVehicleDialogProps) {
  const values: TransferValues = {
    vehicleId,
    customerId: "",
    date: new Date().toISOString().slice(0, 10),
  }
  const form = useForm({ resolver: zodResolver(transferSchema), values })
  const label = isWalkIn ? "Link to customer" : "Transfer owner"

  return (
    <FormDialog
      trigger={
        <Button variant="outline">
          <ArrowRightLeft aria-hidden />
          {label}
        </Button>
      }
      title={`${label}: ${registration}`}
      form={form}
      action={transferVehicleAction}
      successMessage={isWalkIn ? "Vehicle linked" : "Owner changed"}
      submitLabel={label}
    >
      <Controller
        name="customerId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="customerId">{isWalkIn ? "Customer" : "New owner"}</FieldLabel>
            <Combobox
              id="customerId"
              options={customers.map((customer) => ({
                value: customer.id,
                label: `${customer.name} · ${formatPhone(customer.phone)}`,
              }))}
              value={field.value || null}
              onChange={(value) => field.onChange(value ?? "")}
              placeholder="Choose a customer"
              searchPlaceholder="Search name or mobile"
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <TextField
        control={form.control}
        name="date"
        label={isWalkIn ? "Linked on" : "Transfer date"}
        type="date"
      />
      {!isWalkIn && (
        <FormAlert tone="warning">
          The new owner sees the full service history, including prices (default for Q-04). The
          previous owner keeps their past orders but no longer sees this vehicle.
        </FormAlert>
      )}
    </FormDialog>
  )
}
