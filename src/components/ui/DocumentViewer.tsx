"use client"

import { ExternalLink, FileText } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Attachment } from "@/lib/types"

type DocumentViewerProps = {
  documents: (Attachment & { label: string })[]
}

/** A list of uploaded documents; each opens beside the page so the reviewer can compare it with the details. */
export function DocumentViewer({ documents }: DocumentViewerProps) {
  if (documents.length === 0) return <p className="text-sm text-gray-500">No documents uploaded.</p>

  return (
    <ul className="divide-y divide-gray-200">
      {documents.map((document) => (
        <li key={document.id} className="flex items-center gap-3 py-3">
          <FileText aria-hidden className="size-5 shrink-0 text-danger-600" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900">{document.label}</p>
            <p className="truncate text-xs text-gray-500">{document.name}</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                View
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full gap-0 sm:max-w-2xl">
              <SheetHeader className="border-b border-gray-200">
                <SheetTitle>{document.label}</SheetTitle>
                <SheetDescription>
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-navy-700 hover:underline"
                  >
                    Open in a new tab
                    <ExternalLink aria-hidden className="size-3.5" />
                  </a>
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 bg-gray-100 p-2">
                {document.mimeType === "application/pdf" ? (
                  <iframe
                    src={document.url}
                    title={document.label}
                    className="size-full rounded-lg bg-white"
                  />
                ) : (
                  <Image
                    src={document.url}
                    alt={document.label}
                    width={800}
                    height={1000}
                    unoptimized
                    className="mx-auto h-auto max-w-full"
                  />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </li>
      ))}
    </ul>
  )
}
