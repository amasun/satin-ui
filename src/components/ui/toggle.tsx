import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Toggle as TogglePrimitive } from "radix-ui"

const toggleVariants = cva(
  "group/toggle relative inline-flex items-center justify-center gap-1 rounded-pill text-[13px] font-medium whitespace-nowrap transition-[color,background-color,scale] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted data-[state=on]:bg-muted",
        outline: "border border-input bg-transparent hover:bg-muted data-[state=on]:bg-muted",
        /** One option of a segmented control; the group draws the sliding thumb. */
        segment: "text-muted-foreground hover:text-foreground data-[state=on]:font-semibold data-[state=on]:text-foreground",
        /** A filter chip: fills with the brand gradient when selected. */
        chip: "bg-card font-semibold text-card-foreground active:scale-[0.96] data-[state=on]:bg-brand-gradient data-[state=on]:text-brand-foreground",
      },
      size: {
        default: "h-8 min-w-8 px-3",
        sm: "h-7 min-w-7 px-2.5 text-xs",
        lg: "h-9.5 min-w-9.5 px-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
