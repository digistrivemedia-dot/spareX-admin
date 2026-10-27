import {
  CheckCircle2,
  FileCheck2,
  IndianRupee,
  MessageSquareWarning,
  Undo2,
  Wallet,
} from "lucide-react"

import { StatCard } from "@/components/ui/StatCard"
import { can, type Permission } from "@/features/auth/permissions"
import type { Session } from "@/features/auth/types"
import type { AttentionCounts } from "@/features/dashboard/types"
import { formatNumber, formatPrice } from "@/lib/format"

/** Work waiting for an admin, first on the page. Each tile opens the list filtered to that work. */
export function NeedsAttention({
  attention,
  session,
}: {
  attention: AttentionCounts
  session: Session
}) {
  const tiles: {
    label: string
    count: number
    hint: string
    href: string
    icon: typeof Undo2
    permission: Permission
  }[] = [
    {
      label: "Applications waiting",
      count: attention.applicationsWaiting,
      hint: "B2B businesses to verify",
      href: "/applications?status=waiting",
      icon: FileCheck2,
      permission: "businesses.view",
    },
    {
      label: "Returns to approve",
      count: attention.returnsToApprove,
      hint: "Requested by customers",
      href: "/returns?status=requested",
      icon: Undo2,
      permission: "returns.view",
    },
    {
      label: "Payments to confirm",
      count: attention.paymentsToConfirm,
      hint: "Bank transfer, cash and COD",
      href: "/payments?status=to_confirm",
      icon: IndianRupee,
      permission: "payments.view",
    },
    {
      label: "Overdue credit",
      count: attention.overdueCreditAccounts,
      hint:
        attention.overdueCreditAmount > 0
          ? `${formatPrice(attention.overdueCreditAmount)} overdue`
          : "No overdue invoices",
      href: "/credit?status=overdue",
      icon: Wallet,
      permission: "credit.view",
    },
    {
      label: "New enquiries",
      count: attention.newEnquiries,
      hint: "Vehicle or part not found",
      href: "/enquiries?status=new",
      icon: MessageSquareWarning,
      permission: "enquiries.view",
    },
  ]
  const visible = tiles.filter((tile) => can(session, tile.permission))

  return (
    <section aria-labelledby="attention-heading" className="flex flex-col gap-3">
      <h2 id="attention-heading" className="text-lg font-semibold text-gray-900">
        Needs attention
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {visible.map((tile) => (
          <StatCard
            key={tile.label}
            label={tile.label}
            value={formatNumber(tile.count)}
            hint={tile.count === 0 ? "All clear" : tile.hint}
            icon={tile.count === 0 ? CheckCircle2 : tile.icon}
            href={tile.href}
            tone={tile.count > 0 ? "attention" : "default"}
          />
        ))}
      </div>
    </section>
  )
}
