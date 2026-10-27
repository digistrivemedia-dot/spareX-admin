"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react"

type ListQueryContextValue = { isPending: boolean; startTransition: TransitionStartFunction }

const ListQueryContext = createContext<ListQueryContextValue | null>(null)

/** Shares one pending state between a list's filters, table and pagination, so the whole list dims while loading. */
export function ListQueryProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition()
  return <ListQueryContext value={{ isPending, startTransition }}>{children}</ListQueryContext>
}

/** Reads and updates list state (search, filters, sort, page) in the URL, which is its source of truth. */
export function useListQuery() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const shared = useContext(ListQueryContext)
  const [localPending, startLocalTransition] = useTransition()
  const startTransition = shared?.startTransition ?? startLocalTransition

  /** `null` removes a key. Any change except paging sends the list back to page 1. */
  function setParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key)
      else next.set(key, value)
    }
    if (!("page" in updates)) next.delete("page")
    const query = next.toString()
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    )
  }

  return { searchParams, setParams, isPending: shared?.isPending ?? localPending }
}
