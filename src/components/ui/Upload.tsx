"use client"

import { UploadCloud } from "lucide-react"
import { useId, type ChangeEvent, type DragEvent } from "react"
import { toast } from "sonner"

import { UploadedFileList } from "@/components/ui/UploadedFileList"

export type UploadItem = {
  id: string
  name: string
  sizeBytes: number
  mimeType: string
  /** An object URL for a new file, or the stored URL for one already saved. */
  url: string
  /** Present for files picked in this session, until they are uploaded. */
  file?: File
}

const KINDS = {
  images: {
    accept: "image/jpeg,image/png",
    types: ["image/jpeg", "image/png"],
    hint: "JPG or PNG",
    maxMb: 5,
  },
  documents: {
    accept: "application/pdf,image/jpeg,image/png",
    types: ["application/pdf", "image/jpeg", "image/png"],
    hint: "PDF, JPG or PNG",
    maxMb: 10,
  },
  csv: {
    accept: ".csv,text/csv",
    types: ["text/csv", "application/vnd.ms-excel", ""],
    hint: "CSV",
    maxMb: 5,
  },
} as const

export type UploadKind = keyof typeof KINDS

type UploadProps = {
  label: string
  kind: UploadKind
  value: UploadItem[]
  onChange: (items: UploadItem[]) => void
  multiple?: boolean
}

/** Pick or drop files, preview them and remove them before saving. */
export function Upload({ label, kind, value, onChange, multiple = false }: UploadProps) {
  const inputId = useId()
  const config = KINDS[kind]

  function addFiles(files: FileList | null) {
    const accepted = Array.from(files ?? []).filter((file) => {
      const ok =
        (config.types as readonly string[]).includes(file.type) &&
        file.size <= config.maxMb * 1_000_000
      if (!ok) toast.error(`${file.name} must be ${config.hint}, up to ${config.maxMb} MB.`)
      return ok
    })
    const items = accepted.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
      url: URL.createObjectURL(file),
      file,
    }))
    onChange(multiple ? [...value, ...items] : items.slice(0, 1))
  }

  function remove(item: UploadItem) {
    if (item.file) URL.revokeObjectURL(item.url)
    onChange(value.filter((candidate) => candidate.id !== item.id))
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    addFiles(event.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={inputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition-colors hover:border-navy-600 hover:bg-navy-50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
      >
        <UploadCloud aria-hidden className="size-6 text-navy-600" />
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-xs text-gray-500">
          Drop {multiple ? "files" : "a file"} here or click to browse. {config.hint}, up to{" "}
          {config.maxMb} MB.
        </span>
        <input
          id={inputId}
          type="file"
          accept={config.accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            addFiles(event.target.files)
            event.target.value = ""
          }}
        />
      </label>

      <UploadedFileList items={value} kind={kind} onRemove={remove} />
    </div>
  )
}
