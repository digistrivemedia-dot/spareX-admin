import type { ActorRef, IsoDateTime, Paise } from "@/lib/types"

export type BusinessSettings = {
  legalName: string
  gstin: string
  registeredAddress: string
  /** e.g. "KG/{FY}/{SEQ}" → KG/26-27/0001. */
  invoiceNumberFormat: string
  creditNoteNumberFormat: string
}

export type DeliverySettings = {
  deliveryCharge: Paise
  freeDeliveryAbove: Paise
  serviceablePincodes: string[]
  /** Only takes effect while the `b2cCashOnDelivery` switch is on (Q-05). */
  codEnabled: boolean
  codLimit: Paise
  codFee: Paise
}

export type OrderSettings = {
  returnWindowDays: number
  nonReturnableCategoryIds: string[]
}

export type QuotationSettings = { validityDays: number }

export type ServiceSettings = {
  pickupWindows: string[]
  inspectionFee: Paise
  /** Behind the `bookingTimeSlots` switch (Q-20). */
  timeSlots: string[]
}

export type SecuritySettings = {
  otpExpiryMinutes: number
  otpMaxAttempts: number
  otpResendSeconds: number
}

export type PlatformSettings = {
  business: BusinessSettings
  delivery: DeliverySettings
  orders: OrderSettings
  quotations: QuotationSettings
  service: ServiceSettings
  security: SecuritySettings
  updatedAt: IsoDateTime
  updatedBy: ActorRef
}

export type SettingsSection = Exclude<keyof PlatformSettings, "updatedAt" | "updatedBy">

export type IntegrationId = "razorpay" | "sms"

/** Keys are never sent back in full: only the last characters, masked. */
export type Integration = {
  id: IntegrationId
  name: string
  provider: string
  description: string
  mode: "test" | "live"
  keyIdMasked: string
  secretMasked: string
  status: "connected" | "error" | "not_configured"
  lastCheckedAt: IsoDateTime | null
  lastCheckMessage: string
}
