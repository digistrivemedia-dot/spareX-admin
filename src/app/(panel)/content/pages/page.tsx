import { Plus } from "lucide-react"
import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { TabNav } from "@/components/layout/TabNav"
import { Button } from "@/components/ui/button"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { faqsApi, pagesApi } from "@/features/content/api"
import { FaqDialog } from "@/features/content/components/FaqDialog"
import { FaqsTable } from "@/features/content/components/FaqsTable"
import { PagesTable } from "@/features/content/components/PagesTable"
import { FAQ_FILTERS, PAGE_FILTERS } from "@/features/content/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Pages and FAQ" }

const TABS = [
  { id: "pages", label: "Policy and help pages" },
  { id: "faq", label: "FAQ" },
]

export default async function ContentPagesPage({ searchParams }: PageProps<"/content/pages">) {
  const query = await searchParams
  const session = await requirePermission("content.view")
  const token = await requireToken()
  const canManage = can(session, "content.manage")
  const canExport = can(session, "data.export")
  const isFaq = query.tab === "faq"

  const faqs = isFaq
    ? await faqsApi.list(
        token,
        parseListParams(query, {
          filterKeys: FAQ_FILTERS,
          defaultSort: { field: "sortOrder", direction: "asc" },
        }),
      )
    : null
  const pages = isFaq
    ? null
    : await pagesApi.list(
        token,
        parseListParams(query, {
          filterKeys: PAGE_FILTERS,
          defaultSort: { field: "title", direction: "asc" },
        }),
      )

  return (
    <Container>
      <PageHeader
        title="Pages and FAQ"
        description="Policy and help pages are edited as sections; the FAQ as question and answer pairs."
        actions={
          canManage &&
          faqs && (
            <FaqDialog
              nextOrder={faqs.total + 1}
              trigger={
                <Button>
                  <Plus aria-hidden />
                  Add FAQ
                </Button>
              }
            />
          )
        }
      />
      <TabNav
        tabs={TABS}
        activeTab={isFaq ? "faq" : "pages"}
        basePath="/content/pages"
        label="Content type"
      />
      {faqs && <FaqsTable data={faqs} canManage={canManage} canExport={canExport} />}
      {pages && <PagesTable data={pages} canExport={canExport} />}
    </Container>
  )
}
