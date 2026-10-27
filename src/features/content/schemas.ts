import { z } from "zod"

import type { BannerPlacement, Faq } from "@/features/content/types"
import { FAQ_CATEGORIES } from "@/features/content/utils"
import { wholeNumber } from "@/lib/validation"

const image = z.union([z.string(), z.instanceof(File), z.null()])
const date = z.iso.date("Pick a date.")

export const bannerSchema = z
  .object({
    title: z.string().trim().min(3, "Enter a title.").max(100, "Keep it under 100 characters."),
    placement: z.enum(
      [
        "b2c_hero",
        "b2c_dashboard_promo",
        "b2b_offers",
        "announcement_strip",
      ] satisfies BannerPlacement[],
      "Choose where it shows.",
    ),
    webImage: image,
    mobileImage: image,
    linkUrl: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || value.startsWith("/") || value.startsWith("https://"),
        "Use a site path such as /c/tyres, or a full https:// link.",
      ),
    startsOn: date,
    endsOn: z.union([z.literal(""), date]),
    sortOrder: wholeNumber("order", 99),
    active: z.boolean(),
  })
  .refine((banner) => !banner.endsOn || banner.endsOn >= banner.startsOn, {
    path: ["endsOn"],
    message: "The end date must be on or after the start date.",
  })

export const faqSchema = z.object({
  question: z.string().trim().min(5, "Enter the question.").max(200),
  answer: z.string().trim().min(5, "Enter the answer.").max(1000),
  category: z.enum(FAQ_CATEGORIES as [Faq["category"], ...Faq["category"][]], "Pick a category."),
  sortOrder: wholeNumber("order", 999),
  active: z.boolean(),
})

/** A page section's paragraphs are typed in one box, separated by a blank line. */
export const pageSchema = z.object({
  title: z.string().trim().min(3, "Enter a title.").max(100),
  published: z.boolean(),
  sections: z
    .array(
      z.object({
        id: z.string(),
        heading: z.string().trim().min(2, "Enter a heading.").max(120),
        body: z
          .string()
          .trim()
          .min(5, "Write at least one paragraph.")
          .transform((value) =>
            value
              .split(/\n\s*\n/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean),
          ),
      }),
    )
    .min(1, "Add at least one section."),
})

export type BannerValues = z.input<typeof bannerSchema>
export type BannerInput = Omit<
  z.output<typeof bannerSchema>,
  "webImage" | "mobileImage" | "startsOn" | "endsOn"
> & {
  webImageUrl: string | null
  mobileImageUrl: string | null
  startsAt: string
  endsAt: string | null
}
export type FaqValues = z.input<typeof faqSchema>
export type FaqInput = z.output<typeof faqSchema>
export type PageValues = z.input<typeof pageSchema>
export type PageInput = z.output<typeof pageSchema>
