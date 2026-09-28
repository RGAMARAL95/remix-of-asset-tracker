import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { IconLoader2 } from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDataProvider } from "@/lib/data-provider";

import { AssetForm } from "@/pages/assets-new/components/asset-form";

/**
 * Add and edit an asset, in a dialog over the list.
 *
 *   Add asset            →  ?asset=new
 *   Edit, or a row click →  ?asset=<id>
 *   load either cold     →  the dialog opens, filled in
 *
 * This replaced two nearly identical full pages, `/assets/new` and
 * `/assets/:id`. Both drew a 672px card on a 1232px page, so more than half the
 * screen was empty — a modal wearing a page's clothes. It also meant two files
 * for one job, which is how the headings and the back links drifted apart.
 *
 * A dialog is what the reference does. Its own "add widget" flow is a dialog on
 * a query parameter — `?createWidget=true` — never a route. It is also the
 * shape already used here for Settings (`?settings=`) and the tile picker, so
 * this is the app's existing idea applied to one more thing.
 *
 * Keeping the list behind the dialog matters: you can see the thing you are
 * adding to, and after saving the new row appears in place rather than after a
 * page change.
 *
 * The form needs no changes to work here. It already navigates to `/assets` on
 * save, cancel and delete, and from `/assets?asset=…` that drops the parameter,
 * which closes this. One exit, three callers.
 */
export function AssetDialog() {
  const [ params, setParams ] = useSearchParams();
  const raw = params.get( "asset" );

  const open = raw !== null;
  const isNew = raw === "new";

  const { useAsset } = useDataProvider();
  // Skipped for "new" — passing "" makes the hook a no-op rather than a lookup
  // for an asset called "new".
  const { data: asset, isLoading } = useAsset( isNew || !raw ? "" : raw );

  const handleOpenChange = useCallback(
    ( next: boolean ) => {
      if ( next ) return;
      const p = new URLSearchParams( params );
      p.delete( "asset" );
      // replace, so Back leaves the list rather than reopening the dialog.
      setParams( p, { replace: true } );
    },
    [ params, setParams ]
  );

  if ( !open ) return null;

  const title = isNew ? "Add asset" : asset?.name ?? "Edit asset";

  return (
    <Dialog open onOpenChange={ handleOpenChange }>
      {/* 560 wide. The form is a single column of short fields; the picker's
          960 is for choosing between tiles by shape, which is a different job.
          Full height on a phone, where a centred box plus a keyboard leaves
          almost nothing visible. */}
      <DialogContent className="max-h-[100dvh] w-full max-w-[560px] gap-0 overflow-y-auto p-6 max-sm:h-[100dvh] max-sm:max-h-none max-sm:rounded-none">
        <DialogTitle className="text-[24px] font-bold leading-[30px]">
          { title }
        </DialogTitle>
        <DialogDescription className="sr-only">
          { isNew
            ? "Name the asset, choose its kind and enter what it is worth."
            : "Change this asset's name, kind, value or notes." }
        </DialogDescription>

        <div className="mt-4">
          { isNew ? (
            <AssetForm />
          ) : isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <IconLoader2 className="size-4 animate-spin" />
              Loading asset…
            </div>
          ) : !asset ? (
            // The id does not match a row for this user — a stale link, or
            // something deleted in another tab.
            <p className="py-8 text-sm text-muted-foreground">
              This asset doesn&rsquo;t exist or has been removed.
            </p>
          ) : (
            <AssetForm asset={ asset } />
          ) }
        </div>
      </DialogContent>
    </Dialog>
  );
}
