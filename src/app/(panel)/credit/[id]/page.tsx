import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { FormAlert } from "@/components/ui/FormAlert"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { listAuditEntries } from "@/features/audit/api"
import { toActivityItems } from "@/features/audit/utils"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getCreditAccount } from "@/features/credit/api"
import { CreditActions } from "@/features/credit/components/CreditActions"
import { CreditLedger } from "@/features/credit/components/CreditLedger"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = { title: "Credit account" }

export default async function CreditAccountPage({ params }: PageProps<"/credit/[id]">) {
  const { id } = await params
  const session = await requirePermission("credit.view")
  const token = await requireToken()
  const [account, activity] = await Promise.all([
    getCreditAccount(token, id),
    listAuditEntries(token, {
      page: 1,
      pageSize: 20,
      sort: { field: "at", direction: "desc" },
      filters: { record: id },
    }),
  ])
  if (!account) notFound()

  return (
    <Container>
      <DetailLayout
        back={{ href: "/credit", label: "Credit accounts" }}
        title={account.businessName}
        status={<StatusBadge domain="credit" status={account.status} />}
        facts={[
          { label: "Limit", value: <Price paise={account.limit} /> },
          { label: "Used", value: <Price paise={account.outstanding} /> },
          {
            label: "Available",
            value: <Price paise={account.available} className="text-success-700" />,
          },
          {
            label: "Overdue",
            value:
              account.overdue > 0 ? (
                <Price paise={account.overdue} className="text-danger-700" />
              ) : (
                "Nothing"
              ),
          },
          { label: "Terms", value: `Net ${account.termsDays} days` },
        ]}
        actions={can(session, "credit.manage") && <CreditActions account={account} />}
        activity={<ActivityTimeline items={toActivityItems(activity.items)} />}
      >
        {account.status === "on_hold" && (
          <FormAlert tone="warning">On hold: {account.holdReason}</FormAlert>
        )}
        {account.status === "overdue" && (
          <FormAlert tone="error">
            {formatPrice(account.overdue)} is past its due date. New credit orders are still allowed
            until you put the account on hold (default for Q-11).
          </FormAlert>
        )}
        <p className="text-sm text-gray-500">
          Amounts include GST.{" "}
          <Link
            href={`/businesses/${account.businessId}`}
            className="text-navy-700 hover:underline"
          >
            Open the business
          </Link>
        </p>
        <CreditLedger rows={account.ledger} />
      </DetailLayout>
    </Container>
  )
}
