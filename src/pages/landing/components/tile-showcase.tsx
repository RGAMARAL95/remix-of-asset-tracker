import { SeedDataProvider } from "@/lib/data-provider";
import { TileSurface } from "@/pages/overview/components/tile-surface";
import { TileNetWorth } from "@/pages/overview/components/tile-net-worth";
import { TileTimeline } from "@/pages/overview/components/tile-timeline";
import { TileHoldings } from "@/pages/overview/components/tile-holdings";
import { TileAllocation } from "@/pages/overview/components/tile-allocation";
import { TileOwnVsOwe } from "@/pages/overview/components/tile-own-vs-owe";
import { TileLeverage } from "@/pages/overview/components/tile-leverage";
import { TileConcentration } from "@/pages/overview/components/tile-concentration";
import { TileLiquidity } from "@/pages/overview/components/tile-liquidity";
import { TileSinceStarted } from "@/pages/overview/components/tile-since-started";

/** The three module sizes tiles are drawn at, same lattice as the Overview. */
const SMALL = "h-[192px] w-[192px]";
const WIDE = "h-[192px] w-[400px]";
const LARGE = "h-[400px] w-[400px]";

/**
 * One pass of the showcase.
 *
 * `[&>*>*]:h-full` reaches past the size wrapper to the tile itself so the tile
 * fills its wrapper. Do NOT put `h-full` on the wrappers — it beats the fixed
 * sizes and every tile ends up as tall as the tallest one.
 *
 * Sizes alternate large / small / wide so the row has a rhythm instead of a run
 * of same-shaped boxes.
 */
function ShowcaseSet() {
  return (
    <div className="flex shrink-0 items-center gap-[30px] pr-[30px] [&>*>*]:h-full">
      <div className={LARGE}>
        <TileNetWorth />
      </div>
      <div className={SMALL}>
        <TileLeverage />
      </div>
      <div className={WIDE}>
        <TileAllocation />
      </div>
      <div className={LARGE}>
        <TileTimeline />
      </div>
      <div className={SMALL}>
        <TileConcentration />
      </div>
      <div className={WIDE}>
        <TileOwnVsOwe />
      </div>
      <div className={LARGE}>
        <TileHoldings />
      </div>
      <div className={SMALL}>
        <TileLiquidity />
      </div>
      <div className={WIDE}>
        <TileSinceStarted />
      </div>
    </div>
  );
}

/**
 * A slow, endless row of the app's OWN tiles, filled with the demo data.
 *
 * It shows what you get by showing the real thing, so there is no screenshot or
 * illustration to keep in sync when a tile changes.
 *
 * Decoration only: hidden from screen readers, not clickable, and still under
 * `prefers-reduced-motion` (via `motion-reduce` here and the global clamp in
 * style-pack.css).
 */
export function TileShowcase() {
  return (
    <div
      aria-hidden="true"
      // `inert` as well as aria-hidden: recharts puts tabindex="0" on its
      // wrappers, so an aria-hidden subtree still held focusable nodes
      // (axe: aria-hidden-focus). inert takes the whole track out of the
      // tab order and the a11y tree together.
      { ...( { inert: "" } as Record<string, string> ) }
      className="pointer-events-none flex select-none items-center overflow-hidden"
    >
      {/* Both surfaces are the same tinted glass now — .card-solid and
          .card-tonal share one definition, so this context no longer changes
          anything. Kept so the marquee can diverge again without touching all
          nine tiles. */}
      <TileSurface value="tonal">
        <SeedDataProvider>
          {/* Two identical sets, so translating the track by half its own width
              travels exactly one set and the loop never shows a seam. */}
          <div className="flex w-max animate-showcase-scroll motion-reduce:animate-none">
            <ShowcaseSet />
            <ShowcaseSet />
          </div>
        </SeedDataProvider>
      </TileSurface>
    </div>
  );
}
