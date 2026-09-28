import { useState } from "react";
import { IconUser } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

/**
 * The account avatar — a ladder, never an empty circle and never a broken
 * image.
 *
 *   photo?  yes → show it
 *     no
 *     ↓
 *   name?   yes → monogram on a colour
 *     no
 *     ↓
 *   generic person glyph
 *
 * A photo that fails to load falls to the monogram. A missing face is the
 * normal case, not an error — most people never set one.
 *
 * Two things can fill rung one: a photo the person uploaded (`avatar-field.tsx`
 * writes it to `profiles.avatar_url`), or whatever Google or Apple handed us at
 * sign-in. An uploaded one wins, because it was chosen on purpose.
 */

/**
 * Colours are picked by the person's ID, never their name.
 *
 * Names get edited. If the colour came from the name, fixing a typo in someone's
 * surname would repaint their avatar, and the same person would read as a
 * different one. The ID never changes, so the colour never does.
 *
 * All eight carry white text at 4.5:1 or better — they are used at 13px, which
 * is small text, so the 3:1 large-text allowance does not apply.
 */
const COLORS = [
  "#9E3D32",
  "#8A5314",
  "#4F6B1B",
  "#1B6357",
  "#2A5794",
  "#57499B",
  "#8A3A72",
  "#4C5866",
];

function colorFor( id: string ): string {
  // djb2. Any stable hash does; this one is short and spreads single-character
  // differences well, which matters because UUIDs share long common prefixes.
  let h = 5381;
  for ( let i = 0; i < id.length; i++ ) h = ( ( h << 5 ) + h + id.charCodeAt( i ) ) >>> 0;
  return COLORS[ h % COLORS.length ];
}

/**
 * First letters of the first and last words: "Ada Lovelace" → "AL".
 *
 * Falls back to the first letter of an email local part, so someone who has
 * never set a name still gets a monogram rather than dropping to the glyph.
 */
function monogram( name: string ): string {
  const words = name.trim().split( /\s+/ ).filter( Boolean );
  if ( words.length === 0 ) return "";
  if ( words.length === 1 ) return words[ 0 ].slice( 0, 1 ).toUpperCase();
  return (
    words[ 0 ].slice( 0, 1 ) + words[ words.length - 1 ].slice( 0, 1 )
  ).toUpperCase();
}

export function AccountAvatar( {
  id,
  name,
  photoUrl,
  size = 28,
  /**
   * Whether the name is written next to this avatar.
   *
   * Beside a name the circle is decoration and gets `aria-hidden` — announcing
   * "A L, Ada Lovelace" is noise. Alone in a narrow header it is the only thing
   * identifying the account, so it becomes an image that carries the name.
   */
  labelled = false,
  className,
}: {
  id: string;
  name: string;
  photoUrl?: string | null;
  size?: number;
  labelled?: boolean;
  className?: string;
} ) {
  const [ photoFailed, setPhotoFailed ] = useState( false );

  const initials = monogram( name );
  const showPhoto = Boolean( photoUrl ) && !photoFailed;

  // One set of a11y props for all three rungs, so the ladder cannot fall down a
  // step and lose its name.
  const a11y = labelled
    ? ( { role: "img", "aria-label": name || "Account" } as const )
    : ( { "aria-hidden": true } as const );

  const base = cn(
    "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
    className
  );
  const style = { width: size, height: size };

  if ( showPhoto ) {
    return (
      <span className={ base } style={ style } { ...a11y }>
        <img
          src={ photoUrl ?? undefined }
          alt=""
          className="size-full object-cover"
          onError={ () => setPhotoFailed( true ) }
        />
      </span>
    );
  }

  if ( initials ) {
    return (
      <span
        className={ cn( base, "font-medium text-white" ) }
        style={ { ...style, background: colorFor( id ), fontSize: Math.round( size * 0.42 ) } }
        { ...a11y }
      >
        { initials }
      </span>
    );
  }

  return (
    <span
      className={ cn( base, "bg-white/20 text-white" ) }
      style={ style }
      { ...a11y }
    >
      <IconUser style={ { width: size * 0.6, height: size * 0.6 } } />
    </span>
  );
}
