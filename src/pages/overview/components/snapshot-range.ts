import type { SnapshotFilters } from "@/lib/data-provider";

// All-time window for net_worth_snapshots. Used by the Net Worth delta and the
// "Since you started" tile. The upper bound is open-ended so today's snapshot
// is always included.
export const ALL_TIME_RANGE: SnapshotFilters = {
  startDate: "2000-01-01",
  endDate: "2100-01-01",
};

// SPEC-GAP: the Timeline tile is spec'd as a rolling 12-month window
// ({ startDate: today-12mo, endDate: today }). Seed snapshots are anchored to
// 2024, so a today-relative window would render an empty demo timeline. We
// query the full history (filter still wired + functional) and slice the last
// 12 monthly points client-side — correct for both seed and real accounts.
export const TIMELINE_RANGE: SnapshotFilters = ALL_TIME_RANGE;
export const TIMELINE_MONTHS = 12;
