import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AssetKind } from "@/data/seed";

/**
 * Shared filter state for the Assets list. Lives in context so the kind +
 * search selection survives navigation between Assets and the editor.
 * Components read `filters` and pass them to `useAssets(filters)`.
 */
export interface AssetFilterState {
  kind: AssetKind | "all";
  search: string;
}

const DEFAULT_FILTERS: AssetFilterState = {
  kind: "all",
  search: "",
};

interface FilterContextValue {
  filters: AssetFilterState;
  setFilters: (updates: Partial<AssetFilterState>) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<AssetFilterState>(DEFAULT_FILTERS);

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      setFilters: (updates) =>
        setFiltersState((prev) => ({ ...prev, ...updates })),
      resetFilters: () => setFiltersState(DEFAULT_FILTERS),
    }),
    [filters],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be inside FilterProvider");
  return ctx;
}
