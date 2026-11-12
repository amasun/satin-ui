import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-pill border border-transparent text-[13px] font-semibold whitespace-nowrap transition-[color,background-color,border-color,scale,opacity,filter] duration-200 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85",
        brand: "bg-brand-gradient text-brand-foreground hover:brightness-95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-well aria-expanded:bg-well",
        /** A light control sitting on a tile. */
        surface: "bg-card text-card-foreground hover:bg-card/70",
        outline: "border-border bg-transparent hover:bg-muted aria-expanded:bg-muted",
        ghost: "hover:bg-muted aria-expanded:bg-muted",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/30",
        link: "rounded-md text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default: "h-9.5 gap-1.5 px-4",
        sm: "h-8 gap-1 px-3 text-xs",
        lg: "h-11 gap-2 px-5 text-sm",
        icon: "size-9",
        /* Small icon buttons keep a 44px hit area through the pseudo element. */
        "icon-xs": "size-7 after:absolute after:-inset-2 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 after:absolute after:-inset-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  type,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
