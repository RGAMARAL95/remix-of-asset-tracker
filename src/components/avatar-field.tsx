import { useCallback, useRef } from "react";

import { AccountAvatar } from "@/components/account-avatar";
import { Button } from "@/components/ui/button";
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from "@/lib/avatar";
import { useDataProvider } from "@/lib/data-provider";
import { useAuth } from "@/lib/auth/auth-provider";

/**
 * The door to rung one of the avatar ladder.
 *
 * Rungs two and three happen by themselves — a name makes a monogram, no name
 * makes a glyph. A photo only ever exists because somebody put it there, so an
 * avatar that *can* show one but offers no way to set one is decoration: the
 * rung is unreachable and the top of the ladder never fires.
 *
 * It sits at the top of Settings › General, above the name, because that
 * section is where the account is described and a face is part of describing
 * it.
 *
 * The avatar itself is the control AND a button beside it says what it does.
 * Both open the same picker. The avatar alone is a guess at what is clickable;
 * the button alone wastes the obvious target.
 */
export function AvatarField() {
  const { user } = useAuth();
  const { useProfile, useUploadAvatar, useUpdateProfile } = useDataProvider();
  const { data: profile } = useProfile();
  const upload = useUploadAvatar();
  const updateProfile = useUpdateProfile();

  const inputRef = useRef<HTMLInputElement | null>( null );

  const email = user?.email ?? "";
  const displayName = profile?.display_name?.trim() || email.split( "@" )[ 0 ] || "";

  // Whatever Google or Apple gave us at sign-in, if nothing has been uploaded.
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const ssoPhoto =
    ( typeof meta?.avatar_url === "string" ? meta.avatar_url : null ) ??
    ( typeof meta?.picture === "string" ? meta.picture : null );
  const photoUrl = profile?.avatar_url ?? ssoPhoto;

  const pick = useCallback( () => inputRef.current?.click(), [] );

  const onFile = useCallback(
    ( e: React.ChangeEvent<HTMLInputElement> ) => {
      const file = e.target.files?.[ 0 ];
      // Reset first, so choosing the SAME file twice still fires a change.
      e.target.value = "";
      if ( file ) upload.mutate( file );
    },
    [ upload ]
  );

  // Removing writes null and stops there — it drops to the monogram, never to
  // an empty circle. The ladder holds on the way down as well as up.
  const remove = useCallback(
    () => updateProfile.mutate( { avatar_url: null } ),
    [ updateProfile ]
  );

  const busy = upload.isLoading;
  // Remove is offered only when there IS a photo, and only for one we stored —
  // an SSO picture is not ours to clear.
  const canRemove = Boolean( profile?.avatar_url ) && !busy;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={ pick }
        disabled={ busy }
        aria-label="Change photo"
        className="rounded-full ring-offset-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <AccountAvatar
          id={ user?.id ?? "" }
          name={ displayName }
          photoUrl={ photoUrl }
          size={ 56 }
        />
      </button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={ pick } disabled={ busy }>
            { busy ? "Uploading…" : "Change photo" }
          </Button>
          { canRemove && (
            <Button type="button" variant="ghost" size="sm" onClick={ remove }>
              Remove
            </Button>
          ) }
        </div>
        {/* The limits are written here, not discovered by failing. */}
        <p className="mt-1.5 text-xs text-muted-foreground">
          JPG, PNG or WebP, up to { Math.round( AVATAR_MAX_BYTES / 1024 / 1024 ) } MB.
        </p>
      </div>

      <input
        ref={ inputRef }
        type="file"
        accept={ AVATAR_TYPES.join( "," ) }
        onChange={ onFile }
        className="hidden"
        tabIndex={ -1 }
      />
    </div>
  );
}
