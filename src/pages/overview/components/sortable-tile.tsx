import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconMinus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import type { TileSize } from "@/lib/data-provider";

import { SIZE_CLASS } from "./tile-registry";

/**
 * Wraps a tile while rearranging. Only mounted in that mode, so view mode pays
 * nothing for the drag machinery.
 *
 * The whole tile is the drag handle, which is what the reference does — there
 * is no separate grip. The body is inert underneath, so a drag can start
 * anywhere on the card without a click landing on something inside it.
 */
export function SortableTile( {
  id,
  size,
  onRemove,
  children,
}: {
  id: string;
  size: TileSize;
  onRemove: () => void;
  children: ReactNode;
} ) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable( { id } );

  return (
    <div
      ref={ setNodeRef }
      style={ { transform: CSS.Translate.toString( transform ), transition } }
      className={ `relative ${ SIZE_CLASS[ size ] } ${
        isDragging ? "z-10 opacity-70" : ""
      }` }
    >
      {/* The remove control sits ABOVE the drag listeners in the tree, so
          clicking it never starts a drag. */}
      <Button
        size="icon"
        onClick={ onRemove }
        aria-label="Remove tile"
        className="absolute -left-2 -top-2 z-20 size-6 rounded-full bg-[#D23222] text-white hover:bg-[#b92c1e]"
      >
        <IconMinus className="size-4" />
      </Button>

      <div
        { ...attributes }
        { ...listeners }
        className="h-full cursor-grab touch-none select-none active:cursor-grabbing [&_*]:pointer-events-none"
      >
        { children }
      </div>
    </div>
  );
}
