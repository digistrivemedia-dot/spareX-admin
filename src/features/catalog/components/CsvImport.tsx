"use client"

import { Download, Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FormAlert } from "@/components/ui/FormAlert"
import { Upload, type UploadItem } from "@/components/ui/Upload"
import { commitImportAction, previewImportAction } from "@/features/catalog/actions"
import { ImportPreviewTable } from "@/features/catalog/components/ImportPreviewTable"
import type { ImportKind, ImportPreview } from "@/features/catalog/types"
import { IMPORT_TEMPLATES } from "@/features/catalog/utils"
import { downloadCsv, toCsv } from "@/lib/csv"
import { formatNumber } from "@/lib/format"

/** Template → upload → preview with per-row errors → import the valid rows. */
export function CsvImport({ kind }: { kind: ImportKind }) {
  const [files, setFiles] = useState<UploadItem[]>([])
  const [csv, setCsv] = useState("")
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const template = IMPORT_TEMPLATES[kind]

  function downloadTemplate() {
    const columns = template.columns.map((column, i) => ({
      header: column,
      value: (row: readonly string[]) => row[i],
    }))
    downloadCsv({ filename: `${kind}-template.csv`, content: toCsv([template.example], columns) })
  }

  function pick(items: UploadItem[]) {
    setFiles(items)
    setPreview(null)
    setError(null)
    const file = items[0]?.file
    if (!file) return
    startTransition(async () => {
      const text = await file.text()
      setCsv(text)
      const result = await previewImportAction(kind, text)
      if (result.ok) setPreview(result.data)
      else setError(result.error)
    })
  }

  function confirm() {
    startTransition(async () => {
      const result = await commitImportAction(kind, csv)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(
        `Imported ${formatNumber(result.data.imported)} rows${result.data.skipped ? `, skipped ${result.data.skipped}` : ""}`,
      )
      pick([])
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Columns:{" "}
          <span className="text-xs break-all text-gray-900">{template.columns.join(", ")}</span>
        </p>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download aria-hidden />
          Download template
        </Button>
      </div>
      <Upload label="Upload a CSV file" kind="csv" value={files} onChange={pick} />
      {isPending && !preview && (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Checking every row…
        </p>
      )}
      {error && <FormAlert tone="error">{error}</FormAlert>}
      {preview && (
        <>
          <FormAlert tone={preview.errorCount ? "error" : "success"}>
            {formatNumber(preview.validCount)} rows ready to import
            {preview.errorCount
              ? `, ${formatNumber(preview.errorCount)} with errors will be skipped. Fix them in the file and upload again to include them.`
              : "."}
          </FormAlert>
          <ImportPreviewTable rows={preview.rows} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => pick([])} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={isPending || preview.validCount === 0}>
              {isPending && <Loader2 aria-hidden className="animate-spin" />}
              Import {formatNumber(preview.validCount)} rows
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
