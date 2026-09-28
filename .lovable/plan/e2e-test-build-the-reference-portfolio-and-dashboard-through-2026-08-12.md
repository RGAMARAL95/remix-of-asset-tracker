# E2E test: build the reference portfolio and dashboard through the UI

Drive the real signed-in app with Playwright, entering all eight assets through the Add asset form and adding all nine tiles through the tile picker, then verify the numbers match the reference figures.

## Phase 1 — Session and clean start

- Restore the injected preview session, land on `/assets` (authenticated route, not `/demo`).
- Record the starting asset list. If prior dogfood assets exist, delete them first so totals are comparable to the reference figures.

## Phase 2 — Add the eight assets

Each one via `/assets` → Add asset → name, kind, value → Save, then assert the new row appears in the table.

| Name | Kind | Value entered |
|---|---|---|
| MacBook Pro M3 | Other | 700 |
| Seed-round equity | Private equity | 5,000 |
| Gold bars | Precious metal | 9,000 |
| Rolex Submariner | Collectible | 18,000 |
| BMW 5 Series | Vehicle | 28,000 |
| Main Residence | Property | 420,000 |
| Mortgage — Main Residence | Liability | 280,000 (sign comes from the kind) |
| Vanguard ISA | Investment | 61,000 |

Assert after the last save: 8 rows, footer net worth `$261,700`.

## Phase 3 — Add all nine tiles

On `/overview`, open the tile picker and add: Net worth, Timeline, Leverage, Concentration, Liquidity, Since you started, Holdings, Allocation, Own vs owe. Close the picker and assert nine tiles render with no grid holes or overlaps.

## Phase 4 — Verify the numbers against the reference

- Net worth `$261,700`, delta chip present.
- Leverage `34.1%` / Healthy; Concentration `94.0%`; Liquidity `12.9%`.
- Holdings lists all eight in descending value with the mortgage negative.
- Allocation: Property 51%, Liability 34%, Investment 7%, "+5 more".
- Own vs owe: Own `$541,700`, Owe `−$280,000`, Net `$261,700`.
- Timeline renders an axis and a series for "Last 12 months".

Since-you-started (`+$48.3K / +22.6%`) depends on snapshot history, so it is checked for a plausible non-empty value rather than the exact demo figure, and any mismatch is reported rather than forced.

## Phase 5 — Persistence and report

Reload `/overview` and `/assets`; assert tile set, order and all values survive. Capture screenshots at 1440.

Report PASS/FAIL per step with the observed value next to the expected one. Any genuine defect found (wrong maths, failed save, broken picker) is fixed in source and the failing step re-run; test-script races are called out as such with evidence.

## Technical notes

- Playwright scripts under `/tmp/browser/`, session restored from the injected Supabase env vars — no credentials typed.
- Liability values are entered as positive numbers; the sign is applied by the kind.
- No schema or backend config changes; fixes, if needed, stay in frontend source.
