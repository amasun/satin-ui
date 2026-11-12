import * as React from "react"
import { cn } from "cn"
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from "react-day-picker"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  captionLayout = "label",
  buttonVariant = "secondary",
  locale,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaults = getDefaultClassNames()
  const navButton = cn(buttonVariants({ variant: buttonVariant, size: "icon-xs" }), "aria-disabled:opacity-40")

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      locale={locale}
      className={cn("group/calendar [--cell-size:--spacing(8)]", className)}
      classNames={{
        root: cn("w-full", defaults.root),
        months: cn("relative flex flex-col gap-4", defaults.months),
        month: cn("flex w-full flex-col gap-2", defaults.month),
        nav: cn("absolute top-0 right-0 z-10 flex items-center gap-1.5", defaults.nav),
        button_previous: cn(navButton, defaults.button_previous),
        button_next: cn(navButton, defaults.button_next),
        month_caption: cn("flex h-7 items-center pr-16", defaults.month_caption),
        caption_label: cn("text-[15px] font-semibold tracking-tight select-none", defaults.caption_label),
        month_grid: cn("w-full border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn("flex-1 text-[11px] font-semibold text-muted-foreground select-none", defaults.weekday),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn("group/day relative flex-1 p-0 text-center select-none", defaults.day),
        range_start: cn("rounded-l-pill bg-muted", defaults.range_start),
        range_middle: cn("bg-muted", defaults.range_middle),
        range_end: cn("rounded-r-pill bg-muted", defaults.range_end),
        today: cn("[&>button:not([data-selected-single=true])]:bg-muted [&>button]:font-semibold", defaults.today),
        outside: cn("[&>button]:text-muted-foreground/60", defaults.outside),
        disabled: cn("opacity-40", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...rootProps }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...rootProps} />
        ),
        Chevron: ({ className, orientation, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeftIcon : orientation === "right" ? ChevronRightIcon : ChevronDownIcon
          return <Icon className={cn("size-3.5", className)} strokeWidth={2.5} {...chevronProps} />
        },
        DayButton: (dayProps) => <CalendarDayButton locale={locale} {...dayProps} />,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const edge = modifiers.range_start || modifiers.range_end

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={modifiers.selected && !edge && !modifiers.range_middle}
      data-range-edge={edge}
      className={cn(
        "mx-auto size-(--cell-size) text-[13px] font-medium active:scale-90",
        "data-[selected-single=true]:bg-brand-gradient data-[selected-single=true]:font-semibold data-[selected-single=true]:text-brand-foreground data-[selected-single=true]:hover:brightness-95",
        "data-[range-edge=true]:bg-primary data-[range-edge=true]:text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
