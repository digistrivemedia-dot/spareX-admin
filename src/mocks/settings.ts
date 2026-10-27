import "server-only"

import type { Integration, PlatformSettings } from "@/features/settings/types"
import {
  DEFAULT_QUOTATION_VALIDITY_DAYS,
  PICKUP_WINDOWS,
  RETURN_WINDOW_DAYS,
  SELLER,
} from "@/lib/constants"
import { daysAgo, persistent } from "@/mocks/utils"

/** Seeded from the defaults in `lib/constants.ts`, which hold the open questions' answers (Q-05, Q-12–Q-15). */
export const platformSettings = persistent<PlatformSettings>("settings", () => ({
  business: {
    legalName: SELLER.legalName,
    gstin: SELLER.gstin,
    registeredAddress: SELLER.address,
    invoiceNumberFormat: "KG/{FY}/{SEQ}",
    creditNoteNumberFormat: "CN/{FY}/{SEQ}",
  },
  delivery: {
    deliveryCharge: 4_900,
    freeDeliveryAbove: 99_900,
    serviceablePincodes: ["560001-560110", "635109-635126", "570001-570036"],
    codEnabled: false,
    codLimit: 500_000,
    codFee: 4_900,
  },
  orders: {
    returnWindowDays: RETURN_WINDOW_DAYS,
    nonReturnableCategoryIds: ["cat_engine-oil-and-lubricants", "cat_electricals"],
  },
  quotations: { validityDays: DEFAULT_QUOTATION_VALIDITY_DAYS },
  service: {
    pickupWindows: [...PICKUP_WINDOWS],
    inspectionFee: 0,
    timeSlots: ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM", "5:00 PM"],
  },
  security: {
    otpExpiryMinutes: 5,
    otpMaxAttempts: 5,
    otpResendSeconds: 30,
  },
  updatedAt: daysAgo(12, 16),
  updatedBy: { type: "admin", id: "adm_ravi", name: "Ravi Shankar" },
}))

export const integrations = persistent<Integration[]>("integrations", () => [
  {
    id: "razorpay",
    name: "Payments",
    provider: "Razorpay",
    description:
      "UPI, cards, net banking and wallets. Online payments are marked paid automatically.",
    mode: "test",
    keyIdMasked: "rzp_test_••••••••9fQ2",
    secretMasked: "••••••••••••x8Lp",
    status: "connected",
    lastCheckedAt: daysAgo(1, 9),
    lastCheckMessage: "Test payment of ₹1 created and refunded.",
  },
  {
    id: "sms",
    name: "SMS and OTP",
    provider: "MSG91",
    description: "Sign-in codes for customers and garages, and order and booking updates by SMS.",
    mode: "test",
    keyIdMasked: "",
    secretMasked: "",
    status: "not_configured",
    lastCheckedAt: null,
    lastCheckMessage: "Add the provider's keys to send OTPs.",
  },
])
