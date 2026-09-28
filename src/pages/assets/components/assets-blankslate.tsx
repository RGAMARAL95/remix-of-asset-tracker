import { useLocation, useNavigate } from "react-router-dom";
import { IconPackageImport } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

/**
 * Empty state shown inside the assets table body when the account has no
 * assets yet. Icon + heading + one-line description + primary "Add your first
 * asset" CTA that routes to the add-asset editor.
 */
export function AssetsBlankslate() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const base = pathname.startsWith("/demo") ? "/demo/assets/new" : "/assets/new";

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-foreground">
        <IconPackageImport className="size-6" />
      </span>
      <h2 className="text-base font-semibold text-foreground">No assets yet</h2>
      <p className="max-w-xs text-pretty text-sm text-muted-foreground">
        Add your first asset to see your net worth here.
      </p>
      <Button size="lg" className="mt-1" onClick={() => navigate(base)}>
        Add your first asset →
      </Button>
    </div>
  );
}
