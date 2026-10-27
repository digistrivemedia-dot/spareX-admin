import "server-only"

import { delay } from "@/mocks/utils"

/** Demo uploads are kept in memory as data URLs; the real API stores the file and returns its URL. */
export async function uploadFile(file: File): Promise<string> {
  await delay()
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")
  return `data:${file.type};base64,${base64}`
}
