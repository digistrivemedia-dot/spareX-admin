"use client"

import { useWatch } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { MultiImageField } from "@/components/ui/MultiImageField"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import type { ProductControl } from "@/features/catalog/schemas"
import { isEnabled } from "@/lib/features"

/** Photos, search snippet and whether the product is on sale. */
export function ProductListingSection({ control }: { control: ProductControl }) {
  const installation = useWatch({ control, name: "installationAvailable" })

  return (
    <FormSection title="Listing" columns="one">
      <MultiImageField control={control} name="images" label="Product photos" />
      <TextField
        control={control}
        name="seoTitle"
        label="Search title"
        description="Up to 70 characters."
      />
      <TextareaField
        control={control}
        name="seoDescription"
        label="Search description"
        description="Up to 160 characters."
      />
      <SwitchField
        control={control}
        name="active"
        label="Active"
        description="Inactive products are hidden on B2C and B2B."
      />
      {isEnabled("productInstallation") && (
        <>
          <SwitchField
            control={control}
            name="installationAvailable"
            label="Installation available"
            description="Customers can add fitting by a garage at checkout."
          />
          {installation && (
            <TextField
              control={control}
              name="installationCharge"
              label="Installation charge (₹, incl. GST)"
              inputMode="decimal"
            />
          )}
        </>
      )}
    </FormSection>
  )
}
