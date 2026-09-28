import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { IconLoader2 } from "@tabler/icons-react";
import { z } from "zod";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { SocialAuthButtons } from "@/components/base/social-auth-buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/base/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

interface SignUpFormProps {
  onSuccess: (email: string) => void;
}

/**
 * Sign-up form card — SSO (Google/Apple) + email/password registration.
 *
 * SSO is the shared `<SocialAuthButtons>` and nothing else: it owns the brand-compliant
 * markup, the Lovable managed OAuth broker call, and the fixed
 * `${origin}/auth/callback` redirect. Never hand-roll those buttons here again.
 *
 * Email/password calls `supabase.auth.signUp`. On success the parent swaps to the
 * "Check your email" state (no navigation).
 */
export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const busy = submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(null);
    setPasswordError(null);

    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.email) setEmailError(fieldErrors.email[0]);
      if (fieldErrors.password) setPasswordError(fieldErrors.password[0]);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("already") || message.includes("registered")) {
        setEmailError("Email already registered.");
      } else if (message.includes("password") || message.includes("weak")) {
        setPasswordError("Password too weak.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    onSuccess(parsed.data.email);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Track everything you own and owe.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialAuthButtons mode="signup" />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com…"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={busy}
              aria-invalid={emailError ? true : undefined}
            />
            {emailError ? (
              <p className="text-sm text-destructive">{emailError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
              aria-invalid={passwordError ? true : undefined}
            />
            {passwordError ? (
              <p className="text-sm text-destructive">{passwordError}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={busy}>
            {submitting ? (
              <>
                <IconLoader2
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
                Saving…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
