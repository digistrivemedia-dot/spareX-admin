"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ReasonDialog } from "@/components/ui/ReasonDialog"
import { hideReviewAction, publishReviewAction } from "@/features/reviews/actions"
import type { ProductReview, ReviewKind } from "@/features/reviews/types"

type ReviewModerationProps = {
  kind: ReviewKind
  id: string
  status: ProductReview["status"]
  author: string
}

/** Hide (with a reason) a published or pending review; publish a hidden or pending one. */
export function ReviewModeration({ kind, id, status, author }: ReviewModerationProps) {
  return (
    <div className="flex justify-end gap-2">
      {status !== "hidden" && (
        <ReasonDialog
          trigger={
            <Button size="sm" variant="outline">
              Hide
            </Button>
          }
          title={`Hide ${author}'s review?`}
          description="Customers stop seeing it. The reason is kept for the audit log."
          reasonLabel="Reason for hiding"
          suggestions={[
            "Contains contact details",
            "Abusive language",
            "Promotional content",
            "Not about this service",
          ]}
          confirmLabel="Hide review"
          destructive
          onConfirm={(reason) => hideReviewAction(kind, id, reason)}
          successMessage="Review hidden"
        />
      )}
      {status !== "published" && (
        <ConfirmDialog
          trigger={<Button size="sm">Publish</Button>}
          title={`Publish ${author}'s review?`}
          description="Customers will see it on the site."
          confirmLabel="Publish"
          onConfirm={() => publishReviewAction(kind, id)}
          successMessage="Review published"
        />
      )}
    </div>
  )
}
