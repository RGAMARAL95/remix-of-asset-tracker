import type { Asset, AssetKind, NetWorthSnapshot } from "@/data/seed";
import { LIQUID_KINDS } from "@/lib/liquidity";

/** Derived data powering the Overview bento tiles. */
export interface OverviewTileData {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  allocationByKind: Partial<Record<AssetKind, number>>;
  /** Σliabilities ÷ (Σassets + Σliabilities) × 100 */
  leverage: number;
  /** top-3 own assets ÷ Σassets × 100 */
  concentration: number;
  /** (investment + precious_metal) ÷ Σassets × 100 */
  liquidity: number;
  liquidValue: number;
  /** active rows sorted by value desc (liabilities included) */
  holdingsSorted: Asset[];
}

/**
 * Compute all Overview tile aggregations from a raw assets array.
 * Always filters to active assets first — the same logic runs on seed data
 * (SeedDataProvider) and Supabase data (SupabaseDataProvider).
 */
export function computeOverviewTiles(assets: Asset[]): OverviewTileData {
  const active = assets.filter((a) => a.active);
  const ownAssets = active.filter((a) => a.kind !== "liability");
  const liabilities = active.filter((a) => a.kind === "liability");

  const totalAssets = ownAssets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const allocationByKind = active.reduce(
    (acc, a) => {
      acc[a.kind] = (acc[a.kind] ?? 0) + a.value;
      return acc;
    },
    {} as Partial<Record<AssetKind, number>>,
  );

  const grossTotal = totalAssets + totalLiabilities;
  const leverage = grossTotal > 0 ? (totalLiabilities / grossTotal) * 100 : 0;

  const sortedOwn = ownAssets.slice().sort((a, b) => b.value - a.value);
  const top3Sum = sortedOwn.slice(0, 3).reduce((s, a) => s + a.value, 0);
  const concentration = totalAssets > 0 ? (top3Sum / totalAssets) * 100 : 0;

  const liquidValue = ownAssets
    .filter((a) => LIQUID_KINDS.includes(a.kind))
    .reduce((s, a) => s + a.value, 0);
  const liquidity = totalAssets > 0 ? (liquidValue / totalAssets) * 100 : 0;

  const holdingsSorted = active.slice().sort((a, b) => b.value - a.value);

  return {
    netWorth,
    totalAssets,
    totalLiabilities,
    allocationByKind,
    leverage,
    concentration,
    liquidity,
    liquidValue,
    holdingsSorted,
  };
}

/**
 * Build today's net worth snapshot payload from the full assets list.
 * Used by the post-mutation snapshot upsert (create/update/delete/toggle).
 */
export function buildSnapshotPayload(
  assets: Asset[],
  today: string,
): Omit<NetWorthSnapshot, "id" | "user_id" | "created_at"> {
  const tiles = computeOverviewTiles(assets);
  return {
    date: today,
    net_worth: tiles.netWorth,
    total_assets: tiles.totalAssets,
    total_liabilities: tiles.totalLiabilities,
    breakdown: tiles.allocationByKind,
  };
}
