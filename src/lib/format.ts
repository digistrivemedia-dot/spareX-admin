import type { IsoDate, IsoDateTime, Paise } from "@/lib/types"

const TIME_ZONE = "Asia/Kolkata"

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

const rupeesWithPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactRupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
})

const numbers = new Intl.NumberFormat("en-IN")

const dates = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
})

const times = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TIME_ZONE,
})

/** ₹1,24,999. Shows paise only when the amount has them, unless `exact` is set. */
export function formatPrice(paise: Paise, { exact = false } = {}): string {
  const hasPaise = paise % 100 !== 0
  return (exact || hasPaise ? rupeesWithPaise : rupees).format(paise / 100)
}

/** ₹1.2L, ₹45K: for chart axes and tight tiles, where the exact amount is in a tooltip or list. */
export function formatCompactPrice(paise: Paise): string {
  return compactRupees.format(paise / 100)
}

export function formatNumber(value: number): string {
  return numbers.format(value)
}

export function formatPercent(value: number): string {
  return `${numbers.format(value)}%`
}

/** 12 Oct 2026 */
export function formatDate(value: IsoDate | IsoDateTime): string {
  return dates.format(new Date(value))
}

/** 12 Oct 2026, 4:30 PM (IST) */
export function formatDateTime(value: IsoDateTime): string {
  const date = new Date(value)
  return `${dates.format(date)}, ${times.format(date).toUpperCase()}`
}

/** "+91 98450 12345" from "+919845012345" or "9845012345". */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(-10)
  if (digits.length !== 10) return value
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

/** "today", "1 day", "12 days": how long something has been waiting. */
export function formatAge(from: IsoDateTime, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(from).getTime()) / 86_400_000)
  if (days <= 0) return "today"
  return days === 1 ? "1 day" : `${days} days`
}

/** "out_for_delivery" → "Out for delivery" */
export function humanize(value: string): string {
  const text = value.replace(/[_-]+/g, " ").trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "Arjun Rao" → "AR" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}
