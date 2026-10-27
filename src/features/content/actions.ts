"use server"

import { z } from "zod"

import * as api from "@/features/content/api"
import {
  bannerSchema,
  faqSchema,
  pageSchema,
  type BannerValues,
  type FaqValues,
  type PageValues,
} from "@/features/content/schemas"
import type { FeaturedKind } from "@/features/content/types"
import {
  BANNER_FILTERS,
  FAQ_FILTERS,
  PAGE_FILTERS,
  PLACEMENT_LABELS,
} from "@/features/content/utils"
import { storeImage } from "@/features/uploads/api"
import { exportCsv } from "@/lib/csv-export"
import { endOfDayIst, startOfDayIst } from "@/lib/dates"
import { formatDate, formatDateTime, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runMutation, runValidatedMutation } from "@/lib/server-action"

export async function saveBannerAction(id: string | null, values: BannerValues) {
  return runValidatedMutation("content.manage", bannerSchema, values, async (context, data) => {
    const { webImage, mobileImage, startsOn, endsOn, ...rest } = data
    await api.saveBanner(context, id, {
      ...rest,
      webImageUrl: await storeImage(context, webImage),
      mobileImageUrl: await storeImage(context, mobileImage),
      startsAt: startOfDayIst(startsOn),
      endsAt: endsOn ? endOfDayIst(endsOn) : null,
    })
  })
}

export async function deleteBannerAction(id: string) {
  return runMutation("content.manage", (context) => api.deleteBanner(context, id))
}

const featuredSchema = z.array(z.string().min(1)).max(20, "Feature up to 20.")

export async function saveFeaturedAction(kind: FeaturedKind, ids: string[]) {
  return runValidatedMutation("content.manage", featuredSchema, ids, (context, data) =>
    api.saveFeatured(context, kind, data),
  )
}

export async function savePageAction(id: string, values: PageValues) {
  return runValidatedMutation("content.manage", pageSchema, values, (context, data) =>
    api.savePage(context, id, data),
  )
}

export async function saveFaqAction(id: string | null, values: FaqValues) {
  return runValidatedMutation("content.manage", faqSchema, values, (context, data) =>
    api.saveFaq(context, id, data),
  )
}

export async function deleteFaqAction(id: string) {
  return runMutation("content.manage", (context) => api.deleteFaq(context, id))
}

export async function exportBannersAction(query: string) {
  const params = listParamsFromQuery(query, BANNER_FILTERS)
  return exportCsv({
    entity: "content",
    label: "Banners",
    load: (token) => api.bannersApi.all(token, params),
    columns: [
      { header: "Title", value: (row) => row.title },
      { header: "Placement", value: (row) => PLACEMENT_LABELS[row.placement] },
      { header: "Order", value: (row) => row.sortOrder },
      { header: "Link", value: (row) => row.linkUrl },
      { header: "Starts", value: (row) => formatDate(row.startsAt) },
      { header: "Ends", value: (row) => (row.endsAt ? formatDate(row.endsAt) : "") },
      { header: "Active", value: (row) => (row.active ? "Yes" : "No") },
    ],
  })
}

export async function exportPagesAction(query: string) {
  const params = listParamsFromQuery(query, PAGE_FILTERS)
  return exportCsv({
    entity: "content",
    label: "Pages",
    load: (token) => api.pagesApi.all(token, params),
    columns: [
      { header: "Title", value: (row) => row.title },
      { header: "Slug", value: (row) => row.slug },
      { header: "Type", value: (row) => humanize(row.kind) },
      { header: "Sections", value: (row) => row.sections.length },
      { header: "Published", value: (row) => (row.published ? "Yes" : "No") },
      { header: "Updated", value: (row) => formatDateTime(row.updatedAt) },
    ],
  })
}

export async function exportFaqsAction(query: string) {
  const params = listParamsFromQuery(query, FAQ_FILTERS)
  return exportCsv({
    entity: "content",
    label: "FAQs",
    load: (token) => api.faqsApi.all(token, params),
    columns: [
      { header: "Order", value: (row) => row.sortOrder },
      { header: "Category", value: (row) => humanize(row.category) },
      { header: "Question", value: (row) => row.question },
      { header: "Answer", value: (row) => row.answer },
      { header: "Active", value: (row) => (row.active ? "Yes" : "No") },
    ],
  })
}
