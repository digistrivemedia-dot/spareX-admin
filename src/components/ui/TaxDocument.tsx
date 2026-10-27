import type { ReactNode } from "react"

import { Logo } from "@/components/layout/Logo"
import { SELLER } from "@/lib/constants"

type TaxDocumentProps = {
  /** e.g. "Tax invoice", "Credit note". */
  title: string
  /** Number, order, date: one short line each. */
  meta: string[]
  children: ReactNode
}

/** A printable GST document (invoice, credit note) with Kannali's details as the seller. */
export function TaxDocument({ title, meta, children }: TaxDocumentProps) {
  return (
    <article className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 sm:p-8 print:border-0 print:p-0">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="font-semibold text-gray-900">{SELLER.legalName}</p>
          <p>{SELLER.address}</p>
          <p>GSTIN {SELLER.gstin}</p>
        </div>
        <div className="flex flex-col gap-1 sm:text-right">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {meta.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </header>
      {children}
      <p className="text-xs text-gray-500">
        Computer-generated document. Seller details are placeholders for the demo.
      </p>
    </article>
  )
}
