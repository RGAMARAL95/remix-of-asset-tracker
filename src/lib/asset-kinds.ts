import {
  IconBriefcase,
  IconCar,
  IconCreditCard,
  IconDeviceWatch,
  IconDiamond,
  IconHome,
  IconPackage,
  IconTrendingUp,
  type Icon,
} from "@tabler/icons-react";

import type { AssetKind } from "@/lib/data-provider";

/**
 * What an asset kind is called, coloured and drawn as. One place, for the whole
 * app.
 *
 * There used to be three, each owning a piece:
 *
 *   overview/components/kinds.ts        label + colour
 *   assets/components/kind-meta.ts      label + badge colour
 *   assets-new/components/kind-options  label + icon
 *
 * and they disagreed. Property was cream on the dashboard and blue on Assets.
 * Vehicle was amber, then grey. Collectible and Private equity were two
 * different colours on the dashboard but BOTH purple on Assets, so two kinds
 * were indistinguishable there. The words drifted too — "Investments" against
 * "Investment", "Precious metals" against "Precious Metal". The old
 * kind-options.tsx even documented the split as deliberate, "so the two screens
 * stay independent". That independence was the bug: one thing, described three
 * ways, is a thing that will drift again.
 *
 * Labels are singular. They name one row in the Assets table, and they read
 * fine as a category total too ("Property 51%").
 *
 * Colours are the dashboard's set. They were picked to read on the green canvas
 * and are used as bar segments and legend dots, so they are already proven
 * there — and now Assets uses the same surface, so they carry across unchanged.
 * All eight are distinct, which the old Assets set was not.
 */
export interface AssetKindMeta {
  label: string;
  color: string;
  icon: Icon;
}

export const ASSET_KINDS: Record<AssetKind, AssetKindMeta> = {
  property: { label: "Property", color: "#F5F3E7", icon: IconHome },
  vehicle: { label: "Vehicle", color: "#F6C177", icon: IconCar },
  investment: { label: "Investment", color: "#8FD3E8", icon: IconTrendingUp },
  collectible: { label: "Collectible", color: "#C3A6E0", icon: IconDeviceWatch },
  precious_metal: { label: "Precious metal", color: "#F2D06B", icon: IconDiamond },
  private_equity: { label: "Private equity", color: "#9AD0B0", icon: IconBriefcase },
  other: { label: "Other", color: "#D5D9DC", icon: IconPackage },
  /* Same coral as `--tile-neg` in style-pack.css, deliberately. A liability and
   * a number that went down are the same thing in this app — Own vs owe already
   * paints the "Owe" bar with the money colour while Allocation painted its
   * liability segment #E88B7D, so the same idea had two corals.
   *
   * #E88B7D also measured 2.79:1 on the lightest card, under the 3:1 a graphic
   * needs, so it failed as a bar and a dot for as long as it shipped. */
  liability: { label: "Liability", color: "#F7C7BF", icon: IconCreditCard },
};

/**
 * The order kinds appear in, everywhere they are listed — the filter tabs and
 * the form's kind picker. These were two different orders before (investment
 * and vehicle were swapped), which is the same drift in another guise.
 */
export const ASSET_KIND_ORDER: AssetKind[] = [
  "property",
  "vehicle",
  "investment",
  "collectible",
  "precious_metal",
  "private_equity",
  "other",
  "liability",
];

export function kindLabel( kind: AssetKind ): string {
  return ASSET_KINDS[ kind ].label;
}

export function kindColor( kind: AssetKind ): string {
  return ASSET_KINDS[ kind ].color;
}
