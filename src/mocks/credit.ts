import "server-only"

import type { CreditAccount, CreditLedgerEntry } from "@/features/businesses/types"
import type { ActorRef, Paise } from "@/lib/types"
import { businesses } from "@/mocks/businesses"
import { orders } from "@/mocks/orders"
import { creditNotes } from "@/mocks/returns"
import { dateOnly, daysAgo, persistent } from "@/mocks/utils"

const ADMIN: ActorRef = { type: "admin", id: "adm_priya", name: "Priya Nair" }

/** [business id, limit ₹, terms days, earlier settled invoice ₹, hold reason] */
const ACCOUNTS: [string, number, number, number, string | null][] = [
  ["bus_001", 300_000, 30, 84_500, null],
  ["bus_002", 500_000, 30, 142_000, null],
  [
    "bus_003",
    200_000,
    30,
    61_200,
    "Cheque for the September invoice bounced. Credit paused until cleared.",
  ],
  ["bus_004", 400_000, 45, 118_750, null],
  ["bus_005", 250_000, 30, 52_300, null],
]

function addDays(iso: string, days: number): string {
  const date = new Date(iso)
  date.setDate(date.getDate() + days)
  return dateOnly(date.toISOString())
}

/** Applies payments and credit notes to the oldest invoices first; what is left past its due date is overdue. */
function overdueAmount(ledger: CreditLedgerEntry[]): Paise {
  let credits = -ledger
    .filter((entry) => entry.amount < 0)
    .reduce((sum, entry) => sum + entry.amount, 0)
  const today = dateOnly(new Date().toISOString())
  return ledger
    .filter((entry) => entry.type === "invoice")
    .sort((a, b) => a.at.localeCompare(b.at))
    .reduce((overdue, invoice) => {
      const settled = Math.min(credits, invoice.amount)
      credits -= settled
      const unpaid = invoice.amount - settled
      return invoice.dueOn && invoice.dueOn < today ? overdue + unpaid : overdue
    }, 0)
}

export const creditAccounts = persistent<CreditAccount[]>("credit-accounts", () =>
  ACCOUNTS.map(([businessId, limit, termsDays, earlierInvoice, holdReason], index) => {
    const business = businesses.find((candidate) => candidate.id === businessId)
    if (!business) throw new Error(`Unknown demo business ${businessId}`)
    const earlierAt = daysAgo(70 - index * 3, 12)
    const ledger: CreditLedgerEntry[] = [
      {
        id: `${businessId}_l0`,
        type: "invoice",
        at: earlierAt,
        reference: `KG/26-27/00${80 + index}`,
        orderId: null,
        amount: earlierInvoice * 100,
        dueOn: addDays(earlierAt, termsDays),
        note: null,
        by: ADMIN,
      },
      {
        id: `${businessId}_l1`,
        type: "payment",
        at: daysAgo(40 - index * 2, 15),
        reference: `UTR HDFC0${4410 + index}77${index}`,
        orderId: null,
        amount: -earlierInvoice * 100,
        dueOn: null,
        note: "NEFT received",
        by: ADMIN,
      },
    ]
    for (const order of orders) {
      if (
        order.customer.id !== businessId ||
        order.payment.method !== "credit" ||
        !order.invoiceNumber
      )
        continue
      const invoicedAt =
        order.timeline.find((event) => event.status === "confirmed")?.at ?? order.placedAt
      ledger.push({
        id: `${businessId}_${order.id}`,
        type: "invoice",
        at: invoicedAt,
        reference: order.invoiceNumber,
        orderId: order.id,
        amount: order.total,
        dueOn: addDays(invoicedAt, termsDays),
        note: null,
        by: ADMIN,
      })
    }
    for (const note of creditNotes) {
      if (note.customer.id !== businessId || note.appliedTo !== "credit_ledger") continue
      ledger.push({
        id: `${businessId}_${note.id}`,
        type: "credit_note",
        at: note.issuedAt,
        reference: note.number,
        orderId: note.orderId,
        amount: -note.amount,
        dueOn: null,
        note: note.reason,
        by: note.issuedBy,
      })
    }
    ledger.sort((a, b) => a.at.localeCompare(b.at))

    const outstanding = ledger.reduce((sum, entry) => sum + entry.amount, 0)
    const overdue = overdueAmount(ledger)
    return {
      id: `cr_${businessId.slice(4)}`,
      businessId,
      businessName: business.name,
      status: holdReason ? "on_hold" : overdue > 0 ? "overdue" : "active",
      limit: limit * 100,
      termsDays,
      outstanding,
      overdue,
      holdReason,
      ledger,
      enabledAt: daysAgo(150 - index * 10),
    }
  }),
)

/**
 * Recomputes what the business owes after a ledger change, as the backend does. An account on hold or disabled
 * keeps that status; otherwise it is overdue while any invoice is past due.
 */
export function refreshTotals(account: CreditAccount): void {
  account.outstanding = account.ledger.reduce((sum, entry) => sum + entry.amount, 0)
  account.overdue = overdueAmount(account.ledger)
  if (account.status === "active" || account.status === "overdue") {
    account.status = account.overdue > 0 ? "overdue" : "active"
  }
}
