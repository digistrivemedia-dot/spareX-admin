import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { DetailList } from "@/components/ui/DetailList"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getCoupon, getCouponScopeOptions } from "@/features/coupons/api"
import { CouponForm } from "@/features/coupons/components/CouponForm"
import { couponState, describeDiscount, SCOPE_LABELS } from "@/features/coupons/utils"
import { formatDate, formatNumber, formatPrice } from "@/lib/format"

export const metadata: Metadata = { title: "Coupon" }

export default async function CouponPage({ params }: PageProps<"/coupons/[id]">) {
  const { id } = await params
  const session = await requirePermission("coupons.view")
  const token = await requireToken()
  const coupon = await getCoupon(token, id)
  if (!coupon) notFound()
  const canManage = can(session, "coupons.manage")

  return (
    <Container className="max-w-5xl">
      <PageHeader
        title={coupon.code}
        description={`Used ${formatNumber(coupon.usedCount)} time${coupon.usedCount === 1 ? "" : "s"}${coupon.usageLimit === null ? "" : ` of ${formatNumber(coupon.usageLimit)}`}.`}
        actions={<StatusBadge domain="coupon" status={couponState(coupon)} />}
      />
      {canManage ? (
        <CouponForm coupon={coupon} options={await getCouponScopeOptions(token)} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <DetailList
            items={[
              { label: "Description", value: coupon.description },
              { label: "Discount", value: describeDiscount(coupon) },
              { label: "Applies to", value: SCOPE_LABELS[coupon.scope] },
              { label: "Minimum order", value: formatPrice(coupon.minOrderValue) },
              {
                label: "Validity",
                value: `${formatDate(coupon.startsAt)} – ${coupon.endsAt ? formatDate(coupon.endsAt) : "no end date"}`,
              },
              { label: "Uses per customer", value: String(coupon.perCustomerLimit) },
            ]}
          />
        </div>
      )}
    </Container>
  )
}
