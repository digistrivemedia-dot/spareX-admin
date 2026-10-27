import type { Booking } from "@/features/bookings/types"
import type { Enquiry } from "@/features/enquiries/types"
import type { Order } from "@/features/orders/types"
import type { ReturnRequest } from "@/features/returns/types"
import type { VehicleListItem } from "@/features/vehicles/types"
import type { Address, IsoDateTime, Paise } from "@/lib/types"

/**
 * `deletion_requested`: the customer asked for their account to be deleted (DPDP). `deleted`: admin processed it;
 * personal details are erased and only tax records (orders, invoices) remain.
 */
export type CustomerStatus = "active" | "inactive" | "deletion_requested" | "deleted"

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  status: CustomerStatus
  addresses: Address[]
  createdAt: IsoDateTime
  lastActiveAt: IsoDateTime
  deletionRequestedAt: IsoDateTime | null
  /** Why admin deactivated the account; null while active. */
  deactivationReason: string | null
}

export type CustomerListItem = Customer & {
  city: string
  vehicleCount: number
  orderCount: number
  /** Non-cancelled orders, incl. GST, less refunds. */
  totalSpend: Paise
}

export type CustomerDetail = CustomerListItem & {
  vehicles: VehicleListItem[]
  orders: Pick<Order, "id" | "number" | "placedAt" | "status" | "total">[]
  returns: Pick<ReturnRequest, "id" | "number" | "kind" | "status" | "requestedAt">[]
  bookings: Pick<Booking, "id" | "number" | "date" | "garageName" | "status">[]
  enquiries: Pick<Enquiry, "id" | "number" | "kind" | "status" | "createdAt">[]
}
