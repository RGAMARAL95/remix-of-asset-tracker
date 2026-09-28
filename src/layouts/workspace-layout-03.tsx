import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  IconPlant2,
  IconLayoutDashboard,
  IconList,
  IconSettings,
  IconLogout,
  IconLayoutSidebar,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/auth-provider";

const navItems = [
  { key: "overview", label: "Overview", icon: IconLayoutDashboard },
  { key: "assets", label: "Assets", icon: IconList },
];

export default function WorkspaceLayout03() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // The same shell serves the authenticated app (/overview, /assets…) and the
  // public demo (/demo/overview…). Derive the route prefix from the path so
  // nav links stay within the current context.
  const isDemo = pathname.startsWith("/demo");
  const base = isDemo ? "/demo" : "";

  const activeKey =
    navItems.find((item) => pathname.startsWith(`${base}/${item.key}`))?.key ??
    "overview";

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  return (
    <div className="flex h-screen bg-muted">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col p-4 transition-[width] duration-300 lg:flex",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden p-0",
        )}
      >
        <Link
          to={`${base}/overview`}
          className="mb-8 flex items-center gap-2 px-2 font-heading text-[19px] font-semibold leading-6 tracking-tight text-foreground"
        >
          <IconPlant2 className="size-5 text-primary" />
          Asset Tracker
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <Link
                key={item.key}
                to={`${base}/${item.key}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer — account actions */}
        <div className="mt-auto flex flex-col gap-1">
          <Separator className="my-2" />
          {isDemo ? (
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <IconX className="size-4" />
              Exit demo
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <IconLogout className="size-4" />
              Sign out
            </button>
          )}
          {/* SPEC-GAP: the screenboard shows a "Settings" footer link, but the
              settings screen is out of scope for this build. Left as a nav
              target so the footer matches the wireframe. */}
          <Link
            to={`${base}/settings`}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <IconSettings className="size-4" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content — inset card */}
      <div className="flex flex-1 flex-col overflow-hidden p-0 lg:py-2 lg:pr-2">
        <div className="flex flex-1 flex-col overflow-hidden border border-border bg-background shadow-sm lg:rounded-xl">
          {/* Header with sidebar toggle */}
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <IconLayoutSidebar className="size-4" />
            </Button>
            <span className="text-sm font-medium text-foreground">
              {navItems.find((i) => i.key === activeKey)?.label ?? "Overview"}
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
