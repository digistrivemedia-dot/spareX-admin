import { Info } from "lucide-react"

import type { DemoAccount } from "@/features/auth/types"

/** Only rendered in demo mode, so the client can try each role. */
export function DemoAccounts({ accounts }: { accounts: DemoAccount[] }) {
  if (accounts.length === 0) return null
  return (
    <aside
      aria-label="Demo accounts"
      className="rounded-lg border border-info-700/20 bg-info-50 p-3 text-sm text-info-700"
    >
      <p className="flex items-center gap-1.5 font-medium">
        <Info aria-hidden className="size-4" />
        Demo accounts
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {accounts.map((account) => (
          <li key={account.email} className="break-all">
            <span className="font-medium">{account.roleName}:</span> {account.email} /{" "}
            {account.password}
          </li>
        ))}
      </ul>
    </aside>
  )
}
