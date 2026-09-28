import { useSearchParams } from "react-router-dom";
import { IconPlus, IconSearch } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { useDataProvider, type AssetKind } from "@/lib/data-provider";
import { useFilters } from "@/lib/filter-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { AssetsTable } from "./components/assets-table";
import { AssetDialog } from "./components/asset-dialog";
import { useCurrency } from "./components/use-currency";
import { kindLabel } from "@/lib/asset-kinds";
import { KIND_OPTIONS } from "./components/kind-meta";

/**
 * Assets list — the full table of every asset and liability row. The user
 * scans, searches, filters by kind, toggles active state, edits, and deletes
 * here. `+ Add asset` is the primary creation entry point. The footer shows the
 * displayed row count and the live portfolio net worth.
 */
export default function Assets() {
  const { useAssets, useOverviewTiles } = useDataProvider();
  const { filters, setFilters, resetFilters } = useFilters();
  const { data: assets, isLoading } = useAssets(filters);
  const { data: tiles } = useOverviewTiles();
  const { format } = useCurrency();
  const [, setParams] = useSearchParams();

  const hasActiveFilters =
    filters.kind !== "all" || filters.search.trim() !== "";

  return (
    <div className="h-full overflow-y-auto">
      {/* The title carries the switcher — with the sidebar deleted this is the
          only route between screens. `+ Add asset` keeps its label rather than
          becoming an icon; whether it should is defect A6, still open. */}
      <PageHeader
        title="Assets"
        actions={
          // ?asset=new, not /assets/new. Adding is a dialog over this list, the
          // way the reference's own add-widget flow is (?createWidget=true) and
          // the way Settings already works here. See asset-dialog.tsx.
          <Button size="sm" onClick={() => setParams({ asset: "new" })}>
            <IconPlus className="size-4" />
            Add asset
          </Button>
        }
      />

      {/* The whole app now sits on the gradient, so this screen's content needs
          an opaque sheet. The tiles are tinted glass with white text; this table is a
          shadcn component whose colours resolve from light-mode tokens.

          Padding on the OUTER div, the 1232 cap on the inner one — the same
          shape BentoCanvas and PageHeader use. With the padding INSIDE the cap
          the sheet was squeezed to 1184 and pushed to x=430, so it sat 24px
          inside the title above it and 24px inside the dashboard's grid. */}
      <div className="px-4 pb-8 sm:px-6">
        <div className="mx-auto w-full max-w-[1232px]">
        <div className="card-sheet p-5">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search assets…"
            className="pl-9"
            aria-label="Search assets"
          />
        </div>

        {/* Kind filter — segmented tabs, not a dropdown. The reference uses
            tabs for exactly this job, and its own teardown says to swap ours
            (cloudkit-teardown.md, "what to steal"). Measured: radius 6,
            height 30, text 15/20 weight 500. Theirs has four; ours has nine, so
            the row scrolls sideways in its own container rather than wrapping
            into two ragged lines.

            Their active fill is #EEEEF2, a light grey — right on their white
            page, invisible on our glass. It uses the tile chip token instead,
            which is the same fill the tiles use for their own pills. */}
        <ToggleGroup
          type="single"
          value={filters.kind}
          onValueChange={(value) =>
            // Radix clears the value when you click the active item; a filter
            // should not be able to have nothing selected, so ignore that.
            value && setFilters({ kind: value as AssetKind | "all" })
          }
          aria-label="Filter by kind"
          className="-mx-1 mt-3 justify-start gap-1 overflow-x-auto px-1 pb-1"
        >
          {(["all", ...KIND_OPTIONS] as const).map((kind) => (
            <ToggleGroupItem
              key={kind}
              value={kind}
              className="h-[30px] shrink-0 rounded-md px-3 text-[15px] font-medium leading-5 text-muted-foreground data-[state=on]:bg-[var(--tile-chip)] data-[state=on]:text-foreground"
            >
              {kind === "all" ? "All kinds" : kindLabel(kind)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* Table */}
        <div className="mt-4">
          <AssetsTable
            assets={assets}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={resetFilters}
          />
        </div>

        {/* Footer — row count + live net worth */}
        {!isLoading && assets.length > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            {assets.length} {assets.length === 1 ? "row" : "rows"} · Net worth:{" "}
            <span className="tabular-nums">{format(tiles.netWorth)}</span>
          </p>
        )}
        </div>
        </div>
      </div>

      {/* Reads ?asset= itself, so a pasted link opens it with no help from
          here — the same contract as SettingsDialog. */}
      <AssetDialog />
    </div>
  );
}
