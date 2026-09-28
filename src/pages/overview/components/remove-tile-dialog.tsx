import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Removing a tile confirms. That was tested on the reference rather than
 * reasoned about — an earlier draft argued no dialog was needed since removing
 * loses no data, and the reference disagrees.
 *
 * The shape is theirs: 700×194 at radius 4, heading 24 w700, body 13 w400,
 * buttons 136×34 right-aligned 11px apart, destructive action in #D23222.
 *
 * The words are NOT theirs. Their menu says "Remove Widget" and their dialog
 * says "Delete the widget?" — two verbs for one action — and "This cannot be
 * undone", which is simply untrue here: the tile comes straight back from the
 * picker and no asset is touched.
 */
export function RemoveTileDialog( {
  open,
  tileLabel,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  tileLabel: string;
  onOpenChange: ( next: boolean ) => void;
  onConfirm: () => void;
} ) {
  return (
    <AlertDialog open={ open } onOpenChange={ onOpenChange }>
      <AlertDialogContent className="ref-popover w-[700px] max-w-[calc(100vw-32px)] gap-0 border-0 p-0">
        <div className="px-[35px] pb-5 pt-10">
          <AlertDialogTitle className="text-[24px] font-bold leading-[29px] text-[#111]">
            Remove this tile?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-3 text-[13px] leading-[18px] text-[#333]">
            { tileLabel } comes back any time from Add a tile. Your assets are
            not affected.
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter className="flex-row justify-end gap-[11px] border-t border-[#e9e9e9] px-[35px] py-4 sm:justify-end">
          <AlertDialogCancel className="m-0 h-[34px] w-[136px] rounded border-0 bg-[#EEEEF2] text-[14px] font-medium text-[rgb(0,93,210)] hover:bg-[#e4e4e9]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={ onConfirm }
            className="m-0 h-[34px] w-[136px] rounded bg-[#D23222] text-[14px] font-medium text-white hover:bg-[#b92c1e]"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
