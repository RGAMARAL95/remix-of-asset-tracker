import { useMemo } from "react";
import { IconPercentage } from "@tabler/icons-react";
import { useDataProvider } from "@/lib/data-provider";
import { TileShell, type TileChromeProps } from "./tile-shell";
import { FULL_HISTORY, sliceToRange, parseRange } from "./tile-time-range";

function zoneLabel( pct: number ): string {
  if ( pct === 0 ) return "No debt";
  if ( pct < 40 ) return "Healthy";
  if ( pct < 60 ) return "Caution";
  return "High";
}

/**
 * Leverage — what you owe as a share of what you own, over a three-zone scale.
 *
 *   Small   the percentage and its zone, no bar (192px cannot hold both)
 *   Medium  percentage + the zone bar with a marker + the zone name
 *   Large   the same, plus how the ratio has moved over the chosen range
 */
export function TileLeverage( chrome: TileChromeProps = {} ) {
  const size = chrome.size ?? "medium";
  const { useOverviewTiles, useNetWorthSnapshots } = useDataProvider();
  const { data: tiles } = useOverviewTiles();
  const { data: snapshots } = useNetWorthSnapshots( FULL_HISTORY );

  const pct = tiles.leverage;
  const marker = Math.min( Math.max( pct, 0 ), 100 );

  /** Large only: leverage per snapshot, which the raw totals already give us. */
  const history = useMemo( () => {
    if ( size !== "large" ) return [];
    const points = snapshots.map( ( s ) => ( {
      date: s.date,
      pct: s.total_assets > 0 ? ( s.total_liabilities / s.total_assets ) * 100 : 0,
    } ) );
    return sliceToRange( points, parseRange( chrome.range ) );
  }, [ size, snapshots, chrome.range ] );

  const peak = Math.max( 100, ...history.map( ( h ) => h.pct ) );

  return (
    <TileShell { ...chrome } label="Leverage" icon={ IconPercentage }>
      <span className="metric">
        { pct.toFixed( 1 ) }%
      </span>

      { size === "small" ? (
        <span className="mt-auto text-xs text-[var(--tile-muted)]">
          { zoneLabel( pct ) }
        </span>
      ) : (
        <>
          <div className={ size === "large" ? "flex flex-col gap-1.5" : "mt-auto flex flex-col gap-1.5" }>
            <div className="relative h-2 w-full overflow-hidden rounded-full">
              <div className="absolute inset-0 flex">
                <div className="h-full w-[40%] bg-[#7CB342]" />
                <div className="h-full w-[20%] bg-[#E8B04B]" />
                <div className="h-full w-[40%] bg-[#E07A5F]" />
              </div>
              <div
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--tile-fill)] bg-white"
                style={ { left: `${ marker }%` } }
              />
            </div>
            <span className="text-xs text-[var(--tile-muted)]">{ zoneLabel( pct ) }</span>
          </div>

          { size === "large" && (
            <div className="mt-2 flex flex-1 flex-col justify-end gap-2">
              <span className="text-xs text-[var(--tile-muted)]">
                How it has moved
              </span>
              { history.length < 2 ? (
                <span className="text-xs text-[var(--tile-muted)]">
                  Not enough history yet
                </span>
              ) : (
                <div className="flex h-24 items-end gap-[3px]">
                  { history.map( ( h ) => (
                    <div
                      key={ h.date }
                      title={ `${ h.date }: ${ h.pct.toFixed( 1 ) }%` }
                      className="min-w-[3px] flex-1 rounded-sm bg-[var(--tile-fill)]"
                      style={ { height: `${ Math.max( ( h.pct / peak ) * 100, 2 ) }%` } }
                    />
                  ) ) }
                </div>
              ) }
            </div>
          ) }
        </>
      ) }
    </TileShell>
  );
}
