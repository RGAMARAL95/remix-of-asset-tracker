import { SiteHeader } from "@/components/base/site-header";

/**
 * Header — the landing page's marketing nav.
 *
 * It is the shared SiteHeader, not a copy of it, so the auth screens carry the
 * same brand chrome and the two cannot drift apart. See
 * docs/design/auth-screen.md rules 11 to 14.
 *
 * It used to offer "Sign in" beside "Get started" — two names for one screen.
 * The wording now comes from lib/auth/constants, and there is one door.
 */
export function Header01() {
  return <SiteHeader />;
}
