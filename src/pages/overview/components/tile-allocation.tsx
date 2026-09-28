import { useMemo } from "react";
import { IconChartPie } from "@tabler/icons-react";
import { useDataProvider, type AssetKind } from "@/lib/data-provider";
import { TileShell, type TileChromeProps } from "./tile-shell";
import { useCurrency } from "./use-currency";
import { KIND_META } from "./kinds";

/**
 * Allocation — a stacked composition bar subdivided by asset kind.
 *
 *   Small   the largest slice, and the bar
 *   Medium  the bar + a legend of the top 3
 *   Large   the bar + every kind, with values
 *
 * A stacked bar rather than a donut: it scales past five kinds without
 * crowding, and it can show liabilities in the same structure instead of
 * needing a second, negative ring.
 */
export function TileAllocation( chrome: TileChromeProps = {} ) {
  const size = chrome.size ?? "medium";
  const { useOverviewTiles } = useDataProvider();
  const { data: tiles } = useOverviewTiles();
  const { format } = useCurrency();

  const segments = useMemo( () => {
    const entries = Object.entries( tiles.allocationByKind ) as [
      AssetKind,
      number,
    ][];
    const total = entries.reduce( ( s, [ , v ] ) => s + v, 0 );
    return entries
      .filter( ( [ , v ] ) => v > 0 )
      .map( ( [ kind, value ] ) => ( {
        kind,
        value,
        pct: total > 0 ? ( value / total ) * 100 : 0,
        ...KIND_META[ kind ],
      } ) )
      .sort( ( a, b ) => b.value - a.value );
  }, [ tiles.allocationByKind ] );

  if ( segments.length === 0 ) {
    return (
      <TileShell { ...chrome } label="Allocation" icon={ IconChartPie }>
        <p className="mt-2 text-sm text-[var(--tile-muted)]">No assets yet.</p>
      </TileShell>
    );
  }

  const top = segments[ 0 ];
  const legend = size === "large" ? segments : segments.slice( 0, 3 );

  const bar = (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--tile-track)]">
      { segments.map( ( seg ) => (
        <div
          key={ seg.kind }
          style={ { width: `${ seg.pct }%`, background: seg.color } }
          title={ `${ seg.label } ${ Math.round( seg.pct ) }%` }
        />
      ) ) }
    </div>
  );

  if ( size === "small" ) {
    return (
      <TileShell { ...chrome } label="Allocation" icon={ IconChartPie }>
        <span className="metric">
          { Math.round( top.pct ) }%
        </span>
        <span className="truncate text-xs text-[var(--tile-muted)]">
          { top.label }
        </span>
        <div className="mt-auto">{ bar }</div>
      </TileShell>
    );
  }

  return (
    <TileShell { ...chrome } label="Allocation" icon={ IconChartPie }>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <span className="metric">
          { top.label } { Math.round( top.pct ) }%
        </span>
        { bar }

        { size === "large" ? (
          // A real list at Large: every kind, with what it is worth. The
          // wrapping chip legend cannot carry values without becoming soup.
          <div className="-mr-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-2">
            { legend.map( ( seg ) => (
              <div key={ seg.kind } className="flex items-baseline justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={ { background: seg.color } }
                  />
                  <span
                    className={ `truncate text-xs ${
                      seg.kind === "liability"
                        ? "text-[var(--tile-neg)]"
                        : "text-[var(--tile-muted)]"
                    }` }
                  >
                    { seg.label }
                  </span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-[var(--tile-muted)]">
                  { Math.round( seg.pct ) }% · { format( seg.value ) }
                </span>
              </div>
            ) ) }
          </div>
        ) : (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            { legend.map( ( seg ) => (
              <li key={ seg.kind } className="flex items-center gap-1.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={ { background: seg.color } }
                />
                <span
                  className={
                    seg.kind === "liability"
                      ? "text-[var(--tile-neg)]"
                      : "text-[var(--tile-fg)]"
                  }
                >
                  { seg.label } { Math.round( seg.pct ) }%
                </span>
              </li>
            ) ) }
            { segments.length > 3 && (
              <li className="text-[var(--tile-muted)]">
                +{ segments.length - 3 } more
              </li>
            ) }
          </ul>
        ) }
      </div>
    </TileShell>
  );
}
