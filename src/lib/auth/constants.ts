/**
 * The welcome line at the top of the auth screen — two lines, held by explicit
 * breaks so a third line cannot push the buttons off centre.
 *
 * It must be a welcome, not the bare word "Sign in", which tells a person
 * nothing they did not already know from clicking Sign in. See
 * docs/design/auth-screen.md rule 9.
 */
export const AUTH_WELCOME = {
  signIn: [ "Welcome back to", "Asset Tracker" ],
  signUp: [ "Know what you own,", "and where it is" ],
} as const;

/**
 * The words on every button that leads to the auth screen.
 *
 * The auth screen is one door, so the app must not describe it several ways on
 * the way in. This is the one place those words live. This template had two
 * doors side by side in its header — "Sign in" next to "Get started" — which is
 * two names for the same screen.
 *
 *   ENTER   a visitor on a marketing surface (header, hero, CTA band)
 *   SAVE    a guest already inside the product
 *
 * See docs/design/auth-screen.md §5.
 */
export const AUTH_CTA = {
  enter: "Get started",
  save: "Sign in to save",
  demo: "View demo",
} as const;

/** Where a marketing "Get started" sends the visitor. */
export const AUTH_CTA_ROUTE = "/sign-in";

/** Where the demo lives, for the secondary beside every `enter`. */
export const DEMO_ROUTE = "/demo/assets";
