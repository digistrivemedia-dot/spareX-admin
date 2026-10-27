import "server-only"

import type { CreditTermsInput, PaymentInput } from "@/features/businesses/schemas"
import type {
  CreditAccount,
  CreditAccountDetail,
  CreditAccountListItem,
} from "@/features/businesses/types"
import { ApiError } from "@/lib/api-client"
import { formatPrice, humanize } from "@/lib/format"
import type { ActorRef } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { businesses } from "@/mocks/businesses"
import { creditAccounts, refreshTotals } from "@/mocks/credit"
import { delay, listEndpoint, newId, omit } from "@/mocks/utils"

function listItem(account: CreditAccount): CreditAccountListItem {
  return { ...omit(account, "ledger"), available: Math.max(account.limit - account.outstanding, 0) }
}

/** Overdue and on-hold accounts sort first, so they are dealt with before anything else. */
const ATTENTION: Record<CreditAccount["status"], number> = {
  overdue: 0,
  on_hold: 1,
  active: 2,
  disabled: 3,
}

export const creditEndpoint = listEndpoint<CreditAccountListItem>(
  () => creditAccounts.map(listItem),
  {
    searchText: (row) => row.businessName,
    filters: { status: (row, value) => row.status === value },
    sortValues: {
      attention: (row) => ATTENTION[row.status],
      businessName: (row) => row.businessName,
      limit: (row) => row.limit,
      outstanding: (row) => row.outstanding,
      overdue: (row) => row.overdue,
    },
  },
)

export function creditAccountFor(businessId: string): CreditAccount | undefined {
  return creditAccounts.find((account) => account.businessId === businessId)
}

export async function getCreditAccount(id: string): Promise<CreditAccountDetail | null> {
  await delay()
  const account = creditAccounts.find((candidate) => candidate.id === id)
  if (!account) return null
  let balance = 0
  let credits = -account.ledger
    .filter((entry) => entry.amount < 0)
    .reduce((sum, entry) => sum + entry.amount, 0)
  const ledger = account.ledger.map((entry) => {
    balance += entry.amount
    if (entry.type !== "invoice") return { ...entry, balance, unpaid: null }
    const settled = Math.min(credits, entry.amount)
    credits -= settled
    return { ...entry, balance, unpaid: entry.amount - settled }
  })
  return { ...listItem(account), ledger: ledger.toReversed() }
}

function find(id: string): CreditAccount {
  const account = creditAccounts.find((candidate) => candidate.id === id)
  if (!account) throw new ApiError("Credit account not found.", 404)
  return account
}

function audit(
  actor: ActorRef,
  account: CreditAccount,
  summary: string,
  field: string,
  before: string,
  after: string,
) {
  recordAuditEntry(actor, {
    action: "update",
    entity: "credit",
    entityId: account.id,
    entityLabel: account.businessName,
    summary,
    changes: before === after ? [] : [{ field, before, after }],
  })
}

/** Turns credit on for a business, creating its account the first time. Credit is off by default. */
export async function enableCredit(
  actor: ActorRef,
  businessId: string,
  terms: CreditTermsInput,
): Promise<CreditAccount> {
  await delay()
  const business = businesses.find((candidate) => candidate.id === businessId)
  if (!business) throw new ApiError("Business not found.", 404)
  const existing = creditAccountFor(businessId)
  if (existing) {
    Object.assign(existing, {
      limit: terms.limit,
      termsDays: terms.termsDays,
      status: "active",
      holdReason: null,
    })
    refreshTotals(existing)
    audit(actor, existing, "Enabled credit", "Status", "Disabled", humanize(existing.status))
    return existing
  }
  const account: CreditAccount = {
    id: newId("cr"),
    businessId,
    businessName: business.name,
    status: "active",
    limit: terms.limit,
    termsDays: terms.termsDays,
    outstanding: 0,
    overdue: 0,
    holdReason: null,
    ledger: [],
    enabledAt: new Date().toISOString(),
  }
  creditAccounts.push(account)
  audit(
    actor,
    account,
    `Enabled credit: ${formatPrice(terms.limit)}, Net ${terms.termsDays}`,
    "Credit",
    "Off",
    "On",
  )
  return account
}

export async function updateCreditTerms(actor: ActorRef, id: string, terms: CreditTermsInput) {
  await delay()
  const account = find(id)
  const before = `${formatPrice(account.limit)}, Net ${account.termsDays}`
  Object.assign(account, terms)
  audit(
    actor,
    account,
    "Changed credit limit or terms",
    "Limit and terms",
    before,
    `${formatPrice(account.limit)}, Net ${account.termsDays}`,
  )
}

/** Hold stops new credit orders; disable turns credit off. Releasing goes back to active or overdue. */
export async function setCreditStatus(
  actor: ActorRef,
  id: string,
  next: "on_hold" | "disabled" | "active",
  reason: string | null,
) {
  await delay()
  const account = find(id)
  if (next === "disabled" && account.outstanding > 0) {
    throw new ApiError(
      `${account.businessName} still owes ${formatPrice(account.outstanding)}. Put the account on hold instead.`,
      409,
    )
  }
  const before = humanize(account.status)
  account.status = next
  account.holdReason = next === "on_hold" ? reason : null
  refreshTotals(account)
  const summary =
    next === "on_hold"
      ? `Put credit on hold: ${reason}`
      : next === "disabled"
        ? "Disabled credit"
        : "Released credit"
  audit(actor, account, summary, "Status", before, humanize(account.status))
}

export async function recordCreditPayment(actor: ActorRef, id: string, payment: PaymentInput) {
  await delay()
  const account = find(id)
  const before = account.outstanding
  account.ledger.push({
    id: newId("led"),
    type: "payment",
    at: new Date(`${payment.date}T12:00:00+05:30`).toISOString(),
    reference: payment.reference,
    orderId: null,
    amount: -payment.amount,
    dueOn: null,
    note: "Recorded by admin",
    by: actor,
  })
  account.ledger.sort((a, b) => a.at.localeCompare(b.at))
  refreshTotals(account)
  audit(
    actor,
    account,
    `Recorded payment of ${formatPrice(payment.amount)} (${payment.reference})`,
    "Outstanding",
    formatPrice(before),
    formatPrice(account.outstanding),
  )
}
