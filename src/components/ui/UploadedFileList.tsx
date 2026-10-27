"use client"

import { FileSpreadsheet, FileText, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import type { UploadItem, UploadKind } from "@/components/ui/Upload"
import { cn } from "@/lib/utils"

function sizeLabel(bytes: number): string {
  return bytes > 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`
}

type UploadedFileListProps = {
  items: UploadItem[]
  kind: UploadKind
  onRemove: (item: UploadItem) => void
}

/** Picked or saved files with a preview, a link to open them, and a remove button. */
export function UploadedFileList({ items, kind, onRemove }: UploadedFileListProps) {
  if (items.length === 0) return null
  return (
    <ul className={cn("grid gap-2", kind === "images" && "grid-cols-2 sm:grid-cols-4")}>
      {items.map((item) => (
        <li
          key={item.id}
          className="relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2"
        >
          {item.mimeType.startsWith("image/") ? (
            <Image
              src={item.url}
              alt={item.name}
              width={64}
              height={64}
              unoptimized
              className="size-16 shrink-0 rounded-md object-cover"
            />
          ) : kind === "csv" ? (
            <FileSpreadsheet aria-hidden className="size-8 shrink-0 text-success-600" />
          ) : (
            <FileText aria-hidden className="size-8 shrink-0 text-danger-600" />
          )}
          <div className="min-w-0 flex-1">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-sm text-navy-700 hover:underline"
            >
              {item.name}
            </a>
            {item.sizeBytes > 0 && (
              <p className="text-xs text-gray-500">{sizeLabel(item.sizeBytes)}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item.name}`}
          >
            <X aria-hidden />
          </Button>
        </li>
      ))}
    </ul>
  )
}
