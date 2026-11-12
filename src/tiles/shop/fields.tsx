import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { useCellActive } from "@/lib/autoplay";
import { cn } from "@/lib/utils";

type CaretInputProps = Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  /** True while the demo is typing into this field: shows a caret on the mirrored text. */
  typing?: boolean;
};

/**
 * Like kit's DemoInput, but only the field the demo is typing into shows a
 * caret, so a form with several filled fields doesn't blink everywhere.
 */
export function CaretInput({ value, onChange, typing = false, className, ...rest }: CaretInputProps) {
  const ghost = useCellActive() && typing && value.length > 0;
  return (
    <span className="relative block min-w-0 flex-1">
      <Input
        value={value}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        className={cn(ghost && "text-transparent", className)}
        {...rest}
      />
      {ghost && (
        <span aria-hidden className={cn("pointer-events-none absolute inset-0 flex items-center overflow-hidden border border-transparent px-4 text-base whitespace-pre md:text-[13px]", className, "bg-transparent")}>
          <span>{value}</span>
          <i className="ml-px inline-block h-[1.2em] w-[1.5px] shrink-0 animate-caret bg-foreground" />
        </span>
      )}
    </span>
  );
}
