"use client"

import { ArrowDown, ArrowUp, Loader2, X } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/Combobox"
import { saveFeaturedAction } from "@/features/content/actions"
import type { FeaturedItem, FeaturedKind } from "@/features/content/types"
import { moveItem } from "@/features/content/utils"

type FeaturedEditorProps = {
  kind: FeaturedKind
  title: string
  description: string
  items: FeaturedItem[]
  options: FeaturedItem[]
  canManage: boolean
}

/** Reorder with the up / down buttons, add or remove, then save the order the B2C home shows. */
export function FeaturedEditor(props: FeaturedEditorProps) {
  const { kind, title, description, options, canManage } = props
  const [items, setItems] = useState(props.items)
  const [isPending, startTransition] = useTransition()
  const dirty = items.map((item) => item.id).join() !== props.items.map((item) => item.id).join()
  const available = options
    .filter((option) => !items.some((item) => item.id === option.id))
    .map((option) => ({ value: option.id, label: `${option.name} (${option.detail})` }))

  function save() {
    startTransition(async () => {
      const result = await saveFeaturedAction(
        kind,
        items.map((item) => item.id),
      )
      if (result.ok) toast.success(`Featured ${kind} saved`)
      else toast.error(result.error)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        <p className="text-sm text-gray-500">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.length === 0 && <p className="text-sm text-gray-500">Nothing featured yet.</p>}
        <ol className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-center gap-2 px-3 py-2">
              <span className="w-6 text-sm text-gray-500 tabular-nums">{index + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-900">{item.name}</span>
                <span className="text-xs text-gray-500">{item.detail}</span>
              </span>
              {canManage && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => setItems(moveItem(items, index, -1))}
                    aria-label={`Move ${item.name} up`}
                  >
                    <ArrowUp aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === items.length - 1}
                    onClick={() => setItems(moveItem(items, index, 1))}
                    aria-label={`Move ${item.name} down`}
                  >
                    <ArrowDown aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setItems(items.filter((other) => other.id !== item.id))}
                    aria-label={`Remove ${item.name}`}
                  >
                    <X aria-hidden />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ol>
        {canManage && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Combobox
              options={available}
              value={null}
              onChange={(id) => {
                const option = options.find((candidate) => candidate.id === id)
                if (option) setItems([...items, option])
              }}
              placeholder={`Add ${kind === "categories" ? "a category" : "a product"}`}
              searchPlaceholder="Search"
              className="sm:flex-1"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!dirty || isPending}
                onClick={() => setItems(props.items)}
              >
                Undo
              </Button>
              <Button disabled={!dirty || isPending} onClick={save}>
                {isPending && <Loader2 aria-hidden className="animate-spin" />}
                Save order
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
