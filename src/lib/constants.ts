/**
 * Business defaults in one place. Several are open questions (see OPEN-QUESTIONS.md); when the client answers,
 * change the value here.
 */

export const GST_RATE_PERCENT = 18

/** B2B credit terms when admin first enables credit. Q-11. */
export const DEFAULT_CREDIT_TERMS_DAYS = 30

/** Quotation validity when admin sends a quotation. */
export const DEFAULT_QUOTATION_VALIDITY_DAYS = 7

/** Days after delivery a customer can ask for a return. Q-12. */
export const RETURN_WINDOW_DAYS = 7

/** Pickup time windows for free pick and drop. Q-15. */
export const PICKUP_WINDOWS = ["9–11 AM", "11 AM–1 PM", "2–4 PM", "4–6 PM"] as const

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 20

export const PASSWORD_MIN_LENGTH = 8

/** Length of the 2-step verification and password reset codes. */
export const OTP_LENGTH = 6

/** Dashboard activity figures (orders, revenue, charts) cover this many days. */
export const DASHBOARD_PERIOD_DAYS = 30

/** Highest B2B discount admin can set on a business. Q-22. */
export const MAX_B2B_DISCOUNT_PERCENT = 50

/** Most rows one CSV import accepts. */
export const MAX_IMPORT_ROWS = 1000

/** Seller details printed on invoices and credit notes. Placeholders until the client confirms them (Q-13). */
export const SELLER = {
  legalName: "Kannali Garage Private Limited",
  gstin: "29AAACK0000A1Z5",
  address: "Registered office address, Bengaluru, Karnataka 560001",
  stateCode: "29",
} as const
