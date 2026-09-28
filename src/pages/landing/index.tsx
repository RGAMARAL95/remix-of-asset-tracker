import { AUTH_CTA, AUTH_CTA_ROUTE } from "@/lib/auth/constants";
import { Header01 } from "./components/header";
import { HeroShowcase } from "./components/hero-showcase";
import { Footer01 } from "./components/footer-01";

/**
 * Landing — the welcome screen.
 *
 * Three things and nothing else: the header, the heading group, and the showcase
 * row. No feature sections, no testimonials, no CTA banner.
 *
 * The heading group has two CTAs that mirror the marketing header: a ghost
 * "Demo" button and an outline "Get started" button. This keeps the entry
 * points consistent across the chrome and the hero.
 *
 * The canvas lives HERE, not on the hero, so the gradient runs from the top of
 * the header to the bottom of the footer as one surface. Header and footer are
 * transparent and sit on it — the reference has no seams anywhere, and a white
 * bar top and bottom would put two hard lines across it.
 */
export default function Landing() {
  return (
    <div className="nw-canvas flex min-h-screen flex-col text-white">
      <Header01 />
      <HeroShowcase
        heading="Asset Tracker"
        subline="Know your real net worth"
        demoCta={{ label: AUTH_CTA.demo, to: "/demo/overview" }}
        getStartedCta={{ label: AUTH_CTA.enter, to: AUTH_CTA_ROUTE }}
      />
      <Footer01 />
    </div>
  );
}
