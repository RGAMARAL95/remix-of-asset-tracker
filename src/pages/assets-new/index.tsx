import { Navigate, useLocation, useParams } from "react-router-dom";

/**
 * `/assets/new` and `/assets/:id` used to be full pages. Adding and editing are
 * now a dialog over the list, addressed by `?asset=new` and `?asset=<id>` — see
 * `pages/assets/components/asset-dialog.tsx` for why.
 *
 * These routes stay as redirects rather than being deleted, so anything already
 * pointing at them still lands in the right place: a bookmark, a link someone
 * shared, or the browser's own history.
 *
 * `replace` so the old address does not sit in the history and send Back
 * straight into another redirect.
 */
export default function AssetRouteRedirect() {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const assets = pathname.startsWith( "/demo" ) ? "/demo/assets" : "/assets";

  return <Navigate to={ `${ assets }?asset=${ id ?? "new" }` } replace />;
}
