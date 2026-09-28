import { useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { IconCheck, IconChevronDown, IconPlant2 } from "@tabler/icons-react";

import { AccountAvatar } from "@/components/account-avatar";
import { SettingsDialog } from "@/components/settings-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDataProvider } from "@/lib/data-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/auth-provider";

/**
 * The app shell. There is no sidebar.
 *
 * The reference has no sidebar and no tab bar — the title is the navigation,
 * and a chevron on it opens a switcher. That lives in `page-header.tsx`,
 * because the title can be the dashboard's own name and only the page knows it.
 *
 * What this file owns is the level above: a 48px global bar with the wordmark
 * on the left and the account menu on the right. The reference's rule is that
 * every object owns its own actions at the top-right of its own container, and
 * levels never mix. This is the account level.
 */

/** Demo screens live under /demo and never cross into the real app. */
function useBase() {
  const { pathname } = useLocation();
  return pathname.startsWith( "/demo" ) ? "/demo" : "";
}

/**
 * The only labelled control in the chrome. Everything else is icon-only,
 * because the container it sits in already says what it is about.
 *
 * Sign out is NOT red. In this system red means destroying an object, and
 * leaving destroys nothing.
 */
function AccountMenu( { base }: { base: string } ) {
  const { user, signOut } = useAuth();
  const { useProfile } = useDataProvider();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDemo = base === "/demo";
  // Whether the name is written beside the avatar right now, which decides
  // whether the avatar is decoration or the thing carrying the name.
  const nameIsWritten = !useIsMobile();

  const handleSignOut = useCallback( async () => {
    await signOut();
    navigate( "/sign-in", { replace: true } );
  }, [ signOut, navigate ] );

  // Settings is a place, not a panel, so opening it is a navigation and the
  // section goes in the address. See settings-dialog.tsx.
  const openSettings = useCallback(
    () => navigate( `${ pathname }?settings=general` ),
    [ navigate, pathname ]
  );
  const exitDemo = useCallback( () => navigate( "/", { replace: true } ), [ navigate ] );

  // What we show, and what the monogram is built from. Falls back to the
  // email's local part, so someone who never set a name still gets letters
  // instead of dropping to the generic glyph.
  const email = user?.email ?? "";
  const displayName = profile?.display_name?.trim() || email.split( "@" )[ 0 ] || "";
  // An uploaded photo wins over whatever Google or Apple handed us at sign-in:
  // the person chose one of them on purpose. Both come from the same query the
  // settings control writes to, so a new photo appears here without a reload.
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const ssoPhoto =
    ( typeof meta?.avatar_url === "string" ? meta.avatar_url : null ) ??
    ( typeof meta?.picture === "string" ? meta.picture : null );
  const photoUrl = profile?.avatar_url ?? ssoPhoto;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-[38px] items-center gap-2 rounded px-2 text-[13px] text-white transition-colors hover:bg-white/15"
          aria-label={ isDemo ? "Demo menu" : "Account menu" }
        >
          {/* The trigger says WHO you are and that it opens something: a name,
              a quieter second line, a chevron.

              The avatar's a11y role flips with the width, which is the whole
              point of the `labelled` prop. Wide enough to write the name and
              the circle is decoration — announcing "G, Georgemaine" is noise.
              Below `sm` the text is hidden and that circle is the only thing
              identifying the account, so it carries the name itself. */}
          {/* The demo wears the SAME trigger as the signed-in app — avatar,
              name, quieter second line — built from the seed profile. It used
              to render the bare word "Demo", which made the demo look like an
              older build of the product it is advertising. */}
          <AccountAvatar
            id={ isDemo ? "demo" : user?.id ?? "" }
            name={ isDemo ? profile?.display_name ?? "Demo" : displayName }
            photoUrl={ isDemo ? profile?.avatar_url ?? null : photoUrl }
            labelled={ !nameIsWritten }
            size={ 26 }
          />
          {/* md, not sm — it has to be the SAME breakpoint useIsMobile
              watches (768), or the avatar would claim the name at a width
              where the name is already written, or drop it at a width where
              it is not. */}
          <span className="hidden min-w-0 text-left leading-tight md:block">
            <span className="block truncate text-[13px] text-white">
              { isDemo ? profile?.display_name ?? "Demo" : displayName || "Signed in" }
            </span>
            <span className="block truncate text-[11px] text-white/70">
              { isDemo ? "Demo mode" : email }
            </span>
          </span>

          <IconChevronDown className="size-[14px] text-white/70" />
        </DropdownMenuTrigger>

        {/* 226 wide, list padding 10px 0, rows 31 tall (47 for the identity
            row), text 15px, left gutter 30px, separators with 4px each side. */}
        <DropdownMenuContent align="end" className="ref-popover w-[226px] border-0 p-0 py-[10px]">
          { isDemo ? (
            <>
              {/* Same identity band as the signed-in menu, so the demo shows
                  the current chrome rather than a reduced older one. */}
              <div className="flex h-[47px] items-center gap-2 py-1.5 pl-[10px] pr-[20px]">
                <IconCheck className="size-4 shrink-0 text-[#333]" aria-hidden="true" />
                <AccountAvatar
                  id="demo"
                  name={ profile?.display_name ?? "Demo" }
                  photoUrl={ profile?.avatar_url ?? null }
                  size={ 24 }
                />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium leading-5 text-[#111]">
                    { profile?.display_name ?? "Demo" }
                  </p>
                  <p className="truncate text-[12px] leading-4 text-[#666]">
                    Nothing you change is kept
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="my-1" />
              {/* Settings opens in the demo too — its writes go through the
                  demo's in-memory provider, so changes apply immediately and
                  are gone on refresh. */}

              <DropdownMenuItem
                onSelect={ openSettings }
                className="h-[31px] rounded-md py-0 pl-[30px] pr-5 text-[15px] text-[#333]"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem asChild className="h-[31px] rounded-md py-0 pl-[30px] pr-5 text-[15px] text-[#333]">
                <Link to="/sign-up">Sign up</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={ exitDemo }
                className="h-[31px] rounded-md py-0 pl-[30px] pr-5 text-[15px] text-[#333]"
              >
                Exit demo
              </DropdownMenuItem>
            </>
          ) : (

            <>
              {/* Band 1 — who am I signed in as.
                  The tick is there with a single account on purpose: it answers
                  "which one am I in", so adding a second account later changes
                  nothing about this row. The avatar is decoration here, because
                  the name is written right beside it. */}
              <div className="flex h-[47px] items-center gap-2 py-1.5 pl-[10px] pr-[20px]">
                <IconCheck className="size-4 shrink-0 text-[#333]" aria-hidden="true" />
                <AccountAvatar
                  id={ user?.id ?? "" }
                  name={ displayName }
                  photoUrl={ photoUrl }
                  size={ 24 }
                />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium leading-5 text-[#111]">
                    { displayName || "Signed in" }
                  </p>
                  <p className="truncate text-[12px] leading-4 text-[#666]">{ email }</p>
                </div>
              </div>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onSelect={ openSettings }
                className="h-[31px] rounded-md py-0 pl-[30px] pr-5 text-[15px] text-[#333]"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onSelect={ handleSignOut }
                className="h-[31px] rounded-md py-0 pl-[30px] pr-5 text-[15px] text-[#333]"
              >
                Sign out
              </DropdownMenuItem>
            </>
          ) }
        </DropdownMenuContent>
      </DropdownMenu>

      {/* No `open` prop: the dialog reads the address itself, so a pasted
          ?settings=currency opens it cold with no help from this component. */}
      <SettingsDialog />
    </>
  );
}

export default function AppShell() {
  const base = useBase();

  return (
    /* One surface for the whole app. The gradient used to live on the Overview's
     * canvas only, which put a hard seam between Overview and Assets. The
     * reference has a single page background everywhere and no seams, so the
     * gradient moves up here and every screen sits on it. Ours is a gradient
     * where theirs is flat grey, which is a colour difference — the allowed
     * kind. The header is transparent so nothing bands across it. */
    <div className="nw-canvas flex h-screen flex-col text-white">
      {/* Global bar, 48px. */}
      <header className="flex h-12 shrink-0 items-center justify-between px-4 sm:px-6">
        <Link
          to={ base === "/demo" ? "/demo/overview" : "/" }
          className="flex items-center gap-2 font-heading text-[15px] font-semibold tracking-tight text-white"
        >
          <IconPlant2 className="size-4" />
          Asset Tracker
        </Link>
        <AccountMenu base={ base } />
      </header>

      {/* Each screen renders its own page header — see page-header.tsx.
          This is a <main> so every app route has exactly one main landmark
          (axe: landmark-one-main / region). */}
      <main className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
