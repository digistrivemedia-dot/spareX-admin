"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Truck } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/FormDialog"
import { TextField } from "@/components/ui/TextField"
import { shipOrderAction } from "@/features/orders/actions"
import { shipSchema, type ShipValues } from "@/features/orders/schemas"

const DEFAULTS: ShipValues = { courier: "", trackingNumber: "" }

/** There is no courier integration: admin types the courier and tracking number, which the customer sees. */
export function ShipOrderDialog({ orderId }: { orderId: string }) {
  const form = useForm({ resolver: zodResolver(shipSchema), defaultValues: DEFAULTS })

  return (
    <FormDialog
      trigger={
        <Button>
          <Truck aria-hidden />
          Mark shipped
        </Button>
      }
      title="Mark shipped"
      description="The customer sees the courier and tracking number on their order."
      form={form}
      action={(values) => shipOrderAction(orderId, values)}
      successMessage="Order shipped"
      submitLabel="Mark shipped"
    >
      <TextField
        control={form.control}
        name="courier"
        label="Courier"
        placeholder="e.g. Delhivery"
      />
      <TextField control={form.control} name="trackingNumber" label="Tracking number" />
    </FormDialog>
  )
}
