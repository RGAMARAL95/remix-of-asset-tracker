import { createContext, useContext, useState, type ReactNode } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  AVATAR_EXT_BY_TYPE,
  AVATAR_MAX_BYTES,
  AVATAR_SIGNED_URL_TTL,
  AVATAR_TYPES,
} from "@/lib/avatar";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  seedDashboardTiles,
  seedAssets,
  seedProfile,
  seedSnapshots,
  type Asset,
  type AssetKind,
  type NetWorthSnapshot,
  type Profile,
} from "@/data/seed";
import { ASSET_KINDS } from "@/lib/asset-kinds";
import {
  buildSnapshotPayload,
  computeOverviewTiles,
  type OverviewTileData,
} from "@/lib/net-worth";

// Re-export domain types so screen components depend on the provider, not seed.
export type { Asset, AssetKind, NetWorthSnapshot, Profile };

// ── Filter + input types ────────────────────────────────────────────────

export type AssetFilters = { kind: AssetKind | "all"; search: string };
export type SnapshotFilters = { startDate: string; endDate: string };

export interface UpdateProfileInput {
  display_name?: string;
  currency?: string;
  /** null removes the photo, dropping the avatar back to the monogram. */
  avatar_url?: string | null;
}

/** Currencies the picker offers — anything else is rejected, not stored. */
const ALLOWED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "SEK",
];
const DISPLAY_NAME_MAX = 80;

/**
 * Last line of defence before a profile write. The dialog validates too, but a
 * hook is callable from anywhere, so the rules live where the write happens:
 * names are trimmed and length-capped, the currency must be one we offer, and
 * only http(s) avatar URLs are accepted (never `javascript:` or `data:`, which
 * would come back out of the database and straight into an href/src).
 */
function sanitizeProfileInput(input: UpdateProfileInput): UpdateProfileInput {
  const clean: UpdateProfileInput = {};

  if (input.display_name !== undefined) {
    const name = input.display_name.trim().slice(0, DISPLAY_NAME_MAX);
    clean.display_name = name;
  }

  if (input.currency !== undefined) {
    const code = input.currency.toUpperCase();
    if (!ALLOWED_CURRENCIES.includes(code)) {
      throw new Error("That currency isn't supported.");
    }
    clean.currency = code;
  }

  if (input.avatar_url !== undefined) {
    if (input.avatar_url === null) {
      clean.avatar_url = null;
    } else {
      let safe = false;
      try {
        const url = new URL(input.avatar_url);
        safe = url.protocol === "https:" || url.protocol === "http:";
      } catch {
        safe = false;
      }
      if (!safe) throw new Error("That image address isn't allowed.");
      clean.avatar_url = input.avatar_url;
    }
  }

  return clean;
}


export interface CreateAssetInput {
  name: string;
  kind: AssetKind;
  value: number;
  notes: string;
  active: boolean;
}
export interface UpdateAssetInput {
  id: string;
  name: string;
  kind: AssetKind;
  value: number;
  notes: string;
  active: boolean;
}

const ASSET_NAME_MAX = 120;
const ASSET_NOTES_MAX = 2000;

/**
 * Write-layer validation for assets. The form validates too, but hooks are
 * callable from anywhere, so the rules live where the write happens.
 */
function sanitizeAssetInput<T extends CreateAssetInput | UpdateAssetInput>(
  input: T,
): T {
  const name = input.name.trim().slice(0, ASSET_NAME_MAX);
  if (!name) throw new Error("Give the asset a name.");
  if (!(input.kind in ASSET_KINDS)) throw new Error("Pick a valid kind.");
  if (!Number.isFinite(input.value)) throw new Error("Enter a valid amount.");
  return {
    ...input,
    name,
    notes: (input.notes ?? "").slice(0, ASSET_NOTES_MAX),
    value: input.value,
    active: Boolean(input.active),
  };
}



// ── Dashboard (composed Overview) ───────────────────────────────────────

export type TileType =
  | "net_worth" | "timeline" | "holdings" | "allocation" | "own_vs_owe"
  | "leverage" | "concentration" | "liquidity" | "since_started";

export type TileSize = "small" | "medium" | "large";

export interface DashboardTile {
  id: string;
  dashboard_id: string;
  tile_type: TileType;
  size: TileSize;
  /** Anything only the tile itself reads. `range` is a token, never dates. */
  config: { range?: string };
}

export interface Dashboard {
  id: string;
  name: string;
  /** THE ORDER. Reordering is one write to this array, not a renumber. */
  tile_ids: string[];
}

/** Tiles already sorted by the parent's `tile_ids`, so callers just map. */
export interface DashboardView {
  dashboard: Dashboard | null;
  tiles: DashboardTile[];
}

export interface AddTileInput { tile_type: TileType; size: TileSize }
export interface UpdateTileInput {
  id: string;
  size?: TileSize;
  config?: DashboardTile["config"];
}
export interface SaveLayoutInput {
  tile_ids: string[];
  name: string;
  removed: string[];
}

// ── Provider interface ──────────────────────────────────────────────────

interface QueryResult<T> {
  data: T;
  isLoading: boolean;
}
interface MutateOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}
interface MutationResult<TInput> {
  mutate: (input: TInput, options?: MutateOptions) => void;
  isLoading: boolean;
}

export interface AssetTrackerDataProvider {
  // Reads
  useProfile(): QueryResult<Profile | null>;
  useAssets(filters: AssetFilters): QueryResult<Asset[]>;
  useAsset(id: string): QueryResult<Asset | null>;
  useNetWorthSnapshots(filters: SnapshotFilters): QueryResult<NetWorthSnapshot[]>;
  useOverviewTiles(): QueryResult<OverviewTileData>;

  // Mutations
  useUpdateProfile(): MutationResult<UpdateProfileInput>;
  /** Rung one of the avatar ladder — see the implementation for why it exists. */
  useUploadAvatar(): MutationResult<File>;
  useCreateAsset(): MutationResult<CreateAssetInput>;
  useUpdateAsset(): MutationResult<UpdateAssetInput>;
  useToggleAssetActive(): MutationResult<{ id: string; active: boolean }>;
  useDeleteAsset(): MutationResult<{ id: string }>;

  // Composed Overview
  useDashboard(): QueryResult<DashboardView>;
  useAddDashboardTile(): MutationResult<AddTileInput>;
  useUpdateDashboardTile(): MutationResult<UpdateTileInput>;
  useSaveDashboardLayout(): MutationResult<SaveLayoutInput>;
  useRemoveDashboardTile(): MutationResult<{ id: string }>;
}

const DataProviderContext = createContext<AssetTrackerDataProvider | null>(null);

export function useDataProvider(): AssetTrackerDataProvider {
  const ctx = useContext(DataProviderContext);
  if (!ctx) throw new Error("useDataProvider must be inside a DataProvider");
  return ctx;
}

// ── SeedDataProvider (demo — seeded, fully interactive, never persisted) ──
//
// The demo behaves exactly like the signed-in app: every read and every write
// works. The difference is where the data lives — React state seeded from
// `src/data/seed.ts`. Nothing is written anywhere, so a refresh restores the
// original demo. The seed modules themselves are copied, never mutated.

function ok<T>(data: T): QueryResult<T> {
  return { data, isLoading: false };
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function SeedDataProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(() =>
    seedAssets.map((a) => ({ ...a })),
  );
  const [profile, setProfile] = useState<Profile>(() => ({ ...seedProfile }));
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>(() =>
    seedSnapshots.map((s) => ({ ...s })),
  );
  // Q2: the demo CAN compose. React state only: no storage, gone on refresh.
  const [demoLayout, setDemoLayout] = useState<DashboardView>(() => ({
    dashboard: {
      id: "demo",
      name: "Overview",
      tile_ids: seedDashboardTiles.map((t) => t.id),
    },
    tiles: seedDashboardTiles,
  }));

  /**
   * Mirror of `writeSnapshot` for the demo: after any asset write, today's
   * snapshot is recomputed so the timeline reacts the way it does for a real
   * account instead of freezing on the seeded curve.
   */
  const syncSnapshot = (next: Asset[]) => {
    const date = todayISO();
    const payload = buildSnapshotPayload(next, date);
    setSnapshots((prev) => {
      const rest = prev.filter((s) => s.date !== date);
      return [
        ...rest,
        { id: `demo-${date}`, user_id: "user-seed", ...payload },
      ].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const writeAssets = (
    updater: (prev: Asset[]) => Asset[],
    options?: MutateOptions,
    message?: string,
  ) => {
    const next = updater(assets);
    setAssets(next);
    syncSnapshot(next);
    if (message) toast.success(message);
    options?.onSuccess?.();
  };


  const provider: AssetTrackerDataProvider = {
    useProfile: () => ok<Profile | null>(profile),

    useAssets: (filters) => {
      let result = assets.slice();
      if (filters.kind !== "all") {
        result = result.filter((a) => a.kind === filters.kind);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter((a) => a.name.toLowerCase().includes(q));
      }
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      return ok(result);
    },

    useAsset: (id) => ok<Asset | null>(assets.find((a) => a.id === id) ?? null),

    useNetWorthSnapshots: (filters) =>
      ok(
        snapshots
          .filter((s) => s.date >= filters.startDate && s.date <= filters.endDate)
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date)),
      ),

    useOverviewTiles: () => ok(computeOverviewTiles(assets)),

    useUpdateProfile: () => ({
      mutate: (input, options) => {
        let clean: UpdateProfileInput;
        try {
          clean = sanitizeProfileInput(input);
        } catch (err) {
          const error = err as Error;
          toast.error(error.message);
          options?.onError?.(error);
          return;
        }
        setProfile((prev) => ({
          ...prev,
          ...clean,
          updated_at: new Date().toISOString(),
        }));
        options?.onSuccess?.();
      },
      isLoading: false,
    }),


    // Same limits as the real upload, but the photo never leaves the browser:
    // an object URL stands in for the storage bucket.
    useUploadAvatar: () => ({
      mutate: (file, options) => {
        if (!AVATAR_TYPES.includes(file.type)) {
          toast.error("That file type isn't supported.");
          options?.onError?.(new Error("Unsupported file type"));
          return;
        }
        if (file.size > AVATAR_MAX_BYTES) {
          toast.error("That image is over 2 MB.");
          options?.onError?.(new Error("File too large"));
          return;
        }
        const url = URL.createObjectURL(file);
        setProfile((prev) => ({
          ...prev,
          avatar_url: url,
          updated_at: new Date().toISOString(),
        }));
        toast.success("Photo updated");
        options?.onSuccess?.();
      },
      isLoading: false,
    }),

    useCreateAsset: () => ({
      mutate: (input, options) => {
        const now = new Date().toISOString();
        const asset: Asset = {
          id: crypto.randomUUID(),
          user_id: "user-seed",
          ...sanitizeAssetInput(input),
          created_at: now,
          updated_at: now,
        };
        writeAssets((prev) => [asset, ...prev], options, "Asset added");
      },
      isLoading: false,
    }),

    useUpdateAsset: () => ({
      mutate: (input, options) => {
        const { id, ...rest } = sanitizeAssetInput(input);
        writeAssets(
          (prev) =>
            prev.map((a) =>
              a.id === id
                ? { ...a, ...rest, updated_at: new Date().toISOString() }
                : a,
            ),
          options,
          "Changes saved",
        );
      },
      isLoading: false,
    }),

    useToggleAssetActive: () => ({
      mutate: ({ id, active }, options) => {
        writeAssets(
          (prev) =>
            prev.map((a) =>
              a.id === id
                ? { ...a, active, updated_at: new Date().toISOString() }
                : a,
            ),
          options,
        );
      },
      isLoading: false,
    }),

    useDeleteAsset: () => ({
      mutate: ({ id }, options) => {
        writeAssets((prev) => prev.filter((a) => a.id !== id), options, "Asset deleted");
      },
      isLoading: false,
    }),

    useDashboard: () => ok(demoLayout),


    useAddDashboardTile: () => ({
      mutate: (input, options) => {
        setDemoLayout((prev) => {
          const tile: DashboardTile = {
            id: `demo-${input.tile_type}-${prev.tiles.length}`,
            dashboard_id: "demo",
            tile_type: input.tile_type,
            size: input.size,
            config: {},
          };
          return {
            dashboard: prev.dashboard
              ? { ...prev.dashboard, tile_ids: [...prev.dashboard.tile_ids, tile.id] }
              : prev.dashboard,
            tiles: [...prev.tiles, tile],
          };
        });
        options?.onSuccess?.();
      },
      isLoading: false,
    }),

    useUpdateDashboardTile: () => ({
      mutate: (input, options) => {
        setDemoLayout((prev) => ({
          ...prev,
          tiles: prev.tiles.map((t) =>
            t.id === input.id
              ? {
                  ...t,
                  ...(input.size ? { size: input.size } : {}),
                  ...(input.config ? { config: input.config } : {}),
                }
              : t,
          ),
        }));
        options?.onSuccess?.();
      },
      isLoading: false,
    }),

    useSaveDashboardLayout: () => ({
      mutate: (input, options) => {
        setDemoLayout((prev) => ({
          dashboard: prev.dashboard
            ? { ...prev.dashboard, tile_ids: input.tile_ids, name: input.name }
            : prev.dashboard,
          tiles: prev.tiles.filter((t) => !input.removed.includes(t.id)),
        }));
        options?.onSuccess?.();
      },
      isLoading: false,
    }),

    useRemoveDashboardTile: () => ({
      mutate: ({ id }, options) => {
        setDemoLayout((prev) => ({
          dashboard: prev.dashboard
            ? { ...prev.dashboard, tile_ids: prev.dashboard.tile_ids.filter((t) => t !== id) }
            : prev.dashboard,
          tiles: prev.tiles.filter((t) => t.id !== id),
        }));
        options?.onSuccess?.();
      },
      isLoading: false,
    }),
  };

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}

// ── SupabaseDataProvider (real — reads Supabase via React Query) ──────────

const ASSET_COLUMNS = "id, name, kind, value, notes, active, created_at, updated_at";

/**
 * Recompute and upsert today's net worth snapshot from the full assets list.
 * Called after every asset create / update / toggle / delete.
 */
async function writeSnapshot(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("assets")
    .select(ASSET_COLUMNS)
    .eq("user_id", userId);
  const assets = (data ?? []) as Asset[];
  const today = new Date().toISOString().split("T")[0];
  const payload = buildSnapshotPayload(assets, today);
  await supabase
    .from("net_worth_snapshots")
    .upsert({ user_id: userId, ...payload }, { onConflict: "user_id,date" });
}

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const invalidateAssets = () => {
    queryClient.invalidateQueries({ queryKey: ["assets", userId] });
    queryClient.invalidateQueries({ queryKey: ["net_worth_snapshots", userId] });
  };

  const provider: AssetTrackerDataProvider = {
    useProfile: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["profiles", userId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("profiles")
            // avatar_url has to be SELECTED, not merely exist. A column that is
            // never read is the same as having no photo — the avatar falls to
            // the monogram while every piece looks wired.
            .select("id, display_name, currency, avatar_url, updated_at")
            .eq("id", userId!)
            .single();
          return (data as Profile) ?? null;
        },
        enabled: !!userId,
      });
      return { data: data ?? null, isLoading };
    },

    useAssets: (filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ["assets", userId, filters],
        queryFn: async () => {
          let query = supabase
            .from("assets")
            .select(ASSET_COLUMNS)
            .eq("user_id", userId!)
            .order("created_at", { ascending: false });
          if (filters.kind && filters.kind !== "all") {
            query = query.eq("kind", filters.kind);
          }
          if (filters.search) {
            query = query.ilike("name", `%${filters.search}%`);
          }
          const { data } = await query;
          return (data as Asset[]) ?? [];
        },
        enabled: !!userId,
      });
      return { data: data ?? [], isLoading };
    },

    useAsset: (id) => {
      const { data, isLoading } = useQuery({
        queryKey: ["asset", id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("assets")
            .select(ASSET_COLUMNS)
            .eq("id", id)
            .eq("user_id", userId!)
            .single();
          return (data as Asset) ?? null;
        },
        enabled: !!userId && !!id,
      });
      return { data: data ?? null, isLoading };
    },

    useNetWorthSnapshots: (filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ["net_worth_snapshots", userId, filters],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("net_worth_snapshots")
            .select(
              "id, date, net_worth, total_assets, total_liabilities, breakdown",
            )
            .eq("user_id", userId!)
            .gte("date", filters.startDate)
            .lte("date", filters.endDate)
            .order("date", { ascending: true });
          return (data as NetWorthSnapshot[]) ?? [];
        },
        enabled: !!userId,
      });
      return { data: data ?? [], isLoading };
    },

    // Derived from useAssets — no Supabase call of its own.
    useOverviewTiles: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["assets", userId, { kind: "all", search: "" }],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("assets")
            .select(ASSET_COLUMNS)
            .eq("user_id", userId!)
            .order("created_at", { ascending: false });
          return (data as Asset[]) ?? [];
        },
        enabled: !!userId,
      });
      return { data: computeOverviewTiles(data ?? []), isLoading };
    },

    /**
     * Put a photo on the account — the first rung of the avatar ladder, and the
     * only one that needs a person to do something.
     *
     * Uploads to `avatars/<user id>/<timestamp>.<ext>`, then writes the public
     * URL onto the profile. The timestamp is not decoration: the bucket is
     * public and therefore cached, so reusing one filename would leave the old
     * face showing until the cache expired.
     *
     * A failure leaves the old photo alone and says so. It never clears the
     * column on the way past, which would drop someone to a monogram because
     * their network hiccuped.
     */
    useUploadAvatar: () => {
      const mutation = useMutation({
        mutationFn: async (file: File) => {
          if (!userId) throw new Error("You need to be signed in.");
          if (!AVATAR_TYPES.includes(file.type)) {
            throw new Error("That file type isn't supported.");
          }
          if (file.size > AVATAR_MAX_BYTES) {
            throw new Error("That image is over 2 MB.");
          }
          // Extension comes from the validated MIME type, never from the
          // uploaded filename — a crafted name must not steer the path.
          const ext = AVATAR_EXT_BY_TYPE[file.type];
          const path = `${userId}/${Date.now()}.${ext}`;

          const { error: upErr } = await supabase.storage
            .from("avatars")
            .upload(path, file, { upsert: true, contentType: file.type });
          if (upErr) throw upErr;

          // The bucket is private and readable only by its owner, so a public
          // URL would 400. A signed URL is minted for the owner instead.
          const { data: signed, error: signErr } = await supabase.storage
            .from("avatars")
            .createSignedUrl(path, AVATAR_SIGNED_URL_TTL);
          if (signErr) throw signErr;

          const { data, error } = await supabase
            .from("profiles")
            .update({
              avatar_url: signed.signedUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .select()
            .single();
          if (error) throw error;
          return data as Profile;
        },

        // Invalidate rather than patch: every avatar in the app reads the same
        // profile query, so the header, the menu and the settings row all pick
        // the new face up together, with no reload.
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["profiles", userId] });
          toast.success("Photo updated");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Couldn't upload that photo. Try again.");
        },
      });
      return { mutate: mutation.mutate, isLoading: mutation.isPending };
    },

    useUpdateProfile: () => {
      const mutation = useMutation({
        mutationFn: async (input: UpdateProfileInput) => {
          if (!userId) throw new Error("You need to be signed in.");
          // Validate at the write, not only in the dialog.
          const clean = sanitizeProfileInput(input);
          const { data, error } = await supabase
            .from("profiles")
            .update({ ...clean, updated_at: new Date().toISOString() })
            .eq("id", userId)
            .select()
            .single();
          if (error) throw error;
          return data as Profile;
        },

        onMutate: async (input) => {
          await queryClient.cancelQueries({ queryKey: ["profiles", userId] });
          const previous = queryClient.getQueryData<Profile | null>([
            "profiles",
            userId,
          ]);
          if (previous) {
            queryClient.setQueryData<Profile>(["profiles", userId], {
              ...previous,
              ...input,
            });
          }
          return { previous };
        },
        onError: (_err, _input, context) => {
          queryClient.setQueryData(["profiles", userId], context?.previous);
          toast.error("Couldn't save your profile. Try again.");
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["profiles", userId] });
        },
      });
      return { mutate: mutation.mutate, isLoading: mutation.isPending };
    },

    useCreateAsset: () => {
      const mutation = useMutation({
        mutationFn: async (input: CreateAssetInput) => {
          if (!userId) throw new Error("You need to be signed in.");
          const clean = sanitizeAssetInput(input);
          const { data, error } = await supabase
            .from("assets")
            .insert({ user_id: userId, ...clean })
            .select()
            .single();
          if (error) throw error;
          return data as Asset;
        },
        onMutate: async (input) => {
          const key = ["assets", userId];
          await queryClient.cancelQueries({ queryKey: key });
          const previous = queryClient.getQueriesData<Asset[]>({ queryKey: key });
          const now = new Date().toISOString();
          const optimistic: Asset = {
            id: `temp-${now}`,
            user_id: userId ?? "",
            ...input,
            created_at: now,
            updated_at: now,
          };
          queryClient.setQueriesData<Asset[]>({ queryKey: key }, (old) =>
            old ? [optimistic, ...old] : [optimistic],
          );
          return { previous };
        },
        onError: (_err, _input, context) => {
          context?.previous?.forEach(([key, data]) =>
            queryClient.setQueryData(key, data),
          );
          toast.error("Couldn't save your asset. Try again.");
        },
        onSuccess: async () => {
          await writeSnapshot(userId!);
          toast.success("Asset added");
        },
        onSettled: invalidateAssets,
      });
      return { mutate: mutation.mutate, isLoading: mutation.isPending };
    },

    useUpdateAsset: () => {
      const mutation = useMutation({
        mutationFn: async (input: UpdateAssetInput) => {
          const { id, ...rest } = sanitizeAssetInput(input);
          const { data, error } = await supabase
            .from("assets")
            .update({ ...rest, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", userId!)
            .select()
            .single();
          if (error) throw error;
          return data as Asset;
        },
        onMutate: async (input) => {
          const key = ["assets", userId];
          await queryClient.cancelQueries({ queryKey: key });
          const previous = queryClient.getQueriesData<Asset[]>({ queryKey: key });
          queryClient.setQueriesData<Asset[]>({ queryKey: key }, (old) =>
            old
              ? old.map((a) => (a.id === input.id ? { ...a, ...input } : a))
              : old,
          );
          return { previous };
        },
        onError: (_err, _input, context) => {
          context?.previous?.forEach(([key, data]) =>
            queryClient.setQueryData(key, data),
          );
          toast.error("Couldn't save your changes. Try again.");
        },
        onSuccess: async (_data, input) => {
          await writeSnapshot(userId!);
          queryClient.invalidateQueries({ queryKey: ["asset", input.id] });
          toast.success("Changes saved");
        },
        onSettled: invalidateAssets,
      });
      return { mutate: mutation.mutate, isLoading: mutation.isPending };
    },

    useToggleAssetActive: () => {
      const mutation = useMutation({
        mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
          const { error } = await supabase
            .from("assets")
            .update({ active, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", userId!);
          if (error) throw error;
        },
        onMutate: async ({ id, active }) => {
          const key = ["assets", userId];
          await queryClient.cancelQueries({ queryKey: key });
          const previous = queryClient.getQueriesData<Asset[]>({ queryKey: key });
          queryClient.setQueriesData<Asset[]>({ queryKey: key }, (old) =>
            old ? old.map((a) => (a.id === id ? { ...a, active } : a)) : old,
          );
          return { previous };
        },
        onError: (_err, _input, context) => {
          context?.previous?.forEach(([key, data]) =>
            queryClient.setQueryData(key, data),
          );
          toast.error("Couldn't update the asset. Try again.");
        },
        onSuccess: async () => {
          await writeSnapshot(userId!);
        },
        onSettled: invalidateAssets,
      });
      return { mutate: mutation.mutate, isLoading: mutation.isPending };
    },

    useDeleteAsset: () => {
      const mutation = useMutation({
        mutationFn: async ({ id }: { id: string }) => {
          const { error } = await supabase
            .from("assets")
            .delete()
            .eq("id", id)
            .eq("user_id", userId!);
          if (error) throw error;
        },
        onMutate: async ({ id }) => {
          const key = ["assets", userId];
          await queryClient.cancelQueries({ queryKey: key });
          const previous = queryClient.getQueriesData<Asset[]>({ queryKey: key });
          queryClient.setQueriesData<Asset[]>({ queryKey: key }, (old) =>
            old ? old.filter((a) => a.id !== id) : old,
          );
          return { previous };
        },
        onError: (_err, _input, context) => {
          context?.previous?.forEach(([key, data]) =>
            queryClient.setQueryData(key, data),
          );
          toast.error("Couldn't delete the asset. Try again.");
        },
        onSuccess: async (_data, input) => {
          await writeSnapshot(userId!);
          queryClient.invalidateQueries({ queryKey: ["asset", input.id] });
          toast.success("Asset deleted");
        },
        onSettled: invalidateAssets,
      });
      return { mutate: mutation.mutate, isLoading: mutation.isPending };
    },

    // ── Composed Overview ────────────────────────────────────────────────

    useDashboard: () => {
      const query = useQuery({
        queryKey: ["dashboard", userId],
        queryFn: async (): Promise<DashboardView> => {
          const { data: dash } = await supabase
            .from("dashboards")
            .select("id, name, tile_ids")
            .eq("user_id", userId!)
            .maybeSingle();
          if (!dash) return { dashboard: null, tiles: [] };

          const { data: rows } = await supabase
            .from("dashboard_tiles")
            .select("id, dashboard_id, tile_type, size, config")
            .eq("dashboard_id", dash.id);

          // tile_ids IS the order. Anything it lists that we did not load is
          // skipped rather than rendered as a hole.
          const byId = new Map(
            ((rows ?? []) as DashboardTile[]).map((r) => [r.id, r]),
          );
          const tiles = ((dash.tile_ids ?? []) as string[])
            .map((id) => byId.get(id))
            .filter((t): t is DashboardTile => Boolean(t));

          return { dashboard: dash as Dashboard, tiles };
        },
        enabled: Boolean(userId),
      });
      return {
        data: query.data ?? { dashboard: null, tiles: [] },
        isLoading: query.isLoading,
      };
    },

    useAddDashboardTile: () => {
      const mutation = useMutation({
        // One RPC, not two writes — see the migration. A crash between the
        // insert and the array append would otherwise orphan the tile.
        mutationFn: async (input: AddTileInput) => {
          const { data, error } = await supabase.rpc("add_dashboard_tile", {
            p_tile_type: input.tile_type,
            p_size: input.size,
            p_config: {},
          });
          if (error) throw error;
          return data as DashboardTile;
        },
        onError: () => toast.error("Couldn't add that tile. Try again."),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
        },
      });
      return { mutate: mutation.mutate, isLoading: mutation.isPending };
    },

    useUpdateDashboardTile: () => {
      const mutation = useMutation({
        mutationFn: async (input: UpdateTileInput) => {
          const { id, ...patch } = input;
          const { error } = await supabase
            .from("dashboard_tiles")
            .update(patch)
            .eq("id", id);
          if (error) throw error;
        },
        // Resizing has to feel instant — the grid repacks under the pointer.
        onMutate: async (input) => {
          await queryClient.cancelQueries({ queryKey: ["dashboard", userId] });
          const previous = queryClient.getQueryData<DashboardView>([
            "dashboard",
            userId,
          ]);
          if (previous) {
            queryClient.setQueryData<DashboardView>(["dashboard", userId], {
              ...previous,
              tiles: previous.tiles.map((t) =>
                t.id === input.id
                  ? {
                      ...t,
                      ...(input.size ? { size: input.size } : {}),
                      ...(input.config ? { config: input.config } : {}),
                    }
                  : t,
              ),
            });
          }
          return { previous };
        },
        onError: (_e, _i, context) => {
          queryClient.setQueryData(["dashboard", userId], context?.previous);
          toast.error("Couldn't save that change. Try again.");
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
        },
      });
      return { mutate: mutation.mutate, isLoading: mutation.isPending };
    },

    useSaveDashboardLayout: () => {
      const mutation = useMutation({
        mutationFn: async (input: SaveLayoutInput) => {
          const current = queryClient.getQueryData<DashboardView>([
            "dashboard",
            userId,
          ]);
          const dashboardId = current?.dashboard?.id;
          if (!dashboardId) throw new Error("No dashboard");

          // Removals first. If this half fails the order is untouched, which is
          // recoverable; the reverse leaves tile_ids pointing at nothing.
          if (input.removed.length) {
            const { error } = await supabase
              .from("dashboard_tiles")
              .delete()
              .in("id", input.removed);
            if (error) throw error;
          }

          const { error } = await supabase
            .from("dashboards")
            .update({
              tile_ids: input.tile_ids,
              name: input.name,
              updated_at: new Date().toISOString(),
            })
            .eq("id", dashboardId);
          if (error) throw error;
        },
        onError: () => toast.error("Couldn't save your layout. Try again."),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
        },
      });
      return { mutate: mutation.mutate, isLoading: mutation.isPending };
    },

    useRemoveDashboardTile: () => {
      const mutation = useMutation({
        mutationFn: async ({ id }: { id: string }) => {
          const current = queryClient.getQueryData<DashboardView>([
            "dashboard",
            userId,
          ]);
          const dashboardId = current?.dashboard?.id;
          if (!dashboardId) throw new Error("No dashboard");

          const { error: delErr } = await supabase
            .from("dashboard_tiles")
            .delete()
            .eq("id", id);
          if (delErr) throw delErr;

          const { error } = await supabase
            .from("dashboards")
            .update({
              tile_ids: (current?.dashboard?.tile_ids ?? []).filter(
                (t) => t !== id,
              ),
              updated_at: new Date().toISOString(),
            })
            .eq("id", dashboardId);
          if (error) throw error;
        },
        onMutate: async ({ id }) => {
          await queryClient.cancelQueries({ queryKey: ["dashboard", userId] });
          const previous = queryClient.getQueryData<DashboardView>([
            "dashboard",
            userId,
          ]);
          if (previous) {
            queryClient.setQueryData<DashboardView>(["dashboard", userId], {
              ...previous,
              tiles: previous.tiles.filter((t) => t.id !== id),
            });
          }
          return { previous };
        },
        onError: (_e, _i, context) => {
          queryClient.setQueryData(["dashboard", userId], context?.previous);
          toast.error("Couldn't remove that tile. Try again.");
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
        },
      });
      return { mutate: mutation.mutate, isLoading: mutation.isPending };
    },
  };

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}
