import { useMemo } from "react";
import { IconChartLine } from "@tabler/icons-react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDataProvider } from "@/lib/data-provider";
import { TileShell, type TileChromeProps } from "./tile-shell";
import { useCurrency } from "./use-currency";
import { FULL_HISTORY, parseRange, sliceToRange } from "./tile-time-range";

const chartConfig: ChartConfig = {
  net_worth: { label: "Net worth", color: "var(--tile-series)" },
};

function monthLabel( date: string ): string {
  // date is an ISO day string (e.g. "2024-03-31"); format to "Mar".
  return new Date( date + "T00:00:00" ).toLocaleString( "en-US", { month: "short" } );
}

/**
 * Timeline — net worth over the chosen range.
 *
 *   Small   a bare sparkline, no axes, bleeding to both edges
 *   Medium  the chart with month labels along the bottom
 *   Large   full axes, both scales, and a tooltip
 *
 * Small deliberately looks like the Since-you-started tile. Same call as Q4 and
 * Q5: a composed dashboard does not prevent redundancy, because nobody is made
 * to add both.
 *
 * The range now comes from the tile's own control rather than a hard-coded 12
 * months. Note the query still asks for the full history and slices in memory —
 * seed snapshots are anchored to 2024, so a today-relative window would render
 * every demo chart empty.
 */
export function TileTimeline( chrome: TileChromeProps = {} ) {
  const size = chrome.size ?? "large";
  const { useNetWorthSnapshots } = useDataProvider();
  const { data: snapshots } = useNetWorthSnapshots( FULL_HISTORY );
  const { formatCompact, format } = useCurrency();

  const points = useMemo(
    () =>
      sliceToRange(
        snapshots.map( ( s ) => ( {
          month: monthLabel( s.date ),
          net_worth: s.net_worth,
        } ) ),
        parseRange( chrome.range )
      ),
    [ snapshots, chrome.range ]
  );

  const hasData = points.length > 0;
  const chartHeight = size === "small" ? 70 : size === "medium" ? 110 : 240;

  if ( !hasData ) {
    return (
      <TileShell { ...chrome } label="Timeline" icon={ IconChartLine }>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full border-t border-dashed border-[var(--tile-line)] pt-3 text-center text-sm text-[var(--tile-muted)]">
            Add assets to see your timeline grow
          </div>
        </div>
      </TileShell>
    );
  }

  return (
    <TileShell
      { ...chrome }
      label="Timeline"
      icon={ IconChartLine }
      // Small bleeds its chart to both edges — that break is deliberate, and is
      // why a small tile's sparkline feels different from a big tile's chart.
      className={ size === "small" ? "pb-0 pl-0 pr-0" : undefined }
    >
      <div className={ size === "small" ? "mt-auto" : "mt-auto" }>
        <ChartContainer
          config={ chartConfig }
          className="w-full [&_.recharts-cartesian-axis-tick_text]:fill-[var(--tile-muted)]"
          style={ { height: chartHeight } }
        >
          <AreaChart
            data={ points }
            margin={
              size === "small"
                ? { top: 4, right: 0, left: 0, bottom: 0 }
                : { top: 8, right: 8, left: 8, bottom: 0 }
            }
          >
            <defs>
              <linearGradient id="fillNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--tile-series)" stopOpacity={ 0.3 } />
                <stop offset="100%" stopColor="var(--tile-series)" stopOpacity={ 0 } />
              </linearGradient>
            </defs>

            { size !== "small" && (
              <XAxis
                dataKey="month"
                tickLine={ false }
                axisLine={ false }
                tickMargin={ 8 }
                fontSize={ 11 }
                // Medium is 400px wide: every month label would collide, so
                // show every other one. Large is 400px on the lattice but goes
                // fluid (~300px) on a phone, where all twelve months ran
                // together — preserveStartEnd + a gap drops the ones that
                // would touch instead of printing "JanFebMar".
                interval={ size === "medium" ? 1 : "preserveStartEnd" }
                minTickGap={ 6 }

              />
            ) }

            { size === "large" && (
              <YAxis
                tickLine={ false }
                axisLine={ false }
                width={ 48 }
                fontSize={ 11 }
                tickFormatter={ ( v: number ) => formatCompact( v ) }
              />
            ) }

            { size === "large" && (
              <ChartTooltip
                cursor={ { stroke: "var(--tile-line)" } }
                content={
                  <ChartTooltipContent
                    className="text-foreground"
                    formatter={ ( value ) => format( Number( value ) ) }
                  />
                }
              />
            ) }

            <Area
              dataKey="net_worth"
              type="monotone"
              stroke="var(--tile-series)"
              strokeWidth={ 2 }
              fill="url(#fillNetWorth)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </TileShell>
  );
}
