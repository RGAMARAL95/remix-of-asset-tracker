import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { IconDots, IconPlus } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDataProvider, type TileSize } from "@/lib/data-provider";

import { BentoCanvas } from "./components/bento-canvas";
import { DashboardBlankslate } from "./components/dashboard-blankslate";
import { RemoveTileDialog } from "./components/remove-tile-dialog";
import { SortableTile } from "./components/sortable-tile";
import { TileGridSkeleton } from "./components/tile-grid-skeleton";
import { TilePickerDialog } from "./components/tile-picker-dialog";
import { TILE_REGISTRY, resolveSize } from "./components/tile-registry";
import { DEFAULT_RANGE, parseRange, type RangeToken } from "./components/tile-time-range";

/**
 * Overview — the composed dashboard.
 *
 * Tiles render from the user's saved layout, in the order held by the parent's
 * `tile_ids` array. Nothing here is hard-coded.
 *
 * Every object owns its own actions at the top-right of its own container:
 * `[⋯] [⊕]` belong to the screen, `[⋯]` to each tile. Levels never mix.
 *
 * Two modes on one route. Rearrange is a mode, not a screen: the header swaps
 * its actions for Cancel and Save and the title becomes a rename field, which
 * is the reference's edit-mode header swap.
 */

/**
 * Handed to tiles while rearranging so they draw the same chrome as view mode.
 * Stable identity, so it never re-renders a tile. It can never run — the drag
 * wrapper covers the body with pointer-events-none.
 */
const NOOP = () => undefined;

/**
 * Tells dnd-kit to move NOBODY except the tile under the pointer.
 *
 * Every built-in sorting strategy (rectSortingStrategy and friends) slides the
 * other items into each other's rectangles. That only works when the items are
 * all the same size. Ours are 192 and 400, so the maths came out wrong and
 * tiles landed on top of each other: dragging a 192-wide Leverage displaced the
 * 400-wide Holdings by 416px — a LARGE tile's width — dropping it into a 192px
 * slot where it overhung three neighbours at once.
 *
 * Returning null leaves every other tile alone. `handleDragOver` reorders the
 * array live instead, and CSS grid re-packs — which handles mixed sizes
 * properly, because that is exactly what a grid is for. The reference does the
 * same thing: "drag → the grid repacks live. Order IS packing order."
 */
const NO_DISPLACEMENT = () => null;

export default function Overview() {
  const {
    useDashboard,
    useUpdateDashboardTile,
    useRemoveDashboardTile,
    useSaveDashboardLayout,
  } = useDataProvider();

  const { data, isLoading } = useDashboard();
  const updateTile = useUpdateDashboardTile();
  const removeTile = useRemoveDashboardTile();
  const saveLayout = useSaveDashboardLayout();

  const [ pickerOpen, setPickerOpen ] = useState( false );
  const [ pendingRemove, setPendingRemove ] = useState<{
    id: string;
    label: string;
  } | null>( null );

  // Draft state. Only touched while rearranging; Cancel throws it all away.
  const [ rearranging, setRearranging ] = useState( false );
  const [ draftOrder, setDraftOrder ] = useState<string[]>( [] );
  const [ draftRemoved, setDraftRemoved ] = useState<string[]>( [] );
  const [ draftName, setDraftName ] = useState( "" );

  // Mouse, pen and touch all arrive as pointer events, so one sensor covers
  // them — no second backend, unlike the reference's react-dnd setup. The 8px
  // threshold stops a tap being read as a drag.
  const sensors = useSensors(
    useSensor( PointerSensor, { activationConstraint: { distance: 8 } } )
  );

  const name = data.dashboard?.name ?? "Overview";

  const visible = useMemo( () => {
    if ( !rearranging ) return data.tiles;
    const byId = new Map( data.tiles.map( ( t ) => [ t.id, t ] ) );
    return draftOrder
      .filter( ( id ) => !draftRemoved.includes( id ) )
      .map( ( id ) => byId.get( id ) )
      .filter( ( t ): t is ( typeof data.tiles )[ number ] => Boolean( t ) );
  }, [ rearranging, data.tiles, draftOrder, draftRemoved ] );

  const enterRearrange = useCallback( () => {
    setDraftOrder( data.tiles.map( ( t ) => t.id ) );
    setDraftRemoved( [] );
    setDraftName( name );
    setRearranging( true );
  }, [ data.tiles, name ] );

  const cancelRearrange = useCallback( () => {
    setRearranging( false );
    setDraftOrder( [] );
    setDraftRemoved( [] );
  }, [] );

  const commitRearrange = useCallback( () => {
    saveLayout.mutate(
      {
        tile_ids: draftOrder.filter( ( id ) => !draftRemoved.includes( id ) ),
        name: draftName.trim() || "Overview",
        removed: draftRemoved,
      },
      { onSuccess: () => setRearranging( false ) }
    );
  }, [ saveLayout, draftOrder, draftRemoved, draftName ] );

  /**
   * Reorder as the pointer moves, not on drop.
   *
   * The array is the layout, so moving an item here makes CSS grid re-pack for
   * real — and grid is the only thing that lays out mixed 192/400 tiles
   * correctly. See NO_DISPLACEMENT for why dnd-kit must not do it instead.
   *
   * Guarded to a genuine index change: this fires continuously while the
   * pointer moves, and re-ordering on every event would thrash.
   */
  const handleDragOver = useCallback( ( event: DragOverEvent ) => {
    const { active, over } = event;
    if ( !over || active.id === over.id ) return;
    setDraftOrder( ( prev ) => {
      const from = prev.indexOf( String( active.id ) );
      const to = prev.indexOf( String( over.id ) );
      if ( from === -1 || to === -1 || from === to ) return prev;
      return arrayMove( prev, from, to );
    } );
  }, [] );

  const openPicker = useCallback( () => setPickerOpen( true ), [] );
  const closeRemove = useCallback(
    ( next: boolean ) => !next && setPendingRemove( null ),
    []
  );
  const confirmRemove = useCallback( () => {
    if ( pendingRemove ) removeTile.mutate( { id: pendingRemove.id } );
    setPendingRemove( null );
  }, [ pendingRemove, removeTile ] );

  const actions = rearranging ? (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={ cancelRearrange }
        className="text-white hover:bg-white/15 hover:text-white"
      >
        Cancel
      </Button>
      <Button size="sm" onClick={ commitRearrange } disabled={ saveLayout.isLoading }>
        { saveLayout.isLoading ? "Saving…" : "Save" }
      </Button>
    </>
  ) : (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Options for this dashboard"
            className="size-[30px] text-white hover:bg-white/15 hover:text-white"
          >
            <IconDots className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="ref-popover w-[202px] border-0 py-[10px]">
          <DropdownMenuItem
            onSelect={ enterRearrange }
            disabled={ data.tiles.length === 0 }
            className="h-[30px] px-5 py-0 text-[13px] text-[#333]"
          >
            Rearrange tiles…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* size="icon" is 40px; the reference measures page actions at 30×30. */}
      <Button
        variant="ghost"
        size="icon"
        onClick={ openPicker }
        aria-label="Add a tile"
        className="size-[30px] text-white hover:bg-white/15 hover:text-white"
      >
        <IconPlus className="size-4" />
      </Button>
    </>
  );

  // In rearrange mode the title becomes a rename field, focused with its
  // contents selected, so typing replaces the name outright.
  const titleSlot = rearranging ? (
    <Input
      autoFocus
      value={ draftName }
      onFocus={ ( e ) => e.currentTarget.select() }
      onChange={ ( e ) => setDraftName( e.target.value ) }
      aria-label="Dashboard name"
      // The negative margins cancel the input's own border and padding so the
      // field occupies EXACTLY the box the h1 did — text starting on the same
      // x, row the same height. Without -my the input stood 47px against the
      // title's 41px and shoved the whole grid down 6px on entering the mode.
      // -ml 13 = 12px px-3 + 1px border. -my 3 = 2px py-0.5 + 1px border.
      className="dash-title -ml-[13px] -my-[3px] h-auto max-w-[520px] rounded-lg border-white/25 bg-white/10 px-3 py-0.5 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/60"
    />
  ) : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title={ name }
        actions={ actions }
        titleSlot={ titleSlot }
        className="shrink-0"
      />

      <BentoCanvas>
        { isLoading ? (
          // Without this the blankslate flashes on every visit before the
          // layout arrives.
          <TileGridSkeleton />
        ) : visible.length === 0 ? (
          <DashboardBlankslate onAdd={ openPicker } />
        ) : rearranging ? (
          <DndContext
            sensors={ sensors }
            collisionDetection={ closestCenter }
            onDragOver={ handleDragOver }
          >
            {/* Sorting, not swapping — back to the normal behaviour now that
                `dense` is gone.

                Swapping was a workaround for the wrong problem. With dense
                packing the browser moved tiles backwards to fill holes, so the
                drop index and the rendered position disagreed and dragging felt
                broken; swapping hid that by never changing anyone else's
                position. Without dense the order IS the layout, so moving a
                tile to a new index does exactly what the preview shows — and
                unlike a swap it can also move a tile to the end, or between two
                others, which a swap cannot express.

                There is no onDragEnd: handleDragOver has already put the array
                in its final state by the time the pointer lifts. Re-applying
                the move on drop would move the tile a second time. */}
            <SortableContext
              items={ visible.map( ( t ) => t.id ) }
              strategy={ NO_DISPLACEMENT }
            >
              { visible.map( ( tile ) => {
                const def = TILE_REGISTRY[ tile.tile_type ];
                const size = resolveSize( tile.tile_type, tile.size );
                const Tile = def.component;
                return (
                  <SortableTile
                    key={ tile.id }
                    id={ tile.id }
                    size={ size }
                    onRemove={ () =>
                      setDraftRemoved( ( prev ) => [ ...prev, tile.id ] )
                    }
                  >
                    {/* The same chrome as view mode — range chip and ⋯ menu.
                        TileShell only draws those when it is handed handlers,
                        so passing none stripped every tile back to a bare
                        label and rearrange mode stopped looking like the
                        dashboard. The handlers are no-ops and can never fire:
                        SortableTile puts pointer-events-none over the body. */ }
                    <Tile
                      size={ size }
                      range={
                        def.timeBased
                          ? parseRange( tile.config?.range )
                          : undefined
                      }
                      onRangeChange={ def.timeBased ? NOOP : undefined }
                      onResize={ NOOP }
                      onRemove={ NOOP }
                    />
                  </SortableTile>
                );
              } ) }
            </SortableContext>
          </DndContext>
        ) : (
          visible.map( ( tile ) => {
            const def = TILE_REGISTRY[ tile.tile_type ];
            const size = resolveSize( tile.tile_type, tile.size );
            const Tile = def.component;
            const range: RangeToken = def.timeBased
              ? parseRange( tile.config?.range )
              : DEFAULT_RANGE;

            return (
              <Tile
                key={ tile.id }
                size={ size }
                range={ def.timeBased ? range : undefined }
                onRangeChange={
                  def.timeBased
                    ? ( next: RangeToken ) =>
                        updateTile.mutate( {
                          id: tile.id,
                          config: { ...tile.config, range: next },
                        } )
                    : undefined
                }
                onResize={ ( next: TileSize ) =>
                  updateTile.mutate( { id: tile.id, size: next } )
                }
                onRemove={ () =>
                  setPendingRemove( { id: tile.id, label: def.label } )
                }
              />
            );
          } )
        ) }
      </BentoCanvas>

      <TilePickerDialog open={ pickerOpen } onOpenChange={ setPickerOpen } />
      <RemoveTileDialog
        open={ Boolean( pendingRemove ) }
        tileLabel={ pendingRemove?.label ?? "" }
        onOpenChange={ closeRemove }
        onConfirm={ confirmRemove }
      />
    </div>
  );
}
