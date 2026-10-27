import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/ui/PrintButton"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getCreditNote } from "@/features/credit-notes/api"
import { CreditNoteDocument } from "@/features/credit-notes/components/CreditNoteDocument"

export const metadata: Metadata = { title: "Credit note" }

export default async function CreditNotePage({ params }: PageProps<"/credit-notes/[id]">) {
  const { id } = await params
  await requirePermission("creditNotes.view")
  const note = await getCreditNote(await requireToken(), id)
  if (!note) notFound()

  return (
    <Container className="max-w-4xl">
      <div className="print:hidden">
        <PageHeader
          title={`Credit note ${note.number}`}
          description="Print it or save it as PDF from the print dialog."
          actions={
            <>
              <Button variant="outline" asChild>
                <Link href="/credit-notes">All credit notes</Link>
              </Button>
              <PrintButton label="Print or save PDF" />
            </>
          }
        />
      </div>
      <CreditNoteDocument note={note} />
    </Container>
  )
}
