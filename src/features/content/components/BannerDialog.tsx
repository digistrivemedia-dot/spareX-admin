"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import { FormDialog } from "@/components/ui/FormDialog"
import { ImageField } from "@/components/ui/ImageField"
import { SelectField } from "@/components/ui/SelectField"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextField } from "@/components/ui/TextField"
import { saveBannerAction } from "@/features/content/actions"
import { bannerSchema, type BannerValues } from "@/features/content/schemas"
import type { Banner } from "@/features/content/types"
import { PLACEMENT_OPTIONS } from "@/features/content/utils"
import { istDate } from "@/lib/dates"

export function BannerDialog({ banner, trigger }: { banner?: Banner; trigger: ReactNode }) {
  const values: BannerValues = {
    title: banner?.title ?? "",
    placement: banner?.placement ?? "b2c_hero",
    webImage: banner?.webImageUrl ?? null,
    mobileImage: banner?.mobileImageUrl ?? null,
    linkUrl: banner?.linkUrl ?? "",
    startsOn: banner ? istDate(banner.startsAt) : istDate(new Date().toISOString()),
    endsOn: banner?.endsAt ? istDate(banner.endsAt) : "",
    sortOrder: String(banner?.sortOrder ?? 1),
    active: banner?.active ?? true,
  }
  const form = useForm({ resolver: zodResolver(bannerSchema), values })

  return (
    <FormDialog
      trigger={trigger}
      title={banner ? "Edit banner" : "Add banner"}
      form={form}
      action={(data) => saveBannerAction(banner?.id ?? null, data)}
      successMessage={banner ? "Banner saved" : "Banner added"}
      submitLabel={banner ? "Save" : "Add banner"}
    >
      <TextField control={form.control} name="title" label="Title" />
      <SelectField
        control={form.control}
        name="placement"
        label="Placement"
        options={PLACEMENT_OPTIONS}
      />
      <ImageField control={form.control} name="webImage" label="Web image (1600 × 500)" />
      <ImageField control={form.control} name="mobileImage" label="Mobile image (800 × 600)" />
      <TextField
        control={form.control}
        name="linkUrl"
        label="Link (optional)"
        placeholder="/c/tyres"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField control={form.control} name="startsOn" label="Starts on" type="date" />
        <TextField control={form.control} name="endsOn" label="Ends on (optional)" type="date" />
      </div>
      <TextField
        control={form.control}
        name="sortOrder"
        label="Order in its placement"
        inputMode="numeric"
      />
      <SwitchField
        control={form.control}
        name="active"
        label="Active"
        description="Shows between its dates while active."
      />
    </FormDialog>
  )
}
