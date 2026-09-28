import type { Icon } from "@tabler/icons-react";

import type { AssetKind } from "@/lib/data-provider";
import { ASSET_KINDS, ASSET_KIND_ORDER } from "@/lib/asset-kinds";

/**
 * Kind picker options for the Add / Edit asset form.
 *
 * Built from `@/lib/asset-kinds` rather than its own list. It used to carry a
 * third copy of the labels and its own ordering, with a comment saying that
 * kept "the two screens independent" — which is exactly how Property ended up
 * called one thing here and another on the dashboard.
 */
export interface KindOption {
  value: AssetKind;
  label: string;
  icon: Icon;
}

export const KIND_OPTIONS: KindOption[] = ASSET_KIND_ORDER.map( ( value ) => ( {
  value,
  label: ASSET_KINDS[ value ].label,
  icon: ASSET_KINDS[ value ].icon,
} ) );
