import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, LogOut, Menu, ShieldAlert, User } from "lucide-react";
import { useEffect, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import { hasPermission, useAuth } from "../lib/auth";

const pageLabels: Record<string, string> = {
  admin: "Overview",
  overview: "Overview",
  transactions: "Transactions",
  analytics: "Site analytics",
  directory: "Overseers directory",
  content: "Site content",
  sermons: "Sermons",
  devotionals: "Devotionals",
  events: "Events",
  blog: "Blog & comments",
  bookstore: "Publications",
  gallery: "Gallery",
  locations: "Locations",
  donations: "Donation funds",
  users: "Administrators",
  settings: "Settings",
};

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const currentKey = pathname.split("/")[2] || "overview";
  const currentPage = pageLabels[currentKey] ?? "Administration";
  const canAccess = hasPermission(user, currentKey);
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#f4f5f7] lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      <AdminSidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:min-h-[72px] sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-controls="admin-navigation"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? "Close admin navigation" : "Open admin navigation"}
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-[#13283d] transition hover:border-[#c8b375] hover:bg-[#fbfaf6] lg:hidden"
              onClick={() => setMobileNavOpen((open) => !open)}
              type="button"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="hidden text-[9px] font-bold uppercase tracking-[.17em] text-slate-400 sm:block">
                HOREMOW <span className="px-1 text-[#c5a75d]">/</span> Administration
              </p>
              <p className="truncate text-sm font-bold text-[#13283d]">{currentPage}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <span className="hidden items-center gap-2 text-[11px] font-medium text-slate-500 sm:flex">
              <CalendarDays size={14} className="text-[#b3944b]" />
              {today}
            </span>
            <span className="hidden h-7 w-px bg-slate-200 sm:block" />
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-full bg-[#102b46] text-[10px] font-bold uppercase text-white ring-2 ring-[#d8c38b]/50">
                    {user.first_name ? user.first_name[0] : "A"}
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <p className="max-w-40 truncate text-[11px] font-bold text-[#13283d]">
                      {user.first_name
                        ? `${user.first_name} ${user.last_name || ""}`
                        : user.email}
                    </p>
                    <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                      {user.role.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
                <button
                  aria-label="Sign out"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:w-auto sm:gap-2 sm:px-3"
                  onClick={handleLogout}
                  title="Sign out"
                  type="button"
                >
                  <LogOut size={14} />
                  <span className="hidden text-[11px] font-semibold sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-[#102b46] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#1a4b8c]"
                to="/admin/login"
              >
                <User size={13} /> Sign in
              </Link>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 sm:p-6 lg:p-9">
          {canAccess ? (
            <Outlet />
          ) : (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-[0_12px_40px_rgba(15,35,55,.06)]">
              <div className="mx-auto grid size-12 place-items-center rounded-xl bg-red-50 text-red-600">
                <ShieldAlert size={22} />
              </div>
              <p className="mt-5 text-[9px] font-bold uppercase tracking-[.18em] text-red-500">
                Permission required
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-[#13283d]">
                Access restricted
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500">
                Your administrative profile ({user?.role}) does not have permission to manage the{" "}
                <strong className="text-slate-700">{currentKey}</strong> module. Please contact a
                Super Administrator to review your access.
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#102b46] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1a4b8c]"
                to="/admin"
              >
                Return to overview <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
