import { useMemo } from "react";
import { IconCurrencyDollar, IconTrendingUp } from "@tabler/icons-react";
import { Area, AreaChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useDataProvider } from "@/lib/data-provider";
import { TileShell, type TileChromeProps } from "./tile-shell";
import { useCurrency } from "./use-currency";
import { useCountUp } from "./use-count-up";
import { FULL_HISTORY, parseRange, sliceToRange } from "./tile-time-range";

const chartConfig: ChartConfig = {
  net_worth: { label: "Net worth", color: "var(--tile-series)" },
};

/**
 * Net worth — one number, with a count-up on mount.
 *
 *   Small   the figure alone
 *   Medium  the figure + this month's change
 *   Large   the figure + the change + an area chart (Q5)
 *
 * Large deliberately overlaps the Timeline tile. A composed dashboard does not
 * have to prevent redundancy the way a fixed one does — nobody is forced to add
 * both, and wanting the headline number and the shape of the year in one tile
 * is a reasonable thing to want.
 */
export function TileNetWorth( chrome: TileChromeProps = {} ) {
  const size = chrome.size ?? "medium";
  const { useOverviewTiles, useNetWorthSnapshots } = useDataProvider();
  const { data: tiles } = useOverviewTiles();
  const { data: snapshots } = useNetWorthSnapshots( FULL_HISTORY );
  const { format, formatCompact, formatSigned } = useCurrency();

  const animated = useCountUp( tiles.netWorth );

  const monthlyDelta =
    snapshots.length >= 2
      ? snapshots[ snapshots.length - 1 ].net_worth -
        snapshots[ snapshots.length - 2 ].net_worth
      : null;

  const points = useMemo( () => {
    if ( size !== "large" ) return [];
    return sliceToRange(
      snapshots.map( ( s ) => ( { date: s.date, net_worth: s.net_worth } ) ),
      parseRange( chrome.range )
    );
  }, [ size, snapshots, chrome.range ] );

  return (
    <TileShell { ...chrome } label="Net worth" icon={ IconCurrencyDollar }>
      <div className={ size === "large" ? "flex flex-col gap-2" : "mt-auto flex flex-col gap-2" }>
        {/* One size at every tile size — the reference's rule. A 192px tile
            cannot hold "$261,700" at 34px, so Small abbreviates the VALUE
            rather than shrinking the type, which is what the reference does
            with "1.123K". */}
        <span className="metric">
          { size === "small" ? formatCompact( animated ) : format( animated ) }
        </span>

        { size !== "small" &&
          ( monthlyDelta !== null && monthlyDelta !== 0 ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--tile-chip)] px-2.5 py-1 text-xs font-medium tabular-nums text-[var(--tile-fg)]">
              <IconTrendingUp className="size-3.5" />
              { formatSigned( monthlyDelta ) } this month
            </span>
          ) : (
            <span className="text-xs text-[var(--tile-muted)]">— this month</span>
          ) ) }
      </div>

      { size === "large" && (
        <div className="mt-auto">
          { points.length < 2 ? (
            <div className="flex h-[150px] items-center justify-center">
              <div className="w-full border-t border-dashed border-[var(--tile-line)] pt-3 text-center text-sm text-[var(--tile-muted)]">
                Add assets to see it grow
              </div>
            </div>
          ) : (
            // No axes: the figure above already says what the numbers are, and
            // the chart is here for the shape. Axes are the Timeline tile's job.
            <ChartContainer config={ chartConfig } className="h-[150px] w-full">
              <AreaChart data={ points } margin={ { top: 4, right: 0, left: 0, bottom: 0 } }>
                <defs>
                  <linearGradient id="fillNetWorthTile" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--tile-series)" stopOpacity={ 0.3 } />
                    <stop offset="100%" stopColor="var(--tile-series)" stopOpacity={ 0 } />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="net_worth"
                  type="monotone"
                  stroke="var(--tile-series)"
                  strokeWidth={ 2 }
                  fill="url(#fillNetWorthTile)"
                />
              </AreaChart>
            </ChartContainer>
          ) }
        </div>
      ) }
    </TileShell>
  );
}
