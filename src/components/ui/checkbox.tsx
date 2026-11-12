"use client"

import * as React from "react"
import { cn } from "cn"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { CheckIcon } from "lucide-react"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-[min(6px,var(--radius-md))] bg-input transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:ring-3 aria-invalid:ring-destructive/30 after:absolute after:-inset-2.5 disabled:cursor-not-allowed disabled:opacity-40 data-checked:bg-brand-gradient data-checked:text-brand-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current animate-in zoom-in-50 duration-200 [&>svg]:size-3.5 [&>svg]:stroke-3"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
