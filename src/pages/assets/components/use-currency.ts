import { useMemo } from "react";
import { useDataProvider } from "@/lib/data-provider";

/**
 * Currency formatter bound to the user's profile currency (from useProfile).
 * The assets table and footer call this so the symbol follows the account
 * setting.
 */
export function useCurrency() {
  const { useProfile } = useDataProvider();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "USD";

  return useMemo(() => {
    const full = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    return {
      /** e.g. "$261,700" */
      format: (value: number) => full.format(value),
    };
  }, [currency]);
}
