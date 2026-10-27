import { ImageIcon } from "lucide-react"
import Image from "next/image"

import { cn } from "@/lib/utils"

type ThumbnailProps = {
  src: string | null
  alt: string
  size?: "sm" | "md"
  className?: string
}

/** A small square image, or a neutral placeholder until a real photo or logo is uploaded. */
export function Thumbnail({ src, alt, size = "sm", className }: ThumbnailProps) {
  const box = cn(
    "shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50",
    size === "sm" ? "size-9" : "size-16",
    className,
  )
  if (!src) {
    return (
      <span className={cn(box, "flex items-center justify-center text-gray-400")} aria-hidden>
        <ImageIcon className={size === "sm" ? "size-4" : "size-6"} />
      </span>
    )
  }
  // Uploaded images may be data URLs in demo mode, which the image optimiser can't fetch.
  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      unoptimized
      className={cn(box, "object-contain")}
    />
  )
}
