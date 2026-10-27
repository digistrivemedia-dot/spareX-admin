"use client"

import { ArrowRight, Eye } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ReasonDialog } from "@/components/ui/ReasonDialog"
import { rejectApplicationAction, startReviewAction } from "@/features/businesses/actions"
import { ApproveDialog } from "@/features/businesses/components/ApproveDialog"
import { SendBackDialog } from "@/features/businesses/components/SendBackDialog"
import type { BusinessApplication } from "@/features/businesses/types"

/** The decisions available at each stage: review, then approve, send back or reject. */
export function ApplicationActions({ application }: { application: BusinessApplication }) {
  const { id, status, businessName, businessId } = application

  if (status === "approved" && businessId) {
    return (
      <Button variant="outline" asChild>
        <Link href={`/businesses/${businessId}`}>
          Open business
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    )
  }
  if (status === "rejected") return null

  return (
    <>
      {status === "submitted" && (
        <ConfirmDialog
          trigger={
            <Button variant="outline">
              <Eye aria-hidden />
              Start review
            </Button>
          }
          title="Start reviewing this application?"
          description="The applicant sees it as under review, and other admins see that you have picked it up."
          confirmLabel="Start review"
          onConfirm={() => startReviewAction(id)}
          successMessage="Review started"
        />
      )}
      <ReasonDialog
        trigger={<Button variant="outline">Reject</Button>}
        title={`Reject ${businessName}?`}
        description="The applicant sees the reason and can apply again."
        reasonLabel="Reason for rejecting"
        suggestions={[
          "GSTIN is cancelled or invalid",
          "Documents don't match the business",
          "Not a business we supply",
        ]}
        confirmLabel="Reject"
        destructive
        onConfirm={(reason) => rejectApplicationAction(id, reason)}
        successMessage="Application rejected"
      />
      {status !== "sent_back" && <SendBackDialog applicationId={id} />}
      {status !== "sent_back" && <ApproveDialog applicationId={id} businessName={businessName} />}
    </>
  )
}
