import { createContext, useContext, type ReactNode } from "react";

/**
 * Which surface the tiles inside are drawn on.
 *
 * The nine tiles are used in two places: the dashboard and the landing marquee.
 * The dashboard needs opaque white, because its job is reading numbers and the
 * frosted glass measured 2.30:1 on its own labels. The landing keeps the glass
 * — there the tiles are decoration over the gradient, nothing has to be read,
 * and the page is already approved.
 *
 * A context rather than a prop, so the switch is one line at the marquee
 * instead of an extra argument threaded through all nine tiles.
 *
 * Both surfaces define the same custom properties (`--tile-fg` and friends in
 * `style-pack.css`), so a tile body never needs to know which one it is on.
 */
type Surface = "solid" | "tonal";

const TileSurfaceContext = createContext<Surface>( "solid" );

export function TileSurface( {
  value,
  children,
}: {
  value: Surface;
  children: ReactNode;
} ) {
  return (
    <TileSurfaceContext.Provider value={ value }>
      { children }
    </TileSurfaceContext.Provider>
  );
}

export function useTileSurface(): Surface {
  return useContext( TileSurfaceContext );
}
