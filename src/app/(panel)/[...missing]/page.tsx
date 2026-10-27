import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = { title: "Page not found" }

/** Sends any address the panel doesn't know to the in-shell 404. */
export default function MissingPage() {
  notFound()
}
