import { CheckCircle2 } from "lucide-react"
import type { ReactNode } from "react"

import { Logo } from "@/components/layout/Logo"

const HIGHLIGHTS = [
  "Catalogue, fitment, prices and stock",
  "Orders, returns, payments and credit",
  "Garages, bookings and B2B verification",
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-navy-900 p-12 text-navy-200 lg:flex">
        <Logo tone="light" />
        <div className="flex max-w-md flex-col gap-6">
          <h2 className="text-3xl font-semibold text-white">
            Run the whole SpareX platform from one place.
          </h2>
          <ul className="flex flex-col gap-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <CheckCircle2 aria-hidden className="size-5 text-orange-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs">For Kannali Garage staff only. Activity is recorded.</p>
      </section>
      <main className="flex flex-col items-center justify-center gap-8 px-4 py-10 sm:px-6">
        <Logo className="lg:hidden" />
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
