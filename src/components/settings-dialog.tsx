import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CircleDollarSign, UserRound } from "lucide-react";
import { toast } from "sonner";

import { AvatarField } from "@/components/avatar-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth/auth-provider";
import { useDataProvider } from "@/lib/data-provider";

/**
 * Settings lives in a dialog with its own sidebar (shadcn `sidebar-13`), not a
 * route. There is no `/settings` — the nav item that pointed at one 404'd.
 *
 * Opened from the account menu, matching the reference: it keeps Settings next
 * to the identity it belongs to instead of in the app's own navigation.
 *
 * But it is still a PLACE, so the open section lives in the address:
 *
 *   choose Settings          →  ?settings=general
 *   choose another section   →  ?settings=currency
 *   load that URL cold       →  dialog opens on that section
 *
 * The last line is the one that matters, and the reason this component owns the
 * query parameter rather than taking an `open` prop. An address that only works
 * from inside the app is not an address. Closing drops the parameter, so what
 * is on screen always matches the URL and Back steps out of the dialog instead
 * of off the page.
 */

const SECTIONS = [
  { key: "general", name: "General", icon: UserRound },
  { key: "currency", name: "Currency", icon: CircleDollarSign },
] as const;

type SectionKey = ( typeof SECTIONS )[ number ][ "key" ];

const SECTION_KEYS = SECTIONS.map( ( s ) => s.key ) as readonly string[];

/** An unknown or missing ?settings= value falls back to the first section. */
function parseSection( raw: string | null ): SectionKey {
  return ( raw && SECTION_KEYS.includes( raw ) ? raw : "general" ) as SectionKey;
}

/** The currencies `Intl.NumberFormat` renders with a symbol people recognise. */
const CURRENCIES = [
  { code: "USD", label: "US dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British pound" },
  { code: "JPY", label: "Japanese yen" },
  { code: "CAD", label: "Canadian dollar" },
  { code: "AUD", label: "Australian dollar" },
  { code: "CHF", label: "Swiss franc" },
  { code: "SEK", label: "Swedish krona" },
];

export function SettingsDialog() {
  const [ params, setParams ] = useSearchParams();

  // The address IS the state. No local `open`, no local `section` — otherwise
  // the two can disagree, and a pasted URL loses.
  const raw = params.get( "settings" );
  const open = raw !== null;
  const section = parseSection( raw );

  const setSection = useCallback(
    ( next: SectionKey ) => {
      const p = new URLSearchParams( params );
      p.set( "settings", next );
      // replace: switching section inside the dialog is not a new place to go
      // Back to. Back should leave the dialog, not walk its sections.
      setParams( p, { replace: true } );
    },
    [ params, setParams ]
  );

  const handleOpenChange = useCallback(
    ( next: boolean ) => {
      if ( next ) return;
      const p = new URLSearchParams( params );
      p.delete( "settings" );
      setParams( p, { replace: true } );
    },
    [ params, setParams ]
  );

  const { user } = useAuth();
  const { useProfile, useUpdateProfile } = useDataProvider();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  // The name field is typed into, so it needs local state. Seed it from the
  // profile and re-seed whenever the dialog reopens, or a cancelled edit would
  // still be sitting there next time.
  const [ name, setName ] = useState( "" );
  useEffect( () => {
    if ( open ) setName( profile?.display_name ?? "" );
  }, [ open, profile?.display_name ] );

  const currency = profile?.currency ?? "USD";
  const nameChanged = useMemo(
    () => name.trim() !== ( profile?.display_name ?? "" ),
    [ name, profile?.display_name ]
  );

  const saveName = useCallback( () => {
    if ( !nameChanged ) return;
    // Confirmation on save. Restored after a rebase silently reverted it —
    // `git pull --rebase` replays local commits on top of Lovable's, and an
    // older local version of this file won the replay.
    updateProfile.mutate(
      { display_name: name.trim() },
      { onSuccess: () => toast.success( "Name saved" ) }
    );
  }, [ nameChanged, name, updateProfile ] );

  // Currency has no Save button. Picking one IS the change — same as choosing a
  // tile size from its menu, and the same as the reference's Appearance row.
  const pickCurrency = useCallback(
    ( next: string ) => updateProfile.mutate( { currency: next } ),
    [ updateProfile ]
  );

  return (
    <Dialog open={ open } onOpenChange={ handleOpenChange }>
      {/* The dialog names ITSELF "Settings"; the section name is a heading over
          the content below. Two different jobs, so two different labels. */}
      <DialogContent
        aria-label="Settings"
        className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[760px]"
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Your name and the currency every figure is shown in.
        </DialogDescription>

        <SidebarProvider className="items-start">
          {/* The list of sections and the content are two surfaces, not one
              sheet. Painted the same colour the dialog reads as one flat page
              and the sections stop looking like a list you pick from — which is
              exactly how this looked before: both sides measured
              rgba(0,0,0,0), no divider.

              The shade is a percentage of the TEXT colour, not a fixed grey. A
              fixed grey is wrong in one of the two themes; a tint of the
              foreground follows whatever the surface is. */}
          {/* color-mix, not `bg-foreground/[0.04]` — that shorthand silently
              produced no rule here, so the rail stayed transparent and matched
              the panel exactly. Measured, not assumed. */}
          <Sidebar
            collapsible="none"
            className="hidden border-r bg-[color-mix(in_srgb,var(--color-foreground)_4%,transparent)] md:flex"
          >
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    { SECTIONS.map( ( item ) => (
                      <SidebarMenuItem key={ item.key }>
                        {/* aria-current, not just isActive. isActive only
                            DRAWS the selection; without this a screen reader
                            cannot tell which section it is in. The reference
                            has exactly this bug — don't inherit it. */}
                        <SidebarMenuButton
                          isActive={ item.key === section }
                          aria-current={ item.key === section ? "page" : undefined }
                          onClick={ () => setSection( item.key ) }
                        >
                          <item.icon />
                          <span>{ item.name }</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ) ) }
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            {/* Below `md` the sidebar is hidden, so without this row there is
                no way to reach Currency at all on a phone. */}
            {/* Below `md` the sidebar is hidden, so without this row there is
                no way to reach Currency at all on a phone. */}
            <ToggleGroup
              type="single"
              value={ section }
              onValueChange={ ( value ) => value && setSection( value as SectionKey ) }
              aria-label="Settings section"
              className="shrink-0 justify-start gap-1 border-b px-4 pt-4 md:hidden"
            >
              { SECTIONS.map( ( item ) => (
                <ToggleGroupItem
                  key={ item.key }
                  value={ item.key }
                  className="gap-1.5 rounded-t px-3 py-2 text-sm text-muted-foreground data-[state=on]:border-b-2 data-[state=on]:border-primary data-[state=on]:bg-transparent data-[state=on]:font-medium data-[state=on]:text-foreground"
                >
                  <item.icon className="size-4" />
                  { item.name }
                </ToggleGroupItem>
              ) ) }
            </ToggleGroup>

            <header className="flex h-16 shrink-0 items-center px-6 max-md:h-12">
              <h2 className="text-base font-medium">
                { SECTIONS.find( ( s ) => s.key === section )?.name }
              </h2>
            </header>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
              { section === "general" && (
                <>
                  {/* Above the name, deliberately. This section describes the
                      account, and a face is part of describing it. */}
                  <AvatarField />

                  <div className="grid gap-2">
                    <Label htmlFor="settings-name">Name</Label>
                    <Input
                      id="settings-name"
                      value={ name }
                      maxLength={ 80 }
                      onChange={ ( e ) => setName( e.target.value ) }
                      placeholder="Your name"
                    />

                    <p className="text-sm text-muted-foreground">
                      Only used to greet you. Nobody else sees it.
                    </p>
                  </div>

                  <div>
                    <Button
                      size="sm"
                      disabled={ !nameChanged || updateProfile.isLoading }
                      onClick={ saveName }
                    >
                      { updateProfile.isLoading ? "Saving…" : "Save" }
                    </Button>
                  </div>

                  { user?.email && (
                    <div className="grid gap-1 border-t pt-6">
                      <Label>Signed in as</Label>
                      <p className="text-sm text-muted-foreground">
                        { user.email }
                      </p>
                    </div>
                  ) }
                </>
              ) }

              { section === "currency" && (
                <div className="grid gap-2">
                  <Label htmlFor="settings-currency">Currency</Label>
                  <Select value={ currency } onValueChange={ pickCurrency }>
                    <SelectTrigger id="settings-currency" className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      { CURRENCIES.map( ( c ) => (
                        <SelectItem key={ c.code } value={ c.code }>
                          { c.code } — { c.label }
                        </SelectItem>
                      ) ) }
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Changes the symbol on every figure. It does not convert
                    anything — the numbers you typed in stay as they are.
                  </p>
                </div>
              ) }
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
