import "server-only"

import type { AuditAction, AuditChange } from "@/features/audit/types"
import type { BannerInput, FaqInput, PageInput } from "@/features/content/schemas"
import type {
  Banner,
  ContentPage,
  Faq,
  FeaturedContent,
  FeaturedKind,
} from "@/features/content/types"
import { bannerState, PLACEMENT_LABELS } from "@/features/content/utils"
import { ApiError } from "@/lib/api-client"
import type { ActorRef } from "@/lib/types"
import { diffChanges, recordAuditEntry } from "@/mocks/audit"
import { products } from "@/mocks/catalog"
import { banners, contentPages, faqs, featuredCategories, featuredProducts } from "@/mocks/content"
import { productCategories } from "@/mocks/masters"
import { delay, listEndpoint, newId } from "@/mocks/utils"

function audit(
  actor: ActorRef,
  action: AuditAction,
  entityId: string,
  entityLabel: string,
  summary: string,
  changes: AuditChange[] = [],
) {
  recordAuditEntry(actor, { action, entity: "content", entityId, entityLabel, summary, changes })
}

function find<T extends { id: string }>(rows: T[], id: string, label: string): T {
  const row = rows.find((candidate) => candidate.id === id)
  if (!row) throw new ApiError(`${label} not found.`, 404)
  return row
}

const isActive = (row: { active: boolean }, value: string) => row.active === (value === "active")

// Banners (A44)

export const bannerEndpoint = listEndpoint<Banner>(() => banners, {
  searchText: (row) => `${row.title} ${row.linkUrl}`,
  date: (row) => row.startsAt,
  filters: { placement: (row, value) => row.placement === value, active: isActive },
  sortValues: {
    placement: (row) => `${row.placement}-${String(row.sortOrder).padStart(2, "0")}`,
    startsAt: (row) => row.startsAt,
    state: (row) => bannerState(row),
  },
})

export async function saveBanner(actor: ActorRef, id: string | null, input: BannerInput) {
  await delay()
  if (id) {
    const banner = find(banners, id, "Banner")
    const before = { ...banner }
    Object.assign(banner, input)
    audit(
      actor,
      "update",
      id,
      banner.title,
      "Edited banner",
      diffChanges(before, banner, {
        title: "Title",
        placement: "Placement",
        linkUrl: "Link",
        startsAt: "Starts",
        endsAt: "Ends",
        sortOrder: "Order",
        active: "Active",
      }),
    )
    return
  }
  const banner = { id: newId("ban"), ...input }
  banners.push(banner)
  audit(
    actor,
    "create",
    banner.id,
    banner.title,
    `Added ${PLACEMENT_LABELS[input.placement]} banner`,
  )
}

export async function deleteBanner(actor: ActorRef, id: string) {
  await delay()
  const banner = find(banners, id, "Banner")
  banners.splice(banners.indexOf(banner), 1)
  audit(actor, "delete", "", banner.title, "Deleted banner")
}

// Featured categories and products (A45)

export async function getFeatured(): Promise<FeaturedContent> {
  await delay()
  const category = (id: string) => {
    const record = productCategories.find((candidate) => candidate.id === id)
    return { id, name: record?.name ?? id, detail: record?.active ? "Active" : "Inactive" }
  }
  const product = (id: string) => {
    const record = products.find((candidate) => candidate.id === id)
    return { id, name: record?.name ?? id, detail: record?.sku ?? "" }
  }
  const sorted = <T extends { sortOrder: number }>(rows: T[]) =>
    rows.toSorted((a, b) => a.sortOrder - b.sortOrder)
  return {
    categories: sorted(featuredCategories).map((row) => category(row.categoryId)),
    products: sorted(featuredProducts).map((row) => product(row.productId)),
    options: {
      categories: productCategories
        .filter((row) => row.parentId === null)
        .map((row) => category(row.id)),
      products: products.map((row) => product(row.id)),
    },
  }
}

export async function saveFeatured(actor: ActorRef, kind: FeaturedKind, ids: string[]) {
  await delay()
  const before = (await getFeatured())[kind].map((item) => item.name).join(", ")
  if (kind === "categories") {
    featuredCategories.splice(
      0,
      featuredCategories.length,
      ...ids.map((categoryId, index) => ({
        id: `fc_${categoryId}`,
        categoryId,
        sortOrder: index + 1,
      })),
    )
  } else {
    featuredProducts.splice(
      0,
      featuredProducts.length,
      ...ids.map((productId, index) => ({
        id: `fp_${productId}`,
        productId,
        sortOrder: index + 1,
      })),
    )
  }
  const after = (await getFeatured())[kind].map((item) => item.name).join(", ")
  audit(actor, "update", `featured_${kind}`, `Featured ${kind}`, `Updated featured ${kind}`, [
    { field: "Order", before, after },
  ])
}

// Pages and FAQ (A46)

export const pageEndpoint = listEndpoint<ContentPage>(() => contentPages, {
  searchText: (row) => `${row.title} ${row.slug}`,
  date: (row) => row.updatedAt,
  filters: { kind: (row, value) => row.kind === value },
  sortValues: { title: (row) => row.title, updatedAt: (row) => row.updatedAt },
})

export async function getPage(id: string): Promise<ContentPage | null> {
  await delay()
  return contentPages.find((candidate) => candidate.id === id) ?? null
}

export async function savePage(actor: ActorRef, id: string, input: PageInput) {
  await delay()
  const page = find(contentPages, id, "Page")
  const before = { title: page.title, published: page.published, sections: page.sections.length }
  Object.assign(page, {
    title: input.title,
    published: input.published,
    sections: input.sections.map((section) => ({
      id: section.id || newId("sec"),
      heading: section.heading,
      paragraphs: section.body,
    })),
    updatedAt: new Date().toISOString(),
    updatedBy: actor,
  })
  audit(
    actor,
    "update",
    id,
    page.title,
    "Edited page",
    diffChanges(
      before,
      { title: page.title, published: page.published, sections: page.sections.length },
      { title: "Title", published: "Published", sections: "Sections" },
    ),
  )
}

export const faqEndpoint = listEndpoint<Faq>(() => faqs, {
  searchText: (row) => `${row.question} ${row.answer}`,
  filters: { category: (row, value) => row.category === value, active: isActive },
  sortValues: { sortOrder: (row) => row.sortOrder, question: (row) => row.question },
})

export async function saveFaq(actor: ActorRef, id: string | null, input: FaqInput) {
  await delay()
  if (id) {
    const faq = find(faqs, id, "FAQ")
    const before = { ...faq }
    Object.assign(faq, input)
    audit(
      actor,
      "update",
      id,
      faq.question,
      "Edited FAQ",
      diffChanges(before, faq, {
        question: "Question",
        answer: "Answer",
        category: "Category",
        sortOrder: "Order",
        active: "Active",
      }),
    )
    return
  }
  const faq = { id: newId("faq"), ...input }
  faqs.push(faq)
  audit(actor, "create", faq.id, faq.question, "Added FAQ")
}

export async function deleteFaq(actor: ActorRef, id: string) {
  await delay()
  const faq = find(faqs, id, "FAQ")
  faqs.splice(faqs.indexOf(faq), 1)
  audit(actor, "delete", "", faq.question, "Deleted FAQ")
}
