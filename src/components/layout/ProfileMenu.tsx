"use client"

import { LogOut, UserRound } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/features/auth/actions"
import { initials } from "@/lib/format"

type ProfileMenuProps = { name: string; email: string; roleName: string }

export function ProfileMenu({ name, email, roleName }: ProfileMenuProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 px-1.5 sm:pr-3"
          aria-label={`Account menu for ${name}`}
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-navy-700 text-xs font-semibold text-white">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden flex-col items-start leading-tight md:flex">
            <span className="text-sm font-medium text-gray-900">{name}</span>
            <span className="text-xs text-gray-500">{roleName}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{name}</span>
          <span className="truncate text-xs font-normal text-gray-500">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound aria-hidden />
            My profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isPending}
          onSelect={() => startTransition(() => signOutAction())}
        >
          <LogOut aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
