import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex h-6 w-10 shrink-0 items-center rounded-pill p-0.5 transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:ring-3 aria-invalid:ring-destructive/30 after:absolute after:-inset-x-2 after:-inset-y-2.5 data-checked:bg-brand-gradient data-unchecked:bg-input data-disabled:cursor-not-allowed data-disabled:opacity-40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-5 rounded-[calc(var(--shape-pill)-2px)] bg-white shadow-knob transition-transform duration-300 ease-out-expo data-checked:translate-x-4 data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
