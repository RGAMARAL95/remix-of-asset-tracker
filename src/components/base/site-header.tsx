import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconMenu2, IconPlant2, IconX } from "@tabler/icons-react";
import { Button } from "@/components/base/button";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Sheet, SheetClose, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AUTH_CTA, AUTH_CTA_ROUTE, DEMO_ROUTE } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

/**
 * SiteHeader — the marketing chrome, on the landing page AND on the auth
 * screens.
 *
 * Why it is shared: someone who lands on sign-in by mistake needs one click
 * back to the marketing page, and the brand should not vanish the moment they
 * go to sign in. That is the ordinary pattern every SaaS takes.
 *
 * Why `variant="auth"` is not the landing header verbatim: the action is
 * "Get started", which points AT the auth screen, and rendering it there is a
 * button to where you already are. The bar also goes transparent so it sits on
 * the branded surface instead of laying a pale strip across the top of it.
 *
 * On mobile (marketing variant) the actions leave the bar for a menu sheet —
 * docs/design/mobile-menu.md. The wordmark truncates so a long product name
 * can never wrap the bar or collide with the trigger.
 */
export interface SiteHeaderProps {
  /** "marketing" on the landing page, "auth" on /sign-in and /sign-up. */
  variant?: "marketing" | "auth";
}

export function SiteHeader({ variant = "marketing" }: SiteHeaderProps) {
  const onAuth = variant === "auth";

  return (
    <header
      className={cn(
        "z-50 bg-transparent",
        onAuth
          // Absolute, not sticky: the auth column is centred in the whole
          // viewport, and a header in the flow would push it off centre.
          ? "absolute inset-x-0 top-0"
          : "sticky top-0",
      )}
    >
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-6 lg:px-8">
        <Link
          to="/"
          className="flex min-w-0 flex-1 items-center gap-2 font-heading text-[21px] font-semibold leading-6 tracking-tight text-white"
        >
          <IconPlant2
            className={cn("size-5 shrink-0", onAuth ? "text-white" : "text-primary")}
            aria-hidden="true"
          />
          {/* One line, always: the name truncates rather than wrapping the bar. */}
          <span className="min-w-0 truncate">Asset Tracker</span>
        </Link>

        <div className={cn("items-center gap-2", onAuth ? "flex" : "hidden sm:flex")}>
          <Button
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/15 hover:text-white"
            asChild
          >
            <Link to={DEMO_ROUTE}>{AUTH_CTA.demo}</Link>
          </Button>
          {/* One wording for the auth door, from lib/auth/constants — and never
              on the auth screen itself, which is a button to where you are. */}
          {!onAuth && (
            <Button
              variant="default"
              className="bg-white text-primary-foreground hover:bg-white/90"
              asChild
            >
              <Link to={AUTH_CTA_ROUTE}>{AUTH_CTA.enter}</Link>
            </Button>
          )}
        </div>
        {!onAuth && <MobileMenu />}
      </div>
    </header>
  );
}

/** The measured motion (docs/design/mobile-menu.md). Inline style, not a
 *  Tailwind class: inline always wins, and Tailwind silently drops ambiguous
 *  ease-[cubic-bezier(...)] classes. */
const SHEET_MOTION = {
  animationDuration: "320ms",
  animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
} as const;
const ICON_MOTION = {
  animationDuration: "200ms",
  animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
} as const;

/**
 * ☰ → full-height sheet sliding in from the right, leaving a 64px finger strip
 * of light scrim that closes it (as do ✕, the scrim anywhere, and Esc).
 * Scale per docs/design/mobile-menu.md: 54px full-bleed rows, -3px margin,
 * 48px inset inside the row, 28px/600/32 type, 320ms cubic-bezier(0.4,0,0.6,1).
 *
 * Built on the vendored Sheet primitive (Radix dialog): the portal renders the
 * sheet at the body root, so no ancestor filter/transform/sticky can re-anchor
 * it; Esc, scrim-close, scroll lock, and the focus trap come from Radix.
 * The morph is two halves of one visual button: ☰ lives in the bar and spins
 * out on open; ✕ lives INSIDE the portal (Radix blocks clicks outside the open
 * dialog) positioned exactly over the trigger's spot, and spins in.
 */
function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="sm:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        {/* The ☰ half of the morphing trigger — in the bar's icon spot. */}
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open menu"
            className="relative -mr-2 flex h-11 w-11 items-center justify-center text-white"
          >
            <span
              aria-hidden
              className={cn(
                "grid place-items-center transition-all [transition-duration:200ms] [transition-timing-function:cubic-bezier(0.4,0,0.6,1)] motion-reduce:transition-none",
                open ? "-rotate-180 opacity-0" : "rotate-0 opacity-100",
              )}
            >
              <IconMenu2 size={24} />
            </span>
          </button>
        </SheetTrigger>

        <SheetPortal>
          {/* Scrim — light, full viewport. Radix closes on click. */}
          <SheetOverlay
            className="z-[55] bg-white/50 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
            style={SHEET_MOTION}
          />

          {/* The sheet wears the landing's own canvas (the nw-canvas
              gradient the bar sits on), so the open menu reads as the bar
              unfolding — docs/design/mobile-menu.md rule 5a. */}
          <SheetPrimitive.Content
            aria-describedby={undefined}
            className={cn(
              "nw-canvas group fixed inset-y-0 right-0 z-[55] flex w-[calc(100%-64px)] flex-col text-white shadow-xl outline-none",
              "data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right motion-reduce:animate-none",
            )}
            style={SHEET_MOTION}
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>

            {/* The ✕ half of the morph — fixed over the bar trigger's spot. */}
            <SheetClose
              aria-label="Close menu"
              className="fixed right-2 top-0 flex h-11 w-11 items-center justify-center text-white outline-none"
            >
              <span
                aria-hidden
                className={cn(
                  "grid place-items-center motion-reduce:animate-none",
                  "group-data-[state=open]:animate-in group-data-[state=open]:[--tw-enter-rotate:180deg] group-data-[state=open]:[--tw-enter-opacity:0]",
                  "group-data-[state=closed]:animate-out group-data-[state=closed]:[--tw-exit-rotate:180deg] group-data-[state=closed]:[--tw-exit-opacity:0]",
                )}
                style={ICON_MOTION}
              >
                <IconX size={24} />
              </span>
            </SheetClose>

            {/* Top zone: 2× the header bar, the ✕ floats in its first half. */}
            <div className="h-28 shrink-0" />

            {/* Routes — where you can go. The row is the box: full-bleed, tappable
                edge to edge, inset carried as padding inside it. */}
            <div className="flex flex-col space-y-[-3px]">
              <Link
                to="/"
                onClick={close}
                className="flex h-[54px] w-full items-center justify-end px-12 text-[28px] font-semibold leading-8 tracking-tight"
              >
                Home
              </Link>
            </div>

            {/* Actions — the doors. Fluid pills, pinned to the bottom. */}
            <div className="mt-auto flex flex-col gap-3 px-12 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <Link
                to={DEMO_ROUTE}
                onClick={close}
                className="flex h-11 items-center justify-center rounded-full border border-white/40 text-base font-semibold text-white"
              >
                {AUTH_CTA.demo}
              </Link>
              <Link
                to={AUTH_CTA_ROUTE}
                onClick={close}
                className="flex h-11 items-center justify-center rounded-full bg-white text-base font-semibold text-primary-foreground"
              >
                {AUTH_CTA.enter}
              </Link>
            </div>
          </SheetPrimitive.Content>
        </SheetPortal>
      </Sheet>
    </div>
  );
}
