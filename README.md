# Satin UI

A design kit built on **Tailwind CSS v4 + shadcn/ui (Radix)**, shown as an
animated bento board of 55 working components across two screens (splitting
a bill, and a team workspace). The board is the showcase; the
theme and the restyled shadcn components are the part meant to be reused.

```bash
npm install
npm run dev      # http://localhost:5183
npm run build    # type-check + production build
```

## What to take into another project

| Path | What it is |
| --- | --- |
| `src/index.css` | The theme: shadcn tokens (light + dark), brand gradient utilities, elevation scale |
| `src/components/ui/` | shadcn components for this kit. Restyled: button, input, select, switch, checkbox, radio, slider, toggle, calendar, otp, accordion, tooltip, badge, avatar, progress, command. Stock shadcn, themed only through the tokens: table, tabs, breadcrumb, pagination, alert, alert-dialog, dropdown-menu, hover-card, drawer, popover, textarea, skeleton |
| `components.json` | shadcn config (`radix-nova`, Lucide icons), so `npx shadcn add …` keeps working |

Everything else is the showcase:

| Path | What it is |
| --- | --- |
| `src/components/kit.tsx` | `Board`, `Tile`, `RollingNumber`, `DemoInput`, `Swap`, `SlidingThumb` |
| `src/tiles/` | Screen 1: 31 tiles |
| `src/tiles/workspace/` | Screen 2: 24 tiles (data, navigation, overlays, inputs, feedback) |
| `src/lib/autoplay.tsx` | Demo scheduler (`useSequence`, `useEvery`, `typeSteps`) |
| `src/App.tsx` | Board layout: which tile sits where |

## Design rules

- **Tokens first.** Colours, radii and shadows come from `index.css`. Use
  `bg-tile`, `bg-card`, `bg-well`, `text-muted-foreground`, `bg-brand-gradient`
  rather than raw values.
- **Shadows are a layering signal, not decoration.** Surfaces that sit in the
  layout have none; tone and a hairline border separate them. Only two levels
  exist: `shadow-knob` (switch and slider thumbs) and `shadow-float` (menus,
  toasts). If something still reads clearly without a shadow, it gets none.
- **Dark mode is the `.dark` class.** Put it on `<html>` for the whole page, or
  on any element to flip the tokens inside it (the dark tiles do this).
- **Corner style is one attribute.** `data-shape="round"` (default) uses pills
  and generous radii; `data-shape="soft"` is a tighter, squarer look. Set it on
  `<html>` or on any subtree. It drives three variables: `--radius` (shadcn's
  base), `--shape-pill` (controls, via `rounded-pill`) and `--shape-tile`
  (via `rounded-tile`). Use `rounded-pill` for controls instead of
  `rounded-full`; keep `rounded-full` for circles that carry meaning (avatars,
  radios, status dots, slider thumbs).
- **Captions are 12px in `muted-foreground`**, which keeps 4.5:1 contrast on
  tiles. Small icon buttons extend their hit area with a pseudo element.

## Demos

Each tile is a normal, keyboard-accessible component that also plays a loop of
itself. The loop only runs while the tile is on screen, the tab is visible, and
nobody is hovering or focusing it; it resumes 1.6s after you leave.

Nothing pops up on its own. Overlays (dialog, drawer, dropdown, select, date
popover, hover card, tooltip) open only when a person clicks, hovers or
focuses. Where it helps, the tile previews the overlay inline instead. `prefers-reduced-motion` starts with demos off, and
the pause button next to the screen dots stops them all.

## Screens

`ScreenPager` (`src/components/pager.tsx`) shows one screen at a time. Wheel,
swipe, PageUp / PageDown or the dots move between screens; the outgoing screen
is unmounted. A screen taller than the viewport (tablet, phone) scrolls
normally first and only hands over once you scroll past its end. Add a screen
by adding an entry to `SCREENS` in `src/App.tsx`.

## Layout

A CSS grid with 78px row units. From 1320px (`board:` breakpoint) it is a fixed
8 × 11 composition (`col` / `row` on each `Tile`); below that it reflows to 4
and then 2 columns in source order. Tiles can be 1 to 4 columns wide and 1 to
4 rows tall; each screen is one `Board`.

## Control bar

Controls that act on the whole page sit outside the board, next to the screen dots (`src/components/controls.tsx`). Their state lives in one store, `src/lib/settings.ts`, so the bar and the Appearance tile always agree.

| Control | Effect | Saved |
| --- | --- | --- |
| Theme | Light or dark | yes |
| Corners | Round or soft | yes |
| Accent | Cycles the brand gradient: green, blue, orange, violet (`data-accent` on `<html>`) | yes |
| Pause | Stops or resumes every demo | no |
| Speed | 1×, 2×, 0.5× for every demo | yes |
| Replay | Replays the current screen's entrance | no |
| Names | Labels each tile with its name and holds the demos | no |
| Full screen | Enters or leaves browser full screen | no |

On narrow screens the last four fold into a "more" menu. To add a setting, add a field to `Settings` and read it with `useSetting`.

## Credits and license

The look started from a short video of an animated bento board of UI components shared online. Everything here (code, copy, names, layout) was written from scratch for this project.

Released under the [MIT License](LICENSE).
