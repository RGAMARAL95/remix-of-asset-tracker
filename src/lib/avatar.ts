/**
 * What the avatar control accepts.
 *
 * Written down in one place so the limits shown beside the control and the
 * limits actually enforced on upload cannot drift apart — a message promising
 * 2 MB while the code rejects at 1 MB is worse than no message.
 *
 * Its own module rather than living in `data-provider.tsx`: that file exports
 * components, and mixing constants in breaks fast refresh.
 */
export const AVATAR_TYPES = [ "image/jpeg", "image/png", "image/webp" ];
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Storage paths are derived from the MIME type we already validated, NEVER from
 * the uploaded filename — a name like `../../other-user/x.png` (or one carrying
 * a second extension) must not be able to steer where the object lands.
 */
export const AVATAR_EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** How long a freshly minted avatar link stays valid (1 year, in seconds). */
export const AVATAR_SIGNED_URL_TTL = 60 * 60 * 24 * 365;

