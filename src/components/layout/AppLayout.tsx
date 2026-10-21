import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Menu, LogOut, X } from "lucide-react";
import { useAuth } from "../../app/AuthProvider";
import { useState } from "react";
import { navigation } from "./navigation";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const permissions = user?.store_user?.permissions ?? [];

  const can = (permission: string) =>
    permissions.some((item) => item.name === permission);

  const visibleNavigation = navigation.filter(
    (item) => item.permission === null || can(item.permission),
  );

  const store = user?.store_user?.store;

  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-text">
      {/* Desktop sidebar */}
      <aside className="hidden h-dvh w-64 shrink-0 overflow-y-auto border-r border-border bg-surface md:flex md:flex-col">
        <div className="border-b border-border p-4">
          <h1 className="text-xl font-bold text-primary">Inventory</h1>
          <p className="mt-1 text-sm text-text-muted">Manage your shop</p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {visibleNavigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-input px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-primary-light font-semibold text-primary"
                    : "text-text-muted hover:bg-background hover:text-text"
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 px-4">
            <p className="truncate text-sm font-semibold">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="truncate text-xs text-text-muted">{user?.email}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-input px-4 py-3 text-text-muted transition-colors hover:bg-background hover:text-text disabled:opacity-60"
          >
            <LogOut size={20} />
            <span>{isLoggingOut ? "Signing out..." : "Log out"}</span>
          </button>
        </div>
      </aside>

      <div className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-5">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="font-semibold md:hidden">Inventory</span>
            <h2>
              <span className="hidden text-lg font-bold text-text-muted md:block">
                {store ? store.name : "Store workspace"}
              </span>
            </h2>
          </div>

          {/* Mobile account menu */}
          <div className="relative md:hidden">
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((previous) => !previous)}
              className="rounded-input p-2 text-text-muted hover:bg-background"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {isMobileMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-surface p-3 shadow-lg">
                <div className="border-b border-border px-3 pb-3">
                  <p className="truncate text-sm font-semibold">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {user?.email} | {user?.store_user?.role?.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="mt-2 flex w-full items-center gap-3 rounded-input px-3 py-3 text-left text-sm text-text-muted transition-colors hover:bg-background hover:text-text disabled:opacity-60"
                >
                  <LogOut size={18} />
                  <span>{isLoggingOut ? "Signing out..." : "Log out"}</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="w-full min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom navigation */}
        <nav
          aria-label="Main navigation"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {visibleNavigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${
                  isActive ? "font-semibold text-primary" : "text-text-muted"
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
