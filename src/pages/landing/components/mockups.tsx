/**
 * Product mockups for the Asset Tracker landing page.
 *
 * These are static marketing visuals — no live data, no DataProvider hooks.
 * They render inside the browser-chrome frame in the hero and the feature
 * showcase to preview the three product surfaces:
 *   - OverviewMockup   — the green gradient bento canvas (net worth + timeline)
 *   - AssetsMockup     — the full-width asset list with kind badges
 *   - HealthTilesMockup — leverage / concentration / liquidity tiles close-up
 */

/* ── Tab 1: Overview — green gradient bento canvas ───────────────── */

export function OverviewMockup() {
  // 12-month sparkline shape (marketing preview only).
  const points = [18, 26, 22, 34, 30, 42, 46, 40, 54, 60, 66, 78];
  const max = Math.max(...points);

  return (
    <div
      className="flex h-full flex-col gap-4 p-6"
      style={{ background: "linear-gradient(180deg,#446013,#709A28)" }}
    >
      {/* Net worth hero tile */}
      <div className="rounded-xl bg-white/10 p-5 backdrop-blur-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-white/70">
          Net worth
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="font-heading text-4xl font-semibold tabular-nums text-white">
            $261,700
          </span>
          <span className="text-sm font-medium tabular-nums text-white">
            ▲ +$4,200 this month
          </span>
        </div>
      </div>

      {/* Timeline tile */}
      <div className="flex-1 rounded-xl bg-white/10 p-5 backdrop-blur-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-white/70">
          Timeline
        </p>
        <div className="mt-4 flex h-full max-h-[120px] items-end gap-1.5">
          {points.map((p, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-white/40"
              style={{ height: `${(p / max) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Tab 2: Assets — full-width table with kind badges ───────────── */

export function AssetsMockup() {
  const rows = [
    { name: "Main Residence", kind: "Property", value: "$420,000", tint: "bg-primary/15 text-foreground" },
    { name: "Vanguard ISA", kind: "Investment", value: "$61,000", tint: "bg-blue-100 text-blue-700" },
    { name: "BMW 5 Series", kind: "Vehicle", value: "$28,000", tint: "bg-amber-100 text-amber-700" },
    { name: "Rolex Submariner", kind: "Collectible", value: "$18,000", tint: "bg-purple-100 text-purple-700" },
    { name: "Gold bars", kind: "Precious metal", value: "$9,000", tint: "bg-amber-100 text-amber-700" },
    { name: "Mortgage — Main Residence", kind: "Liability", value: "−$280,000", tint: "bg-red-100 text-red-700" },
  ];

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-lg font-semibold text-foreground">Assets</span>
        <div className="h-8 w-40 rounded-md border border-border bg-muted/40" />
      </div>
      <div className="flex items-center gap-6 border-b border-border px-6 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <span className="flex-1">Name</span>
        <span className="w-28">Kind</span>
        <span className="w-24 text-right">Value</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.name}
          className="flex items-center gap-6 border-b border-border px-6 py-3"
        >
          <span className="flex-1 text-sm font-medium text-foreground">
            {row.name}
          </span>
          <span className="w-28">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${row.tint}`}>
              {row.kind}
            </span>
          </span>
          <span className="w-24 text-right text-sm font-semibold tabular-nums text-foreground">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Tab 3: Health tiles — leverage / concentration / liquidity ──── */

export function HealthTilesMockup() {
  const tiles = [
    { label: "Leverage", value: "34.1%", caption: "Liabilities ÷ gross assets" },
    { label: "Concentration", value: "94.0%", caption: "Top 3 assets ÷ total" },
    { label: "Liquidity", value: "12.9%", caption: "Liquid ÷ total assets" },
  ];

  return (
    <div className="flex h-full items-center bg-card p-6">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-xl border border-border bg-background p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {tile.label}
            </p>
            <p className="mt-3 font-heading text-3xl font-semibold tabular-nums text-foreground">
              {tile.value}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: tile.value }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{tile.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
