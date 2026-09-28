import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

/**
 * Level 2 of the reference's three empties: page, dashboard, tile. Each is
 * sized to its own container and they share one voice.
 *
 * It does NOT branch on whether the account has assets. An empty dashboard is
 * an empty dashboard; a tile with nothing behind it says "No data" itself,
 * which is level 3.
 */
export function DashboardBlankslate( { onAdd }: { onAdd: () => void } ) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-[15px] font-semibold leading-5 text-white/80">
        No tiles yet
      </p>
      <Button onClick={ onAdd }>
        Add a tile
        <IconPlus className="size-4" />
      </Button>
    </div>
  );
}
