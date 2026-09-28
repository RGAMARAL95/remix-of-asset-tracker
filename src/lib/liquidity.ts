import type { AssetKind } from "@/data/seed";

// Which asset kinds count as "liquid" for the Liquidity tile.
// A plain map, not a database table — the classification is a product rule.
export const LIQUID_KINDS: AssetKind[] = ["investment", "precious_metal"];

export function isLiquidKind(kind: AssetKind): boolean {
  return LIQUID_KINDS.includes(kind);
}
