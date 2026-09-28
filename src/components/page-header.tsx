import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * The page header: the title, and the screen's own actions on the right.
 *
 * The title IS the navigation. A chevron on it opens a switcher, which is the
 * only route between screens now that the sidebar is deleted.
 *
 * Two of the reference's four switcher parts are dropped: the search field at
 * the top and the blue create row at the bottom. Both exist because a team can
 * have many dashboards, and we have two destinations. Restore both the moment a
 * second dashboard does.
 *
 * Actions are right-aligned to the GRID edge, not the window edge, so they line
 * up with the tiles beneath them — hence the same max-width as .bento-grid.
 */

const SCREENS = [
  { key: "overview", label: "Overview" },
  { key: "assets", label: "Assets" },
] as const;

export function PageHeader( {
  title,
  actions,
  /** Replaces the title outright — used by rearrange mode's rename input. */
  titleSlot,
  className,
}: {
  title: string;
  actions?: ReactNode;
  titleSlot?: ReactNode;
  className?: string;
} ) {
  const { pathname } = useLocation();
  const base = pathname.startsWith( "/demo" ) ? "/demo" : "";
  const active = pathname.startsWith( `${ base }/assets` ) ? "assets" : "overview";

  return (
    // The padding goes OUTSIDE the max-width, mirroring BentoCanvas — the grid
    // is `px-4 sm:px-6` on the outside with `max-width:1232` on the grid itself.
    // With the padding inside the box the header sat 24px right of the tiles.
    <div className={ cn( "px-4 py-4 sm:px-6", className ) }>
      <div className="mx-auto flex w-full max-w-[1232px] items-center justify-between gap-4">
      {/* The visible title IS the route's h1 — a heading may wrap the switcher
          button (axe: page-has-heading-one). The h1 carries no styling of its
          own so the measured title look is unchanged. */}
      { titleSlot ?? (
        <DropdownMenu>
          <h1 className="m-0 min-w-0 p-0 text-inherit">
            <DropdownMenuTrigger className="flex items-center gap-2" aria-label="Switch screen">
              <span className="dash-title text-white">{ title }</span>
              {/* 14×19 in the reference. */}
              <IconChevronDown className="size-[14px] text-white/70" />
            </DropdownMenuTrigger>
          </h1>


          {/* ~290 wide, anchored under the title. */}
          <DropdownMenuContent align="start" className="ref-popover w-[290px] border-0 p-0 py-[10px]">
            { SCREENS.map( ( s ) => (
              <DropdownMenuItem
                key={ s.key }
                asChild
                className="relative h-[31px] rounded-md py-0 pl-[30px] pr-5 text-[15px] text-[#333]"
              >
                <Link to={ `${ base }/${ s.key }` }>
                  { s.key === active && (
                    <IconCheck className="absolute left-[9px] size-[14px]" aria-hidden />
                  ) }
                  { s.label }
                </Link>
              </DropdownMenuItem>
            ) ) }
          </DropdownMenuContent>
        </DropdownMenu>
      ) }

      {/* 30×30 boxes with a 5px gap makes the reference's 35px pitch. */}
        { actions && <div className="flex shrink-0 items-center gap-[5px]">{ actions }</div> }
      </div>
    </div>
  );
}
