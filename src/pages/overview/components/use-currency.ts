import { useMemo } from "react";
import { useDataProvider } from "@/lib/data-provider";

/**
 * Currency formatters bound to the user's profile currency (from useProfile).
 * Tiles that render money call this so the symbol follows the account setting.
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
    const compact = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    });
    return {
      /** e.g. "$261,700" */
      format: (value: number) => full.format(value),
      /** e.g. "$262k" — for chart axes and tight labels */
      formatCompact: (value: number) => compact.format(value),
      /** e.g. "+$4,200" / "-$280,000" — signed, for deltas */
      formatSigned: (value: number) =>
        `${value >= 0 ? "+" : "-"}${full.format(Math.abs(value))}`,
      /** e.g. "+$48k" — signed AND compact, for the metric on a 192px tile */
      formatSignedCompact: (value: number) =>
        `${value >= 0 ? "+" : "-"}${compact.format(Math.abs(value))}`,
    };
  }, [currency]);
}
