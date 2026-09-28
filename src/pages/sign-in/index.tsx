import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth/auth-provider";
import { SiteHeader } from "@/components/base/site-header";
import { SignInColumn } from "./components/sign-in-column";

/**
 * Sign in (`/sign-in`) — the front door.
 *
 * Two steps, and the first has no fields: a welcome and three buttons on the
 * branded surface, then the email form in place. See docs/design/auth-screen.md.
 *
 * The header is the landing page's own header minus its auth CTA — rendering
 * "Get started" here would be a button to the page you are already on.
 */
export default function Page() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!loading && user) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname;
    return <Navigate to={from ?? "/assets"} replace />;
  }

  return (
    <div className="auth-surface relative flex min-h-screen flex-col text-white">
      <SiteHeader variant="auth" />
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <h1 className="sr-only">Sign in to Asset Tracker</h1>
        <SignInColumn />
      </main>
    </div>
  );
}
