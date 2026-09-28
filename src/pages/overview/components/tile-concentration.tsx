import { useMemo } from "react";
import { IconFocus2 } from "@tabler/icons-react";
import { useDataProvider } from "@/lib/data-provider";
import { TileShell, type TileChromeProps } from "./tile-shell";
import { useCurrency } from "./use-currency";

/**
 * Concentration — the top-3 own assets as a share of total assets.
 *
 * Bigger never means the same thing stretched; it means more of the thing:
 *   Small   the percentage alone
 *   Medium  percentage + a mini share-bar for each of the top 3
 *   Large   percentage + the full ranked list with values
 */
export function TileConcentration( chrome: TileChromeProps = {} ) {
  const size = chrome.size ?? "medium";
  const { useOverviewTiles } = useDataProvider();
  const { data: tiles } = useOverviewTiles();
  const { format } = useCurrency();

  const owned = useMemo(
    () => tiles.holdingsSorted.filter( ( a ) => a.kind !== "liability" ),
    [ tiles.holdingsSorted ]
  );

  const shown = size === "large" ? owned : owned.slice( 0, 3 );
  const share = ( value: number ) =>
    tiles.totalAssets > 0 ? ( value / tiles.totalAssets ) * 100 : 0;

  return (
    <TileShell { ...chrome } label="Concentration" icon={ IconFocus2 }>
      <span className="metric">
        { tiles.concentration.toFixed( 1 ) }%
      </span>

      { size === "small" ? (
        <span className="mt-auto text-xs text-[var(--tile-muted)]">
          Top 3 of your assets
        </span>
      ) : owned.length === 0 ? (
        <div className="mt-auto flex flex-col gap-2">
          { [ 0, 1, 2 ].map( ( i ) => (
            <div key={ i } className="h-1.5 w-full rounded-full bg-[var(--tile-track)]" />
          ) ) }
        </div>
      ) : (
        <div
          className={
            size === "large"
              ? "-mr-2 flex flex-1 flex-col gap-3 overflow-y-auto pr-2"
              : "mt-auto flex flex-col gap-2"
          }
        >
          { shown.map( ( asset ) => (
            <div
              key={ asset.id }
              className={
                size === "large"
                  ? "flex flex-col gap-1"
                  : // One line at Medium: name, then the bar taking the rest.
                    // text-xs goes on the ROW, not just the span inside it —
                    // otherwise the wrapper keeps the tile's line-height and
                    // each row is 24px instead of 16px, which overflowed.
                    "flex items-center gap-2 text-xs leading-4"
              }
            >
              <div
                className={
                  size === "large"
                    ? "flex items-baseline justify-between gap-2"
                    : "min-w-0 max-w-[45%] shrink overflow-hidden"
                }
              >
                <span className="block min-w-0 truncate text-xs text-[var(--tile-muted)]">
                  { asset.name }
                </span>

                { size === "large" && (
                  <span className="shrink-0 text-xs tabular-nums text-[var(--tile-muted)]">
                    { format( asset.value ) }
                  </span>
                ) }
              </div>
              {/* The fill used to use --tile-track, the same variable as the
                  track behind it, so the bar was invisible. */}
              <div
                className={ `h-1.5 overflow-hidden rounded-full bg-[var(--tile-track)] ${
                  size === "large" ? "w-full" : "min-w-0 flex-1"
                }` }
              >
                <div
                  className="h-full rounded-full bg-[var(--tile-fill)]"
                  style={ { width: `${ Math.max( share( asset.value ), 2 ) }%` } }
                />
              </div>
            </div>
          ) ) }
        </div>
      ) }
    </TileShell>
  );
}
