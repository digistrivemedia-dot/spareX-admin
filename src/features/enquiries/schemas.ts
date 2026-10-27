import { z } from "zod"

const text = (label: string) =>
  z.string().trim().min(3, `Write the ${label}.`).max(1000, "Keep it under 1,000 characters.")

export const noteSchema = z.object({ text: text("note") })

export const replySchema = z.object({ text: text("reply"), resolve: z.boolean() })

export const enquiryStatusSchema = z.enum(["new", "in_progress", "resolved", "closed"])

export type NoteValues = z.input<typeof noteSchema>
export type ReplyValues = z.input<typeof replySchema>
