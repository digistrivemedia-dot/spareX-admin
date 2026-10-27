"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import type { Permission } from "@/features/auth/permissions"
import { visibleNavigation } from "@/lib/navigation"

/** Ctrl / ⌘ K palette to jump to any screen the admin can open. */
export function GlobalSearch({ permissions }: { permissions: readonly Permission[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full max-w-sm justify-start gap-2 bg-gray-50 font-normal text-gray-500 hover:bg-gray-100"
        aria-label="Search pages"
      >
        <Search aria-hidden />
        <span className="truncate">Search pages…</span>
        <kbd className="ml-auto hidden rounded border border-gray-200 bg-white px-1.5 text-xs text-gray-500 sm:inline">
          Ctrl K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search pages"
        description="Jump to any screen in the admin panel"
      >
        <CommandInput placeholder="Type a page name…" />
        <CommandList>
          <CommandEmpty>No matching pages.</CommandEmpty>
          {visibleNavigation(permissions).map((section) => (
            <CommandGroup key={section.label} heading={section.label}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${section.label} ${item.label}`}
                  onSelect={() => go(item.href)}
                >
                  <item.icon aria-hidden />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandGroup heading="Account">
            <CommandItem value="Account My profile" onSelect={() => go("/profile")}>
              My profile
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
