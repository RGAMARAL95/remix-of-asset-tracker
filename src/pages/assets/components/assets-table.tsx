import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IconDots, IconPencil, IconTrash } from "@tabler/icons-react";

import { useDataProvider, type Asset } from "@/lib/data-provider";
import { kindColor, kindLabel } from "@/lib/asset-kinds";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { useCurrency } from "./use-currency";
import { AssetsBlankslate } from "./assets-blankslate";
import { DeleteAssetDialog } from "./delete-asset-dialog";

interface AssetsTableProps {
  assets: Asset[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

/**
 * The assets list table. Clickable rows drill into the editor; the Active
 * switch toggles in-place, the row menu edits or deletes. Renders skeleton
 * rows while loading, a blankslate when the account is empty, and a
 * "no matches" message when filters exclude every row.
 */
export function AssetsTable({
  assets,
  isLoading,
  hasActiveFilters,
  onClearFilters,
}: AssetsTableProps) {
  const { useToggleAssetActive, useDeleteAsset } = useDataProvider();
  const toggleActive = useToggleAssetActive();
  const deleteAsset = useDeleteAsset();
  const { format } = useCurrency();
  const [, setParams] = useSearchParams();

  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  // Opening an asset puts it in the address rather than changing route, so the
  // list stays behind the dialog and a link to one asset can be pasted. The
  // route it used to push, /assets/:id, now just redirects here.
  const openAsset = useCallback(
    (id: string) => setParams({ asset: id }),
    [setParams],
  );

  return (
    // overflow-x-auto, not hidden: on a phone the five columns are wider than
    // the card, and `hidden` silently cropped Value, Active and the row menu.
    //
    // No border either. The card around this is already the frame; a second
    // rounded box inside it framed the table twice, which is part of what made
    // the screen read as flat and outlined. The row rules alone separate the
    // rows, the same way the tiles' own lists do.
    <div className="overflow-x-auto overflow-y-hidden">
      <Table className="min-w-[520px]">

        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Active</TableHead>
            {/* The row-menu column had an empty <th> (axe: empty-table-header);
                a screen reader announced nothing for it. */}
            <TableHead className="w-10">
              <span className="sr-only">Row actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell>
                  <Skeleton className="h-4 w-40 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-9 rounded-full" />
                </TableCell>
                <TableCell />
              </TableRow>
            ))
          ) : assets.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="p-0">
                {hasActiveFilters ? (
                  <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                    <p className="text-sm text-muted-foreground">
                      No assets match your filters.
                    </p>
                    <Button variant="outline" onClick={onClearFilters}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <AssetsBlankslate />
                )}
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => {
              const isLiability = asset.kind === "liability";
              return (
                <TableRow
                  key={asset.id}
                  onClick={() => openAsset(asset.id)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent/50",
                    !asset.active && "opacity-50",
                  )}
                >
                  <TableCell className="text-sm font-medium text-foreground">
                    {asset.name}
                  </TableCell>
                  <TableCell>
                    {/* A dot in the kind's colour, then the label — the same
                        shape as the Allocation tile's legend, so the same kind
                        looks the same on both screens. This replaced a tinted
                        badge (bg-blue-50 / text-blue-700), which was built for
                        a white card and carried a different colour per kind
                        than the dashboard did. */}
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: kindColor(asset.kind) }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {kindLabel(asset.kind)}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right text-sm tabular-nums",
                      isLiability ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {isLiability ? "−" : ""}
                    {format(asset.value)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={asset.active}
                      onCheckedChange={(active) =>
                        toggleActive.mutate({ id: asset.id, active })
                      }
                      aria-label={
                        asset.active ? "Set inactive" : "Set active"
                      }
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label="Row actions"
                        >
                          <IconDots className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => openAsset(asset.id)}
                        >
                          <IconPencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setDeleteTarget(asset)}
                        >
                          <IconTrash className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <DeleteAssetDialog
        asset={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(asset) => {
          deleteAsset.mutate({ id: asset.id });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
