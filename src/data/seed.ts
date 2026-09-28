// Demo seed data for Asset Tracker.
//
// Used ONLY on `/demo/*` routes via SeedDataProvider. Not seeded into real
// user accounts (real users start empty — see cloudboard Seed Strategy).
//
// Shapes mirror the Supabase table schemas exactly so swapping the provider
// (seed → Supabase) changes the data source, never the components.

export type AssetKind =
  | "property"
  | "vehicle"
  | "investment"
  | "collectible"
  | "precious_metal"
  | "private_equity"
  | "other"
  | "liability";

/** Row shape of `public.assets`. */
export interface Asset {
  id: string;
  user_id: string;
  name: string;
  kind: AssetKind;
  value: number;
  notes: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Row shape of `public.net_worth_snapshots`. */
export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  date: string;
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  breakdown: Partial<Record<AssetKind, number>>;
  created_at?: string;
}

/** Row shape of `public.profiles`. */
export interface Profile {
  id: string;
  display_name: string;
  currency: string;
  /** Rung one of the avatar ladder. Null is the normal case, not an error. */
  avatar_url?: string | null;
  updated_at?: string;
}

export const seedProfile: Profile = {
  id: "user-seed",
  display_name: "Alex",
  currency: "USD",
  updated_at: "2024-12-31T00:00:00Z",
};

export const seedAssets: Asset[] = [
  {
    id: "a1",
    user_id: "user-seed",
    name: "Main Residence",
    kind: "property",
    value: 420000,
    notes: "3-bed semi, bought 2019",
    active: true,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-10-01T00:00:00Z",
  },
  {
    id: "a2",
    user_id: "user-seed",
    name: "Mortgage — Main Residence",
    kind: "liability",
    value: 280000,
    notes: "Fixed rate, 2.9%, matures 2039",
    active: true,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-10-01T00:00:00Z",
  },
  {
    id: "a3",
    user_id: "user-seed",
    name: "Vanguard ISA",
    kind: "investment",
    value: 61000,
    notes: "All-world ETF, rebalanced annually",
    active: true,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-11-01T00:00:00Z",
  },
  {
    id: "a4",
    user_id: "user-seed",
    name: "BMW 5 Series",
    kind: "vehicle",
    value: 28000,
    notes: "2022 model, estimated current market",
    active: true,
    created_at: "2024-02-10T00:00:00Z",
    updated_at: "2024-09-15T00:00:00Z",
  },
  {
    id: "a5",
    user_id: "user-seed",
    name: "Rolex Submariner",
    kind: "collectible",
    value: 18000,
    notes: "Ref. 126610LN, 2021",
    active: true,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
  },
  {
    id: "a6",
    user_id: "user-seed",
    name: "Gold bars",
    kind: "precious_metal",
    value: 9000,
    notes: "100g × 3",
    active: true,
    created_at: "2024-04-01T00:00:00Z",
    updated_at: "2024-10-20T00:00:00Z",
  },
  {
    id: "a7",
    user_id: "user-seed",
    name: "Seed-round equity",
    kind: "private_equity",
    value: 5000,
    notes: "Pre-money valuation, 0.2% stake",
    active: true,
    created_at: "2024-05-01T00:00:00Z",
    updated_at: "2024-05-01T00:00:00Z",
  },
  {
    id: "a8",
    user_id: "user-seed",
    name: "MacBook Pro M3",
    kind: "other",
    value: 700,
    notes: "16-inch, 2023",
    active: true,
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
];

export const seedSnapshots: NetWorthSnapshot[] = [
  {
    id: "s1",
    user_id: "user-seed",
    date: "2024-01-31",
    net_worth: 213400,
    total_assets: 493400,
    total_liabilities: 280000,
    breakdown: { property: 420000, liability: 280000 },
  },
  {
    id: "s2",
    user_id: "user-seed",
    date: "2024-02-29",
    net_worth: 219400,
    total_assets: 499400,
    total_liabilities: 280000,
    breakdown: { property: 420000, vehicle: 28000, liability: 280000 },
  },
  {
    id: "s3",
    user_id: "user-seed",
    date: "2024-03-31",
    net_worth: 228200,
    total_assets: 508200,
    total_liabilities: 280000,
    breakdown: {
      property: 420000,
      vehicle: 28000,
      collectible: 18000,
      investment: 42000,
      liability: 280000,
    },
  },
  {
    id: "s4",
    user_id: "user-seed",
    date: "2024-04-30",
    net_worth: 233700,
    total_assets: 513700,
    total_liabilities: 280000,
    breakdown: {
      property: 420000,
      vehicle: 28000,
      collectible: 18000,
      investment: 44000,
      precious_metal: 3000,
      liability: 280000,
    },
  },
  {
    id: "s5",
    user_id: "user-seed",
    date: "2024-05-31",
    net_worth: 237200,
    total_assets: 517200,
    total_liabilities: 280000,
    breakdown: {
      property: 420000,
      vehicle: 28000,
      collectible: 18000,
      investment: 46000,
      precious_metal: 3000,
      private_equity: 2200,
      liability: 280000,
    },
  },
  {
    id: "s6",
    user_id: "user-seed",
    date: "2024-06-30",
    net_worth: 239600,
    total_assets: 519600,
    total_liabilities: 280000,
    breakdown: {
      property: 420000,
      vehicle: 28000,
      collectible: 18000,
      investment: 47000,
      precious_metal: 4200,
      private_equity: 2400,
      other: 700,
      liability: 280000,
    },
  },
  {
    id: "s7",
    user_id: "user-seed",
    date: "2024-07-31",
    net_worth: 243100,
    total_assets: 523100,
    total_liabilities: 280000,
    breakdown: {
      property: 420000,
      vehicle: 28000,
      collectible: 18000,
      investment: 51000,
      precious_metal: 5100,
      private_equity: 2700,
      other: 700,
      liability: 280000,
    },
  },
  {
    id: "s8",
    user_id: "user-seed",
    date: "2024-08-31",
    net_worth: 247800,
    total_assets: 527800,
    total_liabilities: 280000,
    breakdown: {
      property: 420000,
      vehicle: 28000,
      collectible: 18000,
      investment: 53000,
      precious_metal: 6100,
      private_equity: 3000,
      other: 700,
      liability: 280000,
    },
  },
  {
    id: "s9",
    user_id: "user-seed",
    date: "2024-09-30",
    net_worth: 252500,
    total_assets: 532500,
    total_liabilities: 280000,
    breakdown: {
      property: 420000,
      vehicle: 28000,
      collectible: 18000,
      investment: 55000,
      precious_metal: 7000,
      private_equity: 3800,
      other: 700,
      liability: 280000,
    },
  },
  {
    id: "s10",
    user_id: "user-seed",
    date: "2024-10-31",
    net_worth: 256100,
    total_assets: 536100,
    total_liabilities: 280000,
    breakdown: {
      property: 420000,
      vehicle: 28000,
      collectible: 18000,
      investment: 57000,
      precious_metal: 8400,
      private_equity: 4000,
      other: 700,
      liability: 280000,
    },
  },
  {
    id: "s11",
    user_id: "user-seed",
    date: "2024-11-30",
    net_worth: 258900,
    total_assets: 538900,
    total_liabilities: 280000,
    breakdown: {
      property: 420000,
      vehicle: 28000,
      collectible: 18000,
      investment: 59000,
      precious_metal: 8400,
      private_equity: 4100,
      other: 700,
      liability: 280000,
    },
  },
  {
    id: "s12",
    user_id: "user-seed",
    date: "2024-12-31",
    net_worth: 261700,
    total_assets: 541700,
    total_liabilities: 280000,
    breakdown: {
      property: 420000,
      vehicle: 28000,
      collectible: 18000,
      investment: 61000,
      precious_metal: 9000,
      private_equity: 5000,
      other: 700,
      liability: 280000,
    },
  },
];

/**
 * The demo arrives with a dashboard already composed, unlike a new account,
 * which starts empty (Q1). Layout-emptiness follows data-emptiness: a new
 * account has neither, the demo has both. An empty demo Overview would be a
 * shop window with nothing in it.
 *
 * The order is the packing order from docs/redesign/reference/bento-grid.md —
 * these nine sizes leave no holes at 3, 4, 5 or 6 columns.
 */
export interface SeedDashboardTile {
  id: string;
  dashboard_id: string;
  tile_type:
    | "net_worth" | "timeline" | "holdings" | "allocation" | "own_vs_owe"
    | "leverage" | "concentration" | "liquidity" | "since_started";
  size: "small" | "medium" | "large";
  config: { range?: string };
}

/**
 * The demo dashboard.
 *
 * Sizes and order both match `TILE_REGISTRY` / `TILE_TYPES` in
 * `pages/overview/components/tile-registry.ts`, so the demo shows what a real
 * new dashboard looks like. They had drifted: this list still carried
 * `net_worth: medium` and `since_started: medium` after the registry moved them
 * to large and small, and it still used the pre-teardown ordering — so
 * `/demo/overview` packed differently from every signed-in one.
 *
 * If you change a default size or the picker order, change it here too. Nothing
 * enforces it; the two lists are separate on purpose, because a demo may one day
 * want its own arrangement — but today it should not have one by accident.
 */
export const seedDashboardTiles: SeedDashboardTile[] = [
  { id: "d1", dashboard_id: "demo", tile_type: "net_worth",     size: "large",  config: { range: "12m" } },
  { id: "d2", dashboard_id: "demo", tile_type: "timeline",      size: "large",  config: { range: "12m" } },
  { id: "d3", dashboard_id: "demo", tile_type: "leverage",      size: "small",  config: {} },
  { id: "d4", dashboard_id: "demo", tile_type: "concentration", size: "small",  config: {} },
  { id: "d5", dashboard_id: "demo", tile_type: "liquidity",     size: "small",  config: {} },
  { id: "d6", dashboard_id: "demo", tile_type: "since_started", size: "small",  config: { range: "all" } },
  { id: "d7", dashboard_id: "demo", tile_type: "holdings",      size: "large",  config: {} },
  { id: "d8", dashboard_id: "demo", tile_type: "allocation",    size: "medium", config: {} },
  { id: "d9", dashboard_id: "demo", tile_type: "own_vs_owe",    size: "medium", config: {} },
];
