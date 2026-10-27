import { Bell, BellOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/** Placeholder until notification channels and events are decided (Q-16). */
export function NotificationsMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <BellOff aria-hidden className="size-5 text-gray-400" />
          <p className="text-sm font-medium text-gray-900">No notifications</p>
          <p className="text-xs text-gray-500">Work that needs you is listed on the dashboard.</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
