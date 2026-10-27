"use client"

import { Download, Loader2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { downloadCsv, type CsvFile } from "@/lib/csv"
import type { ActionResult } from "@/lib/types"
import { useListQuery } from "@/lib/use-list-query"

export type ExportAction = (query: string) => Promise<ActionResult<CsvFile>>

/** Exports every row matching the filters in the URL (not just the current page). */
export function ExportCsvButton({ action }: { action: ExportAction }) {
  const { searchParams } = useListQuery()
  const [isPending, startTransition] = useTransition()

  function handleExport() {
    startTransition(async () => {
      const result = await action(searchParams.toString())
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      downloadCsv(result.data)
      toast.success(`Downloaded ${result.data.filename}`)
    })
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isPending}>
      {isPending ? <Loader2 aria-hidden className="animate-spin" /> : <Download aria-hidden />}
      Export CSV
    </Button>
  )
}
