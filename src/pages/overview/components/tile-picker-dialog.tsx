import { useCallback, useMemo, useState } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { SeedDataProvider, useDataProvider, type TileSize } from "@/lib/data-provider";

import { TILE_REGISTRY, TILE_TYPES } from "./tile-registry";
import { TileSurface } from "./tile-surface";

/**
 * Add a tile.
 *
 * Geometry is the reference's widget picker, measured
 * (`reference/cloudkit-teardown.md` §5c):
 *
 *   panel      960 wide, radius 4, side padding 35
 *   title      24/30 w700 on the left; search 248×30 on #EEEEF2; Close as a
 *              blue text link, NOT a corner ✕
 *   previews   the real tiles at their TRUE relative size, scaled to 80%
 *              (192 → 154, 400 → 320). You pick by SHAPE, not by name.
 *   ⊕          hangs off the top-LEFT corner, HALF outside the card
 *
 * Already-added types are NOT greyed out. A tile is an instance of a type, so
 * duplicates are expected — that is what the reference's `widgetTemplateId`
 * means, and it answers Q4.
 *
 * The previews read seed data, not the account's. A brand-new dashboard is
 * empty precisely because the account is new, and previews full of "No data"
 * would be a picker with nothing to choose between.
 */

/** Their measured scale: 154/192 and 320/400 both come out at 0.80. */
const PREVIEW_SCALE = 0.8;
/** A 400px preview at 0.80 is 320 wide — wider than a 375px phone's dialog. */
const PREVIEW_SCALE_MOBILE = 0.52;

const PREVIEW_BOX: Record<TileSize, { w: number; h: number }> = {
  small: { w: 192, h: 192 },
  medium: { w: 400, h: 192 },
  large: { w: 400, h: 400 },
};

function Preview( {
  type,
  onAdd,
}: {
  type: ( typeof TILE_TYPES )[ number ];
  onAdd: () => void;
} ) {
  const def = TILE_REGISTRY[ type ];
  const Tile = def.component;
  const box = PREVIEW_BOX[ def.defaultSize ];
  const isMobile = useIsMobile();
  const scale = isMobile ? PREVIEW_SCALE_MOBILE : PREVIEW_SCALE;

  return (
    <div className="relative shrink-0">
      <div
        className="overflow-hidden"
        style={ { width: box.w * scale, height: box.h * scale } }
      >

        <div
          className="pointer-events-none origin-top-left select-none"
          style={ {
            width: box.w,
            height: box.h,
            transform: `scale(${ PREVIEW_SCALE })`,
          } }
          aria-hidden="true"
        >
          <div className="h-full">
            <Tile size={ def.defaultSize } />
          </div>
        </div>
      </div>

      {/* Half outside the corner, as theirs is — not merely overlapping it. */}
      <Button
        size="icon"
        onClick={ onAdd }
        aria-label={ `Add ${ def.label }` }
        className="absolute -left-3 -top-3 size-6 rounded-full shadow-sm transition-transform hover:scale-110"
      >
        <IconPlus className="size-4" />
      </Button>
    </div>
  );
}

export function TilePickerDialog( {
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: ( next: boolean ) => void;
} ) {
  const { useAddDashboardTile } = useDataProvider();
  const addTile = useAddDashboardTile();
  const [ query, setQuery ] = useState( "" );

  const shown = useMemo( () => {
    const q = query.trim().toLowerCase();
    if ( !q ) return TILE_TYPES;
    return TILE_TYPES.filter( ( t ) =>
      TILE_REGISTRY[ t ].label.toLowerCase().includes( q )
    );
  }, [ query ] );

  const add = useCallback(
    ( type: ( typeof TILE_TYPES )[ number ] ) => {
      addTile.mutate( { tile_type: type, size: TILE_REGISTRY[ type ].defaultSize } );
      // The modal deliberately stays open, so several tiles go on in a row.
    },
    [ addTile ]
  );

  const close = useCallback( () => onOpenChange( false ), [ onOpenChange ] );

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent
        // `[&>button]:hidden` removes the default corner ✕ — theirs uses a
        // "Close" text link in the header row instead.
        className="ref-popover w-[960px] max-w-[calc(100vw-32px)] gap-0 border-0 p-0 [&>button]:hidden"
      >
        {/* Phone: title on its own line, then search + Close beneath it, so
            nothing is forced off the right edge. Desktop: their single row. */}
        <div className="flex flex-col gap-3 px-5 pt-6 sm:flex-row sm:items-center sm:gap-4 sm:px-[35px] sm:pt-8">
          <DialogTitle className="min-w-0 text-[20px] font-bold leading-[26px] text-[#111] sm:shrink-0 sm:text-[24px] sm:leading-[30px]">
            Add a tile to this dashboard
          </DialogTitle>

          <div className="flex min-w-0 items-center gap-4 sm:ml-auto">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#666]" />
              <Input
                value={ query }
                onChange={ ( e ) => setQuery( e.target.value ) }
                placeholder="Search tiles"
                aria-label="Search tiles"
                className="h-[30px] w-full border-0 bg-[#EEEEF2] pl-8 text-[13px] sm:w-[248px]"
              />
            </div>

            <button
              type="button"
              onClick={ close }
              className="shrink-0 text-[13px] text-[rgb(0,93,210)] hover:underline"
            >
              Close
            </button>
          </div>
        </div>


        <DialogDescription className="px-5 pt-2 text-[13px] text-[#666] sm:px-[35px]">
          Previews use example data and are shown at their real relative size.
          Add the same tile more than once if you want it at two sizes.
        </DialogDescription>

        <div className="max-h-[60vh] overflow-y-auto px-5 pb-8 pt-6 sm:px-[35px]">
          {/* The tile surface is glass with white text — on the dashboard it
              sits on the dark canvas. Dropped straight onto the white dialog
              every label was white-on-white and the previews looked empty, so
              the preview area carries the same canvas the dashboard does. */}
          <div className="nw-canvas rounded-[15px] p-4">
            <SeedDataProvider>
              <TileSurface value="solid">
                {/* items-start keeps every preview on the same top edge. With
                    items-center each wrapped row centred itself, so nothing
                    lined up and the captions sat at ragged heights. */}
                <div className="flex flex-wrap items-start gap-x-8 gap-y-8">
                  { shown.map( ( type ) => (
                    <Preview key={ type } type={ type } onAdd={ () => add( type ) } />
                  ) ) }
                  { shown.length === 0 && (
                    <p className="text-[13px] text-white/75">
                      No tiles match “{ query }”.
                    </p>
                  ) }
                </div>
              </TileSurface>
            </SeedDataProvider>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
