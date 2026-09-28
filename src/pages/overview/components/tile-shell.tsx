import type { ReactNode } from "react";
import { useCallback } from "react";
import { IconDots } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TileSize } from "@/lib/data-provider";
import { cn } from "@/lib/utils";

import { SIZE_CLASS, SIZE_LABEL, TILE_SIZES } from "./tile-registry";
import { RANGE_LABEL, RANGE_TOKENS, type RangeToken } from "./tile-time-range";
import { useTileSurface } from "./tile-surface";

/**
 * What the dashboard hands each tile so it can render its own chrome. Empty on
 * the landing marquee, which has no menus and sizes its own boxes.
 */
export interface TileChromeProps {
  size?: TileSize;
  range?: RangeToken;
  onRangeChange?: ( next: RangeToken ) => void;
  onResize?: ( next: TileSize ) => void;
  onRemove?: () => void;
}

interface TileShellProps {
  label: string;
  icon: Icon;
  /** Undefined outside the dashboard — the landing marquee sizes its own boxes. */
  size?: TileSize;
  /** Omitted on the five tiles with no period to choose. */
  range?: RangeToken;
  onRangeChange?: ( next: RangeToken ) => void;
  onResize?: ( next: TileSize ) => void;
  onRemove?: () => void;
  className?: string;
  children: ReactNode;
}

/**
 * A tile. Opaque white on the dashboard, frosted on the landing marquee — the
 * surface comes from context, so the nine tiles never carry it.
 *
 * The tile puts its own span class on itself: a tile knows its own size, so no
 * wrapper has to.
 *
 * Header label is 15/20 weight 600 in sentence case, the reference's card
 * title. The menu mirrors theirs row for row — Size as checkable rows with all
 * three always listed, Remove in #D23222 — with one deliberate difference:
 * theirs marks the current size with a bare <svg> and no ARIA state, so a
 * screen reader cannot tell which size is on. We use a radio group.
 */
export function TileShell( {
  label,
  icon: IconCmp,
  size,
  range,
  onRangeChange,
  onResize,
  onRemove,
  className,
  children,
}: TileShellProps ) {
  const surface = useTileSurface();

  const handleResize = useCallback(
    ( next: string ) => onResize?.( next as TileSize ),
    [ onResize ]
  );
  const handleRange = useCallback(
    ( next: string ) => onRangeChange?.( next as RangeToken ),
    [ onRangeChange ]
  );

  const hasRange = Boolean( range && onRangeChange );
  const hasMenu = Boolean( onResize || onRemove || hasRange );

  // A 192px tile cannot hold the label, a "Last 12 months" control AND the
  // menu — the label was collapsing to nothing. So the header control starts
  // at Medium, and the menu carries the range at every size. One setting in
  // two places, which is how the reference treats Size.
  const showHeaderRange = hasRange && size !== "small";

  return (
    <div
      className={ cn(
        surface === "solid" ? "card-solid" : "card-tonal",
        // h-full matters whenever the card is NOT the direct grid child.
        // SIZE_CLASS is a grid-SPAN class (bento-2x2 = span 2 / span 2), which
        // only applies to a grid child. On the dashboard the card IS that
        // child and the grid stretches it. But while rearranging, the drag
        // wrapper is the grid child and the card sits one level deeper, where
        // the span class does nothing — so the card collapsed to its content
        // (Net worth 93px short in a 400px cell) and the grid looked ragged.
        // The picker previews nest it the same way.
        "flex h-full min-w-0 flex-col gap-3 overflow-hidden p-5 text-[var(--tile-fg)]",
        size ? SIZE_CLASS[ size ] : "",
        className
      ) }
    >
      <div className="flex items-center gap-2">
        <IconCmp className="size-4 shrink-0 text-[var(--tile-muted)]" />
        <span className="truncate text-[15px] font-semibold leading-5">
          { label }
        </span>

        { ( showHeaderRange || hasMenu ) && (
          <div className="ml-auto flex shrink-0 items-center gap-1">
            { showHeaderRange && (
              <DropdownMenu>
                {/* 119×28 in the reference, permanently visible. */}
                <DropdownMenuTrigger
                  className="h-[28px] rounded px-2 text-[13px] text-[var(--tile-muted)] hover:bg-[var(--tile-hover)]"
                  aria-label={ `Time range for ${ label }` }
                >
                  { RANGE_LABEL[ range! ] }
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="ref-popover w-[202px] border-0 py-[10px]">
                  <DropdownMenuRadioGroup value={ range } onValueChange={ handleRange }>
                    { RANGE_TOKENS.map( ( t ) => (
                      <DropdownMenuRadioItem
                        key={ t }
                        value={ t }
                        className="h-[30px] py-0 pl-10 pr-5 text-[13px] text-[#333]"
                      >
                        { RANGE_LABEL[ t ] }
                      </DropdownMenuRadioItem>
                    ) ) }
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) }

            { hasMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex size-[28px] items-center justify-center rounded text-[var(--tile-muted)] hover:bg-[var(--tile-hover)]"
                  aria-label={ `Options for ${ label }` }
                >
                  <IconDots className="size-4" />
                </DropdownMenuTrigger>

                {/* 202 wide, rows 30 tall, text 13px. */}
                <DropdownMenuContent align="end" className="ref-popover w-[202px] border-0 py-[10px]">
                  { hasRange && (
                    <>
                      <DropdownMenuLabel className="h-[30px] px-5 py-0 text-[13px] font-normal leading-[30px] text-[#666]">
                        Time range
                      </DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={ range } onValueChange={ handleRange }>
                        { RANGE_TOKENS.map( ( t ) => (
                          <DropdownMenuRadioItem
                            key={ t }
                            value={ t }
                            className="h-[30px] py-0 pl-10 pr-5 text-[13px] text-[#333]"
                          >
                            { RANGE_LABEL[ t ] }
                          </DropdownMenuRadioItem>
                        ) ) }
                      </DropdownMenuRadioGroup>
                      { onResize && size && <DropdownMenuSeparator className="my-[15px]" /> }
                    </>
                  ) }
                  { onResize && size && (
                    <>
                      <DropdownMenuLabel className="h-[30px] px-5 py-0 text-[13px] font-normal leading-[30px] text-[#666]">
                        Size
                      </DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={ size } onValueChange={ handleResize }>
                        { TILE_SIZES.map( ( s ) => (
                          <DropdownMenuRadioItem
                            key={ s }
                            value={ s }
                            className="h-[30px] py-0 pl-10 pr-5 text-[13px] text-[#333]"
                          >
                            { SIZE_LABEL[ s ] }
                          </DropdownMenuRadioItem>
                        ) ) }
                      </DropdownMenuRadioGroup>
                    </>
                  ) }

                  { onRemove && (
                    <>
                      { onResize && <DropdownMenuSeparator className="my-[15px]" /> }
                      <DropdownMenuItem
                        onSelect={ onRemove }
                        className="h-[30px] px-5 py-0 text-[13px] text-[#D23222] focus:bg-[#fdf2f1] focus:text-[#D23222]"
                      >
                        Remove tile
                      </DropdownMenuItem>
                    </>
                  ) }
                </DropdownMenuContent>
              </DropdownMenu>
            ) }
          </div>
        ) }
      </div>

      { children }
    </div>
  );
}
