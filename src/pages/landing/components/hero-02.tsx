import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/base/button";

import { OverviewMockup } from "./mockups";

interface Hero02Props {
  heading: ReactNode;
  subline: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
}

/** Browser-chrome frame around the product mockup. */
function BrowserWindow({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl ring-1 ring-border">
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="mx-auto rounded-md bg-background px-4 py-1 text-xs text-muted-foreground">
          {url}
        </div>
      </div>
      <div className="h-[380px]">{children}</div>
    </div>
  );
}

/**
 * Hero — centered headline + subline above a full-width browser-window mockup
 * showing the bento Overview canvas. Two CTAs: "Get started" (primary → sign-up)
 * and "See demo" (outline → /demo/overview).
 */
export function Hero02({ heading, subline, primaryCta, secondaryCta }: Hero02Props) {
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-balance">{heading}</h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground">{subline}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to={primaryCta.to}>
                {primaryCta.label}
                <IconArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to={secondaryCta.to}>{secondaryCta.label}</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <BrowserWindow url="assettracker.app/overview">
            <OverviewMockup />
          </BrowserWindow>
        </div>
      </div>
    </section>
  );
}
