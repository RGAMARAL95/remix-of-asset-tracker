import type { ReactNode } from "react";

/**
 * The lattice. The gradient itself lives on the shell now, so this only holds
 * the grid.
 *
 * Was a hand-arranged flex column at max-w-5xl with a 15px gap. User-chosen
 * sizes cannot be hand-arranged, so this is the real auto-fill grid with dense
 * packing. Sizing lives in style-pack.css; this supplies the boxes.
 */
export function BentoCanvas( { children }: { children: ReactNode } ) {
  return (
    <div className="h-full w-full overflow-y-auto">
      {/* pt-3 is headroom for the ⊖ controls in rearrange mode, which hang
          8px outside each tile and were clipped by this scroll container. */}
      <div className="bento-viewport px-4 pb-16 pt-3 sm:px-6">
        <div className="bento-grid">{ children }</div>
      </div>
    </div>
  );
}
