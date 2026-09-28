/**
 * The kind filter's options.
 *
 * This file used to own its own labels AND its own badge colours, which
 * disagreed with the dashboard's — Property was blue here and cream there, and
 * Collectible and Private equity were both purple, so two kinds looked the
 * same. Both now come from `@/lib/asset-kinds`, which is the only place that
 * decides what a kind is called or coloured.
 */
export { ASSET_KIND_ORDER as KIND_OPTIONS } from "@/lib/asset-kinds";
