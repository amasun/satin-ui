# Handoff — Satin UI (bento-kit)

_Written 2026-11-12._

## Project
**Satin UI**: a design kit on Tailwind CSS v4 + shadcn/ui (Radix, `radix-nova`, Lucide), shown as an animated bento board of 117 working components across 5 screens: splitting a bill, team workspace, shop and checkout, AI assistant, live event.
Live: https://amasun.github.io/satin-ui/ (GitHub Pages, deployed via `.github/`). Repo: `github:amasun/satin-ui`.

**Stack:** React 19, Vite 8, TypeScript 7, Tailwind 4 (`@tailwindcss/vite`), `motion`, radix-ui, vaul, cmdk, react-day-picker, input-otp.
**Package manager:** pnpm only (no package-lock; store at `X:\.pnpm-store`).

```bash
pnpm install
pnpm dev        # http://localhost:5183
pnpm build      # tsc --noEmit && vite build
```

## Layout
- `src/index.css`: theme tokens (light and dark), brand gradient utilities, elevation scale. Reusable part.
- `src/components/ui/`: shadcn components (some restyled, others stock and themed by tokens). Reusable part.
- `src/components/kit.tsx`: `Board`, `Tile`, `RollingNumber`, `DemoInput`, `Swap`, `SlidingThumb`.
- `src/components/pager.tsx`: screen pager and `Stage` (wordmark, tagline, theme label and page number around the board).
- `src/tiles/`: screen 1 (31 tiles); `tiles/workspace/` screen 2 (24 tiles).
- `src/screens/{shop,assistant,live,workspace}`: other screens.
- `src/lib/autoplay.tsx`: demo scheduler (`useSequence`, `useEvery`, `typeSteps`).
- `src/App.tsx`: board layout.
- `docs/`: `screen-5-live-plan.md`, `screens-3-4-plan.md`. `conversation/`: `session-export.zip`.

Design rules (see README): use tokens first (`bg-tile`, `bg-card`, `bg-well`, `text-muted-foreground`, `bg-brand-gradient`). Shadows signal layering only.

## Recent work (git log)
Latest commits are all about the pager's labels and board scaling:
- `e24a940` Keep the labels still through a screen change
- `74252e5` Titles set horizontally as small labels inside the board's padding
- `410fb61` Stop scaling the board; only the titles adapt to the window
- Before that: wordmark above each board, screens 3–5 added, GitHub Pages deploy.

## Uncommitted state
Only `src/components/pager.tsx` is modified (24+/8−), not committed:
- The wordmark and tagline are now `motion.h1` and `motion.p` with `fixedVariants`. The outgoing copy is dropped instantly so two translucent copies never overlap and read darker.
- The theme label and page number (`labelVariants`) now blur out (0.2s), then blur back in (0.4s, 0.18s delay). They no longer use the shared `labelTransition`.
- Not yet verified in the browser or committed. Run `pnpm typecheck` and check a screen change visually first.

## Suggested next steps
1. Run `pnpm dev`, switch screens, check the label dissolve (no overlap, no jump), then `pnpm build`.
2. Commit the `pager.tsx` change if it looks right. Git warns about LF→CRLF, so consider setting `.gitattributes` or `core.autocrlf`.
3. README says 117 components and five screens. Update it if the counts change.
4. The README table shows garbled characters (`鈥`) next to `npx shadcn add`. The file is likely saved with the wrong encoding, so re-save it as UTF-8.

## Notes
- The user's global rules: use pnpm (never npm/npx), no `browser_subagent` for previews (just output the localhost link), keep replies concise.

