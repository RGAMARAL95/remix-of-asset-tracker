import { useState, type FormEvent } from "react";
import { IconArrowLeft, IconLoader2, IconMail } from "@tabler/icons-react";
import { z } from "zod";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
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

const emailSchema = z.string().email("Enter a valid email address.");

interface ForgotPasswordCardProps {
  onBack: () => void;
}

/**
 * Password reset — shown in place of the sign-in form when the user clicks
 * "Forgot?". Sends a reset link via `supabase.auth.resetPasswordForEmail`,
 * then swaps to a confirmation ("Reset link sent"). "← Back to sign in"
 * returns to the default sign-in card.
 */
export function ForgotPasswordCard({ onBack }: ForgotPasswordCardProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(null);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/sign-in`,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <IconMail className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Reset link sent</CardTitle>
          <CardDescription>
            Check your email for a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBack}
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <button
          type="button"
          className="mb-2 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          onClick={onBack}
        >
          <IconArrowLeft className="size-4" aria-hidden="true" />
          Back to sign in
        </button>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com…"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              aria-invalid={emailError ? true : undefined}
            />
            {emailError ? (
              <p className="text-sm text-destructive">{emailError}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <IconLoader2 className="size-4 animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
