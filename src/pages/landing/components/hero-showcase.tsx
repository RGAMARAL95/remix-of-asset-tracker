import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/base/button";

import { TileShowcase } from "./tile-showcase";

interface HeroShowcaseProps {
  heading: ReactNode;
  subline: string;
  demoCta: { label: string; to: string };
  getStartedCta: { label: string; to: string };
}

/**
 * Landing hero — copy centred over a slow-scrolling row of the product's own
 * tiles, running off both edges of the screen.
 *
 * This replaces the browser-chrome mockup. A mockup is a picture of the app; the
 * showcase IS the app, rendered from demo data, so it can never fall out of date
 * with what the tiles actually look like.
 *
 * Spacing: 114px of air above the heading, 20px from subline to button, 55px
 * from button to the row, and a row window 32px taller than the tallest tile so
 * nothing is clipped.
 *
 * These numbers are OURS. An earlier version of this comment called them "the
 * measured original", which was not true — they appear in no reference
 * document, and the teardown's welcome page records 25px above its button and
 * 35px below. Claiming provenance for invented numbers is worse than inventing
 * them, because it stops anyone checking. They are kept because this page was
 * signed off as it stands, not because they were measured.
 *
 * The two CTAs mirror the marketing header: a ghost "Demo" button and an
 * outline "Get started" button. This keeps the entry points consistent across
 * the chrome and the hero.
 */
export function HeroShowcase({
  heading,
  subline,
  demoCta,
  getStartedCta,
}: HeroShowcaseProps) {
  return (
    /* `landing` is what gives h1 its 40/48 display size (see base.css) — the
       section needs it even though the rest of the styling is local. */
    <section className="landing relative flex-1 overflow-hidden">
      <div className="animate-showcase-reveal flex flex-col items-center px-6 pb-[55px] pt-[114px] text-center text-white">
        <h1 className="text-balance text-white">{heading}</h1>
        <p className="mt-5 max-w-[700px] text-pretty text-lg text-white/80">
          {subline}
        </p>
        {/* Vertical on mobile: side-by-side CTAs squeeze at phone width.
            Stacked, each keeps a 44px tap height (docs/design/mobile-menu.md's
            sibling practice for landings). */}
        <div className="mt-5 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-2">
          <Button
            variant="outline"
            className="h-11 w-full max-w-[320px] whitespace-nowrap border-white/40 bg-transparent text-white hover:bg-white/15 hover:text-white sm:h-9 sm:w-auto"
            asChild
          >
            <Link to={demoCta.to}>{demoCta.label}</Link>
          </Button>
          <Button
            variant="default"
            className="h-11 w-full max-w-[320px] whitespace-nowrap bg-white text-primary-foreground hover:bg-white/90 sm:h-9 sm:w-auto"
            asChild
          >
            <Link to={getStartedCta.to}>{getStartedCta.label}</Link>
          </Button>
        </div>
      </div>

      {/* 400 (tallest tile) + 32 above + 32 below, matching the original. The
          tiles are fully visible; the crop is at the sides, not the bottom. */}
      <div className="animate-showcase-reveal h-[464px] pb-[64px] [animation-delay:100ms]">
        <TileShowcase />
      </div>
    </section>
  );
}
