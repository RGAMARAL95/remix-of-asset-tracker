import type { Asset } from "@/lib/data-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * Confirm-delete dialog for a single asset row. Controlled by the parent —
 * `asset` is the row being deleted (null when closed). Naming the asset in the
 * body prevents accidental deletion of the wrong row.
 */
export function DeleteAssetDialog({
  asset,
  onClose,
  onConfirm,
}: {
  asset: Asset | null;
  onClose: () => void;
  onConfirm: (asset: Asset) => void;
}) {
  return (
    <AlertDialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete asset</AlertDialogTitle>
          <AlertDialogDescription>
            Remove “{asset?.name}” from your assets? This cannot be undone. Your
            net worth will update.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              buttonVariants({ variant: "destructive" }),
              "rounded-full",
            )}
            onClick={() => asset && onConfirm(asset)}
          >
            Delete asset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
