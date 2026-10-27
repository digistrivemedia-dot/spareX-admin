import { formatPrice } from "@/lib/format"

/** One label / amount line in the totals of an invoice or credit note, to the paisa. */
export function AmountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd>{formatPrice(value, { exact: true })}</dd>
    </div>
  )
}
