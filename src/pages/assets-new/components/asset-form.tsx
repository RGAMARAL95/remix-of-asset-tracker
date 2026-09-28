import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconLoader2 } from "@tabler/icons-react";

import {
  useDataProvider,
  type Asset,
  type AssetKind,
} from "@/lib/data-provider";
import { DeleteAssetDialog } from "@/pages/assets/components/delete-asset-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { KIND_OPTIONS } from "./kind-options";

const KINDS = KIND_OPTIONS.map((k) => k.value) as [AssetKind, ...AssetKind[]];

const assetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give the asset a name.")
    .max(80, "Keep the name under 80 characters."),
  kind: z.enum(KINDS, { message: "Pick a kind." }),
  value: z
    .number({ message: "Enter a value." })
    .min(0, "Value can't be negative — sign is set by the kind."),
  notes: z.string().max(2000).optional(),
  active: z.boolean(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

/**
 * Shared asset form — React Hook Form + Zod. Used by both the Add asset
 * (`/assets/new`) and Edit asset (`/assets/:id`) pages.
 *
 * - No `asset` prop → create mode: `useCreateAsset` inserts a new row.
 * - `asset` prop → edit mode: fields pre-fill from the row, `useUpdateAsset`
 *   writes it back, and a "Delete asset" action (ghost, destructive-colored)
 *   opens a confirm dialog wired to `useDeleteAsset`.
 *
 * Every mutation also upserts today's net-worth snapshot in the provider, then
 * navigates back to `/assets`. The currency suffix on the value label follows
 * `profiles.currency`.
 */
export function AssetForm({ asset }: { asset?: Asset }) {
  const { useCreateAsset, useUpdateAsset, useDeleteAsset, useProfile } =
    useDataProvider();
  const create = useCreateAsset();
  const update = useUpdateAsset();
  const del = useDeleteAsset();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "USD";

  const isEdit = !!asset;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDemo = pathname.startsWith("/demo");
  const assetsPath = isDemo ? "/demo/assets" : "/assets";

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: asset
      ? {
          name: asset.name,
          kind: asset.kind,
          value: asset.value,
          notes: asset.notes ?? "",
          active: asset.active,
        }
      : {
          name: "",
          kind: undefined,
          value: undefined,
          notes: "",
          active: true,
        },
  });

  const submitting = isEdit ? update.isLoading : create.isLoading;

  function onSubmit(values: AssetFormValues) {
    const payload = {
      name: values.name.trim(),
      kind: values.kind,
      value: values.value,
      notes: values.notes?.trim() ?? "",
      active: values.active,
    };
    // Navigate only once the write succeeds — the "Saving…" state stays visible
    // while the request is in-flight, and we land on /assets with the row
    // already updated / inserted. The demo takes the same path; its writes land
    // in memory and are gone on refresh.

    if (isEdit && asset) {
      update.mutate(
        { id: asset.id, ...payload },
        { onSuccess: () => navigate(assetsPath) },
      );
    } else {
      create.mutate(payload, { onSuccess: () => navigate(assetsPath) });
    }
  }

  function handleConfirmDelete(row: Asset) {
    del.mutate(
      { id: row.id },
      {
        onSuccess: () => {
          setConfirmDelete(false);
          navigate(assetsPath);
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Main Residence…"
                  maxLength={80}
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Kind */}
        <FormField
          control={form.control}
          name="kind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kind</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={submitting}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a kind…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {KIND_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      {/* One flex span, not two loose children. Radix wraps
                          whatever it is given in a single block-level ItemText,
                          so an icon and a label passed side by side stacked —
                          the icon sat above the word, in the menu AND in the
                          trigger, since the trigger echoes the chosen item. */}
                      <span className="flex items-center gap-2">
                        <Icon className="size-4 shrink-0" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Value */}
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value ({currency})</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="0.00…"
                  className="tabular-nums"
                  disabled={submitting}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : e.target.valueAsNumber,
                    )
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Enter the current value in {currency}. For liabilities, enter a
                positive number — it's subtracted from your net worth.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea rows={2} disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active */}
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Active</FormLabel>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={submitting}
                  />
                </FormControl>
                <span className="text-sm text-foreground">
                  {field.value ? "Currently owned" : "Sold / retired"}
                </span>
              </div>
              <FormDescription>
                Inactive assets are hidden from all totals.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Actions — submit stays enabled (crud.md / ui-guidelines: keep the
            button enabled, validate on submit, disable only while in-flight).
            The screenboard's "disabled until Name+Kind+Value filled" state is
            handled by Zod's inline field errors instead.

            Edit mode adds a left-aligned "Delete asset" ghost/destructive
            trigger that opens the confirm dialog; add mode has no delete. */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={submitting}
              onClick={() => setConfirmDelete(true)}
            >
              Delete asset
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => navigate(assetsPath)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <IconLoader2 className="size-4 animate-spin" />}
              {submitting
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Save asset"}
            </Button>
          </div>
        </div>
      </form>

      {isEdit && (
        <DeleteAssetDialog
          asset={confirmDelete ? asset : null}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </Form>
  );
}
