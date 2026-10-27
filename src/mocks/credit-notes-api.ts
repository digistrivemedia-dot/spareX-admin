import "server-only"

import type { CreditNote } from "@/features/credit-notes/types"
import { creditNotes } from "@/mocks/returns"
import { delay, listEndpoint } from "@/mocks/utils"

export const creditNoteEndpoint = listEndpoint<CreditNote>(() => creditNotes, {
  searchText: (row) =>
    `${row.number} ${row.orderNumber} ${row.returnNumber ?? ""} ${row.customer.name}`,
  date: (row) => row.issuedAt,
  filters: {
    channel: (row, value) => row.channel === value,
    appliedTo: (row, value) => row.appliedTo === value,
  },
  sortValues: { issuedAt: (row) => row.issuedAt, amount: (row) => row.amount },
})

export async function getCreditNote(id: string): Promise<CreditNote | null> {
  await delay()
  return creditNotes.find((candidate) => candidate.id === id) ?? null
}
