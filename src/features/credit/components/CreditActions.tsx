"use client"

import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ReasonDialog } from "@/components/ui/ReasonDialog"
import type { CreditAccountListItem } from "@/features/businesses/types"
import {
  disableCreditAction,
  holdCreditAction,
  releaseCreditAction,
} from "@/features/credit/actions"
import { CreditTermsDialog } from "@/features/credit/components/CreditTermsDialog"
import { RecordPaymentDialog } from "@/features/credit/components/RecordPaymentDialog"

/** Payments, limit and terms, hold / release, and turning credit off. */
export function CreditActions({ account }: { account: CreditAccountListItem }) {
  if (account.status === "disabled") {
    return (
      <CreditTermsDialog
        mode="enable"
        businessId={account.businessId}
        businessName={account.businessName}
        trigger={<Button>Enable credit</Button>}
      />
    )
  }

  return (
    <>
      <ConfirmDialog
        trigger={<Button variant="ghost">Disable credit</Button>}
        title={`Disable credit for ${account.businessName}?`}
        description="They can only pay upfront from now on. Credit can be disabled only when nothing is outstanding."
        confirmLabel="Disable credit"
        destructive
        onConfirm={() => disableCreditAction(account.id)}
        successMessage="Credit disabled"
      />
      {account.status === "on_hold" ? (
        <ConfirmDialog
          trigger={<Button variant="outline">Release hold</Button>}
          title="Release the hold?"
          description="They can place credit orders again, up to the available limit."
          confirmLabel="Release"
          onConfirm={() => releaseCreditAction(account.id)}
          successMessage="Hold released"
        />
      ) : (
        <ReasonDialog
          trigger={<Button variant="outline">Put on hold</Button>}
          title="Put credit on hold?"
          description="No new credit orders until released. Existing invoices stay due."
          reasonLabel="Reason for the hold"
          suggestions={["Payment overdue", "Cheque bounced", "Limit under review"]}
          confirmLabel="Put on hold"
          destructive
          onConfirm={(reason) => holdCreditAction(account.id, reason)}
          successMessage="Credit on hold"
        />
      )}
      <CreditTermsDialog
        mode="edit"
        accountId={account.id}
        businessName={account.businessName}
        limit={account.limit}
        termsDays={account.termsDays}
        trigger={
          <Button variant="outline">
            <Pencil aria-hidden />
            Limit and terms
          </Button>
        }
      />
      <RecordPaymentDialog accountId={account.id} outstanding={account.outstanding} />
    </>
  )
}
