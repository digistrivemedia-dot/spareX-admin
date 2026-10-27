"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ReasonDialog } from "@/components/ui/ReasonDialog"
import {
  deactivateCustomerAction,
  deleteCustomerAction,
  reactivateCustomerAction,
} from "@/features/customers/actions"
import type { CustomerStatus } from "@/features/customers/types"

type CustomerStatusActionsProps = { id: string; name: string; status: CustomerStatus }

/** Deactivate (with a reason), reactivate, or process a DPDP deletion request. */
export function CustomerStatusActions({ id, name, status }: CustomerStatusActionsProps) {
  if (status === "deleted") return null

  return (
    <>
      {status === "inactive" ? (
        <ConfirmDialog
          trigger={<Button variant="outline">Reactivate</Button>}
          title={`Reactivate ${name}?`}
          description="They can sign in, order and book services again."
          confirmLabel="Reactivate"
          onConfirm={() => reactivateCustomerAction(id)}
          successMessage="Account reactivated"
        />
      ) : (
        <ReasonDialog
          trigger={<Button variant="outline">Deactivate</Button>}
          title={`Deactivate ${name}?`}
          description="They won't be able to sign in, order or book. Open orders and bookings continue."
          reasonLabel="Reason for deactivating"
          suggestions={["Repeated failed COD deliveries", "Suspected fraud", "Abusive behaviour"]}
          confirmLabel="Deactivate"
          destructive
          onConfirm={(reason) => deactivateCustomerAction(id, reason)}
          successMessage="Account deactivated"
        />
      )}
      {status === "deletion_requested" && (
        <ConfirmDialog
          trigger={<Button variant="destructive">Delete account</Button>}
          title={`Delete ${name}'s account?`}
          description="Their name, contact details and addresses are erased and their vehicles are unlinked. Orders and invoices are kept, as tax law requires. This can't be undone."
          confirmLabel="Delete account"
          destructive
          onConfirm={() => deleteCustomerAction(id)}
          successMessage="Account deleted"
        />
      )}
    </>
  )
}
