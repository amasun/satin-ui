import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fake product "photos": simple inline drawings tinted through chart tokens,
 * so they follow the theme. `tint` is any CSS colour (normally a var()).
 */

type ArtProps = { tint?: string; className?: string; style?: CSSProperties };

const shine = { stroke: "white", strokeOpacity: 0.35, strokeWidth: 4, strokeLinecap: "round", fill: "none" } as const;

function Frame({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={cn("block size-full", className)} style={style}>
      <ellipse cx="60" cy="106" rx="34" ry="4.5" fill="currentColor" opacity="0.1" />
      {children}
    </svg>
  );
}

export function Kettle({ tint = "var(--chart-5)", className, style }: ArtProps) {
  return (
    <Frame className={className} style={style}>
      <path d="M36 89 Q19 85 18 62 Q17 48 9 42" stroke={tint} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M85 56 Q103 58 101 78 Q99 92 85 92" stroke={tint} strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M34 52 Q31 99 41 102 H79 Q89 99 86 52 Z" fill={tint} />
      <path d="M37 52 Q60 36 83 52 Z" fill={tint} />
      <circle cx="60" cy="41" r="4.5" fill="var(--chart-4)" />
      <path d="M42 60 Q40 80 45 94" {...shine} />
    </Frame>
  );
}

export function Grinder({ tint = "var(--chart-1)", className, style }: ArtProps) {
  return (
    <Frame className={className} style={style}>
      <path d="M60 30 V22 H92" stroke="currentColor" strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="94" cy="22" r="6.5" fill="var(--chart-4)" />
      <rect x="46" y="32" width="28" height="12" rx="3" fill={tint} opacity="0.8" />
      <rect x="40" y="42" width="40" height="62" rx="7" fill={tint} />
      <rect x="40" y="62" width="40" height="5" fill="white" opacity="0.28" />
      <path d="M47 74 V96" {...shine} />
    </Frame>
  );
}

export function Dripper({ tint = "var(--chart-2)", className, style }: ArtProps) {
  return (
    <Frame className={className} style={style}>
      <path d="M40 86 H80 V100 Q80 105 75 105 H45 Q40 105 40 100 Z" fill="currentColor" opacity="0.14" />
      <rect x="34" y="78" width="52" height="7" rx="3.5" fill={tint} />
      <path d="M26 34 H94 L74 78 H46 Z" fill={tint} />
      <path d="M46 44 L54 70 M60 44 V70 M74 44 L66 70" stroke="white" strokeOpacity="0.3" strokeWidth="2.5" strokeLinecap="round" />
    </Frame>
  );
}

export function Mug({ tint = "var(--chart-4)", className, style }: ArtProps) {
  return (
    <Frame className={className} style={style}>
      <path d="M50 26 Q45 32 50 38 Q55 44 50 50 M64 22 Q59 30 64 36 Q69 42 64 48" stroke="currentColor" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M80 60 Q99 60 99 73 Q99 87 80 87" stroke={tint} strokeWidth="7" fill="none" />
      <path d="M32 54 H82 V90 Q82 104 68 104 H46 Q32 104 32 90 Z" fill={tint} />
      <path d="M39 62 V88" {...shine} />
    </Frame>
  );
}

export function Beans({ tint = "var(--chart-3)", className, style }: ArtProps) {
  return (
    <Frame className={className} style={style}>
      <path d="M36 30 H84 L89 100 Q89 105 84 105 H36 Q31 105 31 100 Z" fill={tint} />
      <rect x="34" y="24" width="52" height="10" rx="2.5" fill={tint} opacity="0.75" />
      <rect x="45" y="52" width="30" height="34" rx="5" fill="white" opacity="0.88" />
      <ellipse cx="60" cy="69" rx="7" ry="10" fill="var(--chart-4)" transform="rotate(25 60 69)" />
      <path d="M57 61 Q63 69 57 77" stroke="white" strokeWidth="1.8" fill="none" transform="rotate(25 60 69)" />
    </Frame>
  );
}

export const PRODUCTS = {
  kettle: { name: "Gooseneck kettle", price: 89, Art: Kettle, tint: "var(--chart-5)" },
  grinder: { name: "Hand grinder", price: 64, Art: Grinder, tint: "var(--chart-1)" },
  dripper: { name: "Cone dripper", price: 28, Art: Dripper, tint: "var(--chart-2)" },
  mug: { name: "Stoneware mug", price: 22, Art: Mug, tint: "var(--chart-4)" },
  beans: { name: "Hillside beans", price: 18, Art: Beans, tint: "var(--chart-3)" },
} as const;
export type ProductId = keyof typeof PRODUCTS;

/** A soft tinted backdrop for a product drawing. */
export const backdrop = (tint: string, amount = 16): CSSProperties => ({
  background: `color-mix(in oklab, ${tint} ${amount}%, var(--card))`,
});

export const usd = (n: number, cents = true) => `$${cents ? n.toFixed(2) : Math.round(n)}`;
