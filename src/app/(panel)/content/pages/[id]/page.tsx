import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getPage } from "@/features/content/api"
import { PageEditor } from "@/features/content/components/PageEditor"
import { formatDateTime } from "@/lib/format"

export const metadata: Metadata = { title: "Edit page" }

export default async function ContentPageEditPage({ params }: PageProps<"/content/pages/[id]">) {
  const { id } = await params
  const session = await requirePermission("content.view")
  const page = await getPage(await requireToken(), id)
  if (!page) notFound()

  return (
    <Container className="max-w-4xl">
      <PageHeader
        title={page.title}
        description={`/${page.slug} · last edited by ${page.updatedBy.name}, ${formatDateTime(page.updatedAt)}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/content/pages">All pages</Link>
          </Button>
        }
      />
      {can(session, "content.manage") ? (
        <PageEditor page={page} />
      ) : (
        <article className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6">
          {page.sections.map((section) => (
            <section key={section.id} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm text-gray-700">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      )}
    </Container>
  )
}
