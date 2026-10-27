"use client"

import { ShieldCheck, ShieldOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { setTwoStepAction } from "@/features/auth/account-actions"
import { formatPhone } from "@/lib/format"
import { cn } from "@/lib/utils"

type TwoStepSettingProps = {
  enabled: boolean
  /** Super Admins cannot turn it off. */
  required: boolean
  roleName: string
  phone: string
}

export function TwoStepSetting({ enabled, required, roleName, phone }: TwoStepSettingProps) {
  const Icon = enabled ? ShieldCheck : ShieldOff

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:p-6">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          enabled ? "bg-success-50 text-success-700" : "bg-warning-50 text-warning-700",
        )}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold text-gray-900">
          2-step verification is {enabled ? "on" : "off"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {required
            ? `Mandatory for ${roleName}. A code is sent to ${formatPhone(phone)} each time you sign in.`
            : enabled
              ? `A code is sent to ${formatPhone(phone)} each time you sign in.`
              : "Add a code sent to your mobile at sign-in, so a stolen password alone can't open your account."}
        </p>
      </div>
      {!required &&
        (enabled ? (
          <ConfirmDialog
            trigger={<Button variant="outline">Turn off</Button>}
            title="Turn off 2-step verification?"
            description="You'll sign in with only your password. Anyone who learns it could open your account."
            confirmLabel="Turn off"
            destructive
            onConfirm={() => setTwoStepAction(false)}
            successMessage="2-step verification turned off"
          />
        ) : (
          <ConfirmDialog
            trigger={<Button>Turn on</Button>}
            title="Turn on 2-step verification?"
            description={`From your next sign-in, we'll send a 6-digit code to ${formatPhone(phone)}.`}
            confirmLabel="Turn on"
            onConfirm={() => setTwoStepAction(true)}
            successMessage="2-step verification turned on"
          />
        ))}
    </section>
  )
}
