"use client"

import { CreditCard, Percent } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ReasonDialog } from "@/components/ui/ReasonDialog"
import { holdBusinessAction, releaseBusinessAction } from "@/features/businesses/actions"
import type { BusinessDetail } from "@/features/businesses/types"
import { CreditTermsDialog } from "@/features/credit/components/CreditTermsDialog"
import { DiscountDialog } from "@/features/pricing/components/DiscountDialog"

type BusinessActionsProps = {
  business: BusinessDetail
  canManage: boolean
  canPrice: boolean
  canCredit: boolean
}

/** Discount, credit and account hold for one business; each needs its own permission. */
export function BusinessActions({
  business,
  canManage,
  canPrice,
  canCredit,
}: BusinessActionsProps) {
  const creditOn = business.creditStatus !== null && business.creditStatus !== "disabled"

  return (
    <>
      {canPrice && (
        <DiscountDialog
          businessIds={[business.id]}
          label={business.name}
          current={business.discountPercent}
          trigger={
            <Button variant="outline">
              <Percent aria-hidden />
              Discount
            </Button>
          }
        />
      )}
      {creditOn && business.creditAccountId ? (
        <Button variant="outline" asChild>
          <Link href={`/credit/${business.creditAccountId}`}>
            <CreditCard aria-hidden />
            Credit account
          </Link>
        </Button>
      ) : (
        canCredit && (
          <CreditTermsDialog
            mode="enable"
            businessId={business.id}
            businessName={business.name}
            trigger={
              <Button variant="outline">
                <CreditCard aria-hidden />
                Enable credit
              </Button>
            }
          />
        )
      )}
      {canManage &&
        (business.status === "on_hold" ? (
          <ConfirmDialog
            trigger={<Button>Release account</Button>}
            title={`Release ${business.name}?`}
            description="They can order on B2B again."
            confirmLabel="Release"
            onConfirm={() => releaseBusinessAction(business.id)}
            successMessage="Account released"
          />
        ) : (
          <ReasonDialog
            trigger={<Button variant="destructive">Put on hold</Button>}
            title={`Put ${business.name} on hold?`}
            description="They can sign in but can't place orders or request quotations until released."
            reasonLabel="Reason for the hold"
            suggestions={["GST returns not filed", "Payment dispute", "Documents expired"]}
            confirmLabel="Put on hold"
            destructive
            onConfirm={(reason) => holdBusinessAction(business.id, reason)}
            successMessage="Account on hold"
          />
        ))}
    </>
  )
}
