/**
 * Kept as a thin re-export so the three tiles that import from here keep
 * working. The labels and colours themselves moved to `@/lib/asset-kinds`,
 * which the Assets screen and the asset forms share — see the note there for
 * why one module now owns all of it.
 */
export {
  ASSET_KINDS as KIND_META,
  kindLabel,
  kindColor,
} from "@/lib/asset-kinds";
