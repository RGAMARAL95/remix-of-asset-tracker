import type { SnapshotFilters } from "@/lib/data-provider";

/**
 * The time range belongs to the TILE, not the page — the reference's rule. Two
 * tiles on one dashboard may disagree about the period they show.
 *
 * Store the TOKEN, never the dates. The options are relative ("Last 3 months"),
 * so persisting `{ startDate, endDate }` would freeze each tile's window at
 * whatever day it was saved.
 */

export type RangeToken = "3m" | "12m" | "all";

export const RANGE_TOKENS: readonly RangeToken[] = [ "3m", "12m", "all" ] as const;

/**
 * Months, not days. The reference offers Today / Last Week / Last 30 Days
 * because it watches live server traffic; our history is sampled monthly, so a
 * day-scale window would be empty. Same control, same place, different options
 * — a content difference, not a pattern one.
 */
export const RANGE_LABEL: Record<RangeToken, string> = {
  "3m": "Last 3 months",
  "12m": "Last 12 months",
  all: "All time",
};

export const DEFAULT_RANGE: RangeToken = "12m";

/** How many monthly points a token asks for. `null` means everything. */
export const RANGE_MONTHS: Record<RangeToken, number | null> = {
  "3m": 3,
  "12m": 12,
  all: null,
};

/**
 * Always query the full history and slice client-side.
 *
 * `snapshot-range.ts` records why: seed snapshots are anchored to 2024, so a
 * today-relative window renders every demo chart empty. Rather than make that
 * bug reachable through a new control, the range narrows the points we draw,
 * not the rows we ask for. Personal net-worth history is at most a few hundred
 * monthly rows, so there is nothing to gain by filtering in the query.
 */
export const FULL_HISTORY: SnapshotFilters = {
  startDate: "2000-01-01",
  endDate: "2100-01-01",
};

/** Keep the last N monthly points for a token. */
export function sliceToRange<T>( points: T[], token: RangeToken ): T[] {
  const months = RANGE_MONTHS[ token ];
  return months === null ? points : points.slice( -months );
}

export function parseRange( value: unknown ): RangeToken {
  return ( RANGE_TOKENS as readonly unknown[] ).includes( value )
    ? ( value as RangeToken )
    : DEFAULT_RANGE;
}
