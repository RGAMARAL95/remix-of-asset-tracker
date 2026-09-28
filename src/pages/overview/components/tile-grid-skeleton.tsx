import { Skeleton } from "@/components/ui/skeleton";

/**
 * Without this the "No tiles yet" blankslate flashes on every single visit
 * before the layout arrives — the dashboard reads as empty for a moment, then
 * fills. Three placeholders at mixed sizes, so the grid does not jump when the
 * real tiles land.
 */
export function TileGridSkeleton() {
  return (
    <>
      <Skeleton className="bento-2x1 h-[192px] rounded-[15px] bg-white/20" />
      <Skeleton className="bento-2x2 h-[400px] rounded-[15px] bg-white/20" />
      <Skeleton className="h-[192px] rounded-[15px] bg-white/20" />
    </>
  );
}
