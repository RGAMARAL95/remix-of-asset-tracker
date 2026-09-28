import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/auth-provider";
import { SiteHeader } from "@/components/base/site-header";
import { SignUpColumn } from "./components/sign-up-column";

/**
 * Sign up (`/sign-up`) — the same screen as sign-in, in the same two steps.
 *
 * Keep this shell identical to sign-in/index.tsx: same surface, same header,
 * same centring. See docs/design/auth-screen.md.
 */
export default function Page() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/assets" replace />;

  return (
    <div className="auth-surface relative flex min-h-screen flex-col text-white">
      <SiteHeader variant="auth" />
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <h1 className="sr-only">Create your Asset Tracker account</h1>
        <SignUpColumn />
      </main>
    </div>
  );
}
