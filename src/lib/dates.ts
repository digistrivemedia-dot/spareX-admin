import type { IsoDate, IsoDateTime } from "@/lib/types"

/**
 * Admins pick calendar days in India. Schedules (banners, coupons) start at the beginning of the IST day and end at
 * its last second.
 */
export const startOfDayIst = (date: IsoDate): IsoDateTime =>
  new Date(`${date}T00:00:00+05:30`).toISOString()

export const endOfDayIst = (date: IsoDate): IsoDateTime =>
  new Date(`${date}T23:59:59+05:30`).toISOString()

/** The IST calendar day of a timestamp, for a date input. */
export const istDate = (value: IsoDateTime): IsoDate =>
  new Date(value).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
