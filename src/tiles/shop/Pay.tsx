import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, MapPin, Package, Pencil, Store, Truck, X, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { RollingNumber, SlidingThumb, Swap, caption, fill, title, useLayoutScope } from "@/components/kit";
import { typeSteps, useEvery, useSequence } from "@/lib/autoplay";
import { easeOut, pop, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { usd } from "@/tiles/shop/art";
import { CaretInput } from "@/tiles/shop/fields";

const ring = "outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

/* ── Card form with a live card face ────────────────────── */

const digitsOf = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
const groupCard = (d: string) => d.replace(/(\d{4})(?=\d)/g, "$1 ");
const groupExpiry = (d: string) => (d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
const network = (d: string) => (d.startsWith("4") ? "Visa" : /^5[1-5]/.test(d) ? "Mastercard" : d.startsWith("3") ? "Amex" : "");

type CardField = "number" | "name" | "expiry" | "cvc";

export function CardForm() {
  const id = useId();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  /** Field being typed in, by a person (focus) or by the demo. */
  const [active, setActive] = useState<CardField | null>(null);

  useSequence([
    [900, () => setActive("number")],
    ...typeSteps("4242424242424242", setNumber, 75, 300),
    [500, () => setActive("name")],
    ...typeSteps("MARA QUINN", setName, 70, 300),
    [500, () => setActive("expiry")],
    ...typeSteps("0829", setExpiry, 110, 300),
    [600, () => setActive("cvc")],
    ...typeSteps("123", setCvc, 140, 500),
    [1800, () => setActive(null)],
    [2400, () => (setNumber(""), setName(""), setExpiry(""), setCvc(""))],
  ]);

  const flipped = active === "cvc";
  const net = network(number);
  const slots = Array.from({ length: 16 }, (_, i) => number[i] ?? "•");
  const focus = (f: CardField) => ({ onFocus: () => setActive(f), onBlur: () => setActive((a) => (a === f ? null : a)) });

  return (
    <form className={cn(fill, "flex flex-col gap-3 self-stretch")} onSubmit={(e) => e.preventDefault()} aria-label="Card details">
      {/* Card face */}
      <div className="h-[150px] shrink-0 [perspective:900px]" aria-hidden>
        <motion.div className="relative size-full [transform-style:preserve-3d]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 180, damping: 22 }}>
          <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-brand-gradient p-4 text-brand-foreground [backface-visibility:hidden]">
            <i className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-white/15" />
            <div className="relative flex items-center justify-between">
              <span className="h-6 w-8 rounded-md bg-brand-foreground/20 ring-1 ring-brand-foreground/15" />
              <span className="text-[13px] font-bold tracking-wide italic">
                <Swap id={net || "none"}>{net || "Debit"}</Swap>
              </span>
            </div>
            <p className="relative flex gap-2.5 font-mono text-[17px] leading-none font-semibold tracking-wide">
              {[0, 1, 2, 3].map((g) => (
                <span key={g} className="flex">
                  {slots.slice(g * 4, g * 4 + 4).map((ch, i) => (
                    <span key={i} className="relative inline-block w-[0.62em] text-center">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={ch}
                          className={cn("inline-block", ch === "•" && "opacity-50")}
                          initial={{ y: 8, opacity: 0 }}
                          animate={{ y: 0, opacity: ch === "•" ? 0.5 : 1 }}
                          exit={{ y: -8, opacity: 0 }}
                          transition={{ duration: 0.18, ease: easeOut }}
                        >
                          {ch}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  ))}
                </span>
              ))}
            </p>
            <div className="relative flex items-end justify-between gap-3 text-[10px] leading-tight">
              <div className="min-w-0">
                <p className="opacity-60">Card holder</p>
                <p className="truncate text-xs font-semibold uppercase">{name || "Your name"}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="opacity-60">Expires</p>
                <p className="text-xs font-semibold tabular-nums">{groupExpiry(expiry) || "MM/YY"}</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-brand-gradient pt-5 text-brand-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="h-8 w-full bg-brand-foreground/80" />
            <div className="mt-4 flex items-center gap-2 px-4">
              <span className="h-7 flex-1 rounded-md bg-white/60" />
              <span className="grid h-7 w-14 place-items-center rounded-md bg-white font-mono text-[13px] font-semibold text-black/80">{cvc.padEnd(3, "•")}</span>
            </div>
            <p className="mt-auto px-4 pb-3 text-[10px] opacity-70">Demo card · nothing is charged</p>
          </div>
        </motion.div>
      </div>

      {/* Fields */}
      <label htmlFor={`${id}-num`} className="sr-only">
        Card number
      </label>
      <CaretInput
        id={`${id}-num`}
        inputMode="numeric"
        placeholder="Card number"
        value={groupCard(number)}
        onChange={(v) => setNumber(digitsOf(v, 16))}
        typing={active === "number"}
        className="h-10 font-mono tracking-wide"
        {...focus("number")}
      />
      <label htmlFor={`${id}-name`} className="sr-only">
        Name on card
      </label>
      <CaretInput id={`${id}-name`} placeholder="Name on card" value={name} onChange={(v) => setName(v.toUpperCase().slice(0, 22))} typing={active === "name"} className="h-10" {...focus("name")} />
      <div className="flex gap-2">
        <label htmlFor={`${id}-exp`} className="sr-only">
          Expiry date
        </label>
        <CaretInput
          id={`${id}-exp`}
          inputMode="numeric"
          placeholder="MM/YY"
          value={groupExpiry(expiry)}
          onChange={(v) => setExpiry(digitsOf(v, 4))}
          typing={active === "expiry"}
          className="h-10"
          {...focus("expiry")}
        />
        <label htmlFor={`${id}-cvc`} className="sr-only">
          Security code
        </label>
        <CaretInput id={`${id}-cvc`} inputMode="numeric" placeholder="CVC" value={cvc} onChange={(v) => setCvc(digitsOf(v, 3))} typing={active === "cvc"} className="h-10" {...focus("cvc")} />
      </div>
    </form>
  );
}

/* ── Delivery method radio cards ────────────────────────── */

const DELIVERY = [
  { id: "standard", label: "Standard", eta: "Mon – Wed", price: 0, Icon: Truck },
  { id: "express", label: "Express", eta: "Tomorrow by noon", price: 9, Icon: Zap },
  { id: "pickup", label: "Pick up", eta: "Today at the roastery", price: 0, Icon: Store },
];

export function Delivery() {
  const id = useId();
  const [value, setValue] = useState("standard");
  const thumb = useLayoutScope("delivery");
  useEvery(2100, () => setValue((v) => DELIVERY[(DELIVERY.findIndex((d) => d.id === v) + 1) % DELIVERY.length].id));

  return (
    <RadioGroup value={value} onValueChange={setValue} aria-label="Delivery method" className={cn(fill, "gap-0.5")}>
      {DELIVERY.map(({ id: key, label, eta, price, Icon }) => {
        const on = key === value;
        return (
          <Label
            key={key}
            htmlFor={`${id}-${key}`}
            className={cn("relative flex h-[44px] cursor-pointer items-center gap-2.5 rounded-xl px-3 text-[13px] transition-colors", !on && "hover:bg-card/40")}
          >
            {on && <SlidingThumb id={thumb} className="rounded-xl" />}
            <RadioGroupItem id={`${id}-${key}`} value={key} className="relative" />
            <Icon className={cn("relative size-4 shrink-0 transition-colors", on ? "text-foreground" : "text-muted-foreground")} strokeWidth={2.2} />
            <span className="relative min-w-0 flex-1 leading-tight">
              <span className="block truncate font-semibold">{label}</span>
              <span className={cn(caption, "block truncate font-medium")}>{eta}</span>
            </span>
            <span className={cn("relative text-xs font-semibold tabular-nums", price === 0 && "text-muted-foreground")}>{price ? usd(price, false) : "Free"}</span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}

/* ── Address card with inline editing ───────────────────── */

const STREETS = ["12 Harbour Street", "48 Roastery Lane"];

export function AddressCard() {
  const id = useId();
  const [address, setAddress] = useState({ street: STREETS[0], city: "Portland, OR 97209" });
  const [draft, setDraft] = useState(address);
  const [editing, setEditing] = useState(false);
  const [typing, setTyping] = useState(false);
  const [saved, setSaved] = useState(false);

  const start = () => (setDraft(address), setEditing(true), setSaved(false));
  const save = () => (setAddress(draft), setEditing(false), setTyping(false), setSaved(true));
  const cancel = () => (setEditing(false), setTyping(false));
  const setStreet = (street: string) => setDraft((d) => ({ ...d, street }));

  const demoEdit = (street: string) => [[1900, start] as const, [300, () => setTyping(true)] as const, ...typeSteps(street, setStreet, 65, 300), [900, save] as const];
  useSequence([...demoEdit(STREETS[1]), ...demoEdit(STREETS[0])]);

  return (
    <div className={cn(fill, "flex flex-col gap-1.5 self-stretch py-0.5")}>
      <div className="flex h-8 items-center gap-2 px-1">
        <MapPin className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.2} />
        <p className={cn(title, "flex-1")}>Ship to</p>
        <AnimatePresence mode="popLayout" initial={false}>
          {editing ? (
            <motion.span key="edit" className="flex gap-1" {...pop}>
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2.5" onClick={cancel}>
                Cancel
              </Button>
              <Button type="submit" form={`${id}-form`} size="sm" className="h-7 px-3">
                Save
              </Button>
            </motion.span>
          ) : (
            <motion.span key="view" className="flex items-center gap-1.5" {...pop}>
              <AnimatePresence>
                {saved && (
                  <motion.span {...pop} transition={springBouncy}>
                    <Badge variant="brand" className="h-5 gap-0.5 px-1.5 text-[10px]">
                      <Check strokeWidth={3} /> Saved
                    </Badge>
                  </motion.span>
                )}
              </AnimatePresence>
              <Button type="button" variant="surface" size="sm" className="h-7 px-2.5" onClick={start}>
                <Pencil className="size-3!" strokeWidth={2.6} /> Edit
              </Button>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.form
            key="form"
            id={`${id}-form`}
            className="flex flex-col gap-1.5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: easeOut }}
            onSubmit={(e) => (e.preventDefault(), save())}
          >
            <label htmlFor={`${id}-street`} className="sr-only">
              Street
            </label>
            <CaretInput id={`${id}-street`} value={draft.street} onChange={setStreet} typing={typing} className="h-9" onFocus={() => setTyping(false)} />
            <label htmlFor={`${id}-city`} className="sr-only">
              City and postcode
            </label>
            <CaretInput id={`${id}-city`} value={draft.city} onChange={(city) => setDraft((d) => ({ ...d, city }))} className="h-9" />
          </motion.form>
        ) : (
          <motion.address
            key="view"
            className="rounded-xl bg-card px-3.5 py-2.5 leading-snug text-card-foreground not-italic"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <p className="font-semibold">Mara Quinn</p>
            <p className="truncate">
              <Swap id={address.street}>{address.street}</Swap>
            </p>
            <p className={cn(caption, "truncate")}>{address.city}</p>
          </motion.address>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Order total summary ────────────────────────────────── */

const SUBTOTAL = 142;
const TAX_RATE = 0.08;

export function OrderSummary() {
  const id = useId();
  const [express, setExpress] = useState(false);
  const [promo, setPromo] = useState(true);
  const [placed, setPlaced] = useState(false);
  useSequence([
    [1800, () => setExpress(true)],
    [1700, () => setPromo(false)],
    [1700, () => setExpress(false)],
    [1700, () => setPromo(true)],
  ]);

  const shipping = express ? 9 : 0;
  const discount = promo ? SUBTOTAL * 0.1 : 0;
  const tax = (SUBTOTAL - discount) * TAX_RATE;
  const total = SUBTOTAL - discount + shipping + tax;
  const row = "flex h-[22px] items-center justify-between gap-2";

  return (
    <div className={cn(fill, "flex flex-col self-stretch")}>
      <div className="flex items-baseline justify-between px-0.5">
        <p className="text-[15px] font-semibold tracking-tight">Order summary</p>
        <p className={caption}>4 items</p>
      </div>
      <dl className="mt-2 px-0.5 text-[13px]">
        <div className={row}>
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{usd(SUBTOTAL)}</dd>
        </div>
        <div className={cn(row, "h-[26px]")}>
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Label htmlFor={`${id}-exp`} className="cursor-pointer text-[13px] font-medium text-muted-foreground">
              Express
            </Label>
            <Switch id={`${id}-exp`} checked={express} onCheckedChange={setExpress} className="scale-90" />
          </dt>
          <dd className="tabular-nums">
            <Swap id={shipping}>{shipping ? usd(shipping) : "Free"}</Swap>
          </dd>
        </div>
        <div className={row}>
          <dt className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <span className="truncate">Discount</span>
            <button
              type="button"
              aria-pressed={promo}
              onClick={() => setPromo((p) => !p)}
              className={cn("inline-flex h-5 items-center gap-1 rounded-pill px-2 text-[10px] font-bold transition-colors", ring, promo ? "bg-brand-gradient text-brand-foreground" : "bg-muted text-muted-foreground")}
            >
              BREW10
              {promo && <X className="size-2.5" strokeWidth={3.4} />}
            </button>
          </dt>
          <dd className="tabular-nums">
            <RollingNumber value={discount} text={discount ? `−${usd(discount)}` : usd(0)} />
          </dd>
        </div>
        <div className={row}>
          <dt className="text-muted-foreground">Tax (8%)</dt>
          <dd>
            <RollingNumber value={tax} text={usd(tax)} />
          </dd>
        </div>
      </dl>
      <div className="mt-2 flex items-center justify-between border-t border-border px-0.5 pt-2">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-semibold tracking-tight" aria-live="polite">
          <RollingNumber value={total} text={usd(total)} />
        </span>
      </div>
      <Button variant="brand" className="mt-auto w-full" aria-pressed={placed} onClick={() => setPlaced((p) => !p)}>
        <Swap id={placed ? "p" : "c"}>
          {placed ? (
            <>
              <Check className="mr-1.5 size-4" strokeWidth={3} /> Order placed
            </>
          ) : (
            <>
              <Package className="mr-1.5 size-4" strokeWidth={2.4} /> Place order
            </>
          )}
        </Swap>
      </Button>
    </div>
  );
}

/* ── Monthly / yearly pricing card ──────────────────────── */

const PLANS = { monthly: { price: 18, note: "billed monthly" }, yearly: { price: 14, note: "$168 billed yearly" } } as const;
type Billing = keyof typeof PLANS;

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [joined, setJoined] = useState(false);
  const thumb = useLayoutScope("billing");
  useEvery(2400, () => setBilling((b) => (b === "monthly" ? "yearly" : "monthly")));
  const plan = PLANS[billing];

  return (
    <div className="flex size-full min-w-0 flex-col">
      <div role="radiogroup" aria-label="Billing period" className="grid grid-cols-2 rounded-pill bg-well p-[3px]">
        {(Object.keys(PLANS) as Billing[]).map((b) => (
          <button
            key={b}
            type="button"
            role="radio"
            aria-checked={b === billing}
            onClick={() => setBilling(b)}
            className={cn("relative h-7 rounded-[calc(var(--shape-pill)-3px)] text-xs capitalize transition-colors", ring, b === billing ? "font-semibold text-card-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {b === billing && <SlidingThumb id={thumb} />}
            <span className="relative">{b}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-1">
        <p className={title}>Bean Club</p>
        <AnimatePresence>
          {billing === "yearly" && (
            <motion.span {...pop} transition={springBouncy}>
              <Badge variant="brand" className="h-[18px] px-1.5 text-[10px] font-bold">
                −22%
              </Badge>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-1 flex items-baseline gap-0.5" aria-live="polite">
        <span className="text-[28px] leading-none font-semibold tracking-tight">
          <RollingNumber value={plan.price} text={`$${plan.price}`} />
        </span>
        <span className={caption}>/mo</span>
      </p>
      <p className={cn(caption, "mt-1 truncate")}>
        <Swap id={billing}>{plan.note}</Swap>
      </p>
      <ul className="mt-2.5 space-y-1 text-xs">
        {["2 bags a month", "Free shipping", "Skip any time"].map((f) => (
          <li key={f} className="flex items-center gap-1.5">
            <Check className="size-3 shrink-0 text-chart-2" strokeWidth={3.2} />
            <span className="truncate">{f}</span>
          </li>
        ))}
      </ul>
      <Button variant={joined ? "surface" : "brand"} size="sm" className="mt-auto w-full" aria-pressed={joined} onClick={() => setJoined((j) => !j)}>
        <Swap id={joined ? "j" : "n"}>{joined ? "Joined" : "Subscribe"}</Swap>
      </Button>
    </div>
  );
}

