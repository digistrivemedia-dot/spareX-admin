/** CSV import and export without a library. Values are quoted only when they need to be (RFC 4180). */

export type CsvColumn<T> = {
  header: string
  value: (row: T) => string | number | boolean | null | undefined
}

export type CsvFile = { filename: string; content: string }

function escapeCell(value: string | number | boolean | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => escapeCell(column.header)).join(",")
  const lines = rows.map((row) => columns.map((column) => escapeCell(column.value(row))).join(","))
  return [header, ...lines].join("\r\n")
}

/** Parses CSV text into rows of cells. Handles quoted cells, escaped quotes and line breaks inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        cell += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      row.push(cell)
      cell = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else {
      cell += char
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((cells) => cells.some((value) => value.trim() !== ""))
}

/** Parses CSV text into objects keyed by the header row. */
export function parseCsvRecords(text: string): Record<string, string>[] {
  const [header, ...rows] = parseCsv(text.replace(/^﻿/, ""))
  if (!header) return []
  const keys = header.map((key) => key.trim())
  return rows.map((cells) =>
    Object.fromEntries(keys.map((key, i) => [key, cells[i]?.trim() ?? ""])),
  )
}

/** Starts a browser download. The BOM makes Excel open the file as UTF-8 (₹ and Indian names). */
export function downloadCsv({ filename, content }: CsvFile): void {
  const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
