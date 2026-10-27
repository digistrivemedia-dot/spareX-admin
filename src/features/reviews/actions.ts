"use server"

import * as api from "@/features/reviews/api"
import type { ReviewKind } from "@/features/reviews/types"
import { GARAGE_REVIEW_FILTERS, PRODUCT_REVIEW_FILTERS } from "@/features/reviews/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDateTime, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runMutation, runValidatedMutation } from "@/lib/server-action"
import { reason as reasonSchema } from "@/lib/validation"

export async function hideReviewAction(kind: ReviewKind, id: string, reason: string) {
  return runValidatedMutation("reviews.manage", reasonSchema, reason, (context, data) =>
    api.moderateReview(context, kind, id, "hidden", data),
  )
}

export async function publishReviewAction(kind: ReviewKind, id: string) {
  return runMutation("reviews.manage", (context) =>
    api.moderateReview(context, kind, id, "published", null),
  )
}

export async function exportGarageReviewsAction(query: string) {
  const params = listParamsFromQuery(query, GARAGE_REVIEW_FILTERS)
  return exportCsv({
    entity: "review",
    label: "Garage reviews",
    load: (token) => api.garageReviewsApi.all(token, params),
    columns: [
      { header: "Garage", value: (row) => row.garageName },
      { header: "Customer", value: (row) => row.customerName },
      { header: "Rating", value: (row) => row.rating },
      { header: "Comment", value: (row) => row.comment },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Hidden because", value: (row) => row.hiddenReason ?? "" },
      { header: "Posted", value: (row) => formatDateTime(row.createdAt) },
    ],
  })
}

export async function exportProductReviewsAction(query: string) {
  const params = listParamsFromQuery(query, PRODUCT_REVIEW_FILTERS)
  return exportCsv({
    entity: "review",
    label: "Product reviews",
    load: (token) => api.productReviewsApi.all(token, params),
    columns: [
      { header: "Product", value: (row) => row.productName },
      { header: "Customer", value: (row) => row.customerName },
      { header: "Rating", value: (row) => row.rating },
      { header: "Title", value: (row) => row.title },
      { header: "Comment", value: (row) => row.comment },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Posted", value: (row) => formatDateTime(row.createdAt) },
    ],
  })
}
