import { useState } from "react";
import { IconMail, IconLoader2 } from "@tabler/icons-react";
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

interface CheckEmailCardProps {
  email: string;
}

/**
 * Success state — shown in place of the form after a successful sign-up.
 * No navigation; the user must confirm their email before signing in.
 */
export function CheckEmailCard({ email }: CheckEmailCardProps) {
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Confirmation email resent.");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconMail className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Click it
          to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t get it? Check spam or resend the email.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={resending}
          onClick={handleResend}
        >
          {resending ? (
            <>
              <IconLoader2 className="size-4 animate-spin" aria-hidden="true" />
              Resending…
            </>
          ) : (
            "Resend email"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
