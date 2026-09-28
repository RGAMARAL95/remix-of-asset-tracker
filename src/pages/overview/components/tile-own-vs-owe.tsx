import { useMemo } from "react";
import { IconScale } from "@tabler/icons-react";
import { useDataProvider } from "@/lib/data-provider";
import { TileShell, type TileChromeProps } from "./tile-shell";
import { useCurrency } from "./use-currency";
import { kindLabel } from "./kinds";

/**
 * Own vs owe — the net worth equation.
 *
 *   Small   the net figure alone
 *   Medium  own / owe / net, and the split bar
 *   Large   the same, plus what makes up each side, by kind
 */
export function TileOwnVsOwe( chrome: TileChromeProps = {} ) {
  const size = chrome.size ?? "medium";
  const { useOverviewTiles } = useDataProvider();
  const { data: tiles } = useOverviewTiles();
  const { format } = useCurrency();

  const { totalAssets, totalLiabilities, netWorth } = tiles;
  const gross = totalAssets + totalLiabilities;
  const ownPct = gross > 0 ? ( totalAssets / gross ) * 100 : 50;
  const owePct = gross > 0 ? ( totalLiabilities / gross ) * 100 : 0;

  /** Large only: each side broken down by kind, biggest first. */
  const byKind = useMemo( () => {
    const totals = new Map<string, { value: number; owed: boolean }>();
    for ( const a of tiles.holdingsSorted ) {
      const owed = a.kind === "liability";
      const prev = totals.get( a.kind );
      totals.set( a.kind, { value: ( prev?.value ?? 0 ) + a.value, owed } );
    }
    return [ ...totals.entries() ]
      .map( ( [ kind, v ] ) => ( { kind, ...v } ) )
      .sort( ( a, b ) => b.value - a.value );
  }, [ tiles.holdingsSorted ] );

  if ( size === "small" ) {
    return (
      <TileShell { ...chrome } label="Own vs owe" icon={ IconScale }>
        <span className="metric">
          { format( netWorth ) }
        </span>
        <div className="mt-auto flex h-2 w-full gap-1 overflow-hidden rounded-full">
          <div style={ { width: `${ ownPct }%`, background: "var(--tile-pos)" } } />
          <div style={ { width: `${ owePct }%`, background: "var(--tile-neg)" } } />
        </div>
      </TileShell>
    );
  }

  return (
    <TileShell { ...chrome } label="Own vs owe" icon={ IconScale }>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-[var(--tile-muted)]">Own</span>
          <span className="text-lg font-semibold tabular-nums text-[var(--tile-pos)]">
            { format( totalAssets ) }
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2 border-t border-[var(--tile-line)] pt-1.5">
          <span className="text-xs text-[var(--tile-muted)]">Owe</span>
          <span className="text-lg font-semibold tabular-nums text-[var(--tile-neg)]">
            −{ format( totalLiabilities ) }
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2 border-t border-[var(--tile-line)] pt-1.5">
          <span className="text-xs text-[var(--tile-muted)]">Net</span>
          <span className="text-lg font-semibold tabular-nums">
            { format( netWorth ) }
          </span>
        </div>
      </div>

      {/* Both segments were hardcoded pale rgba, picked to sit on the green
          gradient. They now follow the surface. */}
      <div
        className={ `flex h-2 w-full gap-1 overflow-hidden rounded-full ${
          size === "large" ? "" : "mt-auto"
        }` }
      >
        <div style={ { width: `${ ownPct }%`, background: "var(--tile-pos)" } } />
        <div style={ { width: `${ owePct }%`, background: "var(--tile-neg)" } } />
      </div>

      { size === "large" && (
        <div className="-mr-2 mt-2 flex flex-1 flex-col gap-2 overflow-y-auto pr-2">
          { byKind.length === 0 ? (
            <span className="text-xs text-[var(--tile-muted)]">No data</span>
          ) : (
            byKind.map( ( k ) => (
              <div key={ k.kind } className="flex items-baseline justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={ {
                      background: k.owed ? "var(--tile-neg)" : "var(--tile-pos)",
                    } }
                  />
                  <span className="truncate text-xs text-[var(--tile-muted)]">
                    { kindLabel( k.kind as never ) }
                  </span>
                </span>
                <span
                  className={ `shrink-0 text-xs tabular-nums ${
                    k.owed ? "text-[var(--tile-neg)]" : "text-[var(--tile-muted)]"
                  }` }
                >
                  { k.owed ? "−" : "" }
                  { format( k.value ) }
                </span>
              </div>
            ) )
          ) }
        </div>
      ) }
    </TileShell>
  );
}
