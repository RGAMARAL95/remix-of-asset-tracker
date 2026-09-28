# Make the demo behave like the real app (without persistence)

Today `/demo/*` reads the seed fixtures but every write is blocked with a "Sign in to save changes" toast: you can't add, edit, toggle or delete an asset, and Settings (name, currency, photo) does nothing. Only the dashboard layout is editable.

The change: the demo becomes fully interactive. Everything works exactly as it does when signed in — assets, settings, avatar, tiles — but the state lives in React memory only, so a refresh restores the original seeded demo.

## What changes for the visitor

- Add / edit / delete assets and toggle active on `/demo/assets` — the table, overview tiles and timeline all update live.
- Settings: change display name and currency, upload or remove a photo; the account menu avatar updates immediately.
- Dashboard tiles keep working as they do now (add, resize, reorder, remove).
- Refreshing the page resets everything back to the seeded "Alex Morgan" demo.
- The demo menu keeps its "Nothing you change is kept" subtitle, which now describes the behaviour accurately.

## Technical detail

All work is inside `src/lib/data-provider.tsx`, in `SeedDataProvider`:

- Hold `assets`, `profile` and `snapshots` in `useState`, initialised from `src/data/seed.ts` (copies, so the module fixtures are never mutated).
- Implement the mutation hooks against that state instead of `demoWriteBlocked`:
  - `useCreateAsset` — new row with `crypto.randomUUID()` and current timestamps.
  - `useUpdateAsset`, `useToggleAssetActive`, `useDeleteAsset` — operate on the in-memory list.
  - `useUpdateProfile` — patches display name / currency / `avatar_url` (null removes the photo).
  - `useUploadAvatar` — validate against the existing `AVATAR_MAX_BYTES` / `AVATAR_TYPES` rules, then store an object URL from `URL.createObjectURL(file)`; no upload, no bucket.
  - Each calls `options?.onSuccess?.()` so forms navigate and toasts fire like the signed-in app.
- After any asset write, recompute today's snapshot in memory with the existing `buildSnapshotPayload`, replacing today's entry so the timeline reacts the same way it does for a real user.
- `useAssets` / `useAsset` / `useNetWorthSnapshots` / `useOverviewTiles` read from state rather than the imported fixtures; filtering and sorting logic stays as-is.
- Remove the now-unused `demoWriteBlocked` helper and update the stale "demo is read-only" comments in `SeedDataProvider` and `src/pages/assets-new/components/asset-form.tsx`.

No schema, routing or auth changes; `SupabaseDataProvider` is untouched.
