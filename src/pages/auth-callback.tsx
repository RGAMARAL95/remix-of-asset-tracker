import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";

import { Button } from "@/components/base/button";
import { supabase } from "@/integrations/supabase/client";

/**
 * OAuth return handler. Establishes a Supabase session from whichever strand
 * the broker returns (implicit hash tokens OR PKCE `?code=…`).
 *
 * `setSession` and `exchangeCodeForSession` RETURN errors, they don't throw —
 * so read `error` from the result and surface it. Silently bouncing to
 * /sign-in leaves people signed out with no explanation.
 *
 * `exchangeCodeForSession` takes the bare auth code, never the full URL.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fail = (message: string) => {
      if (!cancelled) setError(message);
    };

    const run = async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));

      // The provider/broker can return an error directly in the URL.
      const urlError =
        hash.get("error_description") ??
        hash.get("error") ??
        url.searchParams.get("error_description") ??
        url.searchParams.get("error");
      if (urlError) {
        fail(urlError);
        return;
      }

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = url.searchParams.get("code");

      try {
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) {
            fail(sessionError.message);
            return;
          }
        } else if (code) {
          // Bare code — passing the full URL fails on @supabase/auth-js.
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            fail(exchangeError.message);
            return;
          }
        }
      } catch (e) {
        fail(e instanceof Error ? e.message : String(e));
        return;
      }

      const { data, error: getSessionError } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        navigate("/overview", { replace: true });
        return;
      }

      fail(
        getSessionError?.message ??
          "We couldn't complete sign-in — no session was returned. Please try again.",
      );
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <IconAlertTriangle
            className="mx-auto size-6 text-destructive"
            aria-hidden="true"
          />
          <h1 className="text-lg font-semibold">Sign-in didn't complete</h1>
          <p className="text-sm text-muted-foreground break-words">{error}</p>
          <Button asChild className="w-full">
            <Link to="/sign-in">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-4 animate-spin" aria-hidden="true" />
        <span className="text-sm">Signing you in…</span>
      </div>
    </div>
  );
}
