import { Link } from "react-router-dom";
import { IconPlant2 } from "@tabler/icons-react";

/**
 * Footer — wordmark and a line of credit. Nothing else.
 *
 * The link columns that used to live here (Product / Legal) all pointed at
 * `/sign-up`. A link that doesn't go where it says is worse than no link, so
 * they are gone rather than re-pointed at pages that don't exist.
 */
export function Footer01() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing border-t border-white/15 py-10">
      <div className="mx-auto flex max-w-page flex-col items-center gap-3 px-6 text-center sm:flex-row sm:justify-between sm:text-left lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-[21px] font-semibold leading-6 tracking-tight text-white"
        >
          <IconPlant2 className="size-5 text-primary" aria-hidden="true" />
          Asset Tracker
        </Link>
        <p className="text-sm text-white/60">
          © {year} Asset Tracker · Made in Lovable
        </p>
      </div>
    </footer>
  );
}
