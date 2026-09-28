import type { Icon } from "@tabler/icons-react";
import {
  IconChartLine,
  IconChartPie,
  IconCurrencyDollar,
  IconDroplet,
  IconFocus2,
  IconList,
  IconPercentage,
  IconScale,
  IconTrendingUp,
} from "@tabler/icons-react";

import type { TileSize, TileType } from "@/lib/data-provider";
import type { TileChromeProps } from "./tile-shell";

import { TileAllocation } from "./tile-allocation";
import { TileConcentration } from "./tile-concentration";
import { TileHoldings } from "./tile-holdings";
import { TileLeverage } from "./tile-leverage";
import { TileLiquidity } from "./tile-liquidity";
import { TileNetWorth } from "./tile-net-worth";
import { TileOwnVsOwe } from "./tile-own-vs-owe";
import { TileSinceStarted } from "./tile-since-started";
import { TileTimeline } from "./tile-timeline";

/**
 * One map: type → component, label, icon, default size, and whether it has a
 * period to choose. The picker, the Size menu and the grid classes all read it,
 * so adding a tenth tile is one entry here and nothing else.
 *
 * There is deliberately NO `allowedSizes`. Every type allows every size, which
 * is what the reference does — verified in its own Customize dialog, where a
 * grouped, stats-bearing widget still offers all three (Q7).
 */

export const TILE_SIZES: readonly TileSize[] = [
  "small",
  "medium",
  "large",
] as const;

export const SIZE_LABEL: Record<TileSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

/** Grid span class per size. Small is 1×1, which needs no class. */
export const SIZE_CLASS: Record<TileSize, string> = {
  small: "",
  medium: "bento-2x1",
  large: "bento-2x2",
};

export interface TileDefinition {
  type: TileType;
  /** Sentence case — the reference's card title is 15/20 w600, not uppercase. */
  label: string;
  icon: Icon;
  defaultSize: TileSize;
  /**
   * Whether the tile shows a time-range control in its header. Four of nine.
   * The reference puts one on every widget because every widget of theirs is a
   * time series; five of ours are not, and a period picker on a leverage ratio
   * would be furniture.
   */
  timeBased: boolean;
  component: ( props: TileChromeProps ) => JSX.Element;
}

export const TILE_REGISTRY: Record<TileType, TileDefinition> = {
  net_worth: {
    type: "net_worth",
    label: "Net worth",
    icon: IconCurrencyDollar,
    // Large, matching the reference's net-worth hero (teardown §8). It had
    // drifted to medium, which is half the reason the grid left holes — see
    // the note above TILE_TYPES.
    defaultSize: "large",
    timeBased: true,
    component: TileNetWorth,
  },
  timeline: {
    type: "timeline",
    label: "Timeline",
    icon: IconChartLine,
    defaultSize: "large",
    timeBased: true,
    component: TileTimeline,
  },
  holdings: {
    type: "holdings",
    label: "Holdings",
    icon: IconList,
    defaultSize: "large",
    timeBased: false,
    component: TileHoldings,
  },
  allocation: {
    type: "allocation",
    label: "Allocation",
    icon: IconChartPie,
    defaultSize: "medium",
    timeBased: false,
    component: TileAllocation,
  },
  own_vs_owe: {
    type: "own_vs_owe",
    label: "Own vs owe",
    icon: IconScale,
    defaultSize: "medium",
    timeBased: false,
    component: TileOwnVsOwe,
  },
  leverage: {
    type: "leverage",
    label: "Leverage",
    icon: IconPercentage,
    defaultSize: "small",
    timeBased: true,
    component: TileLeverage,
  },
  concentration: {
    type: "concentration",
    label: "Concentration",
    icon: IconFocus2,
    defaultSize: "small",
    timeBased: false,
    component: TileConcentration,
  },
  liquidity: {
    type: "liquidity",
    label: "Liquidity",
    icon: IconDroplet,
    defaultSize: "small",
    timeBased: false,
    component: TileLiquidity,
  },
  since_started: {
    type: "since_started",
    label: "Since you started",
    icon: IconTrendingUp,
    // Small, per teardown §8. As a medium this was the other half of the
    // packing problem: it made the small-tile count odd (3), and a lone small
    // leaves a single free column that no 2-wide tile can ever use.
    defaultSize: "small",
    timeBased: true,
    component: TileSinceStarted,
  },
};

/**
 * Picker order — the reference's own, from teardown §8. A new dashboard starts
 * empty, so this doubles as the order tiles land in when someone adds them
 * straight down the list.
 *
 * Two big tiles, the four smalls, then the last big and the two mediums. At six
 * columns that fills rows 1–2 completely and leaves the ragged edge at the very
 * bottom, so the grid reads as though it simply ends.
 *
 * One correction to the teardown while we're here: it claims "nine tiles, four
 * rows, no wasted cell". That is arithmetically impossible — the nine tiles
 * occupy 20 cells and four rows of six is 24. Four empty cells is the floor for
 * ANY order. What an order controls is only WHERE they land.
 */
export const TILE_TYPES: TileType[] = [
  "net_worth",
  "timeline",
  "leverage",
  "concentration",
  "liquidity",
  "since_started",
  "holdings",
  "allocation",
  "own_vs_owe",
];

/**
 * A saved size we do not recognise falls back to the type's default, so a bad
 * row renders instead of crashing. The same defensiveness as `useDashboard`
 * skipping tile_ids it cannot resolve.
 */
export function resolveSize( type: TileType, saved: string ): TileSize {
  return ( TILE_SIZES as readonly string[] ).includes( saved )
    ? ( saved as TileSize )
    : TILE_REGISTRY[ type ].defaultSize;
}
