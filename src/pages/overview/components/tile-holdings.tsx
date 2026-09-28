import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IconList } from "@tabler/icons-react";
import { useDataProvider } from "@/lib/data-provider";
import { TileShell, type TileChromeProps } from "./tile-shell";
import { useCurrency } from "./use-currency";

/**
 * Holdings — every active asset, biggest first. Clicking a row drills into the
 * asset editor, which is the only clickable thing on the whole dashboard.
 *
 *   Small   how many, and the largest one
 *   Medium  the top 3 rows
 *   Large   the full ranked list, scrolling
 */
export function TileHoldings( chrome: TileChromeProps = {} ) {
  const size = chrome.size ?? "large";
  const { useOverviewTiles } = useDataProvider();
  const { data: tiles } = useOverviewTiles();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const base = pathname.startsWith( "/demo" ) ? "/demo/assets" : "/assets";

  const all = tiles.holdingsSorted;
  const rows = size === "large" ? all : size === "medium" ? all.slice( 0, 3 ) : [];
  const totalShare = useMemo(
    () => all.reduce( ( s, a ) => s + a.value, 0 ),
    [ all ]
  );

  if ( all.length === 0 ) {
    return (
      <TileShell { ...chrome } label="Holdings" icon={ IconList }>
        <p className="mt-2 text-sm text-[var(--tile-muted)]">No assets yet.</p>
      </TileShell>
    );
  }

  if ( size === "small" ) {
    const largest = all[ 0 ];
    return (
      <TileShell { ...chrome } label="Holdings" icon={ IconList }>
        <span className="metric">{ all.length }</span>
        <div className="mt-auto flex flex-col gap-0.5">
          <span className="truncate text-xs text-[var(--tile-muted)]">
            Largest: { largest.name }
          </span>
          <span className="text-sm font-medium tabular-nums">
            { largest.kind === "liability" ? "−" : "" }
            { format( largest.value ) }
          </span>
        </div>
      </TileShell>
    );
  }

  return (
    <TileShell { ...chrome } label="Holdings" icon={ IconList }>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        { rows.map( ( asset ) => {
          const isLiability = asset.kind === "liability";
          const pct = totalShare > 0 ? ( asset.value / totalShare ) * 100 : 0;
          return (
            // A native button on purpose: this is a two-line block with a
            // progress bar inside it, and Button's height and padding rules
            // fight that. Everything button-shaped uses the Button component.
            <button
              key={ asset.id }
              type="button"
              onClick={ () => navigate( `${ base }/${ asset.id }` ) }
              className="group -mx-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-[var(--tile-track)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium">{ asset.name }</span>
                <span className="shrink-0 text-sm tabular-nums">
                  { isLiability ? "−" : "" }
                  { format( asset.value ) }
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--tile-track)]">
                {/* The own-asset fill was rgba white at 35%, invisible on a
                    white tile. Both sides now follow the surface. */}
                <div
                  className="h-full rounded-full"
                  style={ {
                    width: `${ Math.max( pct, 2 ) }%`,
                    background: isLiability
                      ? "var(--tile-neg)"
                      : "var(--tile-fill)",
                  } }
                />
              </div>
            </button>
          );
        } ) }

        { size === "medium" && all.length > 3 && (
          <button
            type="button"
            onClick={ () => navigate( base ) }
            className="-mx-2 rounded-xl px-2 py-1 text-left text-xs text-[var(--tile-muted)] hover:text-[var(--tile-fg)]"
          >
            { all.length - 3 } more
          </button>
        ) }
      </div>
    </TileShell>
  );
}
