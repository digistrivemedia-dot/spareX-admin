import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getCouponScopeOptions } from "@/features/coupons/api"
import { CouponForm } from "@/features/coupons/components/CouponForm"

export const metadata: Metadata = { title: "Create coupon" }

export default async function NewCouponPage() {
  await requirePermission("coupons.manage")
  const options = await getCouponScopeOptions(await requireToken())

  return (
    <Container className="max-w-5xl">
      <PageHeader title="Create coupon" description="Customers type the code at checkout." />
      <CouponForm coupon={null} options={options} />
    </Container>
  )
}
