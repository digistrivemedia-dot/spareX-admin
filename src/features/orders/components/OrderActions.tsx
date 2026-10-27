"use client"

import { FileText } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ReasonDialog } from "@/components/ui/ReasonDialog"
import { advanceOrderAction, cancelOrderAction } from "@/features/orders/actions"
import { MarkPaidDialog } from "@/features/orders/components/MarkPaidDialog"
import { ShipOrderDialog } from "@/features/orders/components/ShipOrderDialog"
import type { Order } from "@/features/orders/types"
import { isCancellable, needsConfirmation, nextOrderStatus } from "@/features/orders/utils"
import { humanize } from "@/lib/format"

type OrderActionsProps = { order: Order; canManage: boolean; canConfirmPayment: boolean }

/** The next status, confirming an offline payment, cancelling before shipping, and the invoice. */
export function OrderActions({ order, canManage, canConfirmPayment }: OrderActionsProps) {
  const next = nextOrderStatus(order.status)

  return (
    <>
      {order.invoiceNumber && (
        <Button variant="ghost" asChild>
          <Link href={`/orders/${order.id}/invoice`}>
            <FileText aria-hidden />
            Invoice
          </Link>
        </Button>
      )}
      {canManage && isCancellable(order.status) && (
        <ReasonDialog
          trigger={<Button variant="outline">Cancel order</Button>}
          title={`Cancel ${order.number}?`}
          description={
            order.payment.status === "paid" && order.payment.gateway === "razorpay"
              ? "The customer is refunded in full to their original payment method."
              : "The customer is told, with your reason."
          }
          reasonLabel="Reason for cancelling"
          suggestions={["Out of stock", "Customer asked to cancel", "Address not serviceable"]}
          confirmLabel="Cancel order"
          destructive
          onConfirm={(reason) => cancelOrderAction(order.id, reason)}
          successMessage="Order cancelled"
        />
      )}
      {canConfirmPayment && needsConfirmation(order) && (
        <MarkPaidDialog
          orderId={order.id}
          orderNumber={order.number}
          method={order.payment.method}
          amount={order.total}
        />
      )}
      {canManage &&
        next &&
        (next === "shipped" ? (
          <ShipOrderDialog orderId={order.id} />
        ) : (
          <ConfirmDialog
            trigger={<Button>Mark {humanize(next).toLowerCase()}</Button>}
            title={`Mark ${order.number} ${humanize(next).toLowerCase()}?`}
            description="The customer sees the new status on their order."
            confirmLabel={`Mark ${humanize(next).toLowerCase()}`}
            onConfirm={() => advanceOrderAction(order.id, next)}
            successMessage={`Order ${humanize(next).toLowerCase()}`}
          />
        ))}
    </>
  )
}
