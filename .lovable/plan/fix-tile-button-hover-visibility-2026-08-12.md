# Fix tile button hover visibility

## Current state
The tile header triggers in `src/pages/overview/components/tile-shell.tsx` use a hardcoded `hover:bg-[#EEEEF2]` (near-white). On the frosted glass tile surface (`rgba(255,255,255,0.16)` over a dark green gradient) with white text, this produces white text on an almost-white background — unreadable on hover.

## What to change
1. **Add a semantic tile hover token** in `src/style-pack.css` inside the `.card-solid, .card-tonal, .card-sheet` block, e.g. `--tile-hover: rgba(255, 255, 255, 0.22)` — a translucent white that darkens the glass just enough to read the white label while preserving the frosted aesthetic.
2. **Replace hardcoded hover colors** in `src/pages/overview/components/tile-shell.tsx`:
   - Time-range dropdown trigger: `hover:bg-[#EEEEF2]` → `hover:bg-[var(--tile-hover)]`
   - Options menu trigger (`IconDots`): `hover:bg-[#EEEEF2]` → `hover:bg-[var(--tile-hover)]`
3. **Run `npm run build`** to verify no TypeScript/Tailwind regressions.

## Out of scope
- No changes to the dropdown menu items (they already render on a white `#fff` popover with dark `#333` text, which is correct).
- No backend or auth changes.
