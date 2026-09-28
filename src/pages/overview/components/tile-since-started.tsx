import { useMemo } from "react";
import { IconTrendingUp } from "@tabler/icons-react";
import { Line, LineChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useDataProvider } from "@/lib/data-provider";
import { TileShell, type TileChromeProps } from "./tile-shell";
import { useCurrency } from "./use-currency";
import { FULL_HISTORY, parseRange, sliceToRange } from "./tile-time-range";

const chartConfig: ChartConfig = {
  net_worth: { label: "Net worth", color: "var(--tile-series)" },
};

function shortDate( date: string ): string {
  return new Date( date + "T00:00:00" ).toLocaleString( "en-US", {
    month: "short",
    year: "2-digit",
  } );
}

/**
 * Since you started — the gain from the first snapshot to the latest.
 *
 *   Small   the figure + a sparkline that bleeds to both edges
 *   Medium  the same + the dates the range covers
 *   Large   the same + the first and last values, so the sparkline has a scale
 */
export function TileSinceStarted( chrome: TileChromeProps = {} ) {
  const size = chrome.size ?? "medium";
  const { useNetWorthSnapshots } = useDataProvider();
  const { data: snapshots } = useNetWorthSnapshots( FULL_HISTORY );
  const { formatSigned, formatSignedCompact, format } = useCurrency();

  const { gain, pct, points, first, last } = useMemo( () => {
    const windowed = sliceToRange( snapshots, parseRange( chrome.range ) );
    if ( windowed.length === 0 ) {
      return {
        gain: 0,
        pct: 0,
        points: [] as { net_worth: number }[],
        first: null as ( typeof windowed )[ number ] | null,
        last: null as ( typeof windowed )[ number ] | null,
      };
    }
    const a = windowed[ 0 ];
    const b = windowed[ windowed.length - 1 ];
    return {
      gain: b.net_worth - a.net_worth,
      pct:
        a.net_worth !== 0
          ? ( ( b.net_worth - a.net_worth ) / Math.abs( a.net_worth ) ) * 100
          : 0,
      points: windowed.map( ( s ) => ( { net_worth: s.net_worth } ) ),
      first: a,
      last: b,
    };
  }, [ snapshots, chrome.range ] );

  return (
    <TileShell
      { ...chrome }
      label="Since you started"
      icon={ IconTrendingUp }
      // Small bleeds the sparkline to both edges, as the reference's small
      // charts do.
      className={ size === "small" ? "pb-0 pl-0 pr-0" : undefined }
    >
      <div className={ size === "small" ? "px-5" : "" }>
        {/* Small stacks the percentage UNDER the figure, as the reference's
            small does (teardown §2: metric at y=45, delta on its own line at
            y=86). Side by side, "+$48.3K (+22.6%)" ran 34px past a 192px
            tile — the 34px metric plus a second number never fits one line. */}
        <div
          className={
            size === "small"
              ? "flex flex-col"
              : "flex items-baseline gap-2"
          }
        >
          <span className="metric">
            { size === "small" ? formatSignedCompact( gain ) : formatSigned( gain ) }
          </span>
          <span className="text-sm tabular-nums text-[var(--tile-muted)]">
            ({ pct >= 0 ? "+" : "" }
            { pct.toFixed( 1 ) }%)
          </span>
        </div>

        { size !== "small" && first && last && (
          <p className="mt-1 text-xs text-[var(--tile-muted)]">
            { shortDate( first.date ) } to { shortDate( last.date ) }
          </p>
        ) }
      </div>

      { points.length > 0 && (
        <div className="mt-auto">
          <ChartContainer
            config={ chartConfig }
            className="w-full"
            // Medium also carries a date line, so its chart is shorter than
            // Small's — 52px there overflowed the tile by 4px.
            style={ { height: size === "large" ? 120 : size === "medium" ? 40 : 52 } }
          >
            <LineChart
              data={ points }
              margin={
                size === "small"
                  ? { top: 4, right: 0, left: 0, bottom: 0 }
                  : { top: 4, right: 4, left: 4, bottom: 4 }
              }
            >
              <Line
                dataKey="net_worth"
                type="monotone"
                stroke="var(--tile-series)"
                strokeWidth={ 2 }
                dot={ false }
              />
            </LineChart>
          </ChartContainer>

          {/* Large gives the sparkline a scale — without end values a bare
              line says the shape but not the size. */}
          { size === "large" && first && last && (
            <div className="flex justify-between px-1 pt-2 text-xs tabular-nums text-[var(--tile-muted)]">
              <span>{ format( first.net_worth ) }</span>
              <span>{ format( last.net_worth ) }</span>
            </div>
          ) }
        </div>
      ) }
    </TileShell>
  );
}
