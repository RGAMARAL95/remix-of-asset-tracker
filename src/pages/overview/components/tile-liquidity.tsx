import { useMemo } from "react";
import { IconDroplet } from "@tabler/icons-react";
import { useDataProvider } from "@/lib/data-provider";
import { LIQUID_KINDS } from "@/lib/liquidity";
import { TileShell, type TileChromeProps } from "./tile-shell";
import { useCurrency } from "./use-currency";
import { kindLabel } from "./kinds";

/**
 * Liquidity — liquid assets (investments + precious metals) as a share of the
 * total.
 *
 *   Small   the percentage alone
 *   Medium  percentage + the split bar + value labels
 *   Large   the same, plus which kinds make up each side
 */
export function TileLiquidity( chrome: TileChromeProps = {} ) {
  const size = chrome.size ?? "medium";
  const { useOverviewTiles } = useDataProvider();
  const { data: tiles } = useOverviewTiles();
  const { formatCompact, format } = useCurrency();

  const illiquidValue = Math.max( tiles.totalAssets - tiles.liquidValue, 0 );
  const liquidPct = tiles.liquidity;
  const illiquidPct = tiles.totalAssets > 0 ? 100 - liquidPct : 0;

  /** Large only: the kinds behind each side, biggest first. */
  const byKind = useMemo( () => {
    const totals = new Map<string, { value: number; liquid: boolean }>();
    for ( const a of tiles.holdingsSorted ) {
      if ( a.kind === "liability" ) continue;
      const prev = totals.get( a.kind );
      totals.set( a.kind, {
        value: ( prev?.value ?? 0 ) + a.value,
        liquid: LIQUID_KINDS.includes( a.kind ),
      } );
    }
    return [ ...totals.entries() ]
      .map( ( [ kind, v ] ) => ( { kind, ...v } ) )
      .sort( ( a, b ) => b.value - a.value );
  }, [ tiles.holdingsSorted ] );

  return (
    <TileShell { ...chrome } label="Liquidity" icon={ IconDroplet }>
      <span className="metric">
        { liquidPct.toFixed( 1 ) }%
      </span>

      { size === "small" ? (
        <span className="mt-auto text-xs text-[var(--tile-muted)]">
          Of your assets is liquid
        </span>
      ) : (
        <>
          <div className={ size === "large" ? "flex flex-col gap-2" : "mt-auto flex flex-col gap-2" }>
            <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full bg-[var(--tile-track)]">
              <div style={ { width: `${ liquidPct }%`, background: "var(--tile-fill)" } } />
              {/* Was a hardcoded rgba white — invisible on a white tile. */}
              <div style={ { width: `${ illiquidPct }%`, background: "var(--tile-track)" } } />
            </div>
            <div className="flex justify-between text-xs text-[var(--tile-muted)]">
              <span className="tabular-nums">
                Liquid { formatCompact( tiles.liquidValue ) }
              </span>
              <span className="tabular-nums">
                Illiquid { formatCompact( illiquidValue ) }
              </span>
            </div>
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
                          background: k.liquid
                            ? "var(--tile-fill)"
                            : "var(--tile-track)",
                        } }
                      />
                      <span className="truncate text-xs text-[var(--tile-muted)]">
                        { kindLabel( k.kind as never ) }
                      </span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-[var(--tile-muted)]">
                      { format( k.value ) }
                    </span>
                  </div>
                ) )
              ) }
            </div>
          ) }
        </>
      ) }
    </TileShell>
  );
}
